from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.models import Service, Schedule, Announcement, Document, DocumentChunk
from app.ai.intent import detect_intent
from app.ai.rag import search_similar_chunks

TRANSLATIONS = {
    "en": {
        "area_label": "Area",
        "day_label": "Collection Day",
        "timing_label": "Timing",
        "details_label": "Details",
        "important_label": "Important Instructions",
        "contact_label": "Contact",
        "source_label": "Source",
        "fallback": "I could not find verified civic information for this specific request. Please contact the PMC citizen helpline at 1800-103-0222 or visit your local ward office.",
        "complaint_guide": "You can report this civic issue directly in CivicConnect AI by clicking Report Issue in the menu or going to /complaints/new. Attach a photo and track resolution in real time.",
        "static_transport_note": "Note: Timings are based on scheduled municipal timetables. Live GPS tracking is not enabled.",
        "greeting": "Hello! I am **CivicConnect AI**, your community assistant.\n\nI can help you with:\n• Garbage pickup schedules\n• Bus transport timings\n• Emergency helpline numbers\n• Water and electricity information\n• Parks and recreation\n• Property tax and civic services\n• Reporting potholes, lights, and civic issues\n\nHow may I assist you today?",
        "suggested": [
            "When is garbage collected?",
            "Show bus timings.",
            "What are emergency helpline numbers?",
            "How can I report a pothole?",
            "Is there a water supply notice?",
            "Show public services.",
            "Tell me about parks near me.",
            "How do I pay property tax?",
            "Any new announcements?",
            "Nearest hospital?"
        ]
    },
    "hi": {
        "area_label": "क्षेत्र",
        "day_label": "संग्रहण दिवस",
        "timing_label": "समय",
        "details_label": "विवरण",
        "important_label": "महत्वपूर्ण निर्देश",
        "contact_label": "संपर्क नंबर",
        "source_label": "स्रोत",
        "fallback": "मुझे इस अनुरोध के लिए सत्यापित जानकारी नहीं मिली। कृपया PMC नागरिक हेल्पलाइन 1800-103-0222 पर संपर्क करें।",
        "complaint_guide": "आप CivicConnect AI में Report Issue पर क्लिक करके या /complaints/new पर जाकर शिकायत दर्ज कर सकते हैं। फोटो अपलोड करें और स्थिति ट्रैक करें।",
        "static_transport_note": "नोट: यह समय नगरपालिका तालिका पर आधारित है। लाइव GPS उपलब्ध नहीं है।",
        "greeting": "नमस्ते! मैं **CivicConnect AI** हूं, आपका नागरिक सहायक।\n\nमैं इन विषयों पर मदद कर सकता हूं:\n• कचरा उठाने का समय\n• बस का समय\n• आपातकालीन हेल्पलाइन\n• पानी और बिजली की जानकारी\n• पार्क और मनोरंजन\n• संपत्ति कर और नागरिक सेवाएं\n• सड़क, बत्ती और नागरिक समस्याएं\n\nआज मैं आपकी किस प्रकार सहायता करूं?",
        "suggested": [
            "कचरा कब उठाया जाता है?",
            "बस का समय बताओ।",
            "आपातकालीन हेल्पलाइन नंबर क्या हैं?",
            "सड़क का गड्ढा कैसे रिपोर्ट करें?",
            "क्या आज पानी की कटौती है?",
            "नागरिक सेवाएं दिखाएं।",
            "पास में पार्क कहाँ है?",
            "संपत्ति कर कैसे भरें?",
            "कोई नई सूचना है?",
            "नजदीकी अस्पताल कौन सा है?"
        ]
    },
    "mr": {
        "area_label": "परिसर",
        "day_label": "कचरा संकलन दिवस",
        "timing_label": "वेळ",
        "details_label": "तपशील",
        "important_label": "महत्त्वाच्या सूचना",
        "contact_label": "संपर्क क्रमांक",
        "source_label": "माहिती स्रोत",
        "fallback": "सध्याच्या डेटाबेसमध्ये या विनंतीसाठी अधिकृत माहिती उपलब्ध नाही. कृपया PMC हेल्पलाईन 1800-103-0222 वर संपर्क साधा.",
        "complaint_guide": "आपण CivicConnect AI वर Report Issue वर क्लिक करून तक्रार नोंदवू शकता (/complaints/new). पुरावा फोटो जोडा आणि प्रगतीचा मागोवा घ्या.",
        "static_transport_note": "नोंद: ही वेळ अधिकृत वेळापत्रकावर आधारित आहे. रिअल-टाइम बस ट्रॅकिंग उपलब्ध नाही.",
        "greeting": "नमस्कार! मी **CivicConnect AI** आहे, आपला नागरिक सहाय्यक.\n\nमी या विषयांवर मदत करू शकतो:\n• कचरा संकलनाचे वेळापत्रक\n• बस वेळापत्रक\n• आपत्कालीन हेल्पलाईन\n• पाणी आणि वीज माहिती\n• उद्याने आणि करमणूक\n• मालमत्ता कर आणि नागरी सेवा\n• रस्ता, दिवे आणि नागरी तक्रारी\n\nआज मी आपली कशी मदत करू?",
        "suggested": [
            "कचरा कधी गोळा केला जातो?",
            "बसचे वेळापत्रक दाखवा.",
            "आपत्कालीन हेल्पलाइन क्रमांक काय आहेत?",
            "खड्ड्यांची तक्रार कशी करावी?",
            "पाणी पुरवठ्याची काही सूचना आहे का?",
            "नागरी सेवा दाखवा.",
            "जवळचे उद्यान कोठे आहे?",
            "मालमत्ता कर कसा भरावा?",
            "नवीन घोषणा आहेत का?",
            "जवळचे रुग्णालय कुठे आहे?"
        ]
    }
}

def generate_ai_response(
    db: Session,
    query: str,
    user_area: Optional[str] = "Shivaji Nagar",
    language: str = "en"
) -> Dict[str, Any]:
    lang = language if language in TRANSLATIONS else "en"
    t = TRANSLATIONS[lang]

    intent, detected_area = detect_intent(query)
    effective_area = detected_area or user_area or "Shivaji Nagar"

    sources: List[Dict[str, Any]] = []
    reply_text = ""
    is_fallback = False

    # 1. GARBAGE
    if intent == "GARBAGE":
        schedules = (
            db.query(Schedule, Service)
            .join(Service, Schedule.service_id == Service.id)
            .filter(
                Service.category.ilike("%waste%") | Service.category.ilike("%garbage%"),
                or_(Schedule.area.ilike(f"%{effective_area}%"), Schedule.area == "All Areas")
            ).all()
        )
        if schedules:
            lines = ["**Garbage Collection Schedule**\n", f"**{t['area_label']}:** {effective_area}"]
            for sch, srv in schedules:
                lines.append(f"**{t['day_label']}:** {sch.day}")
                lines.append(f"**{t['timing_label']}:** {sch.start_time} - {sch.end_time}")
                lines.append(f"**{t['details_label']}:** {sch.details}")
                lines.append(f"**{t['contact_label']}:** {srv.contact_number}")
                sources.append({"title": srv.service_name, "category": "Waste Management",
                                "details": sch.details, "contact": srv.contact_number})
            if lang == "hi":
                lines.append(f"\n**{t['important_label']}:** कृपया गीला और सूखा कचरा अलग रखें। हरी बाल्टी में गीला कचरा और नीली बाल्टी में सूखा कचरा डालें।")
                lines.append("**स्रोत:** नगरपालिका ठोस अपशिष्ट प्रबंधन")
            elif lang == "mr":
                lines.append(f"\n**{t['important_label']}:** ओला कचरा (हिरव्या बादलीत) आणि सुका कचरा (निळ्या बादलीत) वेगळा करा. मिश्रित कचरा उचलला जाणार नाही.")
                lines.append("**माहिती स्रोत:** महानगरपालिका घनकचरा व्यवस्थापन")
            else:
                lines.append(f"\n**{t['important_label']}:** Separate wet waste (green bin) and dry waste (blue bin). Mixed waste will not be collected.")
                lines.append(f"**{t['source_label']}:** Municipal Solid Waste Management Schedule")
            reply_text = "\n".join(lines)
        else:
            is_fallback = True
            reply_text = f"No verified garbage schedule found for '{effective_area}'. {t['fallback']}"

    # 2. BUS_TRANSPORT
    elif intent == "BUS_TRANSPORT":
        schedules = (
            db.query(Schedule, Service)
            .join(Service, Schedule.service_id == Service.id)
            .filter(
                Service.category.ilike("%transport%") | Service.category.ilike("%bus%"),
                or_(Schedule.area.ilike(f"%{effective_area}%"), Schedule.area == "All Areas")
            ).all()
        )
        if schedules:
            lines = ["**Public Bus Transport Schedule**\n", f"**{t['area_label']}:** {effective_area}"]
            for sch, srv in schedules:
                lines.append(f"**Route:** {srv.service_name}")
                lines.append(f"**{t['day_label']}:** {sch.day}")
                lines.append(f"**{t['timing_label']}:** {sch.start_time} - {sch.end_time}")
                lines.append(f"**Stops & Frequency:** {sch.details}")
                lines.append(f"**Depot Contact:** {srv.contact_number}")
                sources.append({"title": srv.service_name, "category": "Public Transport",
                                "details": sch.details, "contact": srv.contact_number})
            lines.append(f"\n*{t['static_transport_note']}*")
            lines.append(f"**{t['source_label']}:** PMPML Timetable Database")
            reply_text = "\n".join(lines)
        else:
            is_fallback = True
            reply_text = f"No bus route records for '{effective_area}'. {t['fallback']}"

    # 3. WATER
    elif intent == "WATER":
        notices = (
            db.query(Announcement)
            .filter(
                Announcement.title.ilike("%water%") | Announcement.description.ilike("%water%"),
                or_(Announcement.area.ilike(f"%{effective_area}%"), Announcement.area == "All Areas")
            ).all()
        )
        water_service = db.query(Service).filter(Service.category.ilike("%water%")).first()
        lines = ["**Water Supply Information**\n", f"**{t['area_label']}:** {effective_area}"]
        if notices:
            lines.append("**Active Notices & Outages:**")
            for notice in notices:
                lines.append(f"• **{notice.title}** [{notice.priority}]: {notice.description}")
                sources.append({"title": notice.title, "category": "Water Notice", "details": notice.description})
        else:
            if lang == "hi":
                lines.append("नियमित जल आपूर्ति चल रही है। कोई बंद निर्धारित नहीं है।")
            elif lang == "mr":
                lines.append("नियमित पाणीपुरवठा सुरू आहे. कोणतेही नियोजित बंद नाही.")
            else:
                lines.append("Regular water supply is active. No shutdowns reported.")
        if water_service:
            lines.append(f"\n**{t['contact_label']}:** {water_service.contact_number}")
            lines.append(f"**Working Hours:** {water_service.working_hours}")
            sources.append({"title": water_service.service_name, "category": "Water Supply", "contact": water_service.contact_number})
        if lang == "hi":
            lines.append("\nपाइप फटने या कम दबाव की शिकायत करने के लिए 'Water' श्रेणी में तक्रार दर्ज करें।")
        elif lang == "mr":
            lines.append("\nपाईप फुटणे किंवा कमी दाबाची तक्रार नोंदवण्यासाठी 'Water' श्रेणीत तक्रार द्या.")
        else:
            lines.append("\nTo report pipe burst or low pressure, submit a complaint under category Water.")
        lines.append(f"**{t['source_label']}:** Municipal Water Supply Department")
        reply_text = "\n".join(lines)

    # 4. ELECTRICITY
    elif intent == "ELECTRICITY":
        elec_service = db.query(Service).filter(Service.category.ilike("%electricity%")).first()
        outage_notices = (
            db.query(Announcement)
            .filter(
                Announcement.title.ilike("%electricity%") | Announcement.title.ilike("%power%"),
                or_(Announcement.area.ilike(f"%{effective_area}%"), Announcement.area == "All Areas")
            ).all()
        )
        lines = ["**Electricity Supply & Maintenance**\n", f"**{t['area_label']}:** {effective_area}"]
        if outage_notices:
            lines.append("**Power Maintenance Notices:**")
            for n in outage_notices:
                lines.append(f"• **{n.title}**: {n.description}")
                sources.append({"title": n.title, "category": "Electricity Notice", "details": n.description})
        else:
            if lang == "hi":
                lines.append("आज कोई नियोजित फीडर रखरखाव नहीं है।")
            elif lang == "mr":
                lines.append("आज कोणतेही नियोजित फीडर देखभाल नाही.")
            else:
                lines.append("No planned power outages reported for your area today.")
        if elec_service:
            lines.append(f"\n**MSEDCL Helpline:** {elec_service.contact_number}")
            lines.append(f"**Office Hours:** {elec_service.working_hours}")
            sources.append({"title": elec_service.service_name, "category": "Electricity", "contact": elec_service.contact_number})
        lines.append(f"**{t['source_label']}:** State Electricity Distribution Board")
        reply_text = "\n".join(lines)

    # 5. EMERGENCY
    elif intent == "EMERGENCY":
        emergencies = db.query(Service).filter(Service.category == "Emergency").all()
        if lang == "hi":
            lines = ["**🚨 आपातकालीन हेल्पलाइन निर्देशिका**\n"]
        elif lang == "mr":
            lines = ["**🚨 आपत्कालीन हेल्पलाईन निर्देशिका**\n"]
        else:
            lines = ["**🚨 Emergency Helpline Directory**\n"]
        for s in emergencies:
            lines.append(f"• **{s.service_name}**: `{s.contact_number}` ({s.working_hours})")
            if s.description:
                lines.append(f"  {s.description}")
            sources.append({"title": s.service_name, "category": "Emergency", "contact": s.contact_number})
        if lang == "hi":
            lines.append(f"\n**महत्वपूर्ण:** किसी भी आपात स्थिति में तुरंत **112** डायल करें।")
        elif lang == "mr":
            lines.append(f"\n**महत्त्वाचे:** कोणत्याही आपत्कालीन परिस्थितीत लगेच **112** डायल करा.")
        else:
            lines.append(f"\n**Important:** In any emergency, dial **112** immediately.")
        lines.append(f"**{t['source_label']}:** National Emergency Response Directory")
        reply_text = "\n".join(lines)

    # 6. HEALTHCARE
    elif intent == "HEALTHCARE":
        hospitals = (
            db.query(Service)
            .filter(
                Service.category == "Healthcare",
                or_(Service.area.ilike(f"%{effective_area}%"), Service.area == "All Areas")
            ).all()
        )
        if not hospitals:
            hospitals = db.query(Service).filter(Service.category == "Healthcare").all()
        if hospitals:
            if lang == "hi":
                lines = [f"**अस्पताल और स्वास्थ्य केंद्र**\n", f"**{t['area_label']}:** {effective_area}"]
            elif lang == "mr":
                lines = [f"**रुग्णालये व आरोग्य केंद्रे**\n", f"**{t['area_label']}:** {effective_area}"]
            else:
                lines = [f"**Hospitals & Health Centers**\n", f"**{t['area_label']}:** {effective_area}"]
            for h in hospitals:
                lines.append(f"• **{h.service_name}** ({h.working_hours})")
                if h.description:
                    lines.append(f"  {h.description}")
                lines.append(f"  **{t['contact_label']}:** `{h.contact_number}`")
                sources.append({"title": h.service_name, "category": "Healthcare", "contact": h.contact_number})
            if lang == "hi":
                lines.append("\n**चिकित्सा आपातकाल के लिए:** तुरंत **108** डायल करें।")
            elif lang == "mr":
                lines.append("\n**वैद्यकीय आपत्कालीन परिस्थितीत:** लगेच **108** डायल करा.")
            else:
                lines.append("\n**Medical Emergency:** Dial **108** immediately.")
            lines.append(f"**{t['source_label']}:** Municipal Public Health Directory")
            reply_text = "\n".join(lines)
        else:
            is_fallback = True
            reply_text = f"No hospitals found for '{effective_area}'. For emergencies dial 108. {t['fallback']}"

    # 7. ROAD / STREET_LIGHT / CIVIC_COMPLAINT
    elif intent in ["ROAD", "STREET_LIGHT", "CIVIC_COMPLAINT"]:
        category_name = "Road/Pothole" if intent == "ROAD" else ("Street Light" if intent == "STREET_LIGHT" else "General")
        if lang == "hi":
            lines = [
                f"**नागरिक समस्या दर्ज करें ({category_name})**\n",
                t["complaint_guide"],
                "\n**कदम:**",
                "1. **Report Issue** (/complaints/new) पर जाएं।",
                f"2. श्रेणी चुनें: `{category_name}`",
                f"3. क्षेत्र: `{effective_area}`",
                "4. साक्ष्य फोटो अपलोड करें।",
                "5. ट्रैकिंग आईडी प्राप्त करें।",
                "\n**हेल्पलाइन:** 020-25501000 (PMC Engineering Dept)",
            ]
        elif lang == "mr":
            lines = [
                f"**नागरिक तक्रार नोंदवा ({category_name})**\n",
                t["complaint_guide"],
                "\n**पायऱ्या:**",
                "1. **Report Issue** (/complaints/new) वर जा.",
                f"2. श्रेणी निवडा: `{category_name}`",
                f"3. परिसर: `{effective_area}`",
                "4. पुरावा फोटो जोडा.",
                "5. ट्रॅकिंग आयडी मिळवा.",
                "\n**हेल्पलाईन:** 020-25501000 (PMC Engineering Dept)",
            ]
        else:
            lines = [
                f"**Report a Civic Issue ({category_name})**\n",
                t["complaint_guide"],
                "\n**Quick Steps:**",
                "1. Go to **Report Issue** (/complaints/new).",
                f"2. Select Category: `{category_name}`",
                f"3. Area: `{effective_area}`",
                "4. Attach evidence photo.",
                "5. Get a tracking ID.",
                "\n**Hotline:** 020-25501000 (PMC Engineering Dept)",
            ]
        sources.append({"title": "Civic Complaint Desk", "category": "Complaint Redressal", "contact": "020-25501000"})
        reply_text = "\n".join(lines)

    # 8. ANNOUNCEMENT
    elif intent == "ANNOUNCEMENT":
        announcements = (
            db.query(Announcement)
            .filter(or_(Announcement.area.ilike(f"%{effective_area}%"), Announcement.area == "All Areas"))
            .order_by(Announcement.created_at.desc())
            .limit(5).all()
        )
        if announcements:
            if lang == "hi":
                lines = [f"**नवीनतम सामुदायिक घोषणाएं**\n", f"**{t['area_label']}:** {effective_area}"]
            elif lang == "mr":
                lines = [f"**ताज्या सामुदायिक घोषणा**\n", f"**{t['area_label']}:** {effective_area}"]
            else:
                lines = [f"**Latest Community Announcements**\n", f"**{t['area_label']}:** {effective_area}"]
            for a in announcements:
                lines.append(f"• **{a.title}** [{a.priority}]: {a.description}")
                sources.append({"title": a.title, "category": "Announcement", "details": a.description})
            lines.append(f"**{t['source_label']}:** Municipal Public Relations Portal")
            reply_text = "\n".join(lines)
        else:
            if lang == "hi":
                reply_text = f"'{effective_area}' के लिए अभी कोई सक्रिय सूचना नहीं है।"
            elif lang == "mr":
                reply_text = f"'{effective_area}' साठी सध्या कोणत्याही घोषणा नाहीत."
            else:
                reply_text = f"No active announcements for '{effective_area}' at this time."

    # 9. PARK
    elif intent == "PARK":
        parks = db.query(Service).filter(
            Service.category.ilike("%park%") | Service.category.ilike("%garden%"),
            or_(Service.area.ilike(f"%{effective_area}%"), Service.area == "All Areas")
        ).all()
        if not parks:
            parks = db.query(Service).filter(
                Service.category.ilike("%park%") | Service.category.ilike("%garden%")
            ).all()
        if parks:
            if lang == "hi":
                lines = [f"**पार्क और बगीचे**\n", f"**{t['area_label']}:** {effective_area}"]
            elif lang == "mr":
                lines = [f"**उद्याने आणि बगीचे**\n", f"**{t['area_label']}:** {effective_area}"]
            else:
                lines = [f"**Parks & Public Gardens**\n", f"**{t['area_label']}:** {effective_area}"]
            for p in parks:
                lines.append(f"• **{p.service_name}** ({p.working_hours})")
                if p.description:
                    lines.append(f"  {p.description}")
                lines.append(f"  **{t['contact_label']}:** {p.contact_number}")
                sources.append({"title": p.service_name, "category": "Park", "contact": p.contact_number})
            if lang == "hi":
                lines.append("\nपार्क में किसी भी नुकसान की शिकायत करें: /complaints/new")
            elif lang == "mr":
                lines.append("\nउद्यानातील कोणत्याही नुकसानाची तक्रार करा: /complaints/new")
            else:
                lines.append("\nReport any park damage at /complaints/new")
            lines.append(f"**{t['source_label']}:** Municipal Garden Department")
            reply_text = "\n".join(lines)
        else:
            if lang == "hi":
                reply_text = f"'{effective_area}' के लिए कोई पंजीकृत पार्क नहीं मिला। PMC हेल्पलाइन 1800-103-0222 से संपर्क करें।"
            elif lang == "mr":
                reply_text = f"'{effective_area}' साठी नोंदणीकृत उद्यान सापडले नाही. PMC हेल्पलाईन 1800-103-0222 वर संपर्क करा."
            else:
                reply_text = f"No parks registered for '{effective_area}'. Contact PMC helpline 1800-103-0222."
            is_fallback = True

    # 10. EDUCATION
    elif intent == "EDUCATION":
        schools = db.query(Service).filter(
            Service.category.ilike("%education%") | Service.category.ilike("%school%"),
            or_(Service.area.ilike(f"%{effective_area}%"), Service.area == "All Areas")
        ).all()
        if lang == "hi":
            lines = [f"**शिक्षा सेवाएं**\n", f"**{t['area_label']}:** {effective_area}"]
        elif lang == "mr":
            lines = [f"**शिक्षण सेवा**\n", f"**{t['area_label']}:** {effective_area}"]
        else:
            lines = [f"**Education Services**\n", f"**{t['area_label']}:** {effective_area}"]
        if schools:
            for s in schools:
                lines.append(f"• **{s.service_name}** ({s.working_hours})")
                if s.description:
                    lines.append(f"  {s.description}")
                lines.append(f"  **{t['contact_label']}:** {s.contact_number}")
                sources.append({"title": s.service_name, "category": "Education", "contact": s.contact_number})
        if lang == "hi":
            lines.append("\n**PMC शिक्षण विभाग:** 020-25501500")
            lines.append("**छात्रवृत्ति के लिए:** scholarship.maharashtra.gov.in")
        elif lang == "mr":
            lines.append("\n**PMC शिक्षण विभाग:** 020-25501500")
            lines.append("**शिष्यवृत्तीसाठी:** scholarship.maharashtra.gov.in")
        else:
            lines.append("\n**PMC Education Dept:** 020-25501500")
            lines.append("**Scholarships:** scholarship.maharashtra.gov.in")
        lines.append(f"**{t['source_label']}:** Municipal Education Department")
        reply_text = "\n".join(lines)

    # 11. TAX
    elif intent == "TAX":
        if lang == "hi":
            lines = [
                "**संपत्ति कर / Property Tax**\n",
                "आप संपत्ति कर का भुगतान इन तरीकों से कर सकते हैं:",
                "• **ऑनलाइन:** https://propertytax.punecorporation.org",
                "• **ऑफलाइन:** अपने निकटतम वार्ड कार्यालय जाएं।",
                "• **हेल्पलाइन:** 020-25501500",
                "\n**आवश्यक दस्तावेज:**",
                "• संपत्ति पहचान संख्या (Property ID)",
                "• पिछली रसीद",
                "• आधार कार्ड",
                "\n**देय तिथि:** मार्च 31 (कोई जुर्माना नहीं), इसके बाद 2% प्रति माह जुर्माना।",
                f"**{t['source_label']}:** PMC Property Tax Department"
            ]
        elif lang == "mr":
            lines = [
                "**मालमत्ता कर / Property Tax**\n",
                "मालमत्ता कर भरण्याचे मार्ग:",
                "• **ऑनलाइन:** https://propertytax.punecorporation.org",
                "• **ऑफलाइन:** जवळच्या प्रभाग कार्यालयात जा.",
                "• **हेल्पलाईन:** 020-25501500",
                "\n**आवश्यक कागदपत्रे:**",
                "• मालमत्ता ओळख क्रमांक",
                "• मागील पावती",
                "• आधार कार्ड",
                "\n**अंतिम दिनांक:** 31 मार्च (दंडाशिवाय), नंतर 2% दरमहा दंड.",
                f"**{t['source_label']}:** PMC मालमत्ता कर विभाग"
            ]
        else:
            lines = [
                "**Property Tax Payment Guide**\n",
                "Pay your property tax through:",
                "• **Online:** https://propertytax.punecorporation.org",
                "• **Offline:** Visit your nearest ward office.",
                "• **Helpline:** 020-25501500",
                "\n**Required Documents:**",
                "• Property Identification Number",
                "• Previous tax receipt",
                "• Aadhaar card",
                "\n**Due Date:** March 31 (no penalty). After that: 2% penalty per month.",
                f"**{t['source_label']}:** PMC Property Tax Department"
            ]
        sources.append({"title": "PMC Property Tax", "category": "Tax", "contact": "020-25501500"})
        reply_text = "\n".join(lines)

    # 12. PUBLIC_SERVICE
    elif intent == "PUBLIC_SERVICE":
        services = db.query(Service).filter(
            or_(Service.area.ilike(f"%{effective_area}%"), Service.area == "All Areas")
        ).limit(8).all()
        if lang == "hi":
            lines = [f"**नागरिक सेवाएं**\n", f"**{t['area_label']}:** {effective_area}"]
        elif lang == "mr":
            lines = [f"**नागरी सेवा**\n", f"**{t['area_label']}:** {effective_area}"]
        else:
            lines = [f"**Civic Services Directory**\n", f"**{t['area_label']}:** {effective_area}"]
        for s in services:
            lines.append(f"• **{s.service_name}** [{s.category}] — {s.contact_number}")
            sources.append({"title": s.service_name, "category": s.category, "contact": s.contact_number})
        lines.append(f"**{t['source_label']}:** PMC Services Portal")
        reply_text = "\n".join(lines)

    # 13. DOCUMENT / RAG
    else:
        rag_results = search_similar_chunks(db, query, top_k=2)
        if rag_results and rag_results[0]["similarity"] > 0.3:
            top_hit = rag_results[0]
            if lang == "hi":
                lines = [
                    "**अधिकारिक दस्तावेज से जानकारी**\n",
                    f"**दस्तावेज:** {top_hit['document_title']}",
                    f"\n\"{top_hit['chunk_text']}\"",
                    f"\n**{t['source_label']}:** अपलोड किया गया नागरिक दस्तावेज (RAG)"
                ]
            elif lang == "mr":
                lines = [
                    "**अधिकृत दस्तावेजातून माहिती**\n",
                    f"**दस्तावेज:** {top_hit['document_title']}",
                    f"\n\"{top_hit['chunk_text']}\"",
                    f"\n**{t['source_label']}:** अपलोड केलेला नागरिक दस्तावेज (RAG)"
                ]
            else:
                lines = [
                    "**Information from Official Civic Document**\n",
                    f"**Document:** {top_hit['document_title']}",
                    f"\n\"{top_hit['chunk_text']}\"",
                    f"\n**{t['source_label']}:** Verified Civic Document (RAG)"
                ]
            for hit in rag_results:
                sources.append({"title": hit["document_title"], "category": "Document", "details": hit["chunk_text"][:150]})
            reply_text = "\n".join(lines)
        else:
            greeting_words = ["hello", "hi", "hey", "namaste", "namaskar", "help", "who are you"]
            if any(w in query.lower() for w in greeting_words):
                reply_text = t["greeting"].replace("{effective_area}", effective_area)
            else:
                is_fallback = True
                reply_text = t["fallback"]

    return {
        "reply": reply_text,
        "intent": intent,
        "detected_area": effective_area,
        "language": lang,
        "sources": sources,
        "is_fallback": is_fallback,
        "suggested_questions": t["suggested"]
    }