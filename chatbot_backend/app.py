from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load resume data (assuming resume.json is in the same directory)
with open('resume.json', 'r') as file:
    resume = json.load(file)

# Chatbot logic (same as before, reused for brevity)
def get_response(question):
    question = question.lower().strip()

    if "name" in question:
        return f"My name is {resume['name']}."
    elif "email" in question or "contact" in question or "phone" in question:
        return f"You can reach me at {resume['contact']['email']} or call me at {resume['contact']['phone']}."
    elif "education" in question or "academic" in question or "btech" in question:
        btech = resume['academic_profile']['btech']
        return f"I’m pursuing a {btech['degree']} at {btech['institution']} with a CGPA of {btech['cgpa']} (expected {btech['year']})."
    elif "12th" in question or "xii" in question:
        xii = resume['academic_profile']['cbse_xii']
        return f"I scored {xii['percentage']}% in CBSE XII from {xii['institution']} in {xii['year']}."
    elif "10th" in question or "x" in question:
        x = resume['academic_profile']['cbse_x']
        return f"I scored {x['percentage']}% in CBSE X from {x['institution']} in {x['year']}."
    elif "semester" in question or "cgpa" in question:
        semesters = ", ".join([f"{sem}: {cgpa}" for sem, cgpa in resume['academic_profile']['btech']['semesters'].items()])
        return f"My semester-wise CGPAs are: {semesters}."
    elif "skills" in question or "skill" in question:
        langs = ", ".join(resume['skills']['languages'])
        techs = ", ".join(resume['skills']['technologies'])
        return f"I know languages like {langs}, technologies like {techs}, and have interests in {', '.join(resume['skills']['interests'])}."
    elif "project" in question or "projects" in question:
        if "restaurant" in question:
            proj = resume['projects'][0]
        elif "learning" in question or "companion" in question:
            proj = resume['projects'][1]
        elif "movie" in question or "recommendation" in question:
            proj = resume['projects'][2]
        else:
            proj = resume['projects'][0]
        return f"My project '{proj['name']}': {proj['description']}"
    elif "position" in question or "responsibility" in question or "e-cell" in question or "hostel" in question:
        if "e-cell" in question:
            pos = resume['positions_of_responsibility'][0]
        elif "hostel" in question:
            pos = resume['positions_of_responsibility'][1]
        else:
            pos = resume['positions_of_responsibility'][0]
        details = " ".join(pos['details'])
        return f"As {pos['role']}, I worked on: {details}"
    elif "achievement" in question or "honours" in question or "award" in question:
        achievements = " ".join(resume['honours_and_achievements'])
        return f"Some of my achievements include: {achievements}"
    elif "extracurricular" in question or "football" in question or "dance" in question:
        activities = " ".join(resume['extra_curricular_activities'])
        return f"My extracurricular activities include: {activities}"
    else:
        return "I’m not sure how to answer that. Try asking about my education, skills, projects, or achievements!"

# API endpoint
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    # Accept either 'question' or 'message' for flexibility
    question = data.get('question') or data.get('message')
    if not question:
        return jsonify({"error": "Please provide a question or message"}), 400
    
    response = get_response(question)
    return jsonify({"answer": response})  # Keep 'answer' as the response key

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)