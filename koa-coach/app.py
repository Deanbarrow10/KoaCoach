# tracks agent information
import agentops
from agents import Agent, Runner, WebSearchTool, trace
import asyncio
import os
from dotenv import load_dotenv
import json
from flask import Flask, jsonify, request
from twilio.rest import Client
from sendmail import MailSender
import re

# Twilio setup
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER")
crisis_sms_recipient = os.getenv("CRISIS_PHONE_NUMBER")
twilio_client = Client(account_sid, auth_token)

def send_crisis_sms():
    try:
        message = twilio_client.messages.create(
            body="A crisis event has been detected.",
            from_=twilio_phone_number,
            to=crisis_sms_recipient
        )
        print(f"[CRISIS SMS SENT] SID: {message.sid}")
    except Exception as e:
        print(f"[CRISIS SMS ERROR] {e}")

def send_crisis_email(name: str, crisis_type: str, user_message: str = None):
    try:
        email_user = os.getenv("EMAIL_ADDRESS")
        email_pass = os.getenv("EMAIL_PASSWORD")
        email_recipient = os.getenv("EMAIL_RECIPIENT")

        subject = f"Crisis Alert: {name}"
        plaintext = f"""ALERT: Crisis event detected.

Name: {name}
Type: {crisis_type}
"""
        if user_message:
            plaintext += f"\nUser Message:\n{user_message}"

        html = f"""
        <h2>🚨 Crisis Alert Detected</h2>
        <p><strong>Name:</strong> {name}<br>
        <strong>Type:</strong> {crisis_type}</p>
        """
        if user_message:
            html += f"<p><strong>User Message:</strong><br><i>{user_message}</i></p>"

        mailer = MailSender(email_user, email_pass, ('smtp.gmail.com', 587))
        mailer.set_message(
            in_plaintext=plaintext,
            in_subject=subject,
            in_from="alerts@solace.com",
            in_htmltext=html
            # no attachment args at all
        )

        mailer.set_recipients([email_recipient])
        mailer.connect()
        mailer.send_all()

    except Exception as e:
        print(f"[CRISIS EMAIL ERROR] {e}")


# creates flask web server
app = Flask(__name__)

# API keys for openai and agentops
os.environ["OPENAI_API_KEY"] = "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"
AGENTOPS_API_KEY = 'fc01d380-a529-4ee7-880a-3c8ddd04305b'
agentops.init(
    api_key=AGENTOPS_API_KEY,
    default_tags=['openai agents sdk']
)


web_search = WebSearchTool()

# 1. Diagnostic Agent
diagnostic_agent = Agent(
    name="diagnostic_agent",
    instructions="""
    You are a diagnostic assistant based on the DSM-5-TR criteria.
    
    When a user describes their mental health symptoms, analyze the language and match patterns to DSM-5-TR definitions.
    Clearly explain the possible conditions based on their description (e.g., anxiety, depression), but avoid medical diagnosis unless explicitly asked.
    
    Include:
    - A brief summary of the potential issue
    - The DSM-5-TR category it might fall under
    - Encouragement to consult a licensed professional for a full evaluation
    
    Ask a follow-up question to clarify symptom duration, frequency, or impact on daily life.
    """,
)

# 2. Therapist Matching Agent
therapist_match_agent = Agent(
    name="therapist_match_agent",
    instructions="""
    You are a therapist matching assistant.

    Always use the web_search tool to find real therapists who match the user's needs. Do not make up results or guess from memory.

    Before performing any search:
    - Make sure you know the user's location (such as a city or zip code).
    - If the location is missing, ask:  
    "Can you tell me your city or zip code so I can find therapists near you?"

    When you summarize results, take into account:
    - Type of therapy (CBT, EMDR, talk therapy, etc.)
    - Location or telehealth availability
    - Language, gender, or cultural fit

    For each recommended therapist, provide:
    - Name and credentials
    - Specializations
    - Location or telehealth status
    - Phone number and email if available
    - A short, conversational description of their approach

    Only include up to 3 therapist suggestions per response.

    Here is an example of the ideal response format:

    "Dr. Amanda Lee is a licensed psychologist who specializes in cognitive behavioral therapy for anxiety and trauma.  
    She offers both in-person sessions in Chicago and virtual appointments.  
    You can reach her at 555-234-7890 or amanda.lee@example.com.  
    Would you prefer a therapist who offers evening hours or works on weekends?"

    Do not include any URLs, website links, or Markdown formatting like asterisks or brackets. DO NOT RESPOND WITH ASTERISKS. DO NOT RESPOND WITH ANY links THAT END WITH 'utm_source=openai'.

    Do not wrap text in '**', '[]'. 

    You must write as if your response will be read aloud by a voice assistant. 

    Speak in a smooth, natural voice-ready format.

    At the end of your response, ask a follow-up question about preferences such as insurance coverage or therapy goals.

    Never respond without using the web_search tool first. DO NOT MAKE UP THERAPISTS. USE THE WEB_SEARCH TOOL. Try to include the therapist contact information. 

    I want you to actually find real therapists. Not just clinics.
    """,
    tools=[web_search],
)

# 3. Emotional Support Agent
emotional_support_agent = Agent(
    name="emotional_support_agent",
    instructions="""
    When communicating with users seeking support, prioritize these evidence-based techniques that are strongly associated with reliable improvement:

    1. THERAPEUTIC PRAISE: Regularly acknowledge user progress, efforts, and strengths. Use specific, genuine praise that reinforces positive behaviors and thinking patterns.

    2. FUTURE PLANNING: Guide users to develop concrete, actionable plans. Help them anticipate challenges and create specific strategies for implementing healthy behaviors and coping mechanisms.

    3. HIGHLIGHT PERCEPTIONS OF CHANGE: Draw attention to positive changes the user has made or experienced, even small ones. Help them recognize their progress and changing perspectives.

    4. EMPHASIZE CHANGE METHODS: Focus conversations on specific techniques and methods that facilitate change. Provide clear, practical tools and strategies users can implement.

    5. SET CLEAR AGENDAS: Structure conversations with clear objectives. Begin interactions by establishing what will be discussed and what outcomes are desired.

    6. ELICIT AND GIVE FEEDBACK: Regularly ask for the user's thoughts and reactions, then provide constructive, specific feedback on their approaches and ideas.

    7. REVIEW HOMEWORK: Follow up on previously suggested activities or practices and discuss outcomes and learnings.

    For each interaction, try to base your response on the following techniques. You are to provide emotional support to the user. 
    
    Always mention that you should try seeking a therapist on our platform in a subtle manner. Do not be overly pushy. Mention in a subtle way.

    Do not include category labels, headings, or section titles like "Therapeutic Praise:", "Future Planning:", or "Highlight Perceptions of Change:".  

    Instead, speak naturally in full sentences as if you're talking to the user directly in a conversation. Avoid labeling your statements or organizing them under topics — just respond as a supportive therapist would.
    """,
)

# 4. Crisis Evaluation Agent
crisis_agent = Agent(
    name="crisis_agent",
    instructions="""
    You are a crisis triage agent.

    If a user mentions self-harm, suicidal ideation, or extreme distress, respond with calm empathy.
    
    Do not try to diagnose or counsel. Instead:
    - Validate the person’s pain
    - Provide the Suicide Prevention Hotline (988 in the US)
    - Offer grounding statements and recommend immediate help
    
    Ask: “Would you like me to connect you with professional resources or support lines?”

    Please note that I am not a licensed therapist. I recommend you seek professional help.

    """,
)

# --- Supervisor Therapist Agent ---
therapy_supervisor_agent = Agent(
    name="therapy_supervisor_agent",
    instructions="""
    You are a comprehensive therapist assistant who routes users to the correct specialist.
    
    Based on the user's message:
    1. If they describe emotional distress or need a listening ear → hand off to emotional_support_agent
    2. If they describe symptoms or want to understand what they're going through → hand off to diagnostic_agent
    3. If they ask for help finding a therapist → hand off to therapist_match_agent
    4. If they express thoughts of self-harm or crisis → hand off to crisis_agent

    For general wellness conversations, start with validation and ask one clarifying question to route correctly.
    Maintain a calm, supportive tone at all times.
    """,
    tools=[web_search],
    handoffs=[emotional_support_agent, diagnostic_agent,
              therapist_match_agent, crisis_agent],
)


# ---- Routes ----
@app.route('/api/log', methods=['GET'])
async def log():
    x = request.args.get('x', default='Guest')
    print("[LOG]", x)
    return 'message received!'


# @app.route('/api/therapist', methods=['GET'])
# async def therapist():
#     usermsg = request.args.get('usermsg', default='Guest')
#     lang = request.args.get('lang', default='Guest')
#     print(f"/api/therapist called with message:\n{usermsg}\nLanguage: {lang}")

#     result = await Runner.run(
#         therapy_supervisor_agent,
#         "Respond in " + lang + "\n" + usermsg,
#     )
#     return result.final_output

# @app.route('/api/therapist', methods=['POST'])
# async def therapist():
#     data  = request.get_json() or {}
#     lang  = data.get('lang', 'Guest')
#     messages = data.get('messages', [])

#     # Convert message history to string
#     chat_str = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
#     prompt = f"Respond in {lang}:\n{chat_str}"

#     result = await Runner.run(therapy_supervisor_agent, prompt)
#     return result.final_output

@app.route('/api/therapist', methods=['POST'])
async def therapist():
    data = request.get_json() or {}
    lang = data.get('lang', 'en')
    messages = data.get('messages', [])

    # Combine chat history for prompting
    chat_str = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    prompt = f"Respond in {lang}:\n{chat_str}"

    # Run main assistant
    result = await Runner.run(therapy_supervisor_agent, prompt)
    response_text = result.final_output

    # Ask OpenAI: extract user's full name ONLY
    name_query = await Runner.run(
        therapy_supervisor_agent,
        chat_str + "\n\nExtract ONLY the most recent full name mentioned by the user. Respond with only the name and nothing else."
    )
    raw_name = name_query.final_output.strip()

    # Extract a clean name (e.g. "Sarah Littlegirl")
    name_match = re.search(r"\b[A-Z][a-z]+(?: [A-Z][a-z]+)?\b", raw_name)
    name = name_match.group(0) if name_match else "Unknown User"

    # Combine user messages to detect crisis
    user_inputs = " ".join([m["content"] for m in messages if m["role"] == "user"])
    crisis_keywords = ["988", "suicidal", "kill myself", "self-harm", "hurt myself"]

    if any(kw in user_inputs.lower() for kw in crisis_keywords) or "988" in response_text:
        send_crisis_sms()
        send_crisis_email(
            name=name,
            crisis_type="Possible suicidal ideation",
            user_message=user_inputs
        )

    return response_text


@app.route('/api/web', methods=['GET'])
async def web():
    query = request.args.get('query', default='Guest')
    with trace("Web search"):
        result = await Runner.run(web_search, query)
    print("[WEB SEARCH RESULT]:", result.final_output)
    return jsonify({'message': result.final_output})

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.json
    return jsonify({'you_sent': data})


# no longer using built in flask server
# if __name__ == '__main__':
#    app.run(host='0.0.0.0', port=8080, debug=True, threaded=True)