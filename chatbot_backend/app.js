// Import required modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Load resume data from resume.json
const resume = JSON.parse(fs.readFileSync('resume.json', 'utf8'));

// Initialize Express app
const app = express();
app.use(cors());          // Enable CORS for all routes
app.use(express.json());  // Parse JSON request bodies

// Chatbot logic function
function getResponse(question) {
    // Normalize the question: convert to lowercase and remove leading/trailing whitespace
    question = question.toLowerCase().trim();

    // Check for keywords and return appropriate responses
    if (question.includes("name")) {
        return `My name is ${resume.name}.`;
    } else if (question.includes("email") || question.includes("contact") || question.includes("phone")) {
        return `You can reach me at ${resume.contact.email} or call me at ${resume.contact.phone}.`;
    } else if (question.includes("education") || question.includes("academic") || question.includes("btech")) {
        const btech = resume.academic_profile.btech;
        return `I’m pursuing a ${btech.degree} at ${btech.institution} with a CGPA of ${btech.cgpa} (expected ${btech.year}).`;
    } else if (question.includes("12th") || question.includes("xii")) {
        const xii = resume.academic_profile.cbse_xii;
        return `I scored ${xii.percentage}% in CBSE XII from ${xii.institution} in ${xii.year}.`;
    } else if (question.includes("10th") || question.includes("x")) {
        const x = resume.academic_profile.cbse_x;
        return `I scored ${x.percentage}% in CBSE X from ${x.institution} in ${x.year}.`;
    } else if (question.includes("semester") || question.includes("cgpa")) {
        const semesters = resume.academic_profile.btech.semesters;
        const semesterList = Object.entries(semesters)
            .map(([sem, cgpa]) => `${sem}: ${cgpa}`)
            .join(", ");
        return `My semester-wise CGPAs are: ${semesterList}.`;
    } else if (question.includes("skills") || question.includes("skill")) {
        const langs = resume.skills.languages.join(", ");
        const techs = resume.skills.technologies.join(", ");
        const interests = resume.skills.interests.join(", ");
        return `I know languages like ${langs}, technologies like ${techs}, and have interests in ${interests}.`;
    } else if (question.includes("project") || question.includes("projects")) {
        let proj;
        if (question.includes("restaurant")) {
            proj = resume.projects[0];
        } else if (question.includes("learning") || question.includes("companion")) {
            proj = resume.projects[1];
        } else if (question.includes("movie") || question.includes("recommendation")) {
            proj = resume.projects[2];
        } else {
            proj = resume.projects[0];
        }
        return `My project '${proj.name}': ${proj.description}`;
    } else if (question.includes("position") || question.includes("responsibility") || question.includes("e-cell") || question.includes("hostel")) {
        let pos;
        if (question.includes("e-cell")) {
            pos = resume.positions_of_responsibility[0];
        } else if (question.includes("hostel")) {
            pos = resume.positions_of_responsibility[1];
        } else {
            pos = resume.positions_of_responsibility[0];
        }
        const details = pos.details.join(" ");
        return `As ${pos.role}, I worked on: ${details}`;
    } else if (question.includes("achievement") || question.includes("honours") || question.includes("award")) {
        const achievements = resume.honours_and_achievements.join(" ");
        return `Some of my achievements include: ${achievements}`;
    } else if (question.includes("extracurricular") || question.includes("football") || question.includes("dance")) {
        const activities = resume.extra_curricular_activities.join(" ");
        return `My extracurricular activities include: ${activities}`;
    } else {
        return "I’m not sure how to answer that. Try asking about my education, skills, projects, or achievements!";
    }
}

// Define the /chat API endpoint
app.post('/chat', (req, res) => {
    const data = req.body;
    // Accept either 'question' or 'message' key for flexibility
    const question = data.question || data.message;

    // Check if question is provided
    if (!question) {
        return res.status(400).json({ error: "Please provide a question or message" });
    }

    // Get response and send it as JSON
    const response = getResponse(question);
    res.json({ answer: response });
});

// Start the server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});