const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const defPerms = {
  manage_ideas_manager: [],
  manage_ideas_ambassador: [],
  manage_challenges_ambassador: [],
  manage_challenges_all: [],
  manage_teams: [],
  manage_users: [],
  manage_organisations: [],
  manage_roles: [],
  manage_all: [],
};
let permissions = { ...defPerms };

const hashingParams = {
  type: argon2.argon2id,
  timeCost: 5,
  parallelism: 1,
};

const loadPermissions = (roles) => {
  try {
    permissions = defPerms;
    roles.forEach((role) => {
      for (const permission in permissions) {
        if (permissions[permission]) {
          if (
            role[permission] &&
            !permissions[permission].includes(role.id_role)
          )
            permissions[permission].push(role.id_role);
          if (
            !role[permission] &&
            permissions[permission].includes(role.id_role)
          )
            permissions[permission].splice(
              permissions[permission].indexOf(role.id_role),
              1
            );
        }
      }
    });
  } catch (e) {
    console.error("Permissions loading error: ", e);
  }
};

const checkRight = (...perm) => {
  return (req, res, next) => {
    if (
      (perm.includes("me") &&
        req.payload.sub === parseInt(req.params.id, 10)) ||
      Object.entries(permissions).find(
        (permEntry) =>
          perm.includes(permEntry[0]) && permEntry[1].includes(req.payload.role)
      )
    )
      next();
    else res.sendStatus(403);
  };
};

const hashPassword = (req, res, next) => {
  argon2
    .hash(req.body.password, hashingParams)
    .then((hashedPassword) => {
      req.body.password = hashedPassword;
      next();
    })
    .catch((err) => {
      console.warn("Hshing password error: ", err);
      res.sendStatus(500);
    });
};

const renewToken = (req, res) => {
  const authorizationHeader = req.get("Authorization");
  try {
    if (authorizationHeader == null) {
      throw new Error("Authorization header is missing");
    }
    const [type, renewTokenString] = authorizationHeader.split(" ");
    if (type !== "Bearer") {
      throw new Error("Authorization header has not the 'Bearer' type");
    }
    const payload = jwt.decode(req.cookies.irene_auth, process.env.JWT_SECRET);
    const refreshPayload = jwt.verify(
      renewTokenString,
      process.env.JWT_REFRESH_SECRET + payload.sub
    );
    const refreshExchangePayload = jwt.decode(
      req.body.refreshExchangeToken,
      process.env.JWT_REFRESH_EXCHANGE_SECRET + req.cookies.irene_auth
    );
    if (
      refreshPayload.sub !== payload.sub ||
      refreshExchangePayload.sub !== payload.sub
    )
      throw new Error();
    const expires =
      Math.floor(new Date().getTime() / 1000) +
      parseInt(process.env.TOKEN_VALIDITY, 10);
    req.payload = {
      sub: payload.sub,
      team: payload.team,
      role: payload.role,
      organisation: payload.organisation,
      upload_token: jwt.sign(
        {
          sub: payload.sub,
          iat: Math.floor(new Date().getTime() / 1000),
          exp: Math.floor(new Date().getTime() / 1000) + 10800,
        },
        process.env.JWT_CKEDITOR_UPLOAD_SECRET
      ),
      iat: Math.floor(new Date().getTime() / 1000),
      exp: expires,
    };
    const token = jwt.sign(req.payload, process.env.JWT_SECRET);
    res.cookie("irene_auth", token, {
      maxAge: process.env.TOKEN_RENEWAL_VALIDITY * 1000,
      httpOnly: true,
      sameSite: true,
      secure: false,
      domain: process.env.COOKIE_DOMAIN,
    });
    res.sendStatus(200);
  } catch {
    res.sendStatus(403);
  }
};

const verifyToken = (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  if (req.originalUrl.includes("/assets") && authorizationHeader) {
    try {
      if (authorizationHeader == null) {
        throw new Error("Authorization header is missing");
      }
      const [type, token] = authorizationHeader.split(" ");
      if (type !== "Bearer") {
        throw new Error("Authorization header has not the 'Bearer' type");
      }
      req.payload = jwt.verify(token, process.env.JWT_CKEDITOR_UPLOAD_SECRET);
      const perms = {};
      for (const perm in permissions) {
        if (permissions[perm].includes(req.payload.role)) perms[perm] = true;
      }
      req.perms = perms;
      if (req.payload.sub) next();
      else res.sendStatus(403);
    } catch {
      res.sendStatus(403);
    }
  } else
    try {
      req.payload = jwt.verify(req.cookies.irene_auth, process.env.JWT_SECRET);
      const perms = {};
      for (const perm in permissions) {
        if (permissions[perm].includes(req.payload.role)) perms[perm] = true;
      }
      req.perms = perms;
      next();
    } catch (err) {
      try {
        if (err.expiredAt) {
          const payload = jwt.decode(
            req.cookies.irene_auth,
            process.env.JWT_SECRET
          );
          const refreshExchangeToken = jwt.sign(
            {
              sub: payload.sub,
              iat: Math.floor(new Date().getTime() / 1000),
              exp: Math.floor(new Date().getTime() / 1000) + 30,
            },
            process.env.JWT_REFRESH_EXCHANGE_SECRET + req.cookies.irene_auth
          );
          res.status(400).json({ expired: true, refreshExchangeToken });
        } else res.status(403).redirect(process.env.FRONTEND_URL);
      } catch (err2) {
        if (req.cookies.irene_auth) {
          res
            .cookie("irene_auth", "", {
              maxAge: 0,
              httpOnly: true,
              sameSite: true,
              secure: false,
              domain: process.env.COOKIE_DOMAIN,
            })
            .status(401)
            .json({ loggedOut: true });
        } else res.status(403).redirect(process.env.FRONTEND_URL);
      }
    }
};

module.exports = {
  hashingParams,
  hashPassword,
  verifyToken,
  checkRight,
  loadPermissions,
  renewToken,
};
