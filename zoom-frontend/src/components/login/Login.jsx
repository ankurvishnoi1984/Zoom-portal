import React, { useContext, useReducer, useState } from 'react';

// import '../../../assets/css/style.css'
// import '../../../assets/css/bootstrap/css/bootstrap.min.css'
import axios from 'axios';
import { API_URL } from '../../utils/constant';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../../context/LoginContext';

const Login = () => {
  const [username, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate()

  const {handelSetUserId} = useContext(LoginContext)

  const handleLogin = async() => {
    // Handle login logic here
    if(!username || !password){
      toast.error("Please Provide Username or Password");
      return;
    }
       
    try {
       const res = await axios.post(`${API_URL}/auth/login`,{username,password});
        
       if(res?.data?.errorCode == "1"){
        
        console.log("inside handelLogin",res)
       
        sessionStorage.setItem('IsAdminLoggedIn',true)
        sessionStorage.setItem('userId',res?.data?.responseData?.userId)
        sessionStorage.setItem('roleId',res?.data?.responseData?.roleCode)

         navigate('/dashboard')
         //toast.success("Login Successful")
       }else{
        console.log("dfsdfsdfsdf",res?.data?.errorDetail)
        toast.error(`${res?.data?.errorDetail}`)
       }
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.errorDetail)
    }

    //console.log('Logging in with:', userId, password);
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 px-4">
    <div className="w-full max-w-md">
      
      {/* Logo */}
      <div className="text-center mb-8">
        <img
          src="/images/Logo.png"
          alt="Logo"
          className="mx-auto w-56 drop-shadow-lg"
        />
      </div>

      {/* Card */}
      <div className="backdrop-blur-lg bg-white/80 shadow-2xl rounded-2xl p-8 border border-white/30">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Welcome Back
        </h2>

        {/* User ID */}
       <div className="mb-3">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    User ID
  </label>

  <div className="relative group">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-600 transition">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8 8 0 1118.364 4.56a8 8 0 01-13.243 13.243z" />
      </svg>
    </span>

    <input
      type="email"
      placeholder="Enter your user ID"
      value={username}
      onChange={(e) => setUserId(e.target.value)}
      className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-300 bg-white/70
                 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                 outline-none transition-all duration-200 placeholder:text-gray-400"
    />
  </div>
</div>

        {/* Password */}
       <div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Password
  </label>

  <div className="relative group">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-600 transition">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v2H6v-2c0-1.657 1.343-3 3-3s3 1.343 3 3z" />
      </svg>
    </span>

    <input
      type="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-300 bg-white/70
                 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                 outline-none transition-all duration-200 placeholder:text-gray-400"
    />
  </div>
</div>

        {/* Button */}
      <button
  type="button"
  onClick={handleLogin}
  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700
             hover:from-blue-700 hover:to-blue-800
             text-white font-semibold shadow-lg hover:shadow-xl
             active:scale-[0.98] transition-all duration-200"
>
  Log In
</button>
      </div>

    
    </div>
  </div>
);
};

export default Login;
