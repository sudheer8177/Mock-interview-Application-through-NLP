import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Overview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const responses = location.state?.responses || [];

    return (
        <div className="overview-container min-h-screen bg-gray-50 py-10">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-5">
                <h1 className="text-xl font-bold text-center mb-4">Interview Overview</h1>
                {responses.length > 0 ? (
                    responses.map((item, index) => (
                        <div key={index} className="mt-4">
                            <p><strong>Question {index + 1}:</strong> {item.question}</p>
                            <p><strong>Your Response:</strong> {item.response}</p>
                            {item.score !== undefined && <p><strong>Score:</strong> {item.score}/10</p>}
                        </div>
                    ))
                ) : (
                    <p>No responses available.</p>
                )}
                <button onClick={() => navigate('/')} className="bg-blue-500 text-white rounded p-2 mt-4">
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default Overview;
