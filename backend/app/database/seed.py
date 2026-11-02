import os
import datetime
from sqlalchemy.orm import Session
from app.config import settings
from app.database.session import SessionLocal, engine, Base
from app.models.models import (
    User, Service, Schedule, Complaint, Announcement,
    Notification, Document, DocumentChunk, Message, Conversation, Feedback
)
from app.utils.security import hash_password
from app.ai.embeddings import get_text_embedding, serialize_embedding

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    if db.query(User).filter(User.email == "admin@civicconnect.org").first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding CivicConnect AI database...")
    now = datetime.datetime.now(datetime.timezone.utc)

    # 1. Users
    admin_user = User(name="Civic Administrator", email="admin@civicconnect.org",
        password_hash=hash_password("Admin@123"), role="admin",
        preferred_language="en", area="Central Ward", created_at=now, updated_at=now)
    citizen_user = User(name="Pooja Sharma", email="citizen@civicconnect.org",
        password_hash=hash_password("Citizen@123"), role="citizen",
        preferred_language="en", area="Shivaji Nagar", created_at=now, updated_at=now)
    citizen_user2 = User(name="Rahul Deshmukh", email="rahul@civicconnect.org",
        password_hash=hash_password("Citizen@123"), role="citizen",
        preferred_language="mr", area="Kothrud", created_at=now, updated_at=now)

    db.add_all([admin_user, citizen_user, citizen_user2])
    db.commit()
    db.refresh(admin_user); db.refresh(citizen_user); db.refresh(citizen_user2)

    # 2. Services - expanded
    services_data = [
        # --- Waste Management ---
        Service(category="Waste Management", service_name="Shivaji Nagar Sanitation Division",
            description="Door-to-door wet and dry waste collection. Segregate waste before handover.",
            area="Shivaji Nagar", contact_number="020-25501234", working_hours="06:30 AM - 02:00 PM"),
        Service(category="Waste Management", service_name="Kothrud Solid Waste & Recycling Center",
            description="Daily residential garbage collection and electronic waste recycling.",
            area="Kothrud", contact_number="020-25445678", working_hours="07:00 AM - 02:30 PM"),
        Service(category="Waste Management", service_name="Hadapsar Municipal Waste Management",
            description="Community bin servicing, wet waste composting, and street sweeping.",
            area="Hadapsar", contact_number="020-26871122", working_hours="06:00 AM - 01:30 PM"),
        Service(category="Waste Management", service_name="Viman Nagar Waste Collection Unit",
            description="Residential waste pickup with segregated dry and wet collection.",
            area="Viman Nagar", contact_number="020-26631010", working_hours="07:00 AM - 01:00 PM"),
        Service(category="Waste Management", service_name="Aundh-Baner Sanitation Zone",
            description="Covers Aundh and Baner residential sectors. Special Sunday e-waste drive.",
            area="Aundh", contact_number="020-27290011", working_hours="06:30 AM - 02:00 PM"),
        Service(category="Waste Management", service_name="Deccan-Camp Waste Zone",
            description="Dense urban area waste management with daily bin clearance.",
            area="Deccan", contact_number="020-24444000", working_hours="05:30 AM - 12:30 PM"),

        # --- Public Transport ---
        Service(category="Public Transport", service_name="PMPML Route 101: Swargate to Shivaji Nagar Depot",
            description="High-frequency city bus connecting commercial hubs.",
            area="Shivaji Nagar", contact_number="020-24440417", working_hours="06:00 AM - 11:00 PM"),
        Service(category="Public Transport", service_name="PMPML Route 202: Kothrud Depot to Pune Railway Station",
            description="Direct commuter express via Karve Road and Deccan.",
            area="Kothrud", contact_number="020-25440212", working_hours="06:30 AM - 10:30 PM"),
        Service(category="Public Transport", service_name="PMPML Route 303: Hadapsar Gadital to Hinjawadi Phase 3",
            description="IT corridor express on bypass highway.",
            area="Hadapsar", contact_number="020-26870344", working_hours="07:00 AM - 09:30 PM"),
        Service(category="Public Transport", service_name="PMPML Route 155: Viman Nagar to Pune Airport",
            description="Airport express bus with luggage rack and AC option.",
            area="Viman Nagar", contact_number="020-26631155", working_hours="05:00 AM - 11:30 PM"),
        Service(category="Public Transport", service_name="PMPML Route 50: Aundh to Shivajinagar via University",
            description="Student and commuter route covering university road.",
            area="Aundh", contact_number="020-27290050", working_hours="06:00 AM - 10:30 PM"),
        Service(category="Public Transport", service_name="PMPML Route 77: Camp to Deccan via FC Road",
            description="Heritage route passing through major landmarks.",
            area="Camp", contact_number="020-26341777", working_hours="06:00 AM - 11:00 PM"),

        # --- Water Supply ---
        Service(category="Water Supply", service_name="Municipal Water Supply & Sewerage Board",
            description="Drinking water distribution, pipeline maintenance, water tanker helpline.",
            area="All Areas", contact_number="020-24443333", working_hours="24/7 Grievance Line"),

        # --- Electricity ---
        Service(category="Electricity", service_name="MSEDCL Electricity Distribution Board",
            description="Power grid management, feeder repairs, and load shedding notifications.",
            area="All Areas", contact_number="1912", working_hours="24/7 Emergency Line"),

        # --- Emergency ---
        Service(category="Emergency", service_name="Police Emergency Control Room",
            description="Immediate law enforcement and police dispatch.",
            area="All Areas", contact_number="100", working_hours="24/7"),
        Service(category="Emergency", service_name="Municipal Fire Brigade & Rescue",
            description="Fire fighting, building rescue, hazardous material.",
            area="All Areas", contact_number="101", working_hours="24/7"),
        Service(category="Emergency", service_name="National Emergency Ambulance Service",
            description="Advanced life support ambulances.",
            area="All Areas", contact_number="108", working_hours="24/7"),
        Service(category="Emergency", service_name="Women in Distress Helpline",
            description="Emergency assistance and legal aid for women.",
            area="All Areas", contact_number="1091", working_hours="24/7"),
        Service(category="Emergency", service_name="Childline National Emergency",
            description="Care and protection for children in crisis.",
            area="All Areas", contact_number="1098", working_hours="24/7"),
        Service(category="Emergency", service_name="District Disaster Management Authority",
            description="Flood warning, monsoon alerts, disaster response.",
            area="All Areas", contact_number="1077", working_hours="24/7"),
        Service(category="Emergency", service_name="Cyber Crime Helpline",
            description="Report online fraud, cyberbullying, identity theft.",
            area="All Areas", contact_number="1930", working_hours="24/7"),

        # --- Healthcare ---
        Service(category="Healthcare", service_name="Civil General Hospital & Trauma Center",
            description="Multi-specialty public hospital with 24-hour emergency.",
            area="Central Ward", contact_number="020-26127777", working_hours="24/7 Emergency / OPD 08AM-01PM"),
        Service(category="Healthcare", service_name="Shivaji Nagar Municipal Health Center",
            description="Primary healthcare, immunization, diagnostic.",
            area="Shivaji Nagar", contact_number="020-25504433", working_hours="08:00 AM - 08:00 PM"),
        Service(category="Healthcare", service_name="Aundh District Hospital",
            description="Government hospital with maternity, pediatric, eye, and ENT wards.",
            area="Aundh", contact_number="020-27201400", working_hours="24/7 Emergency / OPD 08AM-02PM"),
        Service(category="Healthcare", service_name="Hadapsar Primary Health Center",
            description="Free vaccination, family planning, and maternal health services.",
            area="Hadapsar", contact_number="020-26870900", working_hours="08:00 AM - 06:00 PM"),
        Service(category="Healthcare", service_name="Blood Bank - Sassoon General Hospital",
            description="24-hour blood bank with all blood groups. Free for BPL patients.",
            area="Central Ward", contact_number="020-26128000", working_hours="24/7"),

        # --- Parks & Gardens ---
        Service(category="Park", service_name="Empress Botanical Garden",
            description="Sprawling botanical garden with 100+ plant species and children play area.",
            area="Camp", contact_number="020-26121000", working_hours="06:00 AM - 06:00 PM"),
        Service(category="Park", service_name="Katraj Snake Park & Zoo",
            description="Zoo, snake park, and reptile exhibit. Entry fee: Rs. 40 adults, Rs. 15 children.",
            area="Hadapsar", contact_number="020-26951000", working_hours="09:00 AM - 05:30 PM"),
        Service(category="Park", service_name="Peshwa Park (Sarasbaug)",
            description="Historic garden with Ganesha temple, jogging track, kids rides.",
            area="Shivaji Nagar", contact_number="020-24221000", working_hours="06:00 AM - 09:00 PM"),
        Service(category="Park", service_name="Baner Biodiversity Park",
            description="Nature reserve park in Baner with forest trails and birdwatching.",
            area="Baner", contact_number="020-27292222", working_hours="06:00 AM - 07:00 PM"),
        Service(category="Park", service_name="Viman Nagar City Garden",
            description="Community garden with fountain, senior citizen area, and gym equipment.",
            area="Viman Nagar", contact_number="020-26632000", working_hours="05:30 AM - 09:00 PM"),

        # --- Education ---
        Service(category="Education", service_name="PMC Municipal Primary School - Shivaji Nagar",
            description="Free primary education (Class 1-7). Midday meal scheme. RTE admissions open.",
            area="Shivaji Nagar", contact_number="020-25503000", working_hours="07:00 AM - 01:00 PM"),
        Service(category="Education", service_name="Municipal Library - Main Branch",
            description="Free membership library with 50,000+ books, newspapers, e-journals.",
            area="Central Ward", contact_number="020-25502100", working_hours="08:00 AM - 08:00 PM"),
        Service(category="Education", service_name="PMC Scholarship & Education Helpdesk",
            description="Scholarship applications, RTE admissions, school transfer certificates.",
            area="All Areas", contact_number="020-25501500", working_hours="10:00 AM - 05:00 PM"),
    ]
    db.add_all(services_data)
    db.commit()

    # 3. Schedules - expanded
    waste_sn  = db.query(Service).filter(Service.service_name.ilike("%Shivaji Nagar Sanitation%")).first()
    waste_kt  = db.query(Service).filter(Service.service_name.ilike("%Kothrud Solid Waste%")).first()
    waste_hd  = db.query(Service).filter(Service.service_name.ilike("%Hadapsar Municipal Waste%")).first()
    waste_vn  = db.query(Service).filter(Service.service_name.ilike("%Viman Nagar Waste%")).first()
    waste_ab  = db.query(Service).filter(Service.service_name.ilike("%Aundh-Baner%")).first()
    waste_dc  = db.query(Service).filter(Service.service_name.ilike("%Deccan-Camp%")).first()
    bus_101   = db.query(Service).filter(Service.service_name.ilike("%Route 101%")).first()
    bus_202   = db.query(Service).filter(Service.service_name.ilike("%Route 202%")).first()
    bus_303   = db.query(Service).filter(Service.service_name.ilike("%Route 303%")).first()
    bus_155   = db.query(Service).filter(Service.service_name.ilike("%Route 155%")).first()
    bus_50    = db.query(Service).filter(Service.service_name.ilike("%Route 50%")).first()
    bus_77    = db.query(Service).filter(Service.service_name.ilike("%Route 77%")).first()

    schedules_data = [
        Schedule(service_id=waste_sn.id, area="Shivaji Nagar",
            day="Monday, Wednesday, Friday", start_time="07:00 AM", end_time="10:30 AM",
            details="Wet waste (green bin) and dry recyclable waste (blue bin) door-to-door."),
        Schedule(service_id=waste_kt.id, area="Kothrud",
            day="Tuesday, Thursday, Saturday", start_time="07:30 AM", end_time="11:00 AM",
            details="Segregated waste collection. Sanitary waste in separate marked pouches."),
        Schedule(service_id=waste_hd.id, area="Hadapsar",
            day="Daily (All Days)", start_time="06:30 AM", end_time="09:30 AM",
            details="Daily community bin collection. Bi-weekly e-waste on Sundays."),
        Schedule(service_id=waste_vn.id, area="Viman Nagar",
            day="Monday, Wednesday, Friday, Sunday", start_time="07:00 AM", end_time="10:00 AM",
            details="Residential sector pickup. Sunday special for bulky items."),
        Schedule(service_id=waste_ab.id, area="Aundh",
            day="Tuesday, Thursday, Saturday", start_time="06:30 AM", end_time="10:30 AM",
            details="Aundh sector A-E covered Tue/Thu. Baner sector on Saturday. Sunday e-waste drive 9AM-12PM."),
        Schedule(service_id=waste_dc.id, area="Deccan",
            day="Daily (All Days)", start_time="05:30 AM", end_time="09:30 AM",
            details="Dense urban daily pickup. Special Saturdays composting in Deccan Gymkhana area."),
        Schedule(service_id=bus_101.id, area="Shivaji Nagar",
            day="Monday through Sunday", start_time="06:00 AM", end_time="11:00 PM",
            details="Every 15 mins. Swargate -> Sarasbaug -> Shaniwarwada -> Shivaji Nagar Depot."),
        Schedule(service_id=bus_202.id, area="Kothrud",
            day="Monday through Sunday", start_time="06:30 AM", end_time="10:30 PM",
            details="Every 20 mins. Kothrud Stand -> Paud Road -> Deccan -> Pune Station."),
        Schedule(service_id=bus_303.id, area="Hadapsar",
            day="Monday through Saturday", start_time="07:00 AM", end_time="09:00 PM",
            details="Every 30 mins peak. Hadapsar -> Magarpatta -> Wakad -> Hinjawadi."),
        Schedule(service_id=bus_155.id, area="Viman Nagar",
            day="Daily", start_time="05:00 AM", end_time="11:30 PM",
            details="Every 20 mins. Viman Nagar -> Nagar Road -> Airport Terminal 1 & 2."),
        Schedule(service_id=bus_50.id, area="Aundh",
            day="Monday through Saturday", start_time="06:00 AM", end_time="10:30 PM",
            details="Every 25 mins. Aundh Depot -> Baner -> University Road -> Shivajinagar."),
        Schedule(service_id=bus_77.id, area="Camp",
            day="Monday through Sunday", start_time="06:00 AM", end_time="11:00 PM",
            details="Every 15 mins. Camp -> East Street -> FC Road -> Deccan Gymkhana."),
    ]
    db.add_all(schedules_data)
    db.commit()

    # 4. Announcements - expanded
    announcements_data = [
        Announcement(title="Scheduled Water Pipeline Maintenance",
            description="Maintenance on Khadakwasla main canal. Water supply paused 08:00 AM - 08:00 PM.",
            area="Shivaji Nagar", priority="CRITICAL", created_at=now,
            expires_at=now + datetime.timedelta(days=2)),
        Announcement(title="Pre-Monsoon Road Resurfacing & Pothole Repair",
            description="Engineering teams repairing potholes on arterial roads. Citizens can submit photos.",
            area="Kothrud", priority="IMPORTANT", created_at=now,
            expires_at=now + datetime.timedelta(days=7)),
        Announcement(title="Mandatory Household Waste Segregation Alert",
            description="Under Municipal Solid Waste Bye-Laws, strict segregation is mandatory. Unsegregated garbage will NOT be collected. Fine: Rs. 500.",
            area="All Areas", priority="NORMAL", created_at=now,
            expires_at=now + datetime.timedelta(days=30)),
        Announcement(title="Extra Electric Buses on Route 202",
            description="6 additional AC electric buses on Route 202 during evening peak (05:00 PM - 08:30 PM).",
            area="Kothrud", priority="NORMAL", created_at=now,
            expires_at=now + datetime.timedelta(days=14)),
        Announcement(title="Free Health Camp - Aundh District Hospital",
            description="Free eye checkup, blood pressure, and diabetes screening camp on Saturday 10AM-2PM.",
            area="Aundh", priority="IMPORTANT", created_at=now,
            expires_at=now + datetime.timedelta(days=5)),
        Announcement(title="Baner Biodiversity Park Closure for Landscaping",
            description="Baner park will be closed Mon-Wed next week for annual landscaping. Reopens Thursday.",
            area="Baner", priority="NORMAL", created_at=now,
            expires_at=now + datetime.timedelta(days=7)),
        Announcement(title="Property Tax Last Date Reminder",
            description="Pay your property tax before March 31 to avoid 2% monthly penalty. Online: propertytax.punecorporation.org or visit your ward office.",
            area="All Areas", priority="IMPORTANT", created_at=now,
            expires_at=now + datetime.timedelta(days=60)),
        Announcement(title="Cyber Safety Awareness Drive",
            description="PMC and Pune Police launch cyber safety campaign. Report online fraud to 1930. Never share OTP.",
            area="All Areas", priority="NORMAL", created_at=now,
            expires_at=now + datetime.timedelta(days=21)),
    ]
    db.add_all(announcements_data)
    db.commit()

    # 5. Complaints
    complaints_data = [
        Complaint(user_id=citizen_user.id, category="Road/Pothole",
            title="Deep pothole near Goodluck Chowk on FC Road",
            description="Dangerous pothole after pipeline work. Causing traffic slowdown.",
            location="FC Road, Near Goodluck Chowk, Shivaji Nagar", priority="HIGH",
            status="IN PROGRESS", admin_remarks="Assigned to Ward Engineer. Patching tonight.",
            created_at=now - datetime.timedelta(days=2), updated_at=now - datetime.timedelta(hours=4)),
        Complaint(user_id=citizen_user.id, category="Garbage",
            title="Garbage bin overflowing near Model Colony Garden",
            description="Community trash bin not cleared for 2 days. Stray animals scattering waste.",
            location="Model Colony, Shivaji Nagar", priority="MEDIUM",
            status="UNDER REVIEW", admin_remarks="Notified Zone 3 sanitation supervisor.",
            created_at=now - datetime.timedelta(days=1), updated_at=now - datetime.timedelta(hours=8)),
        Complaint(user_id=citizen_user2.id, category="Street Light",
            title="Street light pole #44 dark on Karve Road",
            description="Three consecutive streetlights not working at dusk. Unsafe for pedestrians.",
            location="Karve Road, Kothrud", priority="URGENT",
            status="SUBMITTED", admin_remarks=None,
            created_at=now - datetime.timedelta(hours=6), updated_at=now - datetime.timedelta(hours=6)),
        Complaint(user_id=citizen_user2.id, category="Water",
            title="Low water supply pressure on 4th floor apartments",
            description="Water pressure severely diminished during morning supply hours.",
            location="Mayur Colony, Kothrud", priority="MEDIUM",
            status="RESOLVED", admin_remarks="Valve calibrated at Kothrud booster pump.",
            created_at=now - datetime.timedelta(days=5), updated_at=now - datetime.timedelta(days=1)),
    ]
    db.add_all(complaints_data)
    db.commit()

    # 6. Notifications
    notifications_data = [
        Notification(user_id=citizen_user.id,
            title="Complaint Status Updated: IN PROGRESS",
            message="Your complaint 'Deep pothole near Goodluck Chowk' is now IN PROGRESS.",
            is_read=False, created_at=now - datetime.timedelta(hours=4)),
        Notification(user_id=citizen_user.id,
            title="Water Maintenance Alert",
            message="Scheduled 12-hour water shutdown tomorrow in Shivaji Nagar.",
            is_read=True, created_at=now - datetime.timedelta(hours=12)),
    ]
    db.add_all(notifications_data)
    db.commit()

    # 7. Rich RAG Knowledge Document
    doc_content = """Pune Municipal Corporation - Official Civic Services, Guidelines & Helplines 2026

1. SOLID WASTE MANAGEMENT & SEGREGATION
Every household must segregate waste into three categories:
- Wet Waste (food scraps, kitchen waste, garden clippings): GREEN bin
- Dry Waste (paper, plastic, glass, cardboard, packaging): BLUE bin
- Domestic Hazardous & Sanitary Waste: separate marked bags
Garbage trucks operate 06:30 AM - 11:00 AM. Penalty for mixed waste: Rs. 500 first violation, Rs. 1000 repeat.
E-waste (batteries, phones, chargers) collected on designated Sundays 9AM-12PM.

2. WATER SUPPLY & PIPELINE MANAGEMENT
Pune receives water from Khadakwasla, Panshet, Varasgaon, and Temghar reservoirs.
Water supply schedule: 2-3 hours daily per zone (morning 6AM-9AM or evening 5PM-7PM).
Tanker helpline for emergencies: 020-24443333.
To report water contamination or pipeline burst: call 020-24443333 or submit complaint on CivicConnect AI.
Water connection new application: visit ward office with Aadhaar, property documents, and Rs. 1500 fee.

3. ELECTRICITY (MSEDCL)
For power failures: call 1912 (24/7).
For new electricity connection: visit MSEDCL office with property papers and identity proof.
Smart meter installation is free for residential connections below 5KW.
Load shedding schedule updated weekly at mahadiscom.in.
To dispute electricity bill: visit consumer grievance cell with bill and meter reading.

4. PUBLIC TRANSPORT (PMPML)
PMPML operates 1800+ buses on 300+ routes across Pune and Pimpri-Chinchwad.
Smart card (Shivneri Pass) available at depots - Rs. 200 for 30 days unlimited travel.
Accessibility: Low-floor buses with wheelchair access on major routes.
Lost & Found: 020-24440417.
AC Shivneri express buses to Mumbai depart from Shivajinagar and Swargate depots.
Night buses operate on major routes till 11:30 PM.

5. EMERGENCY HELPLINES
- Police Control Room: 100 (24/7)
- Fire & Rescue: 101 (24/7)
- Ambulance: 108 (24/7, free service)
- Women Safety: 1091 (24/7)
- Child Protection: 1098 (24/7)
- Disaster Management: 1077 (24/7)
- Cyber Crime: 1930 (24/7)
- PMC Citizen Helpline: 1800-103-0222 (toll-free)
- MSEDCL Power: 1912 (24/7)
- Unified Emergency: 112

6. CIVIC COMPLAINT & GRIEVANCE REDRESSAL
Citizens may report: potholes, broken streetlights, garbage overflow, water contamination, sewage blockage, illegal construction.
Standard resolution times:
- Street Light Outage: 48 hours
- Pothole Patching: 72 hours
- Garbage Clearance: 24 hours
- Water Leak / Contamination: 12 hours
- Sewage Overflow: 6 hours
Submit complaints at CivicConnect AI (/complaints/new) or PMC portal.

7. PROPERTY TAX
Online payment: propertytax.punecorporation.org
Due date: March 31 annually. Late penalty: 2% per month.
Documents required: Property ID number, Aadhaar, previous receipts.
Tax rebate: 10% for timely payment before February 28.
PMC Tax Helpdesk: 020-25501500 (Mon-Sat 10AM-5PM).

8. PARKS & RECREATION
Major parks: Empress Garden (Camp), Peshwa Park (Shivaji Nagar), Baner Biodiversity Park, Katraj Zoo.
Entry: Most municipal parks free. Zoo entry Rs. 40 adults, Rs. 15 children.
Timings: Generally 06:00 AM - 09:00 PM. Individual parks may vary.
To report park damage or maintenance: /complaints/new or call ward office.
Annual flower show: December at Empress Garden.

9. EDUCATION & SCHOOLS
PMC runs 300+ municipal schools with free primary education (Classes 1-7).
Midday meal scheme: free nutritious lunch for all municipal school students.
RTE (Right to Education) admissions: Apply February-March at ward office.
Scholarship applications: scholarship.maharashtra.gov.in
PMC Education Helpdesk: 020-25501500.
Municipal libraries in all major wards - free membership with Aadhaar.

10. HEALTHCARE
Civil General Hospital (020-26127777): 24/7 emergency, OPD 8AM-1PM.
Aundh District Hospital (020-27201400): Maternity, pediatric, eye, ENT.
Free ambulance service: 108.
Free vaccination for children under 5 at all PHCs.
Blood bank: Sassoon General Hospital 24/7 (020-26128000).
Janani Suraksha Yojana: Free delivery and Rs. 1400 assistance for institutional delivery.
"""

    docs_dir = os.path.join(settings.UPLOAD_DIR, "documents")
    os.makedirs(docs_dir, exist_ok=True)
    doc_path = os.path.join(docs_dir, "PMC_Civic_Guidelines_2026.txt")
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(doc_content)

    doc_record = Document(admin_id=admin_user.id, filename="PMC_Civic_Guidelines_2026.txt",
        file_type="txt", file_path=doc_path,
        title="PMC Official Civic Services & Guidelines 2026", created_at=now)
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    from app.ai.rag import chunk_text
    chunks = chunk_text(doc_content, chunk_size=400, overlap=60)
    for idx, c_text in enumerate(chunks):
        c_emb = get_text_embedding(c_text)
        c_obj = DocumentChunk(document_id=doc_record.id, chunk_text=c_text,
            embedding=serialize_embedding(c_emb), chunk_index=idx, created_at=now)
        db.add(c_obj)
    db.commit()

    print(f"Seeding completed! {len(services_data)} services, {len(schedules_data)} schedules, {len(announcements_data)} announcements.")
    db.close()

if __name__ == "__main__":
    seed_database()