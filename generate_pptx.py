import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

prs = pptx.Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Modern civic theme colors
DARK_BG = RGBColor(16, 22, 20)
CARD_BG = RGBColor(24, 35, 31)
TEAL = RGBColor(0, 200, 150)
LIME = RGBColor(163, 230, 53)
WHITE = RGBColor(243, 247, 245)
GRAY = RGBColor(154, 174, 165)

slides_data = [
    {
        'title': 'CivicConnect AI',
        'subtitle': 'AI-Powered Community Assistance & Civic Query Platform',
        'badge': 'PROJECT PRESENTATION',
        'type': 'title',
        'points': [
            'Tagline: "Ask. Report. Connect."',
            'Bridging the communication gap between citizens and local municipality',
            'Full-Stack AI Web Application built with Next.js, FastAPI, and SQLite'
        ]
    },
    {
        'title': '1. Problem Statement',
        'subtitle': 'Key challenges faced by citizens and municipalities today',
        'type': 'cards',
        'cards': [
            ('Unclear Civic Schedules', 'Citizens do not know exact garbage pickup times or bus timetables, causing roadside dumping and transport delays.'),
            ('Complex Grievance Filing', 'Reporting broken streetlights, water leaks, or potholes requires physical visits or outdated phone lines.'),
            ('Lack of Transparency', 'After filing a civic complaint, citizens receive zero live progress updates or resolution timelines.'),
            ('Language Barriers', 'Most official municipal portals are hard to use for non-English speakers who prefer Hindi or Marathi.')
        ]
    },
    {
        'title': '2. Our Solution: CivicConnect AI',
        'subtitle': 'A smart, one-stop civic assistant for every citizen',
        'type': 'cards',
        'cards': [
            ('Smart AI Assistant', 'Understands natural language questions in English, Hindi, and Marathi across 15+ civic categories.'),
            ('Verified Knowledge Base', 'Never hallucinates answers; provides verified schedules and municipality contacts from DB & official notices.'),
            ('Civic Grievance Reporting', 'Citizens can submit complaints with photo evidence, area tagging, and track progress step-by-step.'),
            ('Universal Device Friendly', 'Fully responsive layout built for mobile phones, tablets, laptops, and desktop computers.')
        ]
    },
    {
        'title': '3. Citizen Features & Capabilities',
        'subtitle': 'Empowering communities with intuitive self-service tools',
        'type': 'list_box',
        'items': [
            ('Multilingual AI Chatbot:', 'Ask questions like "Garbage pickup schedule?" or "कचरा कधी गोळा केला जातो?" and receive instant answers.'),
            ('Organized Question Panel:', '48 organized question buttons across 12 categories that automatically switch between English, Hindi, and Marathi.'),
            ('Public Services Directory:', 'Search hospitals, ward offices, fire stations, parks, and bus depots with phone numbers and timings.'),
            ('Grievance Tracker:', 'Submit problems with photo attachments and track status: Submitted -> Under Review -> In Progress -> Resolved.'),
            ('Emergency Helpline Directory:', 'Quick 1-click access to Police (100/112), Fire (101), Ambulance (108), Cyber Crime (1930), and alerts.')
        ]
    },
    {
        'title': '4. Administrator Portal',
        'subtitle': 'Complete monitoring and control for municipal authorities',
        'type': 'cards',
        'cards': [
            ('Analytics Dashboard', 'Live charts tracking total complaints, resolution percentages, citizen feedback ratings, and user counts.'),
            ('Complaint Resolution', 'Review citizen-submitted complaints, view photo evidence, and update status from Review to Resolved.'),
            ('Knowledge Base & RAG Docs', 'Upload official municipal notices and PDF circulars so the AI immediately learns new civic rules.'),
            ('Announcements & Alerts', 'Broadcast urgent water supply notices, free health camps, property tax reminders, and schedule updates.')
        ]
    },
    {
        'title': '5. System Architecture & Tech Stack',
        'subtitle': 'Modern, high-performance, and scalable technology stack',
        'type': 'cards',
        'cards': [
            ('Frontend (Client UI)', 'Next.js 14 (React & TypeScript)\nTailwind CSS for responsive UI\nLucide Icons & interactive components\nMobile Hamburger & Desktop Navigation'),
            ('Backend (REST API)', 'Python FastAPI (High Performance)\nPydantic for Data Validation\nJWT Token-Based Authentication\nRole-Based Access (Admin / Citizen)'),
            ('Database & AI Layer', 'SQLite / PostgreSQL (Relational Data)\n15 Intent Classification System\nKeyword & Regex Scoring Engine\nRAG Document Vector Search Layer'),
            ('DevOps & Deployment', 'Docker & Docker Compose setup\nCross-platform compatibility\nFast API response times (<100ms)\nCloud-ready for Render, Vercel & AWS')
        ]
    },
    {
        'title': '6. How the AI Chatbot Works',
        'subtitle': 'Step-by-step workflow from user query to verified response',
        'type': 'steps',
        'steps': [
            ('Step 1: Input & Area Detection', 'Citizen enters a query in EN, HI, or MR. System extracts user area (e.g., Kothrud, Shivaji Nagar).'),
            ('Step 2: AI Intent Classification', 'Engine analyzes query into 15 intents: GARBAGE, BUS, WATER, ELECTRICITY, EMERGENCY, ROAD, TAX, etc.'),
            ('Step 3: Database & RAG Retrieval', 'Fetches verified schedule or contacts from database; queries official PDF documents if needed.'),
            ('Step 4: Trilingual Response Delivery', 'Returns a clean, helpful answer in the citizen chosen language along with suggested next questions.')
        ]
    },
    {
        'title': '7. Project Impact & Future Scope',
        'subtitle': 'Real-world benefits and future development roadmap',
        'type': 'cards',
        'cards': [
            ('Community Impact', 'Reduces municipality footfall, ensures faster complaint turnaround, and gives equal access to non-English speakers.'),
            ('WhatsApp / Telegram Bot', 'Integrate CivicConnect AI with WhatsApp so citizens can report potholes simply by sending a photo and location pin.'),
            ('Live GPS Bus Tracking', 'Integrate real-time PMPML/City bus GPS APIs to show live arrival timings alongside static timetables.'),
            ('Voice Input / Speech-to-Text', 'Allow elderly citizens to speak their questions directly in Marathi, Hindi, or English using voice recognition.')
        ]
    },
    {
        'title': 'Thank You! Questions?',
        'subtitle': 'CivicConnect AI - Your AI Assistant for Smarter Communities',
        'badge': 'DEMO & Q&A SESSION',
        'type': 'title',
        'points': [
            'Live Localhost: http://localhost:3000',
            'Interactive Swagger Docs: http://localhost:8000/docs',
            'Ready for Live Demonstration & Feedback'
        ]
    }
]

blank_slide_layout = prs.slide_layouts[6]

for slide_info in slides_data:
    slide = prs.slides.add_slide(blank_slide_layout)
    
    # Background shape
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = DARK_BG
    bg.line.color.rgb = DARK_BG
    
    if slide_info['type'] == 'title':
        # Accent top bar
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.15))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = TEAL
        top_bar.line.fill.background()

        # Title Box
        txBox = slide.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11.0), Inches(4.5))
        tf = txBox.text_frame
        tf.word_wrap = True

        p_badge = tf.paragraphs[0]
        p_badge.text = slide_info.get('badge', 'PROJECT OVERVIEW')
        p_badge.font.size = Pt(14)
        p_badge.font.bold = True
        p_badge.font.color.rgb = LIME
        p_badge.space_after = Pt(20)

        p_title = tf.add_paragraph()
        p_title.text = slide_info['title']
        p_title.font.size = Pt(44)
        p_title.font.bold = True
        p_title.font.color.rgb = TEAL
        p_title.space_after = Pt(14)

        p_sub = tf.add_paragraph()
        p_sub.text = slide_info['subtitle']
        p_sub.font.size = Pt(22)
        p_sub.font.color.rgb = WHITE
        p_sub.space_after = Pt(30)

        for pt in slide_info['points']:
            p_pt = tf.add_paragraph()
            p_pt.text = '✔  ' + pt
            p_pt.font.size = Pt(16)
            p_pt.font.color.rgb = GRAY
            p_pt.space_after = Pt(10)

    else:
        # Header text box
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.7), Inches(1.3))
        htf = header_box.text_frame
        htf.word_wrap = True
        
        hp1 = htf.paragraphs[0]
        hp1.text = slide_info['title']
        hp1.font.size = Pt(28)
        hp1.font.bold = True
        hp1.font.color.rgb = TEAL
        hp1.space_after = Pt(4)

        hp2 = htf.add_paragraph()
        hp2.text = slide_info['subtitle']
        hp2.font.size = Pt(15)
        hp2.font.color.rgb = GRAY

        if slide_info['type'] == 'cards':
            cards = slide_info['cards']
            card_w = Inches(5.6)
            card_h = Inches(2.2)
            positions = [
                (Inches(0.8), Inches(2.1)),
                (Inches(6.8), Inches(2.1)),
                (Inches(0.8), Inches(4.7)),
                (Inches(6.8), Inches(4.7)),
            ]
            for i, (ctitle, cdesc) in enumerate(cards):
                left, top = positions[i]
                c_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, card_w, card_h)
                c_shape.fill.solid()
                c_shape.fill.fore_color.rgb = CARD_BG
                c_shape.line.color.rgb = TEAL
                c_shape.line.width = Pt(1)

                ctf = c_shape.text_frame
                ctf.word_wrap = True
                ctf.margin_left = Inches(0.3)
                ctf.margin_right = Inches(0.3)
                ctf.margin_top = Inches(0.25)
                ctf.margin_bottom = Inches(0.2)

                cp1 = ctf.paragraphs[0]
                cp1.text = ctitle
                cp1.font.size = Pt(17)
                cp1.font.bold = True
                cp1.font.color.rgb = LIME
                cp1.space_after = Pt(8)

                cp2 = ctf.add_paragraph()
                cp2.text = cdesc
                cp2.font.size = Pt(13)
                cp2.font.color.rgb = WHITE

        elif slide_info['type'] == 'list_box':
            card_w = Inches(11.7)
            card_h = Inches(4.8)
            c_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.1), card_w, card_h)
            c_shape.fill.solid()
            c_shape.fill.fore_color.rgb = CARD_BG
            c_shape.line.color.rgb = TEAL
            c_shape.line.width = Pt(1)

            ctf = c_shape.text_frame
            ctf.word_wrap = True
            ctf.margin_left = Inches(0.4)
            ctf.margin_right = Inches(0.4)
            ctf.margin_top = Inches(0.3)

            for i, (label, desc) in enumerate(slide_info['items']):
                p = ctf.paragraphs[0] if i == 0 else ctf.add_paragraph()
                p.text = '✦  ' + label + ' ' + desc
                p.font.size = Pt(14)
                p.font.color.rgb = WHITE
                p.space_after = Pt(16)

        elif slide_info['type'] == 'steps':
            step_w = Inches(11.7)
            step_h = Inches(1.05)
            y_starts = [Inches(2.1), Inches(3.3), Inches(4.5), Inches(5.7)]
            for i, (stitle, sdesc) in enumerate(slide_info['steps']):
                s_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y_starts[i], step_w, step_h)
                s_shape.fill.solid()
                s_shape.fill.fore_color.rgb = CARD_BG
                s_shape.line.color.rgb = TEAL
                s_shape.line.width = Pt(1)

                stf = s_shape.text_frame
                stf.word_wrap = True
                stf.margin_left = Inches(0.3)
                stf.margin_top = Inches(0.15)

                sp1 = stf.paragraphs[0]
                sp1.text = stitle + '  ➔  ' + sdesc
                sp1.font.size = Pt(14)
                sp1.font.color.rgb = WHITE

output_path = r'C:\Users\USER\.gemini\antigravity\scratch\CivicConnect-AI\CivicConnect_AI_Presentation.pptx'
prs.save(output_path)
print(f'Successfully created presentation at: {output_path}')
