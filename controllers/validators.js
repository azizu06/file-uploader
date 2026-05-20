import { body } from "express-validator";

export const validateSignUp = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .isAlphanumeric()
    .withMessage("Username must only contain letters and numbers"),
  body("password")
    .isLength({ min: 8, max: 50 })
    .withMessage("Password must be between 8 and 50 characters."),
  body("confrimPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

export const validateLogin = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .isAlphanumeric()
    .withMessage("Usernmae must only contain letters and numbers"),
  body("password")
    .isLength({ min: 8, max: 50 })
    .withMessage("Password must be between 8 and 50 characters."),
];

export const validateFolder = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Name must be between 1 and 30 characters."),
];
