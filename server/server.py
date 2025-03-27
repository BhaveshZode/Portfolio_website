from flask import Flask, request, jsonify
import os
import openai
import pdfplumber
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings

app = Flask(__name__)

# Set Together AI API Key
os.environ["TOGETHER_API_KEY"] = "2d8430a7bdf4525601b3ee833d09977b947aa25c26387b442a848cfdae4efade"
openai.api_key = os.getenv("TOGETHER_API_KEY")
openai.api_base = "https://api.together.xyz/v1"

# Function to extract text from a PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"
    return text if text else "Error: Could not extract text from PDF"

# Load resume data
resume_path = "../public/resume.pdf"  # Ensure the correct path
resume_text = extract_text_from_pdf(resume_path)

# Split text into smaller chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
resume_chunks = text_splitter.split_text(resume_text)

# Create embeddings using Together AI


embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

vector_db = FAISS.from_texts(resume_chunks, embeddings)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")

    # Find relevant information in resume
    similar_texts = vector_db.similarity_search(user_message, k=3)
    context = "\n".join([doc.page_content for doc in similar_texts])

    # Ask AI based on resume knowledge
    response = openai.ChatCompletion.create(
        model="mistralai/Mistral-7B-Instruct",  # Ensure this model is supported by Together AI
        messages=[
            {"role": "system", "content": "You are a chatbot answering based on the user's resume."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {user_message}"}
        ]
    )

    return jsonify({"response": response["choices"][0]["message"]["content"]})

if __name__ == "__main__":
    app.run(debug=True)
