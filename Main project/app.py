import os
import PyPDF2
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve the API key from environment variables
api_key = os.getenv("GOOGLE_API_KEY")

# Check if the API key is loaded properly
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in your .env file.")

# Configure Google Generative AI with the API key
genai.configure(api_key=api_key)

# Initialize the Generative Model with the specific model name
model = genai.GenerativeModel('gemini-1.5-flash')

# Function to extract text from a PDF file
def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
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
    """Cleans the generated text by removing unwanted characters."""
    return text.replace('*', '').strip()

# Function to convert the response text to a Python list of keywords
def text_to_list(text):
    """Extracts keywords from text and formats them into a Python list."""
    unwanted_phrases = [
        'Here are 10-15 keywords from the resume, emphasizing technical skills, projects, and experience:',
        'Technical Skills:',
        'Projects:',
        'Experience:',
        'Additional Keywords:',
        'Here are 10-15 keywords from the resume, categorized for clarity:',
        'Here are 10-15 keywords extracted from the resume:',
    ]
    
    lines = text.split('\n')
    # Filter out unwanted phrases
    keywords = [line.strip() for line in lines if line.strip() and line.strip() not in unwanted_phrases]
    return keywords

# Function to interact with Google's Gemini API
def ask_google(prompt):
    """Generates content using the Google Gemini API."""
    try:
        response = model.generate_content(prompt)
        cleaned_text = clean_text(response.text)
        # Convert cleaned text to a Python list
        keywords_list = text_to_list(cleaned_text)
        return keywords_list
    except Exception as e:
        print(f"An error occurred while generating content: {e}")
        return []

# Function to analyze a resume
def analyze_resume(file_path):
    """Analyzes a resume to extract key features."""
    resume_text = extract_text_from_pdf(file_path)
    if resume_text:
        prompt = (
            "Extract only 10 to 15 keywords such as technical skills, key words in projects, and experience from the following resume:\n\n{resume_text}."
        ).format(resume_text=resume_text)
        keywords_list = ask_google(prompt)
        return keywords_list[2:]
    else:
        return []

if __name__ == "__main__":
    # Example usage
    resume_file_path = "Sudheer kumar ALL.pdf"
    result = analyze_resume(resume_file_path)
    print(result[2:])
