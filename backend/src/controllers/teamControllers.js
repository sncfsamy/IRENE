const models = require("../models");

const browse = (req, res) => {
  models.team
    .findAll(req.perms.manage_all || req.perms.manage_teams)
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
  const update = [];
  if (req.body.name)
    update.push({
      column: "name",
      value: req.body.name,
    });
  if (req.body.id_organisation)
    update.push({
      column: "id_organisation",
      value: req.body.id_organisation,
    });

  models.team
    .update(update, id)
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

const add = (req, res) => {
  models.team
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
      console.error(err);
      res.sendStatus(500);
    });
};

const destroy = (req, res) => {
  models.team
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

const batchDestroy = (req, res) => {
  const ids = req.query.ids.split(",").filter((id) => !Number.isNaN(id));
  models.team
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
  edit,
  add,
  destroy,
  batchDestroy,
};
