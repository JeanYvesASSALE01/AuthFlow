import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    const error = new Error("non autorisé, token introuvable");
    error.status = 401;
    return  next(error);
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      const error = new Error("non autorisé, token invalide");
      error.status = 401;
      next(error);
    }
    next();
  } catch (error) {
    const err = new Error("non autorisé, token invalide");
    err.status = 401;
    next(err);
  }
};

export default userAuth;


