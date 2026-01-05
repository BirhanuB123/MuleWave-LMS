const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');
const logger = require('./logger');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0]?.value,
            role: 'student', // Default role
            isEmailVerified: true, // Google emails are verified
            authProvider: 'google'
          });

          logger.info(`New user created via Google OAuth: ${user.email}`);
          done(null, user);
        } catch (error) {
          logger.error(`Google OAuth error: ${error.message}`);
          done(error, null);
        }
      }
    )
  );
}

// Microsoft OAuth Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: '/api/auth/microsoft/callback',
        scope: ['user.read'],
        tenant: 'common',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Update Microsoft ID if not set
            if (!user.microsoftId) {
              user.microsoftId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            microsoftId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0]?.value,
            role: 'student', // Default role
            isEmailVerified: true, // Microsoft emails are verified
            authProvider: 'microsoft'
          });

          logger.info(`New user created via Microsoft OAuth: ${user.email}`);
          done(null, user);
        } catch (error) {
          logger.error(`Microsoft OAuth error: ${error.message}`);
          done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
