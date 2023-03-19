const express = require("express");
const multer = require("multer");
const bodyParser = require('body-parser');    
const path = require('path');
const auth = require("./auth");
// On définit la destination de stockage de nos fichiers
const upload = multer({ dest: "uploads/", fileSize: { fileSize: 52428800 } });

const router = express.Router();
router.use('/uploads', express.static(path.join("./", 'uploads')));

// const itemControllers = require("./controllers/itemControllers");
const userControllers = require("./controllers/userControllers");
const commentControllers = require("./controllers/commentControllers");
const ideaControllers = require("./controllers/ideaControllers");
const categorieControllers = require("./controllers/categorieControllers");
const assetControllers = require("./controllers/assetControllers");
const organisationControllers = require("./controllers/organisationControllers");
const roleControllers = require("./controllers/roleControllers");
const validators = require("./validators");

// route login
router.post("/login", validators.validateLogin, userControllers.login);

// protection des routes suivantes
router.use(auth.verifyToken);

// routes users
router.get("/users/search", userControllers.searchUsers);
router.get("/skills", userControllers.browseSkills);
router.get("/users", userControllers.browse);
router.post(
  "/users",
  validators.validateUserAtCreation,
  auth.hashPassword,
  userControllers.add
);
router.get("/me", userControllers.me);
router.get("/users/:id", userControllers.read);
router.put(
  "/users/:id",
  validators.validateUserAtModify,
  userControllers.edit
);
router.delete(
  "/users/:id",
  userControllers.destroy
);

// routes comments
/* Liste des field:
    0  - Idée
    1  - Problème
    2  - Solution
    3  - Gain
*/

// route comments
router.get(
  "/comments/:id_idea/:field",
  commentControllers.browse
);
router.post(
  "/comments",
  validators.validateCommentAtCreation,
  commentControllers.add
);
router.delete(
  "/comments/:id_comment",
  commentControllers.destroy
);

// routes organisation
router.get(
  "/organisations",
  organisationControllers.browse
);
router.post(
  "/organisations",
  validators.validateOrganisationAtCreation,
  organisationControllers.add
);
router.put(
  "/organisations/:id",
  validators.validateOrganisationAtModify,
  organisationControllers.edit
);
router.delete(
  "/organisations/:id",
  organisationControllers.destroy
);

// routes ideas
router.get("/ideas", ideaControllers.browse);
router.get("/ideas/:id", ideaControllers.read);
router.post(
  "/ideas",
  validators.validateIdeaAtCreation,
  ideaControllers.add
);
router.put(
  "/ideas/:id",
  validators.validateIdeaAtModify,
  ideaControllers.edit
);
router.put(
  "/note/:id",
  validators.validateIdeaAtNotation,
  ideaControllers.note
);
router.delete("/ideas/:id", ideaControllers.destroy);

// routes categories
router.get("/categories", categorieControllers.browse);
router.post(
  "/categories",
  validators.validateCategoriesAtCreation,
  categorieControllers.add
);
router.put(
  "/categories/:id",
  validators.validateCategoriesAtModify,
  categorieControllers.edit
);
router.delete(
  "/categories/:id",
  categorieControllers.destroy
);

// routes roles
router.get("/roles", roleControllers.browse);
router.post(
  "/roles",
  validators.validateRoleAtCreation,
  roleControllers.add
);
router.put(
  "/roles/:id",
  validators.validateRoleAtModify,
  roleControllers.edit
);
router.delete(
  "/roles/:id",
  roleControllers.destroy
);

// routes assets
router.get("/assets/:id_idea", assetControllers.browse);
router.delete(
  "/assets/:id_asset",
  assetControllers.destroy
);

// route upload DOIT RESTER EN BAS
router.use(express.urlencoded({ extended: true, limit: '50mb' }));
router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
router.post(
  "/assets/:id_idea",
  //auth.checkUser,
  upload.array("upload"),
  validators.validateUpload,
  assetControllers.upload
);

module.exports = router;
