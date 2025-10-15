import express from 'express'
import { login, logout, register,sendVerifyOtp  , verifyEmail, isAuthenticated ,sendResetOtp , resetPassword} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js'

import upload from '../middleware/multer.js';
import { validateLogin, validateRegister } from '../middleware/validator.js';


const authRouter = express.Router();

authRouter.post('/register',    upload.single("avatarUser"),      validateRegister, register);
authRouter.post('/login',validateLogin, login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/rest', resetPassword);

export default authRouter; 