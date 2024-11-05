import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstanceFlask from '../utils/axiosinstanceflask';
import Navbar from '../Navbar/Navbar';

const Interview = () => {
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [currentResponse, setCurrentResponse] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const recognitionRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.questions) {
            setQuestions(location.state.questions);
            startInterview(location.state.questions);
        } else {
            console.error('No questions received');
        }
    }, [location.state]);

    const speakQuestion = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const initSpeechRecognition = () => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            console.log("Listening for answer...");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            console.log('Transcript received:', transcript);
            setCurrentResponse(transcript);  // Update the current response
            console.log('Updated currentResponse:', transcript);  // Debug log for current response
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    };

    const toggleListenForAnswer = () => {
        if (!recognitionRef.current) {
            initSpeechRecognition();
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const saveResponse = async () => {
        console.log('Preparing to save currentResponse:', currentResponse);  // Debug log before saving
        try {
            const currentQuestion = questions[currentQuestionIndex];
            await axiosInstanceFlask.post('/save-response', {
                question: currentQuestion,
                response: currentResponse,
            });
            console.log('Response saved successfully:', currentResponse);
        } catch (error) {
            console.error('Error sending response:', error);
        }
    };

    const handleNextQuestion = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        console.log('Current response before moving to the next question:', currentResponse);  // Debug log for response
        saveResponse();

        // Add question and response to responses array
        setResponses((prevResponses) => [
            ...prevResponses,
            { question: questions[currentQuestionIndex], response: currentResponse }
        ]);

        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentResponse(''); // Clear current response for the next question
            console.log('Cleared currentResponse for next question');  // Debug log after clearing
            askQuestion(currentQuestionIndex + 1);
        } else {
            handleFinish();
        }
    };

    const startInterview = (questions) => {
        if (questions.length > 0) {
            askQuestion(0);
        }
    };

    const askQuestion = (index) => {
        if (index < questions.length) {
            speakQuestion(questions[index]);
        }
    };

    const handleFinish = () => setIsCompleted(true);

    const handleOverview = () => {
        navigate('/overview', { state: { responses } });
    };

const handleResults = () => {
    const totalScore = responses.reduce((sum) => sum + Math.floor(Math.random() * 11), 0);
    navigate('/overview', { state: { totalScore } });
};

    return (
        <div>
            <Navbar />
            <div className="interview-container min-h-screen bg-gray-50 py-10">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-5">
                    {isCompleted ? (
                        <div>
                            {/* {/* <h1 className="text-xl font-bold text-center">Thank you for participating!</h1>
                            <h2 className="text-lg font-bold mt-4">Your Responses:</h2>
                            {/* {responses.map((item, index) => (
                                <div key={index} className="mt-2">
                                    <p><strong>Question {index + 1}:</strong> {item.question}</p>
                                    <p><strong>Your Response:</strong> {item.response}</p>
                                </div>
                            ))} */} 
                            <button onClick={handleOverview} className="bg-blue-500 text-white rounded p-2 mt-4">
                                View Overview
                            </button>
                            <button onClick={handleResults} className="bg-purple-500 text-white rounded p-2 mt-4 ml-2">
                                View Results
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-xl font-bold mb-4">Interview Questions</h1>
                            <div>
                                <p className="mb-4">{questions[currentQuestionIndex]}</p>
                                <button onClick={toggleListenForAnswer} className="bg-blue-500 text-white rounded p-2">
                                    {isListening ? 'Stop Listening' : 'Start Listening'}
                                </button>
                                <button onClick={handleNextQuestion} className="bg-green-500 text-white rounded p-2 ml-4">
                                    Next Question
                                </button>
                                <div className="mt-4">
                                    <h3 className="font-semibold">Your Response:</h3>
                                    <p><strong>{currentResponse}</strong></p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Interview;
