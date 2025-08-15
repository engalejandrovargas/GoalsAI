import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './database';
import logger from '../utils/logger';

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    logger.info(`Google OAuth attempt for user: ${profile.displayName} (${profile.emails?.[0].value})`);
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.emails![0].value,
          name: profile.displayName,
          profilePicture: profile.photos?.[0].value
        }
      });
      
      logger.info(`New user created: ${user.email} (ID: ${user.id})`);
    } else {
      // Update existing user's profile picture if changed
      if (profile.photos?.[0].value !== user.profilePicture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { profilePicture: profile.photos?.[0].value }
        });
      }
      
      logger.info(`Existing user logged in: ${user.email} (ID: ${user.id})`);
    }

    return done(null, user);
  } catch (error) {
    logger.error('Google OAuth error:', error);
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        location: true,
        ageRange: true,
        onboardingCompleted: true,
        createdAt: true
      }
    });

    if (!user) {
      return done(new Error('User not found'), false);
    }

    done(null, user);
  } catch (error) {
    logger.error('User deserialization error:', error);
    done(error, false);
  }
});

export default passport;