import passport from "passport"
import { Strategy as GitHubStrategy} from "passport-github2"
import User from "../models/user_model.js"

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
            user = await new User({
                githubId: profile.id,
                firstname: profile.name?.givenName || '',
                lastname: profile.name?.familyName || '',
                isAccountVerified: true,
                provider: "github",
                providerId: profile.id,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value
            }).save();
        }
        done(null, user);
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
