import uuid
import json
import os
from datetime import datetime

# Path to database directory
DB_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(DB_DIR, "mock_users.json")
PROFILES_FILE = os.path.join(DB_DIR, "mock_profiles.json")
CHATS_FILE = os.path.join(DB_DIR, "mock_chats.json")
MESSAGES_FILE = os.path.join(DB_DIR, "mock_messages.json")
DOCUMENTS_FILE = os.path.join(DB_DIR, "mock_documents.json")

class PersistentDict(dict):
    def __init__(self, filepath, initial_data=None):
        self.filepath = filepath
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    super().__init__(json.load(f))
            except Exception:
                super().__init__(initial_data or {})
        else:
            super().__init__(initial_data or {})
            self._save()

    def _save(self):
        try:
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(dict(self), f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving database to {self.filepath}: {e}")

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        self._save()

    def __delitem__(self, key):
        super().__delitem__(key)
        self._save()

    def clear(self):
        super().clear()
        self._save()

    def pop(self, *args, **kwargs):
        val = super().pop(*args, **kwargs)
        self._save()
        return val

    def popitem(self):
        val = super().popitem()
        self._save()
        return val

    def update(self, *args, **kwargs):
        super().update(*args, **kwargs)
        self._save()

class PersistentList(list):
    def __init__(self, filepath, initial_data=None):
        self.filepath = filepath
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    super().__init__(json.load(f))
            except Exception:
                super().__init__(initial_data or [])
        else:
            super().__init__(initial_data or [])
            self._save()

    def _save(self):
        try:
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(list(self), f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving list to {self.filepath}: {e}")

    def append(self, item):
        super().append(item)
        self._save()

    def extend(self, iterable):
        super().extend(iterable)
        self._save()

    def insert(self, index, item):
        super().insert(index, item)
        self._save()

    def remove(self, item):
        super().remove(item)
        self._save()

    def pop(self, *args, **kwargs):
        val = super().pop(*args, **kwargs)
        self._save()
        return val

    def clear(self):
        super().clear()
        self._save()

    def __setitem__(self, index, item):
        super().__setitem__(index, item)
        self._save()

    def __delitem__(self, index):
        super().__delitem__(index)
        self._save()

# Prepopulate seed data
test_user_id = "00000000-0000-0000-0000-000000000000"
test_chat_id = "11111111-1111-1111-1111-111111111111"

initial_users = {
    "test@civimind.ae": {
        "id": test_user_id,
        "email": "test@civimind.ae",
        "hashed_password": "$2b$12$K1rZz8e9w.r/t7Yv6JgRjOWhTskB1tG7c14qFz2y80gUq1gR6yW4q"
    }
}

initial_profiles = {
    test_user_id: {
        "id": test_user_id,
        "email": "test@civimind.ae",
        "full_name": "Saeed Al Mansoori",
        "preferred_lang": "en",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
}

initial_chats = {
    test_chat_id: {
        "id": test_chat_id,
        "user_id": test_user_id,
        "title": "Unpaid Salary Dispute MOHRE Guidance",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
}

initial_messages = [
    {
        "id": "msg-1-uuid",
        "chat_id": test_chat_id,
        "role": "user",
        "content": "My employer has not paid my salary for two months. What should I do?",
        "citations": [],
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": "msg-2-uuid",
        "chat_id": test_chat_id,
        "role": "assistant",
        "content": "Under UAE Labour Law (Federal Decree-Law No. 33 of 2021), employers must pay salaries on their due dates. Since your salary is delayed by two months, you are entitled to file a formal complaint with the Ministry of Human Resources & Emiratisation (MOHRE).\n\nHere are the recommended next steps:\n1. **Submit Complaint**: File a dispute online on the MOHRE Portal or the MOHRE App using UAE PASS.\n2. **Amicable Discussion**: MOHRE will contact both parties to try and settle the dispute within 14 days.\n3. **Referral to Court**: If it cannot be resolved, MOHRE will transfer your case to the UAE Labour Court.\n\n**Authority**: Ministry of Human Resources & Emiratisation (MOHRE)\n**Official Link**: [MOHRE Website](https://www.mohre.gov.ae/)",
        "citations": [{"source": "UAE Federal Decree-Law No. 33 of 2021", "link": "https://www.mohre.gov.ae/"}],
        "created_at": datetime.utcnow().isoformat()
    }
]

# Instantiate persistent databases
users_db = PersistentDict(USERS_FILE, initial_users)
profiles_db = PersistentDict(PROFILES_FILE, initial_profiles)
chats_db = PersistentDict(CHATS_FILE, initial_chats)
messages_db = PersistentList(MESSAGES_FILE, initial_messages)
documents_db = PersistentDict(DOCUMENTS_FILE, {})

# Seed Government Services for mock responses
gov_services_db = [
    {
        "id": 1,
        "category": "Labour",
        "title_en": "Filing a Labour Dispute / Unpaid Salary Complaint",
        "title_ar": "تقديم شكوى عمالية / عدم دفع الراتب",
        "description_en": "Official service by MOHRE allowing employees to lodge a formal complaint against employers for non-payment of salary, contract breaches, or arbitrary termination.",
        "description_ar": "الخدمة الرسمية من وزارة الموارد البشرية والتوطين التي تتيح للموظفين تقديم شكوى رسمية ضد أصحاب العمل بسبب عدم دفع الرواتب أو الإخلال بالعقد أو الفصل التعسفي.",
        "authority_en": "Ministry of Human Resources & Emiratisation (MOHRE)",
        "authority_ar": "وزارة الموارد البشرية والتوطين",
        "url": "https://www.mohre.gov.ae/",
        "steps_en": [
            "Register and log in on MOHRE portal or app using UAE PASS.",
            "Navigate to services and select 'Register Labour Complaint'.",
            "Enter contract details, dispute reasons (e.g., unpaid salary), and claim amount.",
            "Submit the complaint. MOHRE will call both parties for amicable settlement within 14 days.",
            "If no agreement is reached, MOHRE issues a referral letter to the Labour Court."
        ],
        "steps_ar": [
            "قم بالتسجيل وتسجيل الدخول على بوابة وزارة الموارد البشرية والتوطين باستخدام الهوية الرقمية.",
            "انتقل إلى الخدمات واختر 'تسجيل شكوى عمالية'.",
            "أدخل تفاصيل العقد، وأسباب النزاع (مثال: راتب غير مدفوع)، ومبلغ المطالبة.",
            "أرسل الشكوى. ستقوم الوزارة بالاتصال بالطرفين للتسوية الودية في غضون 14 يومًا.",
            "في حال عدم التوصل لاتفاق، تصدر الوزارة خطاب إحالة إلى المحكمة العمالية."
        ],
        "docs_required_en": ["MOHRE Labour Contract copy", "Emirates ID copy", "Bank statements showing unpaid months", "Written proof of communication with employer"],
        "docs_required_ar": ["نسخة من عقد العمل المعتمد", "نسخة من الهوية الرقمية / الهوية الإماراتية", "كشف حساب بنكي يوضح الأشهر غير المدفوعة", "إثبات كتابي للتواصل مع صاحب العمل"]
    },
    {
        "id": 2,
        "category": "Visa",
        "title_en": "UAE Golden Visa Application",
        "title_ar": "طلب الإقامة الذهبية في دولة الإمارات",
        "description_en": "Long-term 10-year residency visa for investors, entrepreneurs, exceptional talents, researchers, outstanding students, and frontline heroes.",
        "description_ar": "تأشيرة إقامة طويلة الأجل لمدة 10 سنوات للمستثمرين، ورواد الأعمال، وأصحاب المواهب الاستثنائية، والباحثين، والطلاب المتفوقين، وأبطال الخطوط الأمامية.",
        "authority_en": "Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) / GDRFA Dubai",
        "authority_ar": "الهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ / إقامة دبي",
        "url": "https://smartservices.icp.gov.ae/",
        "steps_en": [
            "Check eligibility categories (e.g., Property Investor minimum AED 2 Million).",
            "Apply for a nominative or initial approval online via ICP or GDRFA portal.",
            "Upload required investment, academic, or professional certificates.",
            "Pay application fees and undergo medical fitness screening in the UAE.",
            "Cancel current visa and get the Golden residency permit issued."
        ],
        "steps_ar": [
            "التحقق من فئات الأهلية (مثال: مستثمر عقاري بقيمة لا تقل عن 2 مليون درهم).",
            "التقدم بطلب للحصول على ترشيح أو موافقة مبدئية عبر بوابة الهيئة أو إقامة دبي.",
            "تحميل شهادات الاستثمار أو الشهادات الأكاديمية أو المهنية المطلوبة.",
            "دفع رسوم الطلب وإجراء الفحص الطبي في دولة الإمارات.",
            "إلغاء التأشيرة الحالية وإصدار الإقامة الذهبية."
        ],
        "docs_required_en": ["Title deed of property (for real estate investors) or academic degree equivalency", "Valid Passport copy", "Emirates ID copy (if resident)", "Health Insurance policy valid in UAE"],
        "docs_required_ar": ["سند ملكية العقار (للمستثمرين العقاريين) أو معادلة الشهادات الأكاديمية", "نسخة من جواز سفر ساري المفعول", "نسخة من الهوية الإماراتية (للمقيمين)", "تأمين صحي ساري المفعول في الدولة"]
    },
    {
        "id": 3,
        "category": "Rental",
        "title_en": "Tenancy Dispute Filing (Rental Dispute Center)",
        "title_ar": "رفع دعوى نزاع إيجاري (مركز فض المنازعات الإيجارية)",
        "description_en": "Service to resolve disputes arising between landlords and tenants in Dubai, such as unfair eviction notice or unjustified rent increases exceeding RERA calculator bounds.",
        "description_ar": "خدمة لحل النزاعات التي تنشأ بين الملاك والمستأجرين في دبي، مثل إنذار الإخلاء غير القانوني أو زيادة الإيجار غير المبررة التي تتجاوز حاسبة إيجارات أراضي دبي.",
        "authority_en": "Dubai Land Department - Rental Dispute Center (RDC)",
        "authority_ar": "دائرة الأراضي والأملاك بدبي - مركز فض المنازعات الإيجارية",
        "url": "https://dubailand.gov.ae/",
        "steps_en": [
            "Attempt amicable settlement or check RERA Index first.",
            "Log in to DLD portal and open RDC portal.",
            "File a 'Rental Dispute Case' and upload Ejari contract details.",
            "Pay RDC filing fee (usually 3.5% of the annual rent, min AED 500, max AED 20,000).",
            "Attend the mediation sessions or arbitration hearings online."
        ],
        "steps_ar": [
            "محاولة التسوية الودية أو التحقق من مؤشر الإيجارات أولاً.",
            "تسجيل الدخول إلى بوابة دائرة الأراضي والأملاك وفتح بوابة مركز فض المنازعات.",
            "رفع 'دعوى نزاع إيجاري' وتحميل تفاصيل عقد إيجاري.",
            "دفع رسوم تسجيل القضية (عادة 3.5% من الإيجار السنوي، بحد أدنى 500 درهم وبحد أقصى 20,000 درهم).",
            "حضور جلسات الوساطة أو جلسات التحكيم عبر الإنترنت."
        ],
        "docs_required_en": ["Ejari certificate", "Tenancy Contract copy", "Copy of Passport & Emirates ID of applicant", "Proof of rent payments (cheques, bank transfers)", "Correspondence/eviction notice copies"],
        "docs_required_ar": ["شهادة تسجيل إيجاري", "نسخة من عقد الإيجار", "نسخة من جواز السفر والهوية الإماراتية لمقدم الطلب", "إثبات دفعات الإيجار (شيكات، تحويلات بنكية)", "نسخ من المراسلات / إنذارات الإخلاء"]
    },
    {
        "id": 4,
        "category": "Business",
        "title_en": "Commercial Trade License Registration",
        "title_ar": "تأسيس رخصة تجارية جديدة",
        "description_en": "Service by the Department of Economy and Tourism (DET) or Free Zone authorities to establish a new corporate entity or commercial trade license in the UAE.",
        "description_ar": "خدمة من دائرة الاقتصاد والسياحة أو سلطات المناطق الحرة لتأسيس كيان تجاري جديد أو إصدار رخصة تجارية في دولة الإمارات العربية المتحدة.",
        "authority_en": "Department of Economy and Tourism (DET) / Free Zone Authorities",
        "authority_ar": "دائرة الاقتصاد والسياحة / سلطات المناطق الحرة",
        "url": "https://ded.ae/",
        "steps_en": [
            "Choose business legal form and business activity.",
            "Register trade name and receive initial approval.",
            "Draft and sign the Memorandum of Association (MOA) or Service Agent agreement.",
            "Establish business address (rent physical office space with Ejari).",
            "Submit application, pay licensing fee, and receive commercial license."
        ],
        "steps_ar": [
            "تحديد الشكل القانوني للشركة والنشاط الاقتصادي.",
            "حجز الاسم التجاري والحصول على الموافقة المبدئية.",
            "إعداد وتوقيع عقد التأسيس (MOA) أو اتفاقية وكيل الخدمات.",
            "تحديد موقع الشركة (استئجار مكتب أو مقر عمل وتسجيل إيجاري).",
            "تقديم الطلب ودفع الرسوم المقررة واستلام الرخصة التجارية."
        ],
        "docs_required_en": ["Passport copy of all partners", "Emirates ID copy (if applicable)", "Trade Name reservation certificate", "Initial Approval certificate", "Ejari contract of physical office"],
        "docs_required_ar": ["نسخة من جواز سفر جميع الشركاء", "نسخة من الهوية الإماراتية (إن وجدت)", "شهادة حجز الاسم التجاري", "شهادة الموافقة المبدئية", "عقد إيجاري لمقر العمل"]
    }
]
