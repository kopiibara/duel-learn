const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

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
                httpOnly: true,           // Cookie only accessible by web server
                secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
                sameSite: 'strict',       // CSRF protection
                maxAge: 3600000           // Optional: Set cookie expiration time (1 hour in ms)
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
                // Return an error if token verification fails
                return res.status(401).json({ error: 'Invalid token' });
            }
            // If token is valid, send the user data
            res.json(user);
        });
    } else {
        // If there is no token, respond with null
        res.json(null);
    }
};

    

module.exports = {
                test,
                signUpUser,
                loginUser,
                getProfile
            };
