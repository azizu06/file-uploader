const { body } = require("express-validator");
exports.validateAddMsg = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters."),
  body("message")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Title must be between 1 and 1000 characters."),
];

exports.validateSignUp = [
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("First name must be between 1 and 30 characters."),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Last name must be between 1 and 30 characters."),
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .isAlphanumeric()
    .withMessage("Usernmae must only contain letters and numbers"),
  body("password")
    .isLength({ min: 8, max: 50 })
    .withMessage("Password must be between 8 and 50 characters."),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

exports.validateLogin = [
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

exports.validateSecret = [
  body("secret")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Passcode must be between 1 and 100 characters"),
];
