const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const auth = require("./auth");
// Define file uplaod destination and set limit file size at 52Mb
const upload = multer({ dest: "uploads/", fileSize: { fileSize: 52428800 } });

const router = express.Router();

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

// Load permissions from database (automatically refreshed when changed by an admin)
roleControllers.loadPermsData(auth.loadPermissions);

router.use(cookieParser(process.env.COOKIE_SECRET));
router.use(express.urlencoded({ extended: true, limit: "52mb" }));
router.use(bodyParser.json({ limit: "52mb" }));
router.use(bodyParser.urlencoded({ extended: true, limit: "52mb" }));

// Authentication routes
router.post("/login", validators.validateLogin, userControllers.login);
router.post("/logout", userControllers.logout);
router.post("/renew", auth.renewToken);

// protect next routes with cookie token check
router.use(auth.verifyToken);

// give access to uploaded files on /uploads (when coockie token are valid only)
router.use("/uploads", express.static(path.join("./", "uploads")));

//  users routes
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
router.delete(
  "/users",
  auth.checkRight("manage_users", "manage_all"),
  userControllers.batchDestroy
);
router.get("/me", userControllers.me);
router.get("/users/:id", userControllers.read);
router.put(
  "/users/:id",
  auth.checkRight("manage_users", "manage_all", "me"),
  validators.validateUserAtModify,
  userControllers.edit
);
router.delete(
  "/users/:id",
  auth.checkRight("manage_users", "manage_all"),
  userControllers.destroy
);

// challenges routes
router.get("/challenges", challengeControllers.browse);
router.get("/challenges/:id", challengeControllers.read);
router.post(
  "/challenges",
  auth.checkRight("manage_challenges_ambassador", "manage_all"),
  challengeControllers.add
);
router.put(
  "/challenges/:id",
  auth.checkRight("manage_challenges_ambassador", "manage_all"),
  challengeControllers.edit
);
router.delete(
  "/challenges",
  auth.checkRight("manage_challenges_ambassador", "manage_all"),
  challengeControllers.batchDestroy
);
router.delete(
  "/challenges/:id",
  auth.checkRight("manage_challenges_ambassador", "manage_all"),
  challengeControllers.destroy
);

// comments routes
router.get("/comments/:id_idea/:field", commentControllers.browse);
router.post(
  "/comments",
  validators.validateCommentAtCreation,
  commentControllers.add
);
router.delete(
  "/comments/:id_comment",
  auth.checkRight("manage_all"),
  commentControllers.destroy
);

// organisations routes
router.get("/organisations", organisationControllers.browse);
router.post(
  "/organisations",
  auth.checkRight("manage_organisations", "manage_all"),
  validators.validateOrganisationAtCreation,
  organisationControllers.add
);
router.delete(
  "/organisations",
  auth.checkRight("manage_organisations", "manage_all"),
  organisationControllers.batchDestroy
);
router.put(
  "/organisations/:id",
  auth.checkRight("manage_organisations", "manage_all"),
  validators.validateOrganisationAtModify,
  organisationControllers.edit
);
router.delete(
  "/organisations/:id",
  auth.checkRight("manage_organisations", "manage_all"),
  organisationControllers.destroy
);

// teams routes
router.get("/teams", teamControllers.browse);
router.post(
  "/teams",
  auth.checkRight("manage_teams", "manage_all"),
  validators.validateTeamAtCreation,
  teamControllers.add
);
router.delete(
  "/teams",
  auth.checkRight("manage_teams", "manage_all"),
  teamControllers.batchDestroy
);
router.put(
  "/teams/:id",
  auth.checkRight("manage_teams", "manage_all"),
  validators.validateTeamAtModify,
  teamControllers.edit
);
router.delete(
  "/teams/:id",
  auth.checkRight("manage_teams", "manage_all"),
  teamControllers.destroy
);

// ideas routes
router.get("/ideas", ideaControllers.browse);
router.get("/ideas/:id", ideaControllers.read);
router.post("/ideas", validators.validateIdeaAtCreation, ideaControllers.add);
router.delete(
  "/ideas",
  auth.checkRight("manage_ideas_ambassador", "manage_ideas_all", "manage_all"),
  ideaControllers.batchDestroy
);
router.put("/ideas/:id", validators.validateIdeaAtModify, ideaControllers.edit);
router.put(
  "/note/:id",
  validators.validateIdeaAtNotation,
  noteControllers.note
);
router.delete("/ideas/:id", ideaControllers.destroy);

// categories routes
router.get("/categories", categorieControllers.browse);
router.post(
  "/categories",
  auth.checkRight("manage_categories", "manage_all"),
  validators.validateCategoriesAtCreation,
  categorieControllers.add
);
router.delete(
  "/categories",
  auth.checkRight("manage_categories", "manage_all"),
  categorieControllers.batchDestroy
);
router.put(
  "/categories/:id",
  auth.checkRight("manage_categories", "manage_all"),
  validators.validateCategoriesAtModify,
  categorieControllers.edit
);
router.delete(
  "/categories/:id",
  auth.checkRight("manage_categories", "manage_all"),
  categorieControllers.destroy
);

// roles routes
router.get(
  "/roles",
  auth.checkRight("manage_roles", "manage_all"),
  roleControllers.browse
);
router.post(
  "/roles",
  auth.checkRight("manage_roles", "manage_all"),
  validators.validateRoleAtCreation,
  roleControllers.add
);
router.delete(
  "/roles",
  auth.checkRight("manage_roles", "manage_all"),
  roleControllers.batchDestroy
);
router.put(
  "/roles/:id",
  auth.checkRight("manage_roles", "manage_all"),
  validators.validateRoleAtModify,
  roleControllers.edit
);
router.delete(
  "/roles/:id",
  auth.checkRight("manage_roles", "manage_all"),
  roleControllers.destroy
);

// assets routes
router.get("/assets/:id_idea", assetControllers.browse);
router.delete("/assets/:id_asset", assetControllers.destroy);

router.post(
  "/assets/:id_idea",
  upload.array("upload"),
  validators.validateUpload,
  assetControllers.upload
);
router.post(
  "/assets",
  upload.array("upload"),
  validators.validateUpload,
  assetControllers.upload
);

module.exports = router;
