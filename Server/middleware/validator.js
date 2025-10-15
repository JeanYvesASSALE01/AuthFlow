import {body , validationResult  } from "express-validator";


export const validateRegister = [
    body("firstname").notEmpty().withMessage("le prenom est requis")
    .isLength({ min: 2 }).withMessage("le prenom doit contenir au moins 2 caractere"),

    body("lastname").notEmpty().withMessage("le nom est requis"),

    body("email").isEmail().withMessage("l'email est invalide"),

    body("avatarUser").optional()
    .isURL().withMessage("l'url de l'avatar est invalide"),
    

    body("password").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    .withMessage("le mot de passe doit contenir au moins 8 caractere, une lettre majuscule, une lettre minuscule, un chiffre et un caractere special"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateLogin = [
    body("email").isEmail().withMessage("l'email est invalide"),
    body("password").notEmpty().withMessage("le mot de passe est requis"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];