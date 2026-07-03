import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel, EmailStr
from backend.config import settings
from backend.mock_db import users_db, profiles_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# Pydantic Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    preferred_lang: str = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    preferred_lang: str
    created_at: str

# Helper Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None or email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Check in DB
    if settings.MOCK_MODE:
        profile = profiles_db.get(user_id)
        if not profile:
            raise credentials_exception
        return profile
    else:
        # Supabase implementation
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            response = supabase.table("profiles").select("*").eq("id", user_id).execute()
            if not response.data:
                raise credentials_exception
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

@router.post("/register", response_model=ProfileResponse)
def register(user_in: UserRegister):
    email = user_in.email.lower()
    
    if settings.MOCK_MODE:
        if email in users_db:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user_in.password)
        
        # Save to mock user DB
        users_db[email] = {
            "id": user_id,
            "email": email,
            "hashed_password": hashed_password
        }
        
        # Save to mock profile DB
        profile = {
            "id": user_id,
            "email": email,
            "full_name": user_in.full_name,
            "preferred_lang": user_in.preferred_lang,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        profiles_db[user_id] = profile
        return profile
    else:
        # Supabase Sign Up
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Auth Sign Up (Creates user in auth schema and triggers schema.sql profile insert)
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": user_in.password
            })
            
            if not auth_response.user:
                raise HTTPException(status_code=400, detail="Authentication signup failed")
                
            user_id = auth_response.user.id
            
            # Ensure profile exists in profiles table
            # (sometimes trigger handles it, but let's make sure)
            profile_data = {
                "id": user_id,
                "email": email,
                "full_name": user_in.full_name,
                "preferred_lang": user_in.preferred_lang
            }
            supabase.table("profiles").upsert(profile_data).execute()
            
            profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
            return profile_response.data[0]
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username.lower()
    password = form_data.password
    
    if settings.MOCK_MODE:
        user = users_db.get(email)
        if not user or not verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user["id"], "email": email})
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        # Supabase Authentication
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            auth_res = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            if not auth_res.user:
                raise HTTPException(status_code=401, detail="Incorrect email or password")
                
            # Create our own local JWT signed with settings.SECRET_KEY 
            # to keep API requests uniform, whether we are in Mock or Supabase
            access_token = create_access_token(data={"sub": auth_res.user.id, "email": email})
            return {"access_token": access_token, "token_type": "bearer"}
        except Exception as e:
            raise HTTPException(status_code=401, detail="Authentication failed: incorrect credentials")

@router.get("/me", response_model=ProfileResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=ProfileResponse)
def update_profile(profile_update: dict, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    if settings.MOCK_MODE:
        profile = profiles_db.get(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        if "full_name" in profile_update:
            profile["full_name"] = profile_update["full_name"]
        if "preferred_lang" in profile_update:
            profile["preferred_lang"] = profile_update["preferred_lang"]
            
        profile["updated_at"] = datetime.utcnow().isoformat()
        profiles_db[user_id] = profile
        return profile
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            update_data = {}
            if "full_name" in profile_update:
                update_data["full_name"] = profile_update["full_name"]
            if "preferred_lang" in profile_update:
                update_data["preferred_lang"] = profile_update["preferred_lang"]
                
            response = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
