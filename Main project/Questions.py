import random
import pyttsx3
import speech_recognition as sr
import time
import google.generativeai as genai
from app import analyze_resume
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize text-to-speech engine
engine = pyttsx3.init()

# Initialize speech recognizer
recognizer = sr.Recognizer()

# Configure Google Generative AI
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("API Key not found. Please set the GOOGLE_API_KEY environment variable.")


model = genai.GenerativeModel("gemini-1.5-flash")
# Function to make the system speak
def speak(text):
    engine.say(text)
    engine.runAndWait()

# Function to listen and recognize speech
def listen():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        try:
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=15)
            print("Recognizing...")
            query = recognizer.recognize_google(audio)
            print(f"You said: {query}")
            return query
        except sr.WaitTimeoutError:
            print("Listening timed out while waiting for phrase to start.")
            speak("I didn't hear anything, would you like to move to the next question?")
            return "no response"
        except sr.UnknownValueError:
            print("Sorry, I did not catch that. Could you please repeat?")
            speak("Sorry, I didn't catch that. Can you please repeat?")
            return "no response"
        except Exception as e:
            print(f"An error occurred: {str(e)}")
            speak("An error occurred while trying to recognize your voice.")
            return "error"

# Function to ask a question using speech recognition
def ask_question_speech(question, time_limit=60):
    speak(question)
    print(f"Asked: {question}")

    start_time = time.time()
    response = ""

    while time.time() - start_time < time_limit:
        response = listen()

        if "next" in response:
            print("User chose to go to the next question.")
            return "next"
        elif "skip" in response:
            print("User chose to skip this question.")
            return "skip"
        elif response == "no response":
            return "timeout"

        if response:  
            return response

    print("Time limit reached. Moving to the next question.")
    return "timeout"

# Function to randomly select keywords from a list
def select_random_keywords(keywords, num_keywords=3):
    if len(keywords) < num_keywords:
        return keywords  
    return random.sample(keywords, num_keywords)

# Function to generate a question from keywords using Generative AI
def generate_question_from_keywords(keywords):
    prompt = f"Generate a question most  related to the following keywords: {', '.join(keywords)}."
    response = model.generate_content(prompt)
    return response.text if response else "Unable to generate question."

    # except Exception as e:
    #     print(f"Error generating question: {e}")
    #     # Fallback to a generic question if the API call fails
    #     return f"What is your experience with {', '.join(keywords)}?"

# Main interview function
def conduct_interview(keywords):
    questions_and_answers = []  # List to store questions and corresponding answers
    num_questions = 7

    for i in range(num_questions):
        selected_keywords = select_random_keywords(keywords)
        question = generate_question_from_keywords(selected_keywords)

        print(f"\nQuestion {i+1}/{num_questions}: {question}")
        response = ask_question_speech(question)

        # Store both the question and the response
        questions_and_answers.append((question, response))

        # Allow for a brief pause between questions
        time.sleep(2)

        # If the user chose to skip, move to the next question
        if response in ["next", "skip", "timeout"]:
            continue

    # Display the questions and answers at the end of the interview
    print("\nInterview complete. Questions and Answers recorded:")
    for i, (q, a) in enumerate(questions_and_answers, 1):
        print(f"\nQuestion {i}: {q}")
        print(f"Answer {i}: {a}")

# Example usage
if __name__ == "__main__":
    # Extract keywords dynamically using the analyze_resume function
    resume_path = "Sudheer kumar ALL.pdf"  # Replace with the path to your resume PDF
    keywords = analyze_resume(resume_path)

    if keywords:
        # Conduct the interview
        conduct_interview(keywords)
    else:
        print("No keywords extracted from the resume.")
