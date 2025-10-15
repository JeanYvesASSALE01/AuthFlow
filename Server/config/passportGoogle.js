import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user_model.js";


passport.use(new GoogleStrategy({
clientID: process.env.GOOGLE_CLIENT_ID,
clientSecret: process.env.GOOGLE_CLIENT_SECRET,
callbackURL: "/auth/google/callback"}
, async (accessToken, refreshToken, profile, done) => {
try{
    let user = await User.findOne({ googleId: profile.id });
 if(!user && profile.emails && profile.emails.length > 0){
    user = await User.findOne({ email: profile.emails[0].value });

 }else {
        const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            avatarUser: profile.photos?.[0]?.value,
            isAccountVerified: true,
            email: profile.emails[0].value,
            provider: "google",
            providerId: profile.id,
           
        });
        await newUser.save();
        return done(null, newUser);
    }
    
}catch(error){
console.error("Error in Google Strategy:", error);  
return done(error, null);
}
}));

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

export default passport;