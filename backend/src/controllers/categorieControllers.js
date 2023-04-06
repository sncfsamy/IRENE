const models = require("../models");

const browse = (req, res) => {
  const searchFilters = [];
  const orderParams = [];
  const orderingColumns = ["name", "id_parent_categorie"];
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  limit = Number.isNaN(limit) ? 20 : limit;
  page = Number.isNaN(page) ? 1 : page;
  const offset = limit * (page - 1);
  if (req.query.keywords && req.query.keywords.length) {
    req.query.keywords.split("s+").forEach((term) => {
      searchFilters.push({
        column: "name",
        value: `%${term}%`,
        operator: "LIKE",
      });
    });
  }
  if (req.query.order) {
    orderParams.push({
      column: orderingColumns[parseInt(req.query.order_by ?? 0, 10)],
      order: parseInt(req.query.order, 10) === 0 ? "DESC" : "ASC",
    });
  }
  Promise.all(
    models.categorie.findAll(searchFilters, orderParams, limit, offset)
  )
    .then(([[rows], [[{ total }]]]) => {
      res.send({ categories: rows, total });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const edit = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const update = [];
  if (req.body.name) {
    update.push({
      column: "name",
      value: req.body.name,
    });
  }
  if (req.body.id_parent_categorie) {
    update.push({
      column: "id_parent_categorie",
      value:
        req.body.id_parent_categorie === -1
          ? null
          : req.body.id_parent_categorie,
    });
  }
  if (update.length) {
    models.categorie
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
  } else {
    res.sendStatus(304);
  }
};

const add = (req, res) => {
  models.categorie
    .insert(req.body)
    .then(([result]) => {
      if (result.insertId) {
        const id = result.insertId;
        res.status(201).json({ id });
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
  models.categorie
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
  models.categorie
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
