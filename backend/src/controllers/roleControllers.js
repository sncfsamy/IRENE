const models = require("../models");
const { loadPermissions } = require("../auth");

const browse = (req, res) => {
  models.role
    .findAll()
    .then(([rows]) => {
      res.send(rows);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const edit = (req, res) => {
  const id = parseInt(req.params.id, 10);
  req.body.id = id;
  models.role
    .update(req.body)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
        models.role.findAll()
        .then(([results]) => {
          loadPermissions(results);
        })
        .catch();
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const add = (req, res) => {
  models.role
    .insert(req.body)
    .then(([result]) => {
      if (result.insertId) {
        const id = result.insertId;
        res.status(201).json({ id });
        models.role.findAll()
        .then(([results]) => {
          loadPermissions(results);
        })
      } else {
        res.sendStatus(400);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const destroy = (req, res) => {
  models.role
    .delete(req.params.id)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
        models.role.findAll()
        .then(([results]) => {
          loadPermissions(results);
        })
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

module.exports = {
  browse,
  edit,
  add,
  destroy,
};
