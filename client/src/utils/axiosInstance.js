import axios from "axios";

import { BASE_URL } from "./constants";


const axiosInstance= axios.create({
    baseURL:BASE_URL,
    timeout:10000,
    headers:{
        "Content-Type":"application/json",
    },
})

axiosInstance.interceptors.request.use(
    (config)=>{
        const accessTocken = localStorage.getItem("token");
        if (accessTocken){
            config.headers.Authorization=`Bearer ${accessTocken}`;
        }  
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);



export default axiosInstance