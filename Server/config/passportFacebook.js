import passport from "passport"
import { Strategy as FacebookStrategy} from "passport-facebook"
import User from "../models/user_model.js"

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ["id", "displayName", "givenName", "photos", "email"]
}, async (accessToken, refreshToken, profile, done) => {
    try {
       
        let user = await User.findOne({ facebookId: profile.id });
        if(!user && profile.emails && profile.emails.length > 0){
            user = await User.findOne({ email: profile.emails[0].value });
        }
        if (user) {
            done(null, user);
        } else {
           
            user = await new User({
                facebookId: profile.id,
                firstname: profile.displayName,
                lastname : profile.name?.familyName || '',
                isAccountVerified: true,
                provider: "facebook",
                providerId: profile.id,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value
            }).save();
            done(null, user);
        }
    } catch (error) {
        console.error(error);
        done(error, null);
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