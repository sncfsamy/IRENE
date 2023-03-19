const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const models = require("../models");
const { hashingParams } = require("../auth");

const browse = (req, res) => {
  models.user
    .findAll()
    .then(([rows]) => {
      res.send(
        rows.map((user) => {
          const newUser = { ...user };
          if (req.payload.role !== 4) {
            delete newUser.role_id;
          }
          return newUser;
        })
      );
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const read = (req, res) => {
  models.user
    .find(req.params.id)
    .then(([rows]) => {
      if (rows[0] == null) {
        res.sendStatus(404);
      } else {
        const user = { ...rows[0] };
        if (req.payload.role !== 4) {
          delete user.role_id;
          if (user.id !== req.payload.sub) {
            delete user.rgpd_agreement;
            delete user.mail_notification;
          }
        }
        res.send(user);
      }
    })
    .catch((err) => {
      console.error(err);
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
        res.json(rows[0]);
      }
    })
    .catch((err) => {
      console.error(err);
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
  if (req.payload.role >= 3) {
    if (user.id_manager != null) {
      update.push({
        column: "id_manager",
        value: parseInt(user.id_manager, 10),
      });
    }
    if (user.organisation_id != null) {
      update.push({
        column: "organisation_id",
        value: parseInt(user.organisation_id, 10),
      });
    }
    if (req.payload.role === 4 && user.role_id != null) {
      update.push({
        column: "role_id",
        value: parseInt(user.role_id, 10),
      });
    }
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
        console.error(err);
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
      console.error(err);
      res.sendStatus(500);
    });
};

const browseSkills = (req, res) => {
  models.user
    .findAllBySkills(req.query.search_terms)
    .then(([rows]) => {
      if (rows == null) {
        res.sendStatus(404);
      } else {
        res.send(rows);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const add = (req, res) => {
  models.user
    .insert(req.body)
    .then(([result]) => {
      res.location(`/users/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const login = (req, res) => {
  models.user
    .getUserByRegistrationNumber(req.body.registration_number)
    .then(([[user]]) => {
      argon2
        .verify(user.password, req.body.password, hashingParams)
        .then((isVerified) => {
          if (isVerified) {
            const token = jwt.sign(
              {
                sub: user.id,
                role: user.role_id,
                organisation: user.organisation_id,
                iat: Math.floor(new Date().getTime() / 1000),
                exp: Math.floor(new Date().getTime() / 1000) + 60 * 60 * 3,
              },
              process.env.JWT_SECRET
            );
            res.json({ token });
          } else {
            res.sendStatus(403);
          }
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    })
    .catch(() => {
      res.sendStatus(404);
    });
};

const searchUsers = (req, res) => {
  models.user
    .search(req.query.search_terms.split(" "))
    .then((results) => {
      console.log(results)
      res.json(results[0]);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(404);
    });
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
  searchUsers,
};
