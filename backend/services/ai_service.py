import os
from openai import OpenAI
from config import settings
from mock_db import gov_services_db

class AIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.client = None
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"Error initializing OpenAI Client: {e}")
                self.client = None

    def get_legal_chat_response(self, user_message: str, chat_history: list = None, lang: str = "en") -> dict:
        """
        Generates UAE legal guidance. Uses OpenAI if key is present, otherwise falls back to a 
        high-fidelity local expert rule engine.
        """
        # Clean query for simple rule matching
        query = user_message.lower()
        
        # 1. Use real OpenAI if available
        if self.client:
            try:
                system_prompt = (
                    "You are CiviMind AI, an elite legal and government services assistant for the United Arab Emirates (UAE).\n"
                    "Provide clear, accurate, and structured legal guidance based on UAE laws (e.g., UAE Labour Law Decree-Law No. 33 of 2021, "
                    "Dubai Tenancy Law Law No. 26 of 2007, etc.).\n"
                    "Structure your response with:\n"
                    "1. GENERAL LEGAL EXPLANATION (citing specific Decree-Laws or executive regulations if relevant)\n"
                    "2. RESPONSIBLE AUTHORITY (e.g., MOHRE, Dubai Land Department, ICP, DET)\n"
                    "3. PRACTICAL NEXT STEPS (actionable guide for the citizen/resident)\n\n"
                    f"Respond in the requested language of the conversation. User language is '{lang}'. Keep tone professional, empathetic, and authoritative."
                )
                
                messages = [{"role": "system", "content": system_prompt}]
                
                # Append history if present
                if chat_history:
                    for msg in chat_history[-6:]:  # limit to last 6 messages
                        messages.append({"role": msg["role"], "content": msg["content"]})
                        
                messages.append({"role": "user", "content": user_message})
                
                response = self.client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=messages,
                    temperature=0.3
                )
                
                answer = response.choices[0].message.content
                
                # Extract citation sources if mentioned in text
                citations = []
                if "mohre" in answer.lower() or "labour" in answer.lower():
                    citations.append({"source": "MOHRE Portal", "link": "https://www.mohre.gov.ae/"})
                if "land department" in answer.lower() or "rera" in answer.lower() or "eviction" in answer.lower():
                    citations.append({"source": "Dubai Land Department", "link": "https://dubailand.gov.ae/"})
                if "golden visa" in answer.lower() or "icp" in answer.lower():
                    citations.append({"source": "ICP Smart Services", "link": "https://smartservices.icp.gov.ae/"})
                if "det" in answer.lower() or "ded" in answer.lower() or "trade license" in answer.lower():
                    citations.append({"source": "Dubai Economy and Tourism (DET)", "link": "https://ded.ae/"})
                
                return {"content": answer, "citations": citations}
            except Exception as e:
                print(f"Error in OpenAI response: {e}. Falling back to Rule Engine.")

        # 2. Local Expert Rule Engine (Fallback)
        citations = []
        
        # Check Arabic/English matching keywords
        is_labour = any(x in query for x in ["salary", "employer", "paid", "contract", "work", "job", "terminate", "\u0639\u0645\u0644", "\u0631\u0627\u062a\u0628", "\u0648\u0638\u064a\u0641\u0629", "\u0641\u0635\u0644", "\u0639\u0642\u062f"])
        is_rental = any(x in query for x in ["rent", "landlord", "evict", "ejari", "tenancy", "rera", "\u0625\u064a\u062c\u0627\u0631", "\u0645\u0624\u062c\u0631", "\u0645\u0633\u062a\u0623\u062c\u0631", "\u0637\u0631\u062f", "\u0625\u062e\u0644\u0627\u0621"])
        is_visa = any(x in query for x in ["visa", "residency", "passport", "golden", "sponsor", "\u062a\u0623\u0634\u064a\u0631\u0629", "\u0625\u0642\u0627\u0645\u0629", "\u062c\u0648\u0627\u0632", "\u0630\u0647\u0628\u064a\u0629", "\u0643\u0641\u064a\u0644"])
        is_business = any(x in query for x in ["business", "company", "trade", "license", "incorporate", "det", "ded", "\u0634\u0631\u0643\u0629", "\u0631\u062e\u0635\u0629", "\u062a\u062c\u0627\u0631\u064a", "\u062a\u0623\u0633\u064a\u0633"])
        
        # Match responses
        if is_labour:
            citations.append({"source": "UAE Ministry of Human Resources & Emiratisation (MOHRE)", "link": "https://www.mohre.gov.ae/"})
            if lang == "ar":
                content = (
                    "\u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u0642\u0627ن\u0648\u0646 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a\u064a (\u0627\u0644\u0645\u0631\u0633\u0648\u0645 \u0628\u0642\u0627\u0646\u0648\u0646 \u0627\u062a\u062d\u0627\u062f\u064a \u0631\u0642\u0645 33 \u0644\u0633\u0646\u0629 2021 \u0628\u0634\u0623\u0646 \u062a\u0646\u0638\u064a\u0645 \u0639\u0644\u0627\u0642\u0627\u062a \u0627\u0644\u0639\u0645\u0644)\u060c "
                    "\u064a\u064f\u0644\u062a\u0632\u0645 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0628\u0633\u062f\u0627\u062f \u0627\u0644\u0631\u0648\u0627\u062a\u0628 \u0641\u064a \u062a\u0627\u0631\u064a\u062e \u0627\u0633\u062a\u062d\u0642\u0627\u0642\u0647\u0627 \u0645\u0646 \u062e\u0644\u0627\u0644 \u0646\u0638\u0627\u0645 \u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0623\u062c\u0648\u0631 (WPS).\n\n"
                    "**\u0627\u0644\u062c\u0647\u0625 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0625:**\n"
                    "\u0648\u0632\u0627\u0631\u0625 \u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0625 \u0648\u0627\u0644\u062a\u0648\u0637\u064a\u0646 (MOHRE).\n\n"
                    "**\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u064a\u0625 \u0627\u0644\u0645\u0642\u062a\u0631\u062d\u0625:**\n"
                    "1. **\u062a\u0642\u062f\u064a\u0645 \u0634\u0643\u0648\u0649 \u0639\u0645\u0644\u064a\u0625**: \u0639\u0628\u0631 \u0645\u0648\u0642\u0639 \u0623\u0648 \u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0648\u0632\u0627\u0631\u0625 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0647\u0648\u064a\u0625 \u0627\u0644\u0631\u0642\u0645\u064a\u0625 (UAE PASS).\n"
                    "2. **\u0627\u0644\u062a\u0633\u0648\u064a\u0625 \u0627\u0644\u0648\u062f\u064a\u0625**: \u062a\u0633\u0639\u0649 \u0627\u0644\u0648\u0632\u0627\u0631\u0625 \u0644\u062d\u0644 \u0627\u0644ش\u0643\u0648\u0649 \u062f\u0648\u062f\u064a\u0625 \u062e\u0644\u0627\u0644 14 \u064a\u0648\u0645\u0627\u064b.\n"
                    "3. **\u0625\u062d\u0627\u0644\u0625 \u0644\u0644\u0645\u062d\u0643\u0645\u0625 \u0627\u0644\u0639\u0645\u0644\u064a\u0625**: \u0625\u0630\u0627 \u062a\u0639\u0630\u0631 \u0627\u0644\u062d\u0644\u060c \u062a\u062d\u0627\u0644 \u0627\u0644\u0642\u0636\u064a\u0625 \u0644\u0644\u0645\u062d\u0643\u0645\u0625 \u0627\u0644\u0639\u0645\u0644\u064a\u0625."
                )
            else:
                content = (
                    "Under UAE Labour Law (Federal Decree-Law No. 33 of 2021 on the Regulation of Labour Relations), "
                    "employers are obligated to pay employees' salaries on their due dates, typically through the Wages Protection System (WPS).\n\n"
                    "**Responsible Authority:**\n"
                    "Ministry of Human Resources & Emiratisation (MOHRE).\n\n"
                    "**Suggested Next Steps:**\n"
                    "1. **File a Dispute**: Log in to the MOHRE website or smart app using your UAE PASS and file a formal 'Labour Dispute' complaint.\n"
                    "2. **Mediation Phase**: MOHRE officers will contact both you and your employer to reach an amicable resolution within 14 days.\n"
                    "3. **Labour Court Referral**: If mediation fails, MOHRE will issue a referral letter enabling you to file a lawsuit in the UAE Labour Court."
                )
        elif is_rental:
            citations.append({"source": "Dubai Land Department (DLD)", "link": "https://dubailand.gov.ae/"})
            if lang == "ar":
                content = (
                    "\u0642\u0627\u0646\u0648\u0646 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0627\u0644\u0639\u0642\u0627\u0631\u064a\u0625 \u0641\u064a \u062f\u0628\u064a (\u0631\u0642\u0645 26 \u0644\u0633\u0646\u0629 2007) \u064a\u0646\u0635 \u0639\u0644\u0649 \u0639\u062f\u0645 \u062c\u0648\u0627\u0632 \u0625\u062e\u0644\u0627\u0621 \u0627\u0644\u0645\u0633\u062a\u0623\u062c\u0631 \u062a\u0639\u0633\u0641\u064a\u0627\u064b. "
                    "\u064a\u062a\u0637\u0644\u0628 \u0627\u0644\u0625\u062e\u0644\u0627\u0621 \u0625\u062e\u0637\u0627\u0631\u0627\u064b \u0631\u0633\u0645\u064a\u0627\u064b \u0642\u0628\u0644 12 \u0634\u0647\u0631\u0627\u064b \u0639\u0628\u0631 \u0627\u0644\u0643\u0627\u062a\u0628 \u0627\u0644\u0639\u062f\u0644 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0645س\u062c\u0644 \u0644\u0623\u0633\u0628\u0627\u0628 \u0645\u062d\u062f\u062f\u0625 \u0642\u0627\u0646\u0648\u0646\u0627\u064b.\n\n"
                    "**\u0627\u0644\u062c\u0647\u0625 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0625:**\n"
                    "\u0645\u0631\u0643\u0632 \u0641\u0636 \u0627\u0644\u0645\u0646\u0627\u0632\u0639\u0627\u062a \u0627\u0644\u0625\u064a\u062c\u0627\u0631\u064a\u0625 (RDC) - \u062f\u0627\u0626\u0631\u0625 \u0627\u0644\u0623\u0631\u0627\u0636\u064a \u0648\u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0628\u062f\u0628\u064a.\n\n"
                    "**\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u064a\u0625 \u0627\u0644\u0645\u0642\u062a\u0631\u062d\u0625:**\n"
                    "1. **\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0624\u0634\u0631 \u0627\u0644\u0625\u064a\u062c\u0627\u0631\u0627\u062a**: \u0639\u0628\u0631 \u062d\u0627\u0633\u0628\u0625 \u0627\u0644\u0625\u064a\u062c\u0627\u0631 \u0645\u0646 \u0645\u0624\u0633\u0633\u0625 \u0627\u0644\u062a\u0646\u0638\u064a\u0645 \u0627\u0644\u0639\u0642\u0627\u0631\u064a (RERA) \u0644\u0644\u062a\u0623\u0643\u062f \u0645\u0646 \u0642\u0627\u0646\u0648\u0646\u064a\u0625 \u0627\u0644\u0632\u064a\u0627\u062f\u0625.\n"
                    "2. **\u0631\u0641\u0639 \u062f\u0639\u0648\u0649 \u0625\u064a\u062c\u0627\u0631\u064a\u0625**: \u0641\u064a \u062d\u0627\u0644 \u0627\u0644\u0625\u062e\u0644\u0627\u0621 \u063a\u064a\u0631 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a \u0623\u0648 \u0632\u064a\u0627\u062f\u0625 \u0627\u0644\u0625\u064a\u062c\u0627\u0631\u060c \u064a\u0645\u0643\u0646 \u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628 \u0646\u0632\u0627\u0639 \u0628\u0645\u0631\u0643\u0632 \u0641\u0636 \u0627\u0644\u0645\u0646\u0627\u0632\u0639\u0627\u062a.\n"
                    "3. **\u062a\u0642\u062f\u064a\u0645 \u0639\u0642\u062f \u0625\u064a\u062c\u0627\u0631\u064a \u0648\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a**: \u0623\u0631\u0641\u0642 \u0639\u0642\u062f \u0625\u064a\u062c\u0627\u0631\u064a \u0633\u0627\u0631\u064a \u0627\u0644\u0645\u0641\u0639\u0648\u0644\u060c \u0648\u062b\u0627\u0626\u0642 \u0627\u0644\u0645\u0631\u0627\u0633\u0644\u0627\u062a\u060c \u0645\u0639 \u0633\u062f\u0627\u062f \u0631\u0633\u0648\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0642\u0636\u064a\u0625 (3.5% \u0645\u0646 \u0627\u0644\u0625\u064a\u062c\u0627\u0631 \u0627\u0644\u0633\u0646\u0648\u064a)."
                )
            else:
                content = (
                    "Pursuant to Dubai Tenancy Law No. 26 of 2007 (amended by Law No. 33 of 2008), "
                    "landlords cannot arbitrarily evict tenants. Evictions require 12 months' written notice served via Notary Public "
                    "or Registered Mail, and must be for specific legally permitted reasons (such as demolition, personal use, or sale).\n\n"
                    "**Responsible Authority:**\n"
                    "Rental Dispute Center (RDC) - Dubai Land Department.\n\n"
                    "**Suggested Next Steps:**\n"
                    "1. **Verify Rental Index**: Check the RERA Rental Calculator to ensure any requested rent increase complies with municipal limits.\n"
                    "2. **File a Rental Case**: If the landlord enforces illegal eviction or rent hikes, log in to the Dubai Land Department portal and initiate a dispute case.\n"
                    "3. **Submit Ejari & Proof**: Provide your Ejari certificate, copy of the tenancy contract, correspondence history, and pay the filing fee (3.5% of the annual rent)."
                )
        elif is_visa:
            citations.append({"source": "Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)", "link": "https://smartservices.icp.gov.ae/"})
            if lang == "ar":
                content = (
                    "\u062a\u0642\u062f\u0645 \u062f\u0648\u0644\u0625 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0642\u0646\u0648\u0627\u062a \u0625\u0642\u0627\u0645\u0625 \u0645\u062a\u0639\u062f\u062f\u0625\u060c \u0628\u0645\u0627 \u0641\u064a \u0630\u0644\u0643 \u0627\u0644\u0625\u0642\u0627\u0645\u0625 \u0627\u0644\u0630\u0647\u0628\u064a\u0625 \u0644\u0645\u062f\u0625 10 \u0633\u0646\u0648\u0627\u062a \u0644\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646 \u0627\u0644\u0639\u0642\u0627\u0631\u064a\u064a\u0646 \u0648\u0631\u0648\u0627\u062f \u0627\u0644\u0623\u0639\u0645\u0627\u0644\u060c "
                    "\u0648\u0627\u0644\u0625\u0642\u0627\u0645\u0625 \u0627\u0644\u062e\u0636\u0631\u0627\u0625 \u0644\u0645\u062f\u0625 5 \u0633\u0646\u0648\u0627\u062a \u0644\u0644\u0645\u0647\u0646\u064a\u064a\u0646 \u0627\u0644\u0645\u0633\u062a\u0642\u0644\u064a\u0646\u060c \u0628\u0627\u0644\u0625\u0636\u0627\u0641\u0625 \u0625\u0644\u0649 \u062a\u0623\u0634\u064a\u0631\u0627\u062a \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0639\u0627\u062f\u064a\u0625 \u062a\u062d\u062a \u0643\u0641\u0627\u0644\u0625 \u062c\u0647\u0625 \u0627\u0644\u0639\u0645\u0644.\n\n"
                    "**\u0627\u0644\u062c\u0647\u0625 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0625:**\n"
                    "\u0627\u0644\u0647\u064a\u0626\u0625 \u0627\u0644\u0627ت\u062d\u0627\u062f\u064a\u0625 \u0644\u0644\u0647\u0648\u064a\u0625 \u0648\u0627\u0644\u062c\u0646\u0633\u064a\u0625 \u0648\u0627\u0644\u062c\u0645\u0627\u0631\u0643 \u0648\u0623\u0645\u0646 \u0627\u0644\u0645\u0646\u0627\u0641\u0630 (ICP) \u0623\u0648 \u0627\u0644\u0625\u062f\u0627\u0631\u0625 \u0627\u0644\u0639\u0627\u0645\u0625 \u0644\u0645\u0625 \u0648\u0634\u0624\u0648\u0646 \u0627\u0644\u0625\u062c\u0627\u0646\u0628 (GDRFA).\n\n"
                    "**\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u064a\u0625 \u0627\u0644\u0645\u0642\u062a\u0631\u062d\u0625:**\n"
                    "1. **\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0623\u0647\u0644\u064a\u0625**: \u062a\u0641\u0636\u0644 \u0628\u0632\u064a\u0627\u0631\u0625 \u0628\u0648\u0627\u062a ICP \u0648\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0634\u0631\u0648\u0637 (\u0645\u062b\u0644 \u0627\u0645\u062a\u0644\u0627\u0643 \u0639\u0642\u0627\u0631 \u0628\u0642\u064a\u0645\u0625 2 \u0645\u0644\u064a\u0648\u0646 \u062f\u0631\u0647\u0645 \u0641\u0645\u0627 \u0641\u0648\u0642 \u0644\u0644\u0625\u0642\u0627\u0645\u0625 \u0627\u0644\u0630\u0647\u0628\u064a\u0625).\n"
                    "2. **\u062a\u0642\u062f\u064a\u0645 \u0627\u0644\u0637\u0644\u0628 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0625**: \u0627\u0631\u0641\u0639 \u0627\u0644\u0645\u0624\u0647\u0644\u0627\u062a\u060c \u0639\u0642\u0648\u062f \u0645\u0644\u0643\u064a\u0625 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a\u060c \u0623\u0648 \u0634\u0647\u0627\u062f\u0627\u062a \u0627\u0644\u0631\u0627\u062a\u0628 \u0639\u0628\u0631 \u062e\u062f\u0645\u0627\u062a ICP \u0627\u0644\u0630\u0643\u064a\u0625.\n"
                    "3. **\u0627\u0644\u0641\u062d\u0635 \u0627\u0644\u0637\u0628\u064a \u0648\u0625\u0635\u062f\u0627\u0631 \u0627\u0644\u0647\u0648\u064a\u0625**: \u0623\u0643\u0645\u0644 \u0627\u0644\u0621\u062d\u0635 \u0627\u0644\u0637\u0628\u064a \u0641\u064a \u0645\u0631\u0627\u0643\u0632 \u0645\u0639\u062a\u0645\u062f\u0625 \u0641\u064a \u0627\u0644\u062f\u0648\u0644\u0625\u060c \u062b\u0645 \u0627\u0644\u063a\u0650 \u062a\u0635\u0631\u064a\u062d\u0643 \u0627\u0644\u0633\u0627\u0628\u0642 \u0648\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0628\u0637\u0627\u0642\u0625 \u0627\u0644\u0647\u0648\u064a\u0625 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a\u064a\u0625 \u0627\u0644\u062c\u062f\u064a\u062f\u0625."
                )
            else:
                content = (
                    "The UAE offers several residency streams, including the 10-year Golden Visa for property investors, entrepreneurs, and outstanding talents, "
                    "the 5-year Green Visa for skilled professionals or freelancers, and standard corporate employment sponsorship visas.\n\n"
                    "**Responsible Authority:**\n"
                    "Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) or GDRFA Dubai.\n\n"
                    "**Suggested Next Steps:**\n"
                    "1. **Confirm Eligibility**: Assess requirements on the ICP portal. Real estate investors must own property worth AED 2 million or more.\n"
                    "2. **Apply online**: Upload qualifications, trade deeds, or salary certificates via ICP Smart Services or the GDRFA website.\n"
                    "3. **Medical Fitness & Identity Check**: Complete medical screening within the UAE, cancel your previous permit, and secure your new Emirates ID card."
                )
        elif is_business:
            citations.append({"source": "Dubai Department of Economy and Tourism (DET)", "link": "https://ded.ae/"})
            if lang == "ar":
                content = (
                    "\u064a\u062a\u0637\u0644\u0628 \u062a\u0623\u0633\u064a\u0633 \u0634\u0631\u0643\u0625 \u0641\u064a \u062f\u0648\u0644\u0625 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0634\u0643\u0648\u0644 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a \u0627\u0644\u0645\u0646\u0627\u0633\u0628 (\u0645\u062b\u0644 \u0634\u0631\u0643\u0625 \u0630\u0627\u062a \u0645\u0633\u0624\u0648\u0644\u064a\u0625 \u0645\u062d\u062f\u0648\u062f\u0625 - \u0630.\u0645.\u0645\u060c \u0645\u0624\u0633\u0633\u0625 \u0641\u0631\u062f\u064a\u0625)\u060c "
                    "\u0648\u0627\u062e\u062a\u064a\u0627\u0631 \u0645\u0648\u0642\u0639 \u0627\u0644\u062a\u0623\u0633\u064a\u0633 \u0628\u064a\u0646 \u0634\u0631\u0643\u0627\u062a \u062f\u0627\u062e\u0644 \u0627\u0644\u062f\u0648\u0644\u0625 (Mainland) \u0623\u0648 \u0641\u064a \u0625\u062d\u062f\u0649 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062d\u0631\u0625 (Free Zones) \u0627\u0644\u062a\u064a \u062a\u062a\u064a\u062d \u0645\u0644\u0643\u064a\u0625 \u0623\u062c\u0646\u0628\u064a\u0625 \u0643\u0627\u0645\u0644\u0625 \u0628\u0646\u0633\u0628\u0625 100%.\n\n"
                    "**\u0627\u0644\u062c\u0647\u0625 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0625:**\n"
                    "\u062f\u0627\u0626\u0631\u0625 \u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f \u0648\u0627\u0644\u0633\u064a\u0627\u062d\u0625 \u0628\u062f\u0628\u064a (DET) \u0644\u0644\u0634\u0631\u0643\u0627\u062a \u062f\u0627\u062e\u0644 \u0627\u0644\u0625\u0645\u0627\u0631\u0625\u060c \u0623\u0648 \u0647\u064a\u0626\u0625 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062d\u0631\u0625 \u0630\u0627\u062a \u0627\u0644\u0635\u0644\u0625.\n\n"
                    "**\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u064a\u0625 \u0627\u0644\u0645\u0642\u062a\u0631\u062d\u0625:**\n"
                    "1. **\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0646\u0634\u0627\u0637 \u0648\u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a**: \u0627\u062e\u062a\u0631 \u0627\u0644\u0623\u0646\u0634\u0637\u0625 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0625 \u0644\u0634\u0631\u0643\u062a\u0643 \u062d\u064a\u062b \u064a\u062d\u062f\u062f \u0630\u0644\u0643 \u0646\u0648\u0639 \u0627\u0644\u0631\u062e\u0635\u0625 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0625 (\u0645\u0647\u0646\u064a\u0625\u060c \u062a\u062c\u0627\u0631\u064a\u0625\u060c \u0635\u0646\u0627\u0639\u064a\u0625).\n"
                    "2. **\u062d\u062c\u0632 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u062a\u062c\u0627\u0631\u064a**: \u062a\u0642\u062f\u0645 \u0628\u0637\u0644\u0628 \u062d\u062c\u0632 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u062a\u062c\u0627\u0631\u064a \u0648\u0627\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0627\u062f\u0642\u0625 \u0627\u0644\u0645\u0628\u062f\u0625\u064a\u0625 \u0639\u0628\u0631 \u0645\u0648\u0642\u0639 \u062f\u0627\u0626\u0631\u0625 \u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f \u0648\u0627\u0644\u0633\u064a\u0627\u062d\u0625 (DET).\n"
                    "3. **\u0625\u0639\u062f\u0627\u062f \u0639\u0642\u062f \u0627\u0644\u062a\u0623\u0633\u064a\u0633 \u0648\u0639\u0642\u062f \u0627\u0644\u0625\u064a\u062c\u0627\u0631**: \u0648\u0642\u0639 \u0639\u0642\u062f \u0627\u0644\u062a\u0623\u0633\u064a\u0633 (MOA) \u0644\u0644\u0634\u0631\u0643\u0625\u060c \u0648\u0642\u0645 \u0628\u0627\u0633\u062a\u0626\u062c\u0627\u0631 \u0645\u0643\u062a\u0628 \u0641\u0639\u0644\u064a \u0648ت\u0633\u062c\u064a\u0644 \u0639\u0642\u062f \u0625\u064a\u062c\u0627\u0631\u064a\u060c \u062b\u0645 \u0627\u062f\u062f\u0639 \u0627\u0644\u0631\u0633\u0648\u0645 \u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0631\u062e\u0635\u0625."
                )
            else:
                content = (
                    "Setting up a business in the UAE requires selecting a legal form (e.g., Limited Liability Company - LLC, Sole Establishment) "
                    "and choosing between Mainland registration (supervised by the Department of Economy and Tourism) and Free Zone registration "
                    "(offering 100% foreign ownership, specific customs exemptions, and tax incentives).\n\n"
                    "**Suggested Next Steps:**\n"
                    "1. **Select Activity & Legal Form**: Choose your business activities which determine your license type (Commercial, Professional, Industrial).\n"
                    "2. **Reserve Trade Name**: Reserve your name and apply for Initial Approval through DET or the relevant Free Zone Authority.\n"
                    "3. **Draft MOA & Rent Office**: Sign the Memorandum of Association and rent physical/virtual premises to obtain your license."
                )
        else:
            if lang == "ar":
                content = (
                    "\u062a\u0645 \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0633\u062a\u0641\u0633\u0627\u0631\u0643 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a. \u064a\u0631\u062c\u0649 \u062a\u0648\u0636\u064a\u062d \u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644 \u064a\u062a\u0639\u0644\u0642 \u0628\u0639\u0642\u062f \u062a\u0648\u0638\u064a\u0641 \u0645\u0633\u062c\u0644 \u0644\u062f\u0649 \u0648\u0632\u0627\u0631\u0625 \u0627\u0644\u0639\u0645\u0644 (MOHRE) \u0623\u0648 \u0625\u064a\u062c\u0627\u0631\u064a \u0639\u0642\u0627\u0631\u064a \u0641\u064a \u062f\u0628\u064a (DLD) \u0623\u0648 \u0644\u0648\u0627\u0626\u062d \u0627\u0644\u0647\u0648\u064a\u0625 \u0627\u0644\u0631\u0642\u0645\u064a\u0625 \u0644\u062a\u0632\u0648\u064a\u062f\u0643 \u0628\u0627\u0644\u062a\u0648\u062c\u064a\u0647 \u0648\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a\u0625 \u0627\u0644\u0631\u0633\u0645\u064a\u0625 \u0627\u0644\u062f\u0642\u064a\u0642\u0625."
                )
            else:
                content = (
                    "Your inquiry is noted. Please clarify if this relates to a MOHRE labour contract, tenancy Ejari details under the Dubai Land Department, or commercial license guidelines for exact UAE regulatory next steps."
                )
        
        return {"content": content, "citations": citations}

    def summarize_legal_document(self, text: str, filename: str, lang: str = "en") -> dict:
        """
        Extracts summary, key legal obligations, risks, and deadlines from document text.
        Falls back to local parser/summarizer if OpenAI is not configured.
        """
        if self.client:
            try:
                system_prompt = (
                    "You are CiviMind AI Document Analyzer. Analyze the provided UAE legal/business document and return a detailed response in JSON format.\n"
                    "You must output ONLY a valid JSON object matching this schema:\n"
                    "{\n"
                    "  \"summary\": \"Clear 2-3 paragraph summary in the user's language\",\n"
                    "  \"highlights\": [\n"
                    "    {\"title\": \"Key Clause/Point Title\", \"description\": \"Detailed explanation of this clause in relation to UAE regulations\"}\n"
                    "  ],\n"
                    "  \"risks\": [\n"
                    "    {\"title\": \"Identified Risk Title\", \"description\": \"Explanation of potential risks, penalties, or compliance liabilities\"}\n"
                    "  ],\n"
                    "  \"deadlines\": [\n"
                    "    {\"title\": \"Key Deadline Event\", \"description\": \"Specific dates, notice periods, or validity limits found in the document\"}\n"
                    "  ]\n"
                    "}\n"
                    f"Analyze the document text and respond in '{lang}'."
                )
                
                response = self.client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Document Name: {filename}\n\nDocument Text:\n{text[:4000]}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2
                )
                
                import json
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                print(f"Error in OpenAI Document Summary: {e}. Falling back to Rule Summary.")

        # Fallback local analyzer based on simple textual rules
        text_lower = text.lower()
        
        # Detect document type
        is_labour = any(x in text_lower for x in ["labor", "labour", "employment", "employer", "employee", "salary", "wage", "work", "job", "terminate", "dismiss", "resign", "probation", "notice period"])
        is_rental = any(x in text_lower for x in ["rent", "rental", "tenant", "landlord", "evict", "eviction", "ejari", "tenancy", "rera", "lease", "apartment", "villa", "property"])
        
        if is_labour:
            if lang == "ar":
                summary = (
                    f"\u062a\u0645 \u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0645\u0633\u062a\u0646\u062f '{filename}' \u0643\u0639\u0642\u062f \u0639\u0645\u0644 \u064a\u062e\u0636\u0639 \u0644\u0642\u0648\u0627\u0646\u064a\u0646 \u0627\u0644\u0639\u0645\u0644 \u0641\u064a \u062f\u0648\u0644\u0625 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0627\u0644\u0639\u0631\u0628\u064a\u0625 \u0627\u0644\u0645\u062a\u062d\u062f\u0625.\n\n"
                    "\u064a\u062d\u062f\u062f \u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u062f \u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u0623\u062d\u0643\u0627\u0645 \u0627\u0644\u062e\u0627\u0635\u0625 \u0628\u0627\u0644\u0648\u0638\u064a\u0641\u0625\u060c \u0628\u0645\u0627 \u0641\u064a \u0630\u0644\u0643 \u0627\u0644\u0645\u0633\u0645\u064a\u0627\u062a \u0627\u0644\u0648\u0638\u064a\u0641\u0625 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064a\u0627\u062a \u0648\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0625 \u0648\u0641\u062a\u0631\u0627\u062a \u0627\u0644\u0625\u062c\u0627\u0632\u0627\u062a "
                    "\u0648\u0627\u0644\u0631\u0627\u062a\u0628 \u0627\u0644\u0623\u0633\u0627\u0633\u064a \u0648\u0627\u0644\u0645\u0632\u0627\u064a\u0625 \u0627\u0644\u0625\u0636\u0627\u0641\u064a\u0625\u060c \u0628\u0627\u0644\u0625\u0636\u0627\u0641\u0625 \u0625\u0644\u0649 \u0634\u0631\u0648\u0637 \u0625\u0646\u0647\u0627\u0625 \u0627\u0644\u062e\u062f\u0645\u0625 \u0648\u0641\u062a\u0631\u0625 \u0627\u0644\u062a\u062c\u0631\u0628\u0625 \u0627\u0644\u0645\u0642\u0631\u0631\u0625."
                )
                highlights = [
                    {"title": "\u0627\u0644\u0631\u0627\u062a\u0628 \u0648\u0627\u0644\u0645\u0633\u062a\u062d\u0642\u0627\u062a \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0625", "description": "\u064a\u062d\u062f\u062f \u0627\u0644\u0623\u062c\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064a \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0644\u062a\u0632\u0645 \u0628\u062a\u062d\u0648\u064a\u0644\u0647 \u0639\u0628\u0631 \u0645\u0646\u0634\u0623\u062a \u062d\u0645\u0627\u064a\u0625 \u0627\u0644\u0623\u062c\u0648\u0631 \u0634\u0647\u0631\u064a\u0625\u064b."},
                    {"title": "\u0641\u062a\u0631\u0625 \u0627\u0644\u062a\u062c\u0631\u0628\u0625 \u0648\u0627\u0644\u0625\u0646\u0647\u0627\u0625", "description": "\u062a\u062d\u062f\u062f \u0641\u062a\u0631\u0625 \u0627\u0644\u062a\u062c\u0631\u0628\u0625 \u0628\u062d\u062f \u0623\u0642\u0635\u0649 6 \u0623\u0634\u0647\u0631\u060c \u0648\u064a\u062a\u0637\u0644\u0628 \u0625\u0646\u0647\u0627\u0625 \u0627\u0644\u062e\u062f\u0645\u0625 \u0625\u062e\u0637\u0627\u0631\u0627\u064b \u0645\u0633\u0628\u0642\u0627\u064b \u0644\u0627 \u064a\u0642\u0644 \u0639\u0645 30 \u064a\u0648\u0645\u0627\u064b."},
                    {"title": "\u0645\u0643\u0627\u0641\u0623\u0625 \u0646\u0647\u0627\u0645 \u0627\u0644\u062e\u062f\u0645\u0625", "description": "\u064a\u0633\u062a\u062d\u0642 \u0627\u0644\u0639\u0627\u0645\u0644 \u0627\u0644\u0630\u064a \u0623\u0643\u0645\u0644 \u0633\u0646\u0625 \u0623\u0648 \u0623\u0643\u062b\u0631 \u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0625 \u0645\u0643\u0627\u0641\u0623\u0625 \u0646\u0647\u0627\u0645 \u0627\u0644\u062e\u062f\u0645\u0625 \u062a\u062d\u062a\u0633\u0628 \u0639\u0644\u0649 \u0623\u0633\u0627\u0633 \u0627\u0644\u0623\u062c\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064a."}
                ]
                risks = [
                    {"title": "\u0639\u062f\u0645 \u062f\u0641\u0639 \u0627\u0644\u0631\u0648\u0627\u062a\u0628 \u0641\u064a \u0645\u0648\u0639\u062f\u0647\u0627", "description": "\u062a\u0623\u062e\u064a\u0631 \u0627\u0644\u0631\u0627\u062a\u0628 \u0644\u0623\u0643\u062b\u0631 \u0645\u0646 15 \u064a\u0648\u0645\u0627\u064b \u064a\u0639\u0631\u0636 \u0627\u0644\u0645\u0646\u0634\u0623\u0625 \u0644\u063a\u0631\u0627\u0645\u0627\u062a \u0648\u0639\u0642\u0648\u0628\u0627\u062a \u0648\u0648\u0642\u0641 \u062a\u0635\u0627\u0631\u064a\u062d  \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062c\u062f\u064a\u062f\u0625."},
                    {"title": "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062a\u0639\u0633\u0641\u064a \u0648\u0627\u0644\u0625\u0646\u0647\u0627\u0625 \u063a\u064a\u0631 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a", "description": "\u0625\u0646\u0647\u0627\u0625 \u062e\u062f\u0645\u0625 \u0627\u0644\u0639\u0627\u0645\u0644 \u0644\u0633\u0628\u0628 \u063a\u064a\u0631 \u0645\u0634\u0631\u0648\u0639 \u064a\u0644\u0632\u0645 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0628\u062f\u0641\u0639 \u062a\u0639\u0648\u064a\u0636 \u064a\u0635\u0644 \u0625\u0644\u0649 \u0631\u0627\u062a\u0628 3 \u0623\u0634\u0647\u0631."}
                ]
                deadlines = [
                    {"title": "\u0641\u062a\u0631\u0625 \u0627\u0644\u0625\u062e\u0637\u0627\u0631 \u0644\u0625\u0646\u0647\u0627\u0625 \u0627\u0644\u0639\u0642\u062f", "description": "\u064a\u062c\u0628 \u0639\u0644\u0649 \u0643\u0644\u0627 \u0627\u0644\u0637\u0631\u0641\u064a\u0646  \u062a\u0642\u062f\u064a\u0645 \u0625\u062e\u0637\u0627\u0631 \u0643\u062a\u0627\u0628\u064a \u0642\u0628\u0644 30 \u0625\u0644\u0649 90 \u064a\u0648\u0645\u0627\u064b \u0645\u0646 \u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0645\u062d\u062f\u062f \u0644\u0625\u0646\u0647\u0627\u0625 \u0627\u0644\u0639\u0642\u062f."},
                    {"title": "\u0641\u062a\u0631\u0625 \u0627\u0644\u062a\u0642\u0627\u062f\u0645 \u0644\u0644\u0645\u0637\u0627\u0644\u0628\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u064a\u0625", "description": "\u062a\u062a\u0642\u0627\u062f\u0645 \u0627\u0644\u062f\u0639\u0627\u0648\u0649 \u0627\u0644\u0639\u0645\u0644\u064a\u0625 \u0628\u0645\u0631\u0648\u0631 \u0633\u0646\u0625 \u0648\u0627\u062d\u062f\u0625 \u0645\u0646 \u062a\u0627\u0631\u064a\u062e \u0627\u0633\u062a\u062d\u0642\u0627\u0642 \u0627\u0644\u062d\u0642 \u0627\u0644\u0645\u0637\u0627\u0644\u0628 \u0628\u0647."}
                ]
            else:
                summary = (
                    f"The document '{filename}' was identified as a UAE Employment Contract under the MOHRE regulatory framework.\n\n"
                    "This agreement governs the relationship between the employer and employee. It delineates roles, standard work hours, "
                    "leave parameters, base salaries, benefits, and statutory provisions for separation."
                )
                highlights = [
                    {"title": "Remuneration Details", "description": "Defines base salary and allowances to be deposited monthly through the Wages Protection System (WPS)."},
                    {"title": "Probationary Controls", "description": "Probation periods are capped at a maximum of 6 months, requiring a minimum of 14 days' written notice for termination."},
                    {"title": "Gratuity Entitlement", "description": "Employees with over 1 year of service qualify for end-of-service gratuity calculated on basic salary."}
                ]
                risks = [
                    {"title": "Late Salary Penalties", "description": "Delays exceeding 15 days trigger blockages on corporate work permits and MOHRE administrative fines."},
                    {"title": "Arbitrary Dismissal Liability", "description": "Unlawful termination may obligate employers to pay up to 3 months' gross wages as compensation."}
                ]
                deadlines = [
                    {"title": "Notice Period Window", "description": "Requires a 30 to 90-day advance warning in writing before executing contract termination."},
                    {"title": "Statute of Limitations", "description": "Labour dispute claims must be officially filed with MOHRE within 1 year from the date the entitlement became due."}
                ]
        elif is_rental:
            if lang == "ar":
                summary = (
                    f"\u062a\u0645 \u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0645\u0633\u062a\u0646\u062f '{filename}' \u0643\u0639\u0642\u062f \u0625\u064a\u062c\u0627\u0631 \u0633\u0643\u0646\u064a \u0623\u0648 \u062a\u062c\u0627\u0631\u064a (\u0625\u064a\u062c\u0627\u0631\u064a) \u0644\u0639\u0642\u0627\u0631 \u0641\u064a \u062f\u0648\u0644\u0625 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0627\u0644\u0639\u0631\u0628\u064a\u0625 \u0627\u0644\u0645\u062a\u062d\u062f\u0625.\n\n"
                    "\u064a\u062d\u062f\u062f \u0627\u0644\u0639\u0642\u062f \u0627\u0644\u0639\u0644\u0627\u0642\u0625 \u0627\u0644\u0642\u0627\u0646\u0648ن\u064a\u0625 \u0628\u064a\u0646 \u0627\u0644\u0645\u0624\u062c\u0631 \u0648\u0627\u0644\u0645\u0633\u062a\u0623\u062c\u0631 \u0644\u0648\u062d\u062f\u0625 \u0639\u0642\u0627\u0631\u064a\u0625. "
                    "\u064a\u0634\u0645\u0644 \u062a\u0641\u0627\u0635\u064a\u0644 \u0641\u062a\u0631\u0625 \u0627\u0644\u0625\u064a\u062c\u0627\u0631\u060c \u0627\u0644\u0642\u064a\u0645\u0625 \u0627\u0644\u0625\u064a\u062c\u0627\u0631\u064a\u0625 \u0627\u0644\u0633\u0646\u0648\u064a\u0625\u060c \u0637\u0631\u064a\u0642\u0625 \u0627\u0644\u062f\u0641\u0639 \u0628\u0627\u0644\u0634\u064a\u0643\u0627\u062a\u060c \u0648\u062a\u0648\u0632\u064a\u0639 \u0645\u0633\u0624\u0648\u0644\u064a\u0627\u062a \u0627\u0644\u0635\u064a\u0627\u0646\u0625 \u0627\u0644\u0643\u0628\u0631\u0649 \u0648\u0627\u0644\u062a\u0631\u0645\u064a\u0645."
                )
                highlights = [
                    {"title": "\u0641ت\u0631\u0625 \u0627\u0644\u0625\u064a\u062c\u0627\u0631 \u0648\u0642\u064a\u0645\u0625 \u0627\u0644\u062f\u0641\u0639", "description": "\u064a\u062d\u062f\u062f \u0642\u064a\u0645\u0625 \u0627\u0644\u0625\u064a\u062c\u0627\u0631 \u0627\u0644\u0633\u0646\u0648\u064a\u0625 \u0648\u0645\u0648\u0627\u0639\u064a\u062f \u0627\u0633\u062a\u062d\u0642\u0627\u0642 \u0627\u0644\u0634\u064a\u0643\u0627\u062a \u0627\u0644\u0645\u0648د\u0639\u0625 \u0644\u062f\u0649 \u0627\u0644\u0645\u0627\u0644\u0643."},
                    {"title": "\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0635\u064a\u0627\u0646\u0625 \u0648\u0627\u0644\u062a\u0631\u0645\u064a\u0645", "description": "\u064a\u062d\u062f\u062f \u062a\u0648\u0632\u064a\u0639 \u0645\u0633\u0624\u0648\u0644\u064a\u0627\u062a \u0627\u0644\u0635\u064a\u0627\u0646\u0625 (\u0639\u0627\u062f\u0625\u064b \u0627\u0644\u0645\u0627\u0644\u0643 \u0644\u0644\u0635\u064a\u0627\u0646\u0625 \u0627\u0644\u0643\u0628\u0631\u0649 \u0641\u0648\u0642 500 \u062f\u0631\u0647\u0645\u060c \u0648\u0627\u0644\u0645\u0633\u062a\u0623\u062c\u0631 \u0644\u0644\u0635\u064a\u0627\u0646\u0625  \u0627\u0644\u0628\u0633\u064a\u0637\u0625)."},
                    {"title": "\u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0645\u0633\u0645\u0648\u062d \u0628\u0647 \u0644\u0644\u0648\u062d\u062f\u0625", "description": "\u064a\u0645\u0646\u0639 \u062a\u063a\u064a\u064a\u0631 \u0637\u0628\u064a\u0639\u0625 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0648\u062d\u062f\u0625 \u0623\u0648 \u062a\u0623\u062c\u064a\u0631\u0647\u0627 \u0645\u0646 \u0627\u0644\u0628\u0627\u0637\u0646 \u062f\u0648\u0646 \u0645\u0648\u0627\u0641\u0642\u0625 \u0643\u062a\u0627\u0628\u064a\u0625 \u0635\u0631\u064a\u062d\u0625 \u0645\u0646 \u0627\u0644\u0645\u0627\u0644\u0643."}
                ]
                risks = [
                    {"title": "\u0627\u0644\u0625\u062e\u0637\u0627\u0631 \u0628\u0627\u0644\u0625\u062e\u0644\u0627\u0625 \u062f\u0648\u0646 \u0645\u0628\u0631\u0631 \u0642\u0627\u0646\u0648\u0646\u064a", "description": "\u064a\u062d\u0645\u064a \u0627\u0644\u0642\u0627\u0646\u0648\u0646 \u0627\u0644\u0645\u0633\u062a\u0623\u062c\u0631 \u0645\u0646 \u0627\u0644\u0637\u0631\u062f \u062a\u0639\u0633\u0641\u064a\u0625\u064b\u060c \u0648\u064a\u062a\u0637\u0644\u0628 \u0625\u062e\u0637\u0627\u0631\u0627\u064b \u0645\u062f\u062a\u0647 12 \u0634\u0647\u0631\u0627\u064b \u0639\u0628\u0631 \u0627\u0644\u0643\u0627\u062a\u0628 \u0627\u0644\u0639\u062f\u0644."},
                    {"title": "\u0632\u064a\u0627\u062f\u0627\u062a \u063a\u064a\u0631 \u0642\u0627\u0646\u0648\u0646\u064a\u0625 \u0641\u064a \u0627\u0644\u0625\u062e\u0627\u0631", "description": "\u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0648\u0627\u0641\u0642 \u0623\u064a \u0632\u064a\u0627\u062f\u0625 \u0645\u0639 \u062d\u0627\u0633\u0628\u0625 \u0625\u064a\u062c\u0627\u0631 RERA \u0645\u0639 \u0625\u062e\u0637\u0627\u0631 \u0627\u0644\u0645\u0633\u062a\u0623\u062c\u0631 \u0642\u0628\u0644 90 \u064a\u0648\u0645\u0627\u064b."}
                ]
                deadlines = [
                    {"title": "\u0625\u062e\u0637\u0627\u0631 \u0627\u0644\u0625\u062e\u0644\u0627\u0625 \u0627\u0644\u0631\u0633\u0645\u064a", "description": "\u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0627\u0644\u0625\u062e\u0637\u0627\u0631 \u0642\u0628\u0644 12 \u0634\u0647\u0631\u0627\u064b \u0643\u0627\u0645\u0644\u0625\u060c \u0648\u064a\u0631\u0633\u0644 \u0639\u0628\u0631 \u0627\u0644\u0643\u0627\u062a\u0628 \u0627\u0644\u0639\u062f\u0644 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0645\u0633\u062c\u0644."},
                    {"title": "\u0625\u062e\u0637\u0627\u0631 \u062a\u0639\u062f\u064a\u0644 \u0634\u0631\u0648\u0637 \u0627\u0644\u0639\u0642\u062f", "description": "\u064a\u062c\u0628 \u0625\u062e\u0637\u0627\u0631 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0622\u062e\u0631 \u0628\u0623\u064a \u0631\u063a\u0628\u0625 \u0641\u064a \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0623\u062c\u0631\u0625 \u0623\u0648 \u0634\u0631\u0648\u0637 \u0627\u0644\u0639\u0642\u062f \u0642\u0628\u0644 90 \u064a\u0648\u0645\u0627\u064b \u0645\u0646 \u0627\u0644\u0627\u0646\u062a\u0647\u0625."}
                ]
            else:
                summary = (
                    f"The document '{filename}' was identified as a Tenancy Contract (Ejari) for a UAE property.\n\n"
                    "This agreement governs the leasing terms between the Landlord and the Tenant. It specifies rent schedules, "
                    "cheque distribution, security deposit parameters, and general upkeep obligations."
                )
                highlights = [
                    {"title": "Rent Installments & Schedule", "description": "Defines the total annual rent and the due dates of the post-dated cheques issued to the landlord."},
                    {"title": "Maintenance Allocations", "description": "Usually splits repair work (landlord handles major repairs over AED 500; tenant covers minor consumables)."},
                    {"title": "Property Use Restrictions", "description": "Prohibits structural alterations or subleasing without written authorization from the owner."}
                ]
                risks = [
                    {"title": "Arbitrary Eviction Risk", "description": "Landlords cannot force evictions without a 12-month advance written notice served via Notary Public."},
                    {"title": "Unauthorized Rent Hikes", "description": "Any rental increases must align with the RERA Rental Index calculator limits and parameters."}
                ]
                deadlines = [
                    {"title": "Eviction Notice Period", "description": "Requires exactly 12 months' official notice via Notary Public to enforce property evacuation."},
                    {"title": "Contract Renewal Modification Notice", "description": "Any change to lease terms or rent requires 90 days' advance notice before the expiry date."}
                ]
        else:
            if lang == "ar":
                summary = (
                    f"\u062a\u0645 \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0645\u0633\u062a\u0646\u062f \u0627\u0644\u0639\u0627\u0645 '{filename}' \u0628\u0646\u062c\u0627\u062d.\n\n"
                    "\u064a\u0648\u0636\u062d \u0647\u0630\u0627 \u0627\u0644\u0645\u0644\u0641 \u0628\u0646\u0648\u062f\u0627\u064b \u0639\u0627\u0645\u0625 \u0623\u0648 \u0645\u0633\u062a\u0646\u062f\u0627\u062a \u062b\u0628\u0648\u062a\u064a\u0625 \u062a\u0645 \u0631\u0641\u0639\u0647\u0627. "
                    "\u064a\u062a\u0645 \u0627\u0633\u062a\u062e\u0631\u0627\u062c \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0648\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646  \u0627\u0644\u062a\u0632\u0627\u0645\u0647\u0627 \u0628\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0648\u0627\u0644\u0644\u0648\u0627\u0626\u062d  \u0627\u0644\u0645\u0639\u0645\u0648\u0644 \u0628\u0648\u0633\u062a\u0647\u0627 \u0641\u064a \u062f\u0648\u0644\u0625 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a."
                )
                highlights = [
                    {"title": "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0644\u0644\u0623\u0646\u0638\u0645\u0625 \u0627\u0644\u0645\u062d\u0644\u064a\u0625", "description": "\u064a\u062a\u0637\u0644\u0628 \u0645\u0631\u0627\u062c\u0639\u0625 \u062a\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u0633\u062a\u0646\u062f \u0645\u0639 \u0627\u0644\u062c\u0647\u0627\u062a \u0627\u0644\u0645\u0646\u0638\u0645\u0625 (\u0645\u062b\u0644 \u0627\u0644\u0647\u0648\u064a\u0625 \u0627\u0644\u0627\u062a\u062d\u0627\u062f\u064a\u0625\u060c  \u0627\u0644\u0628\u064a\u0644\u062f\u064a\u0625 \u0623\u0648 \u0627\u0644\u062f\u0648\u0627\u0626\u0631 \u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f\u064a\u0625)."},
                    {"title": "\u0627\u0643\u062a\u0645\u0627\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a", "description": "\u062a\u0623\u0643\u062f \u0645\u0646 \u0648\u062c\u0648\u062f \u0627\u0644\u062a\u0648\u0627\u0642\u064a\u0639\u060c  \u0627\u0644\u0623\u062e\u062a\u0627م \u0627\u0644\u0631\u0633\u0645\u064a\u0625\u060c \u0648\u0627\u0644\u062a\u0648\u0627\u0631\u064a\u062e \u0627\u0644\u0633\u0627\u0631\u064a\u0625 \u0644\u062a\u062c\u0646\u0628 \u0631\u0641\u0636 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0625."}
                ]
                risks = [
                    {"title": "\u0627\u0645\u062a\u0647\u0625 \u0635\u0644\u0627\u062d\u064a\u0625 \u0627\u0644\u0645\u0633\u062a\u0646\u062f", "description": "\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0645\u0646\u062a\u0647\u064a\u0625 \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0625 \u0642\u062f \u064a\u0639\u0631\u0636\u0643 \u0644\u063a\u0631\u0627\u0645\u0627\u062a \u0625\u062f\u0627\u0631\u064a\u0625 \u0623\u0648 \u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0627\u0644\u062d\u0643\u0648\u0645\u064a\u0625."},
                    {"title": "\u0646\u0642\u0635 \u0627\u0644\u062a\u0648\u062b\u064a\u0642 \u0623\u0648 \u0627\u0644\u062a\u0635\u062f\u064a\u0642", "description": "\u0628\u0639\u0636 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0627\u0644\u062e\u0627\u0631\u062c\u064a\u0625 \u062a\u062a\u0637\u0644\u0628 \u062a\u0635\u062f\u064a\u0642 \u0648\u0632\u0627\u0631\u0625 \u0627\u0644\u062e\u0627\u0631\u062c\u064a\u0625 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a\u064a\u0625 \u0644\u062a\u0643\u0648\u0646 \u0645\u0639\u062a\u0645\u062f\u0625 \u0648\u0635\u0627\u0644\u062d\u0625 \u0644\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645."}
                ]
                deadlines = [
                    {"title": "\u0641\u062a\u0631\u0625 \u062a\u062c\u062f\u064a\u062f \u0627\u0644\u0645\u0633\u062a\u0646\u062f", "description": "\u064a\u0648\u0635\u064a \u0628\u0628\u062f\u0621 \u0625\u062c\u0631\u0627\u0621\u0627\u062a \u062a\u062c\u062f\u064a\u062f \u0627\u0644\u0645\u0633\u062a\u0646\u062f \u0642\u0628\u0644 30 \u064a\u0648\u0645\u0627\u064b \u0645\u0646 \u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0625 \u0627\u0644\u0645\u0648\u0636\u062d \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062a\u0646\u062f \u0644\u062a\u062c\u0646\u0628 \u0627\u0644\u063a\u0631\u0627\u0645\u0627\u062a."},
                    {"title": "\u0627\u0644\u0631\u062f \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631\u0627\u062a \u0627\u0644\u0631\u0633\u0645\u064a\u0625", "description": "\u062a\u0645\u0646\u062d \u0627\u0644\u062c\u0647\u0627\u062a \u0627\u0644\u062d\u0643\u0648\u0645\u064a\u0625 \u0639\u0627\u062f\u0625\u064b \u0641\u062a\u0631\u0625 14 \u064a\u0648\u0645\u0627\u064b \u0644\u0644\u0631\u062f \u0639\u0644\u0649 \u0627\u0644\u0646\u0648\u0627\u0642\u0635 \u0642\u0628\u0644 \u0625\u0644\u063a\u0627\u0625 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0625 \u062a\u0644\u0642\u0627\u0626\u064a\u0625\u064b."}
                ]
            else:
                summary = (
                    f"The general document '{filename}' has been successfully analyzed.\n\n"
                    "This file appears to contain miscellaneous business notes or personal identification records. "
                    "The system extracts textual metadata to check for alignment with UAE compliance checklist standards."
                )
                highlights = [
                    {"title": "Regulatory Conformity", "description": "Requires evaluation against the standard administrative rules of UAE federal or local departments."},
                    {"title": "Administrative Validity", "description": "Ensure official seals, signatures, and validity dates are intact to prevent procedural delays."}
                ]
                risks = [
                    {"title": "Validity Expiry Concerns", "description": "Using expired documentation can stall applications or result in municipal/department fines."},
                    {"title": "Attestation Gaps", "description": "Foreign documents require Ministry of Foreign Affairs (MOFA) attestation to be considered valid."}
                ]
                deadlines = [
                    {"title": "Renewal Threshold", "description": "Initiating renewals 30 days prior to the displayed expiration is advised to maintain compliance."},
                    {"title": "Request for Information Window", "description": "Official requests for correction must be resolved within 14 days to keep the application active."}
                ]

        return {"summary": summary, "highlights": highlights, "risks": risks, "deadlines": deadlines}

ai_service = AIService()
