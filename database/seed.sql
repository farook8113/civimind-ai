-- CiviMind AI Database Seed Data
-- Seed details for primary UAE government services

INSERT INTO public.gov_services (category, title_en, title_ar, description_en, description_ar, authority_en, authority_ar, url, steps_en, steps_ar, docs_required_en, docs_required_ar)
VALUES 
(
  'Labour',
  'Filing a Labour Dispute / Unpaid Salary Complaint',
  'تقديم شكوى عمالية / عدم دفع الراتب',
  'Official service by MOHRE allowing employees to lodge a formal complaint against employers for non-payment of salary, contract breaches, or arbitrary termination.',
  'الخدمة الرسمية من وزارة الموارد البشرية والتوطين التي تتيح للموظفين تقديم شكوى رسمية ضد أصحاب العمل بسبب عدم دفع الرواتب أو الإخلال بالعقد أو الفصل التعسفي.',
  'Ministry of Human Resources & Emiratisation (MOHRE)',
  'وزارة الموارد البشرية والتوطين',
  'https://www.mohre.gov.ae/',
  '[
    "Register and log in on MOHRE portal or app using UAE PASS.",
    "Navigate to services and select ''Register Labour Complaint''.",
    "Enter contract details, dispute reasons (e.g., unpaid salary), and claim amount.",
    "Submit the complaint. MOHRE will call both parties for amicable settlement within 14 days.",
    "If no agreement is reached, MOHRE issues a referral letter to the Labour Court."
  ]'::jsonb,
  '[
    "قم بالتسجيل وتسجيل الدخول على بوابة وزارة الموارد البشرية والتوطين باستخدام الهوية الرقمية.",
    "انتقل إلى الخدمات واختر ''تسجيل شكوى عمالية''.",
    "أدخل تفاصيل العقد، وأسباب النزاع (مثال: راتب غير مدفوع)، ومبلغ المطالبة.",
    "أرسل الشكوى. ستقوم الوزارة بالاتصال بالطرفين للتسوية الودية في غضون 14 يومًا.",
    "في حال عدم التوصل لاتفاق، تصدر الوزارة خطاب إحالة إلى المحكمة العمالية."
  ]'::jsonb,
  '["MOHRE Labour Contract copy", "Emirates ID copy", "Bank statements showing unpaid months", "Written proof of communication with employer"]'::jsonb,
  '["نسخة من عقد العمل المعتمد", "نسخة من الهوية الرقمية / الهوية الإماراتية", "كشف حساب بنكي يوضح الأشهر غير المدفوعة", "إثبات كتابي للتواصل مع صاحب العمل"]'::jsonb
),
(
  'Visa',
  'UAE Golden Visa Application',
  'طلب الإقامة الذهبية في دولة الإمارات',
  'Long-term 10-year residency visa for investors, entrepreneurs, exceptional talents, researchers, outstanding students, and frontline heroes.',
  'تأشيرة إقامة طويلة الأجل لمدة 10 سنوات للمستثمرين، ورواد الأعمال، وأصحاب المواهب الاستثنائية، والباحثين، والطلاب المتفوقين، وأبطال الخطوط الأمامية.',
  'Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) / GDRFA Dubai',
  'الهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ / إقامة دبي',
  'https://smartservices.icp.gov.ae/',
  '[
    "Check eligibility categories (e.g., Property Investor minimum AED 2 Million).",
    "Apply for a nominative or initial approval online via ICP or GDRFA portal.",
    "Upload required investment, academic, or professional certificates.",
    "Pay application fees and undergo medical fitness screening in the UAE.",
    "Cancel current visa and get the Golden residency permit issued."
  ]'::jsonb,
  '[
    "التحقق من فئات الأهلية (مثال: مستثمر عقاري بقيمة لا تقل عن 2 مليون درهم).",
    "التقدم بطلب للحصول على ترشيح أو موافقة مبدئية عبر بوابة الهيئة أو إقامة دبي.",
    "تحميل شهادات الاستثمار أو الشهادات الأكاديمية أو المهنية المطلوبة.",
    "دفع رسوم الطلب وإجراء الفحص الطبي في دولة الإمارات.",
    "إلغاء التأشيرة الحالية وإصدار الإقامة الذهبية."
  ]'::jsonb,
  '["Title deed of property (for real estate investors) or academic degree equivalency", "Valid Passport copy", "Emirates ID copy (if resident)", "Health Insurance policy valid in UAE"]'::jsonb,
  '["سند ملكية العقار (للمستثمرين العقاريين) أو معادلة الشهادات الأكاديمية", "نسخة من جواز سفر ساري المفعول", "نسخة من الهوية الإماراتية (للمقيمين)", "تأمين صحي ساري المفعول في الدولة"]'::jsonb
),
(
  'Rental',
  'Tenancy Dispute Filing (Rental Dispute Center)',
  'رفع دعوى نزاع إيجاري (مركز فض المنازعات الإيجارية)',
  'Service to resolve disputes arising between landlords and tenants in Dubai, such as unfair eviction notice or unjustified rent increases exceeding RERA calculator bounds.',
  'خدمة لحل النزاعات التي تنشأ بين الملاك والمستأجرين في دبي، مثل إنذار الإخلاء غير القانوني أو زيادة الإيجار غير المبررة التي تتجاوز حاسبة إيجارات أراضي دبي.',
  'Dubai Land Department - Rental Dispute Center (RDC)',
  'دائرة الأراضي والأملاك بدبي - مركز فض المنازعات الإيجارية',
  'https://dubailand.gov.ae/',
  '[
    "Attempt amicable settlement or check RERA Index first.",
    "Log in to DLD portal and open RDC portal.",
    "File a ''Rental Dispute Dispute Case'' and upload Ejari contract details.",
    "Pay RDC filing fee (usually 3.5% of the annual rent, min AED 500, max AED 20,000).",
    "Attend the mediation sessions or arbitration hearings online."
  ]'::jsonb,
  '[
    "محاولة التسوية الودية أو التحقق من مؤشر الإيجارات أولاً.",
    "تسجيل الدخول إلى بوابة دائرة الأراضي والأملاك وفتح بوابة مركز فض المنازعات.",
    "رفع ''دعوى نزاع إيجاري'' وتحميل تفاصيل عقد إيجاري.",
    "دفع رسوم تسجيل القضية (عادة 3.5% من الإيجار السنوي، بحد أدنى 500 درهم وبحد أقصى 20,000 درهم).",
    "حضور جلسات الوساطة أو جلسات التحكيم عبر الإنترنت."
  ]'::jsonb,
  '["Ejari certificate", "Tenancy Contract copy", "Copy of Passport & Emirates ID of applicant", "Proof of rent payments (cheques, bank transfers)", "Correspondence/eviction notice copies"]'::jsonb,
  '["شهادة تسجيل إيجاري", "نسخة من عقد الإيجار", "نسخة من جواز السفر والهوية الإماراتية لمقدم الطلب", "إثبات دفعات الإيجار (شيكات، تحويلات بنكية)", "نسخ من المراسلات / إنذارات الإخلاء"]'::jsonb
),
(
  'Business',
  'Commercial Trade License Registration',
  'تأسيس رخصة تجارية جديدة',
  'Service by the Department of Economy and Tourism (DET) or Free Zone authorities to establish a new corporate entity or commercial trade license in the UAE.',
  'خدمة من دائرة الاقتصاد والسياحة أو سلطات المناطق الحرة لتأسيس كيان تجاري جديد أو إصدار رخصة تجارية في دولة الإمارات العربية المتحدة.',
  'Department of Economy and Tourism (DET) / Free Zone Authorities',
  'دائرة الاقتصاد والسياحة / سلطات المناطق الحرة',
  'https://ded.ae/',
  '[
    "Choose business legal form and business activity.",
    "Register trade name and receive initial approval.",
    "Draft and sign the Memorandum of Association (MOA) or Service Agent agreement.",
    "Establish business address (rent physical office space with Ejari).",
    "Submit application, pay licensing fee, and receive commercial license."
  ]'::jsonb,
  '[
    "تحديد الشكل القانوني للشركة والنشاط الاقتصادي.",
    "حجز الاسم التجاري والحصول على الموافقة المبدئية.",
    "إعداد وتوقيع عقد التأسيس (MOA) أو اتفاقية وكيل الخدمات.",
    "تحديد موقع الشركة (استئجار مكتب أو مقر عمل وتسجيل إيجاري).",
    "تقديم الطلب ودفع الرسوم المقررة واستلام الرخصة التجارية."
  ]'::jsonb,
  '["Passport copy of all partners", "Emirates ID copy (if applicable)", "Trade Name reservation certificate", "Initial Approval certificate", "Ejari contract of physical office"]'::jsonb,
  '["نسخة من جواز سفر جميع الشركاء", "نسخة من الهوية الإماراتية (إن وجدت)", "شهادة حجز الاسم التجاري", "شهادة الموافقة المبدئية", "عقد إيجاري لمقر العمل"]'::jsonb
);
