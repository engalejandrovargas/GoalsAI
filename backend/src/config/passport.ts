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
      // Get high-quality profile picture URL
      let profilePictureUrl = profile.photos?.[0].value;
      if (profilePictureUrl) {
        // Replace the default size parameter with a larger one
        profilePictureUrl = profilePictureUrl.replace(/s\d+-c/, 's200-c');
        // Remove size parameter and add larger one if no size parameter exists
        if (!profilePictureUrl.includes('=s')) {
          profilePictureUrl = profilePictureUrl + '=s200-c';
        }
      }
      
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.emails![0].value,
          name: profile.displayName,
          profilePicture: profilePictureUrl
        }
      });
      
      logger.info(`New user created: ${user.email} (ID: ${user.id})`);
    } else {
      // Update existing user's profile picture if changed
      let newProfilePictureUrl = profile.photos?.[0].value;
      if (newProfilePictureUrl) {
        // Replace the default size parameter with a larger one
        newProfilePictureUrl = newProfilePictureUrl.replace(/s\d+-c/, 's200-c');
        // Remove size parameter and add larger one if no size parameter exists
        if (!newProfilePictureUrl.includes('=s')) {
          newProfilePictureUrl = newProfilePictureUrl + '=s200-c';
        }
      }
      
      if (newProfilePictureUrl !== user.profilePicture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { profilePicture: newProfilePictureUrl }
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
        nationality: true,
        travelBudget: true,
        travelStyle: true,
        firstGoal: true,
        annualIncome: true,
        currentSavings: true,
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        goalReminders: true,
        theme: true,
        language: true,
        currency: true,
        defaultGoalCategory: true,
        privacyLevel: true,
        onboardingCompleted: true,
        createdAt: true
      }
    });

    if (!user) {
      // User was deleted or doesn't exist anymore (e.g., after database wipe)
      // Return null to clear the session instead of throwing an error
      logger.warn(`User with ID ${id} not found during deserialization - clearing session`);
      return done(null, null);
    }

    done(null, user);
  } catch (error) {
    logger.error('User deserialization error:', error);
    done(error, false);
  }
});

export default passport;