import axios from 'axios';

const axiosInstanceFlask = axios.create({
    baseURL: 'http://localhost:5000', // or the appropriate backend URL
    // timeout: 10000, // Set a timeout to avoid hanging requests
});

export default axiosInstanceFlask;
