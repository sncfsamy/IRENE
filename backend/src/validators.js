const { body, validationResult } = require("express-validator");

const terminationFunction = (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

const checkCategories = (categories) => {
  return (
    categories.length &&
    categories.every(
      (categorie) => Number(categorie) >= 1 || Number(categorie) <= 999999
    )
  );
};

// Validating POST user fields
const validateUserAtCreation = [
  body("firstname")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 3, max: 255 })
    .withMessage("Doit contenir entre 3 et 255 caractères."),
  body("lastname")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 3, max: 255 })
    .withMessage("Doit contenir entre 3 et 255 caractères."),
  body("mail")
    .exists()
    .withMessage("Doit être spécifiée.")
    .isEmail()
    .withMessage("Doit être un email valide."),
  body("registration_number")
    .isLength({ min: 3, max: 45 })
    .withMessage("Doit être spécifié."),
  body("role_id")
    .exists()
    .withMessage("Doit être spécifié.")
    .isNumeric()
    .withMessage("Doit être un nombre entier.")
    .isLength({ min: 1, max: 2 })
    .withMessage("Doit contenir au moins un nombre entier."),

  // (exists) Adds a validator to check for the existence of the current fields in the request. This means the value of the fields may not be undefined; all other values are acceptable.
  body("organisation_id")
    .isNumeric()
    .withMessage("Doit être un nombre entier.")
    .isLength({ min: 1, max: 2 })
    .withMessage("Doit contenir au moins un nombre entier."),
  body("password")
    .exists()
    .withMessage("Doit être spécifié.")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    // regex (Minimum eight characters, at least one letter and one number)
    .withMessage(
      "Doit comprendre au moins 8 caractères et doit contenir au moins 1 chiffre et 1 lettre."
    ),
  terminationFunction,
];

// Validating PUT user fields
const validateUserAtModify = [
  body("role_id")
    .optional()
    .isNumeric()
    .withMessage("Doit être un nombre entier.")
    .isLength({ min: 1, max: 2 })
    .withMessage("Doit contenir au moins un nombre entier."),
  body("organisation_id")
    .optional()
    .isNumeric()
    .withMessage("Doit être un nombre entier.")
    .isLength({ min: 1, max: 2 })
    .withMessage("Doit contenir au moins un nombre entier."),
  body("rgpd_agreement")
    .optional()
    .isBoolean({ loose: false })
    .withMessage("Doit être un bolléen."),
  body("mail_notification")
    .optional()
    .isBoolean({ loose: false })
    .withMessage("Doit être un bolléen."),
  terminationFunction,
];

// Validating POST comments fields
const validateCommentAtCreation = [
  body("comment")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Doit contenir entre 1 et 5000 caractères."),
  body("field")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 3 et 255 caractères."),
  body("user_id")
    .exists()
    .isNumeric()
    .withMessage("Doit être un nombre entier.")
    .isLength({ min: 1, max: 1000000 })
    .withMessage("Doit être spécifié."),
  body("idea_id")
    .exists()
    .withMessage("Doit être spécifié.")
    .isNumeric()
    .withMessage("Doit être un nombre entier.")
    .isLength({ min: 1, max: 10000000 })
    .withMessage("Doit contenir au moins un nombre entier."),
  terminationFunction,
];

// Validating POST comments fields
const validateOrganisationAtCreation = [
  body("name")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 1 et 50 caractères."),
  terminationFunction,
];

// Validating PUT comments fields
const validateOrganisationAtModify = [
  body("name")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 1 et 50 caractères."),
  terminationFunction,
];

// Validating POST idea fields
const validateIdeaAtCreation = [
  body("name")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 1 et 255 caractères."),
  body("description")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 160 })
    .withMessage("Doit contenir entre 1 et 160 caractères."),
  body("problem").exists().withMessage("Doit être spécifié."),
  body("solution").exists().withMessage("Doit être spécifié."),
  body("gains").exists().withMessage("Doit être spécifié."),
  body("categories")
    .exists()
    .withMessage("Doit être spécifié.")
    .custom(checkCategories)
    .withMessage("Vous devez selectionner au moins une catégorie"),
  terminationFunction,
];

// Validating PUT idea fields
const validateIdeaAtModify = [
  body("name")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 1 et 255 caractères."),
  body("description")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 160 })
    .withMessage("Doit contenir entre 1 et 160 caractères."),
  body("problem").exists().withMessage("Doit être spécifié."),
  body("solution").exists().withMessage("Doit être spécifié."),
  body("gains").exists().withMessage("Doit être spécifié."),
  body("categories")
    .exists()
    .withMessage("Doit être spécifié.")
    .custom(checkCategories)
    .withMessage("Doit contenir au moins une catégorie."),
  terminationFunction,
];

// Validating POST categories fields
const validateCategoriesAtCreation = [
  body("name")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 1 et 255 caractères."),
  body("id_parent_categorie")
    .isNumeric()
    .withMessage("Doit être un nombre entier.")
    .isLength({ min: 1 })
    .withMessage("Doit contenir au moins un nombre entier."),
  terminationFunction,
];

// Validating PUT categories fields
const validateCategoriesAtModify = [
  body("name")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 1 et 255 caractères."),
  body("id_parent_categorie")
    .isNumeric()
    .withMessage("Doit être un nombre entier.")
    .isLength({ min: 1 })
    .withMessage("Doit contenir au moins un nombre entier."),
  terminationFunction,
];

// Validating POST role fields

const validateRoleAtCreation = [
  body("name")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 1 et 255 caractères."),
  terminationFunction,
];

// Validating PUT role fields
const validateRoleAtModify = [
  body("name")
    .exists()
    .withMessage("Doit être spécifié.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Doit contenir entre 1 et 255 caractères."),
  terminationFunction,
];

// Validating POST file upload fields
const validateUpload = [
  // body("assets").exists().withMessage("Au moins un fichier doit être envoyé."),
  body("description", "La description que vous avez entré est trop longue (maximum 16 777 215 caractères).").isLength({ max: 16777215 }),
  terminationFunction,
];

const validateLogin = [
  body("registration_number", "Le CP doit être renseigné.")
    .exists()
    .isLength({ min: 4, max: 8 }),
    terminationFunction,
];

const validateIdeaAtNotation = [
  body("note")
  .exists()
  .isNumeric(),
  terminationFunction,
];
module.exports = {
  validateUserAtCreation,
  validateUserAtModify,
  validateCommentAtCreation,
  validateOrganisationAtCreation,
  validateOrganisationAtModify,
  validateIdeaAtCreation,
  validateIdeaAtModify,
  validateCategoriesAtCreation,
  validateCategoriesAtModify,
  validateRoleAtCreation,
  validateRoleAtModify,
  validateUpload,
  validateLogin,
  validateIdeaAtNotation,
};
