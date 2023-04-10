const models = require("../models");

let loadPermissions;

const browse = (req, res) => {
  models.role
    .findAll(req.perms.manage_all || req.perms.manage_organisations)
    .then(([rows]) => {
      res.send(rows);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

// called from auth.js at start, stock function to reload perms on backend memory when
// perms are changed by edit function
const loadPermsData = (loadPermissionsFunction) => {
  loadPermissions = loadPermissionsFunction;
  models.role
    .findAll()
    .then(([rows]) => {
      loadPermissions(rows);
    })
    .catch((err) => console.warn(err));
};

const edit = (req, res) => {
  const id = parseInt(req.params.id, 10);
  req.body.id_role = id;
  models.role
    .update(req.body)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
        models.role
          .findAll()
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
        models.role.findAll().then(([results]) => {
          loadPermissions(results);
        });
      } else {
        res.sendStatus(500);
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
        models.role.findAll().then(([results]) => {
          loadPermissions(results);
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const batchDestroy = (req, res) => {
  const ids = req.query.ids.split(",").filter((id) => !Number.isNaN(id));
  models.role
    .deleteIds(ids)
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

module.exports = {
  browse,
  loadPermsData,
  edit,
  add,
  destroy,
  batchDestroy,
};
