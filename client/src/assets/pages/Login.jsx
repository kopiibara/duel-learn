import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import '../../output.css';// Import your custom styles
import '../../styles.css'; // Import your Tailwind CSS if needed
import googleIcon from '../images/googleIcon.png';
import axios from 'axios'


const Login = () => {
    const [data, setData] = useState({
        username: '',
        password: ''
    })
    const navigate = useNavigate(); // Hook for programmatic navigation

    const togglePassword = (fieldId, icon) => {
        const passwordInput = document.getElementById(fieldId);
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.textContent = 'visibility'; // Change icon to open eye
        } else {
            passwordInput.type = 'password';
            icon.textContent = 'visibility_off'; // Change icon to closed eye
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const { username, password } = data;
        try {
            const { data: response } = await axios.post(
                '/login',  // Specify the full URL to ensure correct origin
                { username, password },
                { withCredentials: true }        // Include credentials (cookies) in the request
            );
            
            if (response.error) {
                console.log(response.error); // Display error if login fails
            } else {
                setData({});
                navigate('/welcome'); // Redirect to welcome page on success
            }
        } catch (error) {
            console.log("Server error:", error); // Log server errors for debugging
        }
    };
    
    

    return (
        <div className="custom-bg font-aribau h-screen">
            <div className="flex items-center justify-center min-h-screen">
                <div className="custom-bg p-8 rounded shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-1 text-center text-[#E2DDF3]">Login Your Account</h1>
                    <p className="text-sm mb-10 text-center text-[#9F9BAE]">Please enter your details to login.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="username" className="sr-only">Enter your username or email</label>
                            <input 
                                type="text" 
                                value={data.username}
                                onChange={(e) => setData({...data, username: e.target.value})}
                                id="username" 
                                name="username" 
                                placeholder="Enter your username" 
                                required 
                                className="mt-1 block w-full p-2 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-[#9F9BAE]" 
                            />
                        </div>
                        
                        {/* Password Field with Eye Icon */}
                        <div className="mb-4 input-container relative">
                            <label htmlFor="password" className="sr-only">Enter your password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={data.password}
                                onChange={(e) => setData({...data, password: e.target.value})}
                                placeholder="Enter your password" 
                                required 
                                className="mt-1 block w-full p-2 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-[#9F9BAE]" 
                            />
                            <span 
                                onClick={(e) => togglePassword('password', e.currentTarget)} 
                                className="material-icons icon-eye absolute right-3 top-2 cursor-pointer"
                            >
                                visibility_off
                            </span>
                        </div>
                        
                        {/* Forgot Password Link */}
                        <p className="forgot-password mb-4">
                            <Link 
                                to="/forgot-password" 
                                className="hover:underline text-[#9F9BAE] text-sm text-right"
                            >
                                Forgot Password?
                            </Link>
                        </p>

                        <button 
                            type="submit" 
                            className="w-full bg-[#4D18E8] text-white py-2 rounded hover:bg-[#4D18E8]"
                        >
                            Log In
                        </button>
                    </form>
                    
                    {/* Divider and Google Button */}
                    <div className="mt-4 text-center flex items-center">
                        <div className="flex-grow border-t border-[#9F9BAE]"></div>
                        <p className="text-sm text-[#9F9BAE] mx-2">or</p>
                        <div className="flex-grow border-t border-[#9F9BAE]"></div>
                    </div>
                    <button 
                        className="w-full mt-2 border border-[#A38CE6] bg-[#080511] text-white py-2 rounded-lg hover:bg-[#080511] flex items-center justify-center"
                    >
                        <img src={googleIcon} alt="Google icon" className="w-6 h-6 mr-2 object-contain" 
                    />

                        Sign in with Google
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account? 
                        <Link to="/sign-up" className="text-blue-500 hover:underline"> Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
