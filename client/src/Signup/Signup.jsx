import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Passwordinput from '../input/Passwordinput';
import { Link, useNavigate} from 'react-router-dom';
import { validateEmail } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';


const Signup = () => {

    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password, setPassword]=useState("");
    const [error,setError]=useState("");

   const navigate=useNavigate();
  const handleSignup = async(e) =>{
    e.preventDefault();

     

    if (!name){
        setError("Please enter your name");
        return;
    }
    if (!validateEmail(email)){
        setError("Please enter a valid email address");
      return;
    }
    if (!password){
      setError("Please enter the password")
      return; 
    }
    setError("")

    try {
      const response = await axiosInstance.post("/create-account", {
        fullName:name,
        email: email,
        password: password
      });
      
      // Handle successful register  response

      if(response.data && response.data.error ){
        setError(response.data.message)
        return
      }
     
      if(response.data && response.data.accessTocken){
        localStorage.setItem("token",response.data.accessTocken);
        navigate('/dashboard')
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);

      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }

  }


    return (
        <div>
            <Navbar/>
            <div className='flex items-center justify-center mt-28'>
                <div className='w-96 border round bg-white px-7 py-20'>
                    <form onSubmit={handleSignup}>
                      <h1 className='text-2xl font-semibold mb-7 text-center'>Signup</h1>
                      
                      <input type='text' 
                        placeholder='name' 
                        className='input-box'
                        value={name}
                        onChange={(e)=> setName(e.target.value)}
                      />

                    <input type='text' 
                        placeholder='Email' 
                        className='input-box'
                        value={email}
                        onChange={(e)=> setEmail(e.target.value)}
                      />
                    <Passwordinput 
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                      />

                    {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

                      <button type='submit' className='btn-primary'>
                         Create Account
                      </button>

                      <p className='text-sm text-center mt-4'>
                        Already have an account ?{""}
                        <Link to="/login" className='font-medium text-primary underline'>
                            Login
                        </Link>
                      </p>




                    </form>
                </div>
            </div>
        </div> 
    );
}

export default Signup;
