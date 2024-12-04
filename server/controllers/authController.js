import User from '../models/user.js';  // Import User using 'import'
import { hashPassword, comparePassword } from '../utils/authUtils.js';  // Named imports
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // Import Nodemailer for sending emails
import { validationResult } from "express-validator";

const test = (req, res) => {
    res.json("test is working");
};

// Register EndPoint
const signUpUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username) {
            return res.json({ error: 'Username is required' });
        }

        if (!password || password.length < 6) {
            return res.json({ error: 'Password is required and should be at least 6 characters long' });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.json({ error: 'Email already used' });
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            username,
            password: hashedPassword,
            email
        });

        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Something went wrong during sign-up' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ error: "No user found" });
        }

        const match = await comparePassword(password, user.password);
        if (match) {
            const token = jwt.sign(
                {
                    email: user.email,
                    id: user._id,
                    username: user.username
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }  // Optional: set token expiration
            );

            res.cookie('token', token, {
                httpOnly: true,               // Cookie only accessible by web server
                secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
                sameSite: 'strict',           // CSRF protection
                maxAge: 3600000               // Set cookie expiration time (1 hour in ms)
            }).json({ user });

        } else {
            res.json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
};

const getProfile = (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            res.json(user);  // Return user profile data
        });
    } else {
        res.json(null);  // No token available, return null or handle accordingly
    }
};

// Check if Email Exists for Forgot Password
const checkEmailForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the email exists in the database
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Proceed to the next step (like confirmation page)
        res.status(200).json({ message: 'Email found, proceed to confirmation step' });

    } catch (error) {
        console.error("Error in checkEmailForgotPassword:", error);
        res.status(500).json({ error: 'An error occurred while checking the email' });
    }
};

const getUsernameByEmail = async (req, res) => {
    const { email } = req.query;
    console.log('Email parameter received:', email); // Debug log

    if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
    }

    try {
        const user = await User.findOne({ email });
        console.log('User found:', user); // Debug log
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({ username: user.username });
    } catch (error) {
        console.error('Error while fetching username:', error);
        return res.status(500).json({ error: 'An error occurred while fetching the username' });
    }
};


// Forgot Password Email
const sendForgotPasswordEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const resetToken = generateResetToken();
        await saveResetToken(email, resetToken);

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const mailOptions = {
            from: '"Your App" <no-reply@yourapp.com>',
            to: email,
            subject: 'Your Security Code',
            text: `Here is your security code to recover your account: ${resetToken}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Security code sent to your email' });
    } catch (error) {
        console.error("Error sending forgot-password email:", error);
        res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
};

// Security Code Verification Endpoint
const verifySecurityCode = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    try {
        // Check if the user exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the reset code matches the one stored in the database (make sure you saved it in the User model)
        if (user.resetToken !== code) {
            return res.status(400).json({ success: false, message: "Invalid security code" });
        }

        // Success - Code matches
        res.status(200).json({ success: true, message: "Code verified successfully" });

    } catch (error) {
        console.error("Error verifying code:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



// Helper Functions
const findUserByEmail = async (email) => {
    return await User.findOne({ email }); // Replace with your actual database query
};

const generateResetToken = () => {
    return Math.random().toString(36).substring(2, 12); // Generate a secure token
};

const saveResetToken = async (email, resetToken) => {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new Error('User not found');
    }

    // Assign the reset token to the user's document
    user.resetToken = resetToken;
    
    // Save the updated user document
    await user.save();

    return user;  // Optionally return the updated user to verify it's saved
};

const resetPassword = async (req, res) => {
    const { email, newpassword } = req.body;

    try {
        // Validate email and new password
        if (!email || !newpassword) {
            return res.status(400).json({ error: 'Email and new password are required' });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash the new password and update the user's password
        const hashedPassword = await hashPassword(newpassword);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'An error occurred while resetting the password' });
    }
};

export { test, signUpUser, loginUser, getProfile, checkEmailForgotPassword, sendForgotPasswordEmail, getUsernameByEmail, verifySecurityCode, resetPassword };
