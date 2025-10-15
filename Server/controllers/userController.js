import userModel from "../models/user_model.js";

export const getUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      const error = new Error("Utilisateur non trouvé");
      error.status = 401;
      next(error);
    }

    res.json({
      success: true,
      userData: {
        firstname: user.firstname,
        lastname: user.lastname,
        avatar: user.avatar,
        isAccountVerified: user.isAccountVerified,
        email: user.email,
      },
    });
  } catch (error) {
    const err = new Error(error.message);
    error.status = 500;
    next(err);
  }
};
