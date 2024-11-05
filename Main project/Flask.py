import os
import PyPDF2
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import pyttsx3
import speech_recognition as sr
import random
import threading
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Retrieve the API key from environment variables
api_key = os.getenv("GOOGLE_API_KEY")

# Check if the API key is loaded properly
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in your .env file.")

# Configure Google Generative AI with the API key


# Initialize text-to-speech engine
engine = pyttsx3.init()
speak_lock = threading.Lock()

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Function to extract text from a PDF file
def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text

# Function to clean the generated text
def clean_text(text):
    return text.replace('*', '').strip()

# Function to convert the response text to a Python list of keywords
def text_to_list(text):
    unwanted_phrases = [
        'Here are 10-15 keywords from the resume, emphasizing technical skills, projects, and experience:'
    ]
    
    lines = text.split('\n')
    keywords = [line.strip() for line in lines if line.strip() and line.strip() not in unwanted_phrases]
    return keywords

# Function to interact with Google's Gemini API
def ask_google(prompt):
    try:
        response = model.generate_content(prompt)
        cleaned_text = clean_text(response.text)
        keywords_list = text_to_list(cleaned_text)
        return keywords_list
    except Exception as e:
        print(f"An error occurred while generating content: {e}")
        return []

# Function to analyze a resume
def analyze_resume(file_path):
    resume_text = extract_text_from_pdf(file_path)
    if resume_text:
        prompt = f"Extract 10 to 15 keywords like technical skills and experience from the following resume:\n\n{resume_text}."
        keywords_list = ask_google(prompt)
        return keywords_list
    else:
        return []

# Route to upload resume
@app.route('/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file found"}), 400

    resume_file = request.files['resume']
    file_path = os.path.join(UPLOAD_FOLDER, resume_file.filename)

    # Save the file
    resume_file.save(file_path)

    # Analyze the resume to extract keywords
    keywords = analyze_resume(file_path)

    return jsonify({"keywords": keywords}), 200

# Route to start the interview by generating questions
@app.route('/start-interview', methods=['POST'])
def start_interview():
    data = request.get_json()
    keywords = data.get('keywords', [])

    if not keywords:
        return jsonify({"error": "No keywords provided."}), 400

    # Simulate conducting an interview and generating questions based on keywords
    try:
        questions = conduct_interview(keywords)
        return jsonify({
            "message": "Interview conducted successfully.",
            "questions": questions
        }), 200
    except Exception as e:
        print(f"Error conducting interview: {e}")
        return jsonify({"error": "Failed to conduct interview."}), 500

# Function to randomly select keywords from a list
def select_random_keywords(keywords, num_keywords=3):
    if len(keywords) < num_keywords:
        return keywords
    return random.sample(keywords, num_keywords)




# Function to generate a question from keywords using Generative AI
def generate_question_from_keywords(keywords):
    prompt = f"Generate a  related questions only question without any content to the following keywords only one question: {', '.join(keywords)}."
    response = model.generate_content(prompt)
    return response.text if response else f"What is your experience with {', '.join(keywords)}?"

# Main interview function
# Main interview function
def conduct_interview(keywords):
    # questions_and_answers = []
    num_questions = 7
    generated_questions = []  # Array to hold all generated questions

    # Generate questions based on the keywords
    for i in range(num_questions):
        selected_keywords = select_random_keywords(keywords)
        question = generate_question_from_keywords(selected_keywords)
        generated_questions.append(question)  # Store each generated question
    return generated_questions

    # Now ask each generated question
    # for i, question in enumerate(generated_questions):
    #     print(f"\nQuestion {i+1}/{num_questions}: {question}")
    #     response = ask_question_speech(question, time_limit=60)
    #     print(response)

    #     questions_and_answers.append((question, response))
    #     print(questions_and_answers)
    #     time.sleep(2)

    #     # Check for commands to skip to the next question
    #     if response in ["next", "skip", "timeout"]:
    #         continue

    # print("\nInterview complete. Questions and Answers recorded:")
    # for i, (q, a) in enumerate(questions_and_answers, 1):
    #     print(f"\nQuestion {i}: {q}")
    #     print(f"Answer {i}: {a}")

    # return questions_and_answers

@app.route('/save-response', methods=['POST'])
def save_response():
    data = request.get_json()
    question = data.get('question')
    response = data.get('response')

    if not question or not response:
        return jsonify({"error": "Both question and response are required."}), 400

    try:
        # Here, save the response (e.g., to a database or file)
        print(f"Saved response for question: {question} -> {response}")
        return jsonify({"message": "Response saved successfully."}), 200
    except Exception as e:
        print(f"Error saving response: {e}")
        return jsonify({"error": "Failed to save response."}), 500

if __name__ == "__main__":
    app.run(debug=True)
