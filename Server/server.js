import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import erreurBox from "./middleware/errorHandler.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import upload from "./middleware/multer.js";
import "./config/tallPassport.js";
import passport from "./config/tallPassport.js";
const app = express();
const port = process.env.PORT || 4000
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));
app.use(erreurBox);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.send("API Fonctionne.."));
app.use("/api/auth", authRouter);

app.use("/api/data", userRouter);
app.use("/api/upload-test", upload.single("file"), (req, res) => {
  res.send("Fichier téléchargé avec succès");
});

app.listen(port, () => console.log(`Server en marche ! avec un PORT:${port} `));
