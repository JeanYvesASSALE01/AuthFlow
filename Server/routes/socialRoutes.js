import express from "express";
import passport from "../config/tallPassport.js";
import { socialCallback } from "../controllers/socialAthController";


const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));    
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), socialCallback);


router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), socialCallback);


router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback", passport.authenticate("github", { failureRedirect: "/login" }), socialCallback);

export default router;