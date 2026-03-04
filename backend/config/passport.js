const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const Admin = require('../models/Admin');

// JWT Strategy
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'supersecretkey123'
};

passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {
        let user = await User.findById(jwt_payload.id);
        if (!user) {
            user = await Admin.findById(jwt_payload.id);
        }
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

// Google Strategy - Following user's specific request
try {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || "dummy_id",
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_secret",
                callbackURL: "/api/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Maintain existing DB logic to prevent breaking the app
                    let user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        if (!user.isVerified) {
                            user.isVerified = true;
                            await user.save();
                        }
                        return done(null, user);
                    } else {
                        user = await User.create({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            password: Math.random().toString(36).slice(-16),
                            isVerified: true,
                            googleId: profile.id
                        });
                        return done(null, user);
                    }
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
    console.log("Google strategy registered successfully");
} catch (err) {
    console.error("Google strategy registration failed:", err);
}

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
