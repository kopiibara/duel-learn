const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user');  // Your user model
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:8000/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists based on googleId
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // Create a new user if they don't exist
                    user = new User({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        profilePicture: profile.photos[0].value,  // Save profile picture URL
                    });

                    // Save the new user to MongoDB
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                console.error('Error during Google OAuth:', error);
                return done(error);
            }
        }
    )
);

// Google login route
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth callback route
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // If login is successful, user data will be sent
        const user = req.user;

        // Send user data or generate JWT token for frontend
        res.json({ user, message: 'User authenticated and saved successfully' });
    }
);

// Start the server
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
