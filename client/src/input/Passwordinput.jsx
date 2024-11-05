import React, {useState}from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

const Passwordinput = ({value,onChange,placeholder }) => {
    const [isShowPassword,setIsShowPassword]=useState(false);
    const toggleShowPassword=()=>{
        setIsShowPassword(!isShowPassword);
    }
    return (
        <div className='flex items-center bg-transparent border-[1.5px] border-sky-300 px-5 py-3 rounded mb-3'>
            <input value={value} onChange={onChange} placeholder={placeholder || "password"} type={isShowPassword ? "text":"password"}
                className='w-full text-sm bg-transparent -3 mr-3 rounded outline-none'
            />
            {isShowPassword ? (<FaRegEye
                size={22}
                className="text-primary cursor-pointer"
                onClick={()=> toggleShowPassword()}
            />):(
                <FaRegEyeSlash
                   size={22}
                   className='text-slate-400 cursor-pointer'
                   onClick={()=>toggleShowPassword()}  />
            )}
        </div>
    );
}

export default Passwordinput;
