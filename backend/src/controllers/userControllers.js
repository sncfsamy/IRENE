const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const models = require("../models");
const { hashingParams } = require("../auth");

const browse = (req, res) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  limit = Math.min(Number.isNaN(limit) ? 20 : limit, 100);
  page = Number.isNaN(page) ? 1 : page;
  const offset = limit * (page - 1);
  Promise.all(models.user.findAll(req.query.search_terms, limit, offset))
    .then(([[rows], [[{ total }]]]) => {
      res.send({ users: rows, total });
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const read = (req, res) => {
  const id = parseInt(req.params.id, 10);
  models.user
    .find(id)
    .then(([rows]) => {
      if (rows[0] == null) {
        res.sendStatus(404);
      } else {
        models.user
          .findManager(rows[0].id_team)
          .then(([managerData]) => {
            const user = { ...rows[0], id_user: id, managers: managerData };
            if (!req.perms.manage_users && !req.perms.manage_all) {
              delete user.id_role;
              if (id !== req.payload.sub) {
                delete user.rgpd_agreement;
                delete user.mail_notification;
              }
            }
            res.send(user);
          })
          .catch((err) => {
            console.warn(err);
            res.sendStatus(500);
          });
      }
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const me = (req, res) => {
  models.user
    .find(req.payload.sub)
    .then(([rows]) => {
      if (rows[0] == null) {
        res.sendStatus(404);
      } else {
        Promise.all([
          models.user.findManager(rows[0].id_team),
          models.role.find(req.payload.role),
          models.userCategorie.find(req.payload.sub),
        ])
          .then(([[managerData], [[role]], [categories]]) => {
            const perms = {};
            for (const param in role) {
              if (param !== "id_role" && param !== "name" && role[param])
                perms[param] = true;
            }
            res.json({
              ...rows[0],
              id_user: req.payload.sub,
              managers: managerData,
              perms,
              upload_token: req.payload.upload_token,
              categories: categories.map((categorie) => categorie.id_categorie),
            });
          })
          .catch((err) => {
            console.warn(err);
            res.sendStatus(500);
          });
      }
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const edit = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = req.body;
  const update = [];
  if (id === req.payload.sub) {
    if (user.skills != null) {
      update.push({
        column: "skills",
        value: user.skills,
      });
    }
    if (user.mail_notification != null) {
      update.push({
        column: "mail_notification",
        value: user.mail_notification,
      });
    }
    if (user.rgpd_agreement != null) {
      update.push({
        column: "rgpd_agreement",
        value: user.rgpd_agreement,
      });
    }
  }
  if (req.perms.manage_users || req.perms.manage_all) {
    if (user.id_organisation != null) {
      update.push({
        column: "id_organisation",
        value: parseInt(user.id_organisation, 10),
      });
    }
    if (user.id_role != null) {
      update.push({
        column: "id_role",
        value: parseInt(user.id_role, 10),
      });
    }
    if (user.id_team != null) {
      update.push({
        column: "id_team",
        value: parseInt(user.id_team, 10),
      });
    }
  }
  if (
    req.payload.sub === id &&
    req.body.categories &&
    req.body.categories.length
  ) {
    models.userCategorie
      .delete(id)
      .then(() => {
        models.userCategorie.add(
          id,
          req.body.categories
            .map((cid) => parseInt(cid, 10))
            .filter((cid) => !Number.isNaN(cid))
        );
      })
      .catch((err) => console.warn(err));
  }
  if (update.length) {
    models.user
      .update(update, id)
      .then(([result]) => {
        if (result.affectedRows === 0) {
          res.sendStatus(404);
        } else {
          res.sendStatus(202);
        }
      })
      .catch((err) => {
        console.warn(err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(304);
  }
};

const destroy = (req, res) => {
  models.user
    .delete(req.params.id)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const batchDestroy = (req, res) => {
  const ids = req.query.ids.split(",").filter((id) => !Number.isNaN(id));
  models.user
    .deleteIds(ids)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const browseSkills = (req, res) => {
  const page = parseInt(req.query.page ?? 1, 10);
  const offset = ((Number.isNaN(page) ? 1 : page) - 1) * 20;
  Promise.all(models.user.findAllBySkills(req.query.search_terms, offset))
    .then(([[rows], [[{ total }]]]) => {
      if (rows == null || total === 0) {
        res.sendStatus(404);
      } else {
        res.send({ users: rows, total });
      }
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const add = (req, res) => {
  models.user
    .insert(req.body)
    .then(([result]) => {
      if (result.insertId) {
        const id = result.insertId;
        res.status(201).json({ id });
      } else {
        res.sendStatus(500);
      }
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const logout = (req, res) => {
  res
    .cookie("irene_auth", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: true,
      secure: false,
      domain: process.env.COOKIE_DOMAIN,
    })
    .status(200)
    .send();
};

const login = (req, res) => {
  models.user
    .getUserByRegistrationNumber(req.body.registration_number)
    .then(([[user]]) => {
      argon2
        .verify(user.password, req.body.password, hashingParams)
        .then((isVerified) => {
          if (isVerified) {
            const now = Math.floor(new Date().getTime() / 1000);
            const token = jwt.sign(
              {
                sub: user.id_user,
                team: user.id_team,
                role: user.id_role,
                organisation: user.id_organisation,
                upload_token: jwt.sign(
                  {
                    sub: user.id_user,
                    iat: Math.floor(new Date().getTime() / 1000),
                    exp: Math.floor(new Date().getTime() / 1000) + parseInt(process.env.TOKEN_RENEWAL_VALIDITY, 10),
                  },
                  process.env.JWT_CKEDITOR_UPLOAD_SECRET
                ),
                iat: Math.floor(new Date().getTime() / 1000),
                exp: now + parseInt(process.env.TOKEN_VALIDITY, 10),
              },
              process.env.JWT_SECRET
            );
            const refreshToken = jwt.sign(
              {
                sub: user.id_user,
                iat: Math.floor(new Date().getTime() / 1000),
                exp: now + parseInt(process.env.TOKEN_RENEWAL_VALIDITY, 10),
              },
              process.env.JWT_REFRESH_SECRET + user.id_user
            );
            res
              .cookie("irene_auth", token, {
                maxAge: parseInt(process.env.TOKEN_RENEWAL_VALIDITY, 10) * 1000,
                httpOnly: true,
                sameSite: true,
                secure: false,
                domain: process.env.COOKIE_DOMAIN,
              })
              .status(200)
              .json({
                irene_refresh: refreshToken,
              });
          } else {
            res.sendStatus(403);
          }
        })
        .catch((err) => {
          console.warn(err);
          res.sendStatus(500);
        });
    })
    .catch(() => {
      res.sendStatus(404);
    });
};

const searchUsers = (req, res) => {
  if (req.query.search_terms) {
    models.user
      .search(req.query.search_terms.split(" "))
      .then((results) => {
        res.json(results[0]);
      })
      .catch((err) => {
        console.warn(err);
        res.sendStatus(404);
      });
  } else if (req.query.users) {
    const idsUsers = req.query.users.split(",").map((id) => parseInt(id, 10));
    models.user
      .findSome(idsUsers)
      .then(([rows]) => {
        res.send(rows);
      })
      .catch((err) => {
        console.warn(err);
        res.sendStatus(500);
      });
  } else res.sendStatus(404);
};

module.exports = {
  browse,
  read,
  me,
  edit,
  destroy,
  browseSkills,
  add,
  login,
  logout,
  searchUsers,
  batchDestroy,
};
