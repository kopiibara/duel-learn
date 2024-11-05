import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googleIcon from '../images/googleIcon.png';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    
    const navigate = useNavigate();

    const togglePasswordVisibility = (fieldId) => {
        const passwordInput = document.getElementById(fieldId);
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    };

    const validateForm = (event) => {
        event.preventDefault();
        
        setPasswordError('');
        setConfirmPasswordError('');

        const lengthValid = password.length >= 8 && password.length <= 12;
        const uppercaseValid = /[A-Z]/.test(password);
        const lowercaseValid = /[a-z]/.test(password);
        const numberValid = /\d/.test(password);
        const specialCharacterValid = /[!@#$%^&*]/.test(password);
        const spaceValid = !/\s/.test(password);
        const sequentialValid = !/(.)\1{2,}/.test(password);
        const commonWords = ["password", "12345678", "qwerty"];

        if (!lengthValid) setPasswordError(prev => prev + 'Password must be between 8 and 12 characters. ');
        if (!uppercaseValid) setPasswordError(prev => prev + 'Password must contain at least one uppercase letter. ');
        if (!lowercaseValid) setPasswordError(prev => prev + 'Password must contain at least one lowercase letter. ');
        if (!numberValid) setPasswordError(prev => prev + 'Password must contain at least one digit. ');
        if (!specialCharacterValid) setPasswordError(prev => prev + 'Password must contain at least one special character. ');
        if (!spaceValid) setPasswordError(prev => prev + 'Password must not contain spaces. ');
        if (!sequentialValid) setPasswordError(prev => prev + 'Password must not contain sequential or repeating characters. ');
        if (commonWords.some(word => password.toLowerCase().includes(word))) {
            setPasswordError(prev => prev + 'Password must not contain common words or patterns. ');
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
        }

        if (!passwordError && !confirmPasswordError) {
            console.log('Form submitted');
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
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full p-2 rounded-lg bg-[#3B354D] text-[#9F9BAE]"
                            />
                            <span onClick={() => togglePasswordVisibility('password')} className="material-icons icon-eye">
                                visibility_off
                            </span>
                            {passwordError && <div className="error-message">{passwordError}</div>}
                        </div>

                        <div className="mb-4 input-container">
                            <label htmlFor="confirm-password" className="sr-only">Confirm your password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirm-password"
                                placeholder="Confirm your password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full p-2 rounded-lg bg-[#3B354D] text-[#9F9BAE]"
                            />
                            <span onClick={() => togglePasswordVisibility('confirm-password')} className="material-icons icon-eye">
                                visibility_off
                            </span>
                            {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="email" className="sr-only">Enter your email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
