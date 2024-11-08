import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googleIcon from '../images/googleIcon.png';
import axios from 'axios';
import {toast} from 'react-hot-toast' 

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        passwordError: '',
        confirmPasswordError: ''
    });

    const navigate = useNavigate();

    const togglePasswordVisibility = (fieldId) => {
        const passwordInput = document.getElementById(fieldId);
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    };


    const validateForm = async (event) => {
        event.preventDefault();
    
        const { username, password, email } = formData; // Use formData here instead of data
        try {
            const response = await axios.post('/sign-up', { username, password, email }); // Pass data as an object
            if(DataTransfer.error){
                toast.error(data.error)
            } else {
                setFormData({})
                toast.success("Register Succesful. Welcome!")
                navigate('/login')
            }
        } catch (error) {
            console.log(error);
        }
    
        setFormData(prev => ({
            ...prev,
            passwordError: '',
            confirmPasswordError: ''
        }));
    
        const { password: pwd, confirmPassword } = formData; // Rename password to pwd here
    
        const lengthValid = pwd.length >= 8 && pwd.length <= 12;
        const uppercaseValid = /[A-Z]/.test(pwd);
        const lowercaseValid = /[a-z]/.test(pwd);
        const numberValid = /\d/.test(pwd);
        const specialCharacterValid = /[!@#$%^&*]/.test(pwd);
        const spaceValid = !/\s/.test(pwd);
        const sequentialValid = !/(.)\1{2,}/.test(pwd);
        const commonWords = ["password", "12345678", "qwerty"];
    
        if (!lengthValid) {
            setFormData(prev => ({
                ...prev,
                passwordError: prev.passwordError + 'Password must be between 8 and 12 characters. '
            }));
        }
        if (!uppercaseValid) {
            setFormData(prev => ({
                ...prev,
                passwordError: prev.passwordError + 'Password must contain at least one uppercase letter. '
            }));
        }
        if (!lowercaseValid) {
            setFormData(prev => ({
                ...prev,
                passwordError: prev.passwordError + 'Password must contain at least one lowercase letter. '
            }));
        }
        if (!numberValid) {
            setFormData(prev => ({
                ...prev,
                passwordError: prev.passwordError + 'Password must contain at least one digit. '
            }));
        }
        if (!specialCharacterValid) {
            setFormData(prev => ({
                ...prev,
                passwordError: prev.passwordError + 'Password must contain at least one special character. '
            }));
        }
        if (!spaceValid) {
            setFormData(prev => ({
                ...prev,
                passwordError: prev.passwordError + 'Password must not contain spaces. '
            }));
        }
        if (!sequentialValid) {
            setFormData(prev => ({
                ...prev,
                passwordError: prev.passwordError + 'Password must not contain sequential or repeating characters. '
            }));
        }
        if (commonWords.some(word => pwd.toLowerCase().includes(word))) {
            setFormData(prev => ({
                ...prev,
                passwordError: prev.passwordError + 'Password must not contain common words or patterns. '
            }));
        }
    
        if (pwd !== confirmPassword) {
            setFormData(prev => ({
                ...prev,
                confirmPasswordError: 'Passwords do not match.'
            }));
        }
    
        if (!formData.passwordError && !formData.confirmPasswordError) {
            console.log('Form submitted');
            // Add the form submission logic here (e.g., API call)
        }
    };
    

    return (
        <div className="custom-bg font-aribau">
            <div className="flex items-center justify-center min-h-screen">
                <div className="custom-bg p-8 rounded shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-1 text-center text-[#E2DDF3]">Create an Account</h1>
                    <p className="text-sm mb-10 text-center text-[#9F9BAE]">Please enter your details to sign up.</p>
                    <form onSubmit={validateForm}>
                        <div className="mb-4">
                            <label htmlFor="username" className="sr-only">Enter your username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Enter your username"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                className="mt-1 block w-full p-2 rounded-lg bg-[#3B354D] text-[#9F9BAE]"
                            />
                        </div>

                        <div className="mb-4 input-container">
                            <label htmlFor="password" className="sr-only">Enter your password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="mt-1 block w-full p-2 rounded-lg bg-[#3B354D] text-[#9F9BAE]"
                            />
                            <span onClick={() => togglePasswordVisibility('password')} className="material-icons icon-eye">
                                visibility_off
                            </span>
                            {formData.passwordError && <div className="error-message">{formData.passwordError}</div>}
                        </div>

                        <div className="mb-4 input-container">
                            <label htmlFor="confirm-password" className="sr-only">Confirm your password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                className="mt-1 block w-full p-2 rounded-lg bg-[#3B354D] text-[#9F9BAE]"
                            />
                            <span onClick={() => togglePasswordVisibility('confirm-password')} className="material-icons icon-eye">
                                visibility_off
                            </span>
                            {formData.confirmPasswordError && <div className="error-message">{formData.confirmPasswordError}</div>}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="email" className="sr-only">Enter your email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="mt-1 block w-full p-2 rounded-lg bg-[#3B354D] text-[#9F9BAE]"
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                required
                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    onClick={() => alert('Show terms and conditions modal or navigate to the terms page')}
                                    className="text-blue-500 hover:underline"
                                >
                                    Terms and Conditions
                                </button>
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-[#4D18E8] text-white py-2 rounded hover:bg-[#4D18E8]">
                            Create Account
                        </button>
                    </form>

                    <div className="mt-4 text-center flex items-center">
                        <div className="flex-grow border-t border-[#9F9BAE]"></div>
                        <p className="text-sm text-gray-600 mx-2">or</p>
                        <div className="flex-grow border-t border-[#9F9BAE]"></div>
                    </div>

                    <button className="w-full mt-2 border border-[#A38CE6] bg-[#080511] text-white py-2 rounded-lg hover:bg-[#080511] flex items-center justify-center">
                        <img src={googleIcon} alt="Google icon" className="w-6 h-6 mr-2 object-contain" />
                        Sign up with Google
                    </button>
                    

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-500 hover:underline"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
