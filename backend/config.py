import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load local environment variables if available
load_dotenv()

class Settings(BaseSettings):
    # App General Settings
    APP_NAME: str = "CiviMind AI Backend"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8000
    
    # Security/Auth Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "7b6b0ee6948ad18c764ab620a27318ec7e7f722a59e99eb664658fe96942008e") # Local JWT secret key fallback
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    # Supabase (Optional for local testing, fallback to mock DB if empty)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # LLM Settings (OpenAI / Gemini / Anthropic via OpenAI compatibility)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Auto-detected Mock Mode if environment is not fully configured
    @property
    def MOCK_MODE(self) -> bool:
        # If Supabase credentials or OpenAI Key is missing, run in Mock Mode for seamless experience
        return not (self.SUPABASE_URL and self.SUPABASE_KEY and self.OPENAI_API_KEY)

    class Config:
        case_sensitive = True

settings = Settings()
