import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user_model.js";
import transporter from "../config/nodemailer.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const register = async (req, res, next) => {
  const { firstname, lastname, email, password, avatarUser } = req.body;

  if (!firstname || !lastname || !email || !password) {
    const error = new Error("Données incomplètes!");
    error.status = 400;
    return next(error);
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      const error = new Error("Utilisateur existe déja");
      error.status = 409;
      return next(error);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let avatarUrl =
      "https://res.cloudinary.com/dzcmadjlq/image/upload/v1696116223/avatar/default_avatar_uxo4el.png";
    if (req.file) {
      avatarUrl = await uploadToCloudinary(req.file.buffer);
    }

    const user = new userModel({
      firstname,
      lastname,
      email,
      avatarUser: avatarUrl,
      password: hashedPassword,
    });

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Bienvenue sur notre plateforme",
      text: `Bonjour,\n\nMerci de vous être inscrit sur notre plateforme avec email ${email}!\n\nCordialement,\nL'équipe `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    return next(err);
  }
};
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error("Donnée manquante");
    error.status = 400;
    return next(error);
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      const error = new Error("Invalid email");
      error.status = 401;
      return next(error);
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error("Mot de passe incorrect");
      error.status = 401;
      return next(error);
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    return next(err);
  }
};
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    return next(err);
  }
};
export const sendVerifyOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      const error = new Error("Compte déjà vérifié");
      error.status = 400;
      return next(error);
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Vérification de votre compte",
      text: `Votre code de vérification est : ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP envoyé à votre email" });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    return next(err);
  }
};
export const verifyEmail = async (req, res, next) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    const error = new Error("Donnée manquante");
    error.status = 400;
    return next(error);
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      const error = new Error("Utilisateur non trouvé");
      error.status = 404;
      return next(error);
    }
    if (user.verifyOtpExpiry < Date.now()) {
      const error = new Error("OTP expiré");
      error.status = 400;
      return next(error);
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      const error = new Error("OTP invalide");
      error.status = 400;
      return next(error);
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    res.json({ success: true, message: "Compte vérifié avec succès" });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    return next(err);
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    return next(err);
  }
};
export const sendResetOtp = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const error = new Error("Email manquant");
    error.status = 400;
    return next(error);
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      const error = new Error("Utilisateur non trouvé");
      error.status = 404;
      return next(error);
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 5 * 60 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      text: `Votre code de réinitialisation est : ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP envoyé à votre email" });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    next(err);
  }
};
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    const error = new Error("Donnée manquante");
    error.status = 400;
    return next(error);
  }
  try {
    const user = await userModel.findOne({ email });
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      const error = new Error("OTP invalide");
      error.status = 400;
      return next(error);
    }
    if (user.resetOtpExpireAt < Date.now()) {
      const error = new Error("OTP expiré");
      error.status = 400;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 500;
    next(err);
  }
};
