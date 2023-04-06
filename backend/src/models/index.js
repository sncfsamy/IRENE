require("dotenv").config();

const mysql = require("mysql2/promise");

// create a connection pool to the database

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

// try a connection

pool.getConnection().catch(() => {
  console.warn(
    "Warning:",
    "Failed to get a DB connection.",
    "Did you create a .env file with valid credentials?",
    "Routes using models won't work as intended"
  );
});

// declare and fill models: that's where you should register your own managers

const models = {};

const UserManager = require("./UserManager");
const CommentManager = require("./CommentManager");
const IdeaManager = require("./IdeaManager");
const CategorieManager = require("./CategorieManager");
const AssetManager = require("./AssetManager");
const OrganisationManager = require("./OrganisationManager");
const IdeaCategorieManager = require("./IdeaCategorieManager");
const AuthorManager = require("./AuthorManager");
const TeamManager = require("./TeamManager");
const RoleManager = require("./RoleManager");
const NoteManager = require("./NoteManager");
const UserCategorieManager = require("./UserCategorieManager");
const ChallengeManager = require("./ChallengeManager");
const ChallengerManager = require("./ChallengerManager");

models.user = new UserManager();
models.user.setDatabase(pool);

models.comment = new CommentManager();
models.comment.setDatabase(pool);

models.idea = new IdeaManager();
models.idea.setDatabase(pool);

models.categorie = new CategorieManager();
models.categorie.setDatabase(pool);

models.asset = new AssetManager();
models.asset.setDatabase(pool);

models.organisation = new OrganisationManager();
models.organisation.setDatabase(pool);

models.ideaCategorie = new IdeaCategorieManager();
models.ideaCategorie.setDatabase(pool);

models.author = new AuthorManager();
models.author.setDatabase(pool);

models.team = new TeamManager();
models.team.setDatabase(pool);

models.role = new RoleManager();
models.role.setDatabase(pool);

models.note = new NoteManager();
models.note.setDatabase(pool);

models.userCategorie = new UserCategorieManager();
models.userCategorie.setDatabase(pool);

models.challenge = new ChallengeManager();
models.challenge.setDatabase(pool);

models.challenger = new ChallengerManager();
models.challenger.setDatabase(pool);

const handler = {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }

    const pascalize = (string) =>
      string.slice(0, 1).toUpperCase() + string.slice(1);

    throw new ReferenceError(
      `models.${prop} is not defined. Did you create ${pascalize(
        prop
      )}Manager.js, and did you register it in backend/src/models/index.js?`
    );
  },
};

module.exports = new Proxy(models, handler);
