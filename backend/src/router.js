const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const auth = require("./auth");
// On définit la destination de stockage de nos fichiers
const upload = multer({ dest: "uploads/", fileSize: { fileSize: 52428800 } });

const router = express.Router();

// const itemControllers = require("./controllers/itemControllers");
const userControllers = require("./controllers/userControllers");
const commentControllers = require("./controllers/commentControllers");
const ideaControllers = require("./controllers/ideaControllers");
const categorieControllers = require("./controllers/categorieControllers");
const assetControllers = require("./controllers/assetControllers");
const organisationControllers = require("./controllers/organisationControllers");
const roleControllers = require("./controllers/roleControllers");
const teamControllers = require("./controllers/teamControllers");
const noteControllers = require("./controllers/noteControllers");
const challengeControllers = require("./controllers/challengeControllers");
const validators = require("./validators");

roleControllers.loadPermsData(auth.loadPermissions);

router.use(cookieParser(process.env.COOKIE_SECRET));
router.use(express.urlencoded({ extended: true, limit: "50mb" }));
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// route login
router.post("/login", validators.validateLogin, userControllers.login);
router.post("/logout", userControllers.logout);
router.post("/renew", auth.renewToken);

// protection des routes suivantes
router.use(auth.verifyToken);

router.use("/uploads", express.static(path.join("./", "uploads")));

// routes users
router.get("/users/search", userControllers.searchUsers);
router.get("/skills", userControllers.browseSkills);
router.get(
  "/users",
  auth.checkRight("manage_users", "manage_all"),
  userControllers.browse
);
router.post(
  "/users",
  auth.checkRight("manage_users", "manage_all"),
  validators.validateUserAtCreation,
  auth.hashPassword,
  userControllers.add
);
router.delete("/users", userControllers.batchDestroy);
router.get("/me", userControllers.me);
router.get("/users/:id", userControllers.read);
router.put(
  "/users/:id",
  auth.checkRight("manage_users", "manage_all", "me"),
  validators.validateUserAtModify,
  userControllers.edit
);
router.delete("/users/:id", userControllers.destroy);

// routes challenges
router.get("/challenges", challengeControllers.browse);
router.get("/challenges/:id", challengeControllers.read);
router.post("/challenges", challengeControllers.add);
router.put("/challenges/:id", challengeControllers.edit);
router.delete("/challenges", challengeControllers.batchDestroy);
router.delete("/challenges/:id", challengeControllers.destroy);

// route comments
router.get("/comments/:id_idea/:field", commentControllers.browse);
router.post(
  "/comments",
  validators.validateCommentAtCreation,
  commentControllers.add
);
router.delete("/comments/:id_comment", commentControllers.destroy);

// routes organisation
router.get("/organisations", organisationControllers.browse);
router.post(
  "/organisations",
  validators.validateOrganisationAtCreation,
  organisationControllers.add
);
router.delete("/organisations", organisationControllers.batchDestroy);
router.put(
  "/organisations/:id",
  validators.validateOrganisationAtModify,
  organisationControllers.edit
);
router.delete("/organisations/:id", organisationControllers.destroy);

// routes teams
router.get("/teams", teamControllers.browse);
router.post("/teams", validators.validateTeamAtCreation, teamControllers.add);
router.delete("/teams", teamControllers.batchDestroy);
router.put("/teams/:id", validators.validateTeamAtModify, teamControllers.edit);
router.delete("/teams/:id", teamControllers.destroy);

// routes ideas
router.get("/ideas", ideaControllers.browse);
router.get("/ideas/:id", ideaControllers.read);
router.post("/ideas", validators.validateIdeaAtCreation, ideaControllers.add);
router.delete("/ideas", ideaControllers.batchDestroy);
router.put("/ideas/:id", validators.validateIdeaAtModify, ideaControllers.edit);
router.put(
  "/note/:id",
  validators.validateIdeaAtNotation,
  noteControllers.note
);
router.delete("/ideas/:id", ideaControllers.destroy);

// routes categories
router.get("/categories", categorieControllers.browse);
router.post(
  "/categories",
  validators.validateCategoriesAtCreation,
  categorieControllers.add
);
router.delete("/categories", categorieControllers.batchDestroy);
router.put(
  "/categories/:id",
  validators.validateCategoriesAtModify,
  categorieControllers.edit
);
router.delete("/categories/:id", categorieControllers.destroy);

// routes roles
router.get("/roles", roleControllers.browse);
router.post("/roles", validators.validateRoleAtCreation, roleControllers.add);
router.delete("/roles", roleControllers.batchDestroy);
router.put("/roles/:id", validators.validateRoleAtModify, roleControllers.edit);
router.delete("/roles/:id", roleControllers.destroy);

// routes assets
router.get("/assets/:id_idea", assetControllers.browse);
router.delete("/assets/:id_asset", assetControllers.destroy);

router.post(
  "/assets/:id_idea",
  // auth.checkUser,
  upload.array("upload"),
  validators.validateUpload,
  assetControllers.upload
);
router.post(
  "/assets",
  // auth.checkUser,
  upload.array("upload"),
  validators.validateUpload,
  assetControllers.upload
);

module.exports = router;
