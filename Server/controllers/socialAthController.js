import jwt from 'jsonwebtoken';

export const socialCallback = (req, res) => {
    try {
        const user = req.user;
        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.cookie("token", token, { httpOnly: true });
        res.redirect("http://localhost:3000/home");
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
