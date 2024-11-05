// src/components/Login.js
import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from '../Navbar/Navbar';
import { validateEmail } from '../utils/helper';
import PasswordInput from '../input/Passwordinput';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");
    try{
      const response = await axiosInstance.post("/login",{
        email:email,
        password:password
      });
      if(response.data && response.data.accessTocken ){
        localStorage.setItem("token",response.data.accessTocken)
        navigate('/dashboard')
      }
    }catch(error){
      if(error.response && error.response.data && error.response.data.message){
        setError(error.response.data.message)
      }else{
        setError("An unexpected error occured please try again")
      }
    }

    
  };

  return (
    <div>
      <Navbar />
      <div className='flex items-center justify-center mt-28'>
        <div className='w-96 border round bg-white px-7 py-20'>
          <form onSubmit={handleLogin}>
            <h1 className='text-2xl font-semibold mb-7 text-center'>Login</h1>

            <input
              type='text'
              placeholder='Email'
              className='input-box'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}
            <button type='submit' className='btn-primary'>
              Login
            </button>

            <p className='text-sm text-center mt-4'>
              Not registered yet?{" "}
              <Link to="/signup" className='font-medium text-primary underline'>
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
