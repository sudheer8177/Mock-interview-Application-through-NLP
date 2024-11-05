import React from 'react';
import Profileinfo from '../Cards/Profileinfo';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ userInfo }) => {
    const navigate = useNavigate();

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    }

    return (
        <div className='bg-white flex items-center justify-between px-6 py-4 drop-shadow'>
            <h1 className='text-2xl font-large font-bold text-black py-4'>Mock Interview</h1>
            <Profileinfo userInfo={userInfo} onLogout={onLogout} />
        </div>
    );
}

export default Navbar;
