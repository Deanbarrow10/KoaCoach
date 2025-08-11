"""
app.py defines the backend server for the AI therapist assistant. it creates a Flask API that routes messages to specialized agents including diagnostic, support, crisis, and matching agents.
it uses OpenAI's API and sends crisis alerts via SMS & email, and supports web search for therapist lookup.
it processes incoming chat messages, evaluates user needs, and triggers escalation protocols when risk is detected.
"""


# loads environment variables
from agents import Agent, Runner, WebSearchTool, trace, ModelSettings
import os
from flask import Flask, jsonify, request, Response
from twilio.rest import Client
from sendmail import MailSender
import re
import openai
from supabase import create_client
# new import statements
from flask_cors import CORS
import requests
import json
from dotenv import load_dotenv
load_dotenv()


# load Supabase service role key (secure)
SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# if not SUPABASE_SERVICE_ROLE_KEY:
#     print("❌ SUPABASE_SERVICE_ROLE_KEY not set in environment")
#     raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is required for account deletion")

# supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
# sets up Twilio client using environment variables
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER")
crisis_sms_recipient = os.getenv("CRISIS_PHONE_NUMBER")
twilio_client = Client(account_sid, auth_token)


# sets OpenAI API key from environment and checks presence
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
   print("🔍 Debug: OPENAI_API_KEY =", os.getenv("OPENAI_API_KEY"))
   raise RuntimeError("❌ OPENAI_API_KEY not set in environment")


# sends a basic SMS alert when a crisis is detected
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


# sends an email alert with detailed crisis information
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
# enable cors
CORS(app)


# initializes web search tool for therapist matching
web_search = WebSearchTool()
# ----------------------- fitness agents -----------------------
# adds workout, personal trainer, form & safety, nutrition, and sleep coaches
# update: every coach MUST use web_search for evidence + citations

workout_coach_agent = Agent(
    name="workout_coach_agent",
    instructions="""
You are Koa's Workout Coach. Design safe, scalable strength and conditioning plans using evidence.

RESEARCH & CITATIONS (MANDATORY)
- Before finalizing ANY advice or plan, call the web_search tool to find supporting peer‑reviewed sources or authoritative org guidelines.
- Prefer systematic reviews, RCTs, meta‑analyses, and consensus/position stands (ACSM, WHO, DHHS).
- Summarize findings in your own words. Do NOT paste long quotes.
- End every response with 1–3 compact citations formatted: Author, Year, Journal (or Org). DOI if available. No raw URLs.

OUTPUT
- concise blocks: days, exercises, sets×reps, rest, target RPE, weekly progression
- tailor to goal, time, equipment, experience; include 1 regression + 1 progression per main lift
- default rest guidance (heavy 2–5 min; accessories 60–120 s) with 1‑line rationale

GUARDRAILS
- avoid medical advice; if user mentions pain/injury/condition, state you can’t provide medical advice and suggest consulting a clinician.
""",
    model_settings=ModelSettings(temperature=0.4, max_tokens=600),
    tools=[web_search],
)

personal_trainer_coach_agent = Agent(
    name="personal_trainer_coach_agent",
    instructions="""
You are Koa's Personal Trainer Coach. Convert user goals into a 12‑week lifestyle‑fit roadmap.

RESEARCH & CITATIONS (MANDATORY)
- Always run web_search to confirm public‑health recommendations and any coaching claims you reference.
- Prefer WHO guidelines, U.S. Physical Activity Guidelines, and behavior‑change literature (habits/adherence).
- End with 1–2 citations (Author/Org, Year, Source). No raw URLs.

OUTPUT
- (1) 12‑week overview with mesocycles + 1 deload week
- (2) weekly template (cardio + strength + mobility)
- (3) 2 tiny habits (cue→behavior→reward)
- (4) check‑in metric
- (5) busy‑day fallback (10–15 min)
- align with 150–300 min/wk moderate or 75–150 min vigorous + strength 2×/wk (verify via web_search each time)

GUARDRAILS
- practical, time‑anchored advice; no medical claims.
""",
    model_settings=ModelSettings(temperature=0.5, max_tokens=600),
    tools=[web_search],
)

form_safety_coach_agent = Agent(
    name="form_safety_coach_agent",
    instructions="""
You are Koa's Form & Safety Coach. Provide technique cues, common mistakes, and safer regressions/progressions.

DISCLAIMER (ALWAYS FIRST LINE)
"Koa isn’t a medical doctor and doesn’t provide medical advice. If you have pain, injury, or a condition, consult a qualified clinician."

RESEARCH & CITATIONS (MANDATORY)
- Use web_search to validate general technique/safety principles (ACSM, national guidelines, reputable orgs).
- End with 1–2 citations (Author/Org, Year, Source).

OUTPUT (per movement)
- 3–5 short cues
- 1 regression + 1 progression
- common mistakes
- stop‑criteria (what sensations mean stop)
- brief warm‑up suggestion

GUARDRAILS
- plain, actionable language; no diagnosis or treatment.
""",
    model_settings=ModelSettings(temperature=0.4, max_tokens=500),
    tools=[web_search],
)

nutrition_coach_agent = Agent(
    name="nutrition_coach_agent",
    instructions="""
You are Koa's Nutrition Coach. Provide practical, food‑first guidance aligned to build/cut/maintain.

RESEARCH & CITATIONS (MANDATORY)
- Run web_search for protein targets and dietary guidance you reference, prioritizing peer‑reviewed reviews/meta‑analyses.
- End with 2–3 citations (Author, Year, Journal; DOI if available). No raw URLs.

OUTPUT
- daily protein target (range) + per‑meal target in plain language (e.g., “about 20–40 g per meal”)
- simple day template (B/L/D + 2 snacks) with high‑protein options
- quick grocery list
- 1–2 coaching tips (meal prep, swaps)
- when noting ~1.6 g/kg/day with RT, also give an easy non‑kg phrasing

GUARDRAILS
- avoid medical nutrition therapy; avoid unsafe deficits; note supplement caution.
""",
    model_settings=ModelSettings(temperature=0.5, max_tokens=650),
    tools=[web_search],
)

sleep_coach_agent = Agent(
    name="sleep_coach_agent",
    instructions="""
You are Koa's Sleep Coach. Improve recovery and performance via consistent sleep routines.

RESEARCH & CITATIONS (MANDATORY)
- Use web_search to verify sleep duration and hygiene recommendations (AASM/SRS consensus, reputable orgs).
- End with 1–2 citations (Author/Org, Year, Source).

OUTPUT
- target sleep/wake schedule
- 3 habit anchors (AM light, PM wind‑down, caffeine cutoff)
- 2 environment tweaks (dark, cool, quiet)
- contingency plan after a poor night (reduce intensity, prioritize technique)

GUARDRAILS
- aim for 7+ h/night (unless medically directed otherwise); avoid medical claims.
""",
    model_settings=ModelSettings(temperature=0.4, max_tokens=500),
    tools=[web_search],
)

fitness_supervisor_agent = Agent(
    name="fitness_supervisor_agent",
    instructions="""
You are Koa's Fitness Supervisor. Route requests to the right specialist and ensure research‑backed answers.

ROUTING
- "plan, program, split, progression, sets, reps, rest, equipment, time" → workout_coach_agent
- "long‑term, routine, schedule, habit, 12‑week, periodize, lifestyle" → personal_trainer_coach_agent
- "form, technique, how to do, hurts, knee valgus, regression, progression" → form_safety_coach_agent
- "protein, calories, macros, meal, recipe, grocery, cut, bulk" → nutrition_coach_agent
- "sleep, bedtime, wake time, jet lag, recovery, caffeine" → sleep_coach_agent

POLICY
- If user mentions pain/injury/medical condition, reply that we can’t provide medical advice and recommend a qualified clinician.
- Each specialist MUST call web_search before finalizing and MUST include citations at the end.
- Keep a friendly, coach‑like tone.
""",
    model_settings=ModelSettings(temperature=0.4, max_tokens=250),
    handoffs=[
        workout_coach_agent,
        personal_trainer_coach_agent,
        form_safety_coach_agent,
        nutrition_coach_agent,
        sleep_coach_agent
    ],
)
# --------------------- end fitness agents ---------------------






# ---- Routes ----


# handles basic logging route for debugging
@app.route('/api/log', methods=['GET'])
async def log():
   x = request.args.get('x', default='Guest')
   print("[LOG]", x)
   return 'message received!'


# handles therapist chat request and routes to proper agent
@app.route('/api/therapist', methods=['POST'])
async def therapist():
   data = request.get_json() or {}
   lang = data.get('lang', 'en')
   messages = data.get('messages', [])

   # handles interrupted TTS
   interrupted = data.get('interrupted', False)

   # combines chat history into single string for prompt
   chat_str = "\n".join([f"{m['role']}: {m['content']}" for m in messages])


   # handles interrupted TTS
   if interrupted:
       prompt = f"(The user just interrupted you. Respond concisely and naturally.) Respond in {lang}:\n{chat_str}"
   else:
       prompt = f"Respond in {lang}:\n{chat_str}"




   # runs the supervisor agent to generate reply
   result = await Runner.run(fitness_supervisor_agent, prompt)
   response_text = result.final_output


   # Fallback name for alerting, will update once user form is created
   name = "Koa User"


   # checks for crisis-related keywords in user messages
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


# handles web search queries through agent tool
@app.route('/api/web', methods=['GET'])
async def web():
   query = request.args.get('query', default='Guest')
   with trace("Web search"):
       result = await Runner.run(web_search, query)
   print("[WEB SEARCH RESULT]:", result.final_output)
   return jsonify({'message': result.final_output})


# returns the posted data in a JSON response
@app.route('/api/echo', methods=['POST'])
def echo():
   data = request.json
   return jsonify({'you_sent': data})


@app.route('/api/delete-account', methods=['POST'])
def delete_account():
    try:
        # 1. get Authorization header from request
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        access_token = auth_header.split(" ")[1]

        # 2. get the current user from the token
        user = supabase_admin.auth.get_user(access_token)
        if not user or not user.user:
            return jsonify({"error": "Invalid user"}), 401

        user_id = user.user.id

        # 3. delete all user-related data
        supabase_admin.table("journal_entries").delete().eq("user_id", user_id).execute()
        # repeat for any other tables where you store user data
        # supabase_admin.table("messages").delete().eq("user_id", user_id).execute()
        # supabase_admin.table("streaks").delete().eq("user_id", user_id).execute()

        # 4. delete the user from auth
        supabase_admin.auth.admin.delete_user(user_id)

        return jsonify({"ok": True, "message": "Account and all data deleted"})

    except Exception as e:
        print("[DELETE ACCOUNT ERROR]", e)
        return jsonify({"error": str(e)}), 500

# analyzes a meal photo and returns 1–3 options
@app.route('/api/analyze-food', methods=['POST'])
def analyze_food():
    try:
        data = request.get_json(force=True) or {}
        image_b64 = data.get('image_base64')
        if not image_b64:
            return jsonify({"error": "missing image_base64"}), 400

        # build data url for vision
        data_url = f"data:image/jpeg;base64,{image_b64}"

        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "you are a nutrition assistant. identify the primary food(s) in the photo. "
                        "return an object with a single key 'options' whose value is an array (length 1-3). "
                        "each option must have: label (string), serving (string), serving_grams (number), "
                        "calories (number), protein (number), carbs (number), fat (number), confidence (0..1). "
                        "respond strictly as JSON, no prose."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "analyze this meal photo and output the JSON object."},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            "temperature": 0.0,
            "max_tokens": 400,
            "response_format": {"type": "json_object"},
        }

        r = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {openai.api_key}", "Content-Type": "application/json"},
            json=payload,
            timeout=60,
        )
        r.raise_for_status()
        content = r.json()["choices"][0]["message"]["content"]

        try:
            parsed = json.loads(content)
            options = parsed.get("options", [])
        except Exception as e:
            print("[parse error]", e, content[:200])
            options = []


        return jsonify({"options": options})

    except requests.HTTPError as e:
        return jsonify({"error": "vision_failed", "detail": str(e), "body": getattr(e, 'response', None).text if getattr(e, 'response', None) else ""}), 502
    except Exception as e:
        return jsonify({"error": "server_error", "detail": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)