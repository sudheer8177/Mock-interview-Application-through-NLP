import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import axiosInstanceFlask from '../utils/axiosinstanceflask';
import Navbar from '../Navbar/Navbar';

const Home = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getUserInfo = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/get-user");
            if (response.data && response.data.user) {
                setUserInfo(response.data.user);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
            } else {
                console.error("Failed to fetch user info:", error);
            }
        }
    }, [navigate]);

    useEffect(() => {
        getUserInfo();
    }, [getUserInfo]);

    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size must be less than 5MB.");
                return;
            }
            setResume(file);
            console.log("Uploaded resume:", file.name);
        }
    };

    const handleStartInterview = async () => {
        console.log("Start Interview clicked"); // Debugging line
        if (!resume) {
            alert("Please upload your resume before starting the interview.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', resume);

        try {
            // Step 1: Upload resume
            const uploadResponse = await axiosInstanceFlask.post("/upload-resume", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (uploadResponse.data && uploadResponse.data.keywords) {
                const { keywords } = uploadResponse.data;
                console.log("Keywords:", keywords); // Debugging line
                
                // Step 2: Start interview with keywords and retrieve questions
                const interviewResponse = await axiosInstanceFlask.post("/start-interview", { keywords });
                console.log("Interview Response:", interviewResponse.data); // Log response

                if (interviewResponse.data && interviewResponse.data.questions) {
                    console.log("Navigating to /interview");
                    navigate("/interview", { state: { questions: interviewResponse.data.questions } }); // Pass questions via state
                } else {
                    console.error("No questions returned from interview API");
                    alert("Failed to start the interview.");
                }
            }
        } catch (err) {
            console.error("Error starting interview: ", err); // Log error
            alert(`Interview Error: ${err.message || "Failed to start the interview."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar userInfo={userInfo} />
            <div className="container mx-auto p-5">
                <h1 className="text-2xl font-semibold mb-5">Welcome, {userInfo?.fullName}</h1>
                <div className="mb-6">
                    <label className="block text-lg font-medium mb-2">Upload your resume:</label>
                    <input
                        type="file"
                        className="border border-gray-300 rounded p-2 w-64 mb-4"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                    />
                    {resume && <p className="text-green-500">Resume uploaded: {resume.name}</p>}
                </div>
                <div className="flex justify-center items-center space-x-4">
                    <button
                        className={`btn-primary w-32 ${loading ? "opacity-50" : ""}`}
                        onClick={handleStartInterview}
                        disabled={loading}
                    >
                        {loading ? "Starting..." : "Start Interview"}
                    </button>
                    <button
                        className="btn-primary w-32"
                        onClick={() => setResume(null)}
                    >
                        Reset Resume
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
