const models = require("../models");

const browse = (req, res) => {
  models.comment
    .find(req.params.id_idea, req.params.field)
    .then(([rows]) => {
      res.send(rows);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const edit = (req, res) => {
  const id = parseInt(req.params.id_comment, 10);
  models.comment
    .update(req.body.comment, id)
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
  const comment = req.body;
  models.comment
    .insert(comment)
    .then(([result]) => {
      if (result.insertId) {
        const idComment = result.insertId;
        if (req.body.assets) {
          models.asset.setIdComment(req.body.assets, idComment);
        }
        res.status(201).json({ idComment });
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
  models.comment
    .delete(req.params.id_comment)
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
};
