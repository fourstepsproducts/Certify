const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const Admin = require('../models/Admin'); // Add Admin model support

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {
        // Double-check both User and Admin collections
        let user = await User.findById(jwt_payload.id);

        if (!user) {
            user = await Admin.findById(jwt_payload.id);
        }

        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        console.error(error);
        return done(error, false);
    }
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BASE_URL + "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google Auth callback triggered for email:', profile.emails[0].value);
            // Check if user exists
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                console.log('User found:', user.email);
                if (!user.isVerified) {
                    user.isVerified = true;
                    await user.save();
                }
                return done(null, user);
            } else {
                console.log('Creating new user for:', profile.emails[0].value);
                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Dummy password
                    isVerified: true, // Google verified
                    googleId: profile.id
                });
                console.log('New user created:', user.email);
                return done(null, user);
            }
        } catch (error) {
            console.error('Error in Google Strategy:', error);
            return done(error, null);
        }
    }));

// Serialize user for session (if needed, though we use JWT usually, but passport might want it if we used session)
// Since we are likely going to just issue a JWT in the callback route, we might not need extensive session serialization
// But standard passport setup usually includes this:
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
