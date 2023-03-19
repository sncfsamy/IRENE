const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const defPerms = {
  innovator_access: [],
  set_user_role: [],
  set_user_organisation: [],
  manage_users: [],
  manage_roles: [],
  manage_organisations: [],
  manage_organisation_challenges: [],
  delete_innov: [],
};
let permissions = { ...defPerms };

const hashingParams = {
  type: argon2.argon2id,
  timeCost: 5,
  parallelism: 1,
};

const loadPermissions = (perms) => {
  try {
    permissions = {};
    perms.forEach(perm => {
      for (let permission in permissions) {
        perm[permission] && !permissions[permission].includes(permission) && permissions[permission].push(perm.id);
        !perm[permission] && permissions[permission].includes(permission) && permissions[permission].splice(permissions[permission].indexOf(perm.id),1);
      }
    });
  } catch (e) { console.error("Perms loading error:", e); }
};

const checkRight = (perm) => {
  return (req,res,next) => {
    if (permissions[perm].includes(req.payload.role)) next();
    else res.sendStatus(403);
  }
}

const hashPassword = (req, res, next) => {
  argon2
    .hash(req.body.password, hashingParams)
    .then((hashedPassword) => {
      req.body.password = hashedPassword;
      next();
    })
    .catch((err) => {
      console.warn("error hash", err);
      res.sendStatus(500);
    });
};

const verifyToken = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader == null) {
      throw new Error("Authorization header is missing");
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer") {
      throw new Error("Authorization header has not the 'Bearer' type");
    }

    req.payload = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch {
    res.sendStatus(401);
  }
};

module.exports = {
  hashingParams,
  hashPassword,
  verifyToken,
  checkRight,
  loadPermissions
};
