const fs = require("fs");
const path = require("path");
const models = require("../models");

const browse = (req, res) => {
  const { limit, order, organisations, fullData = false } = req.query;
  const orderBy = req.query.order_by;
  models.challenge
    .findAll(organisations, limit, orderBy, order, fullData)
    .then(([results]) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const read = (req, res) => {
  const id = parseInt(req.params.id, 10);
  models.challenge
    .find(id)
    .then(([results]) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const checkAssets = async (req, id) => {
  if (req.body.assets.length)
    await models.asset.setIdChallenge(req.body.assets, id);
  models.asset.findByChallenge(id).then(([assets]) => {
    assets
      .filter((asset) => req.body.assets.includes(asset.id_asset))
      .forEach((asset) => {
        const ideaPath = `uploads/challenges/challenge_${id}`;
        if (!fs.existsSync(ideaPath)) {
          fs.mkdirSync(ideaPath, { recursive: true });
        }
        const fileName = path.parse(asset.file_name);
        const originalFile = `uploads/challenges/challenge_undefined/${fileName.name}`;
        const newPath = `${ideaPath}/${fileName.name}`;
        if (fs.existsSync(`${originalFile}${fileName.ext}`))
          fs.renameSync(
            `${originalFile}${fileName.ext}`,
            `${newPath}${fileName.ext}`
          );
        if (asset.type.includes("image")) {
          if (fs.existsSync(`${originalFile}-150${fileName.ext}`))
            fs.renameSync(
              `${originalFile}-150${fileName.ext}`,
              `${newPath}-150${fileName.ext}`
            );
          if (fs.existsSync(`${originalFile}-300${fileName.ext}`))
            fs.renameSync(
              `${originalFile}-300${fileName.ext}`,
              `${newPath}-300${fileName.ext}`
            );
          if (fs.existsSync(`${originalFile}-800${fileName.ext}`))
            fs.renameSync(
              `${originalFile}-800${fileName.ext}`,
              `${newPath}-800${fileName.ext}`
            );
          if (fs.existsSync(`${originalFile}-1080${fileName.ext}`))
            fs.renameSync(
              `${originalFile}-1080${fileName.ext}`,
              `${newPath}-1080${fileName.ext}`
            );
        }
      });
    const update = [
      {
        column: "description",
        value: req.body.description.replace(
          /\/challenge_undefined\//g,
          `/challenge_${id}/`
        ),
      },
    ];
    models.challenge.update(update, id);
  });
};

const edit = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.body.assets) checkAssets(req, id);
  const update = [];
  update.push({
    column: "name",
    value: req.body.name,
  });
  update.push({
    column: "description",
    value: req.body.description,
  });
  update.push({
    column: "started_at",
    value: req.body.started_at,
  });
  update.push({
    column: "expired_at",
    value: req.body.expired_at,
  });
  const organisation = parseInt(req.body.id_organisation, 10);
  update.push({
    column: "id_organisation",
    value:
      organisation !== -1 && !Number.isNaN(organisation) ? organisation : null,
  });
  const selecteds =
    (req.body.challengers &&
      req.body.challengers.filter((challenger) => challenger.selected)) ||
    [];
  const winners =
    (req.body.challengers &&
      req.body.challengers.filter((challenger) => challenger.winner)) ||
    [];
  if (selecteds.length)
    models.challenger.setSelecteds(
      selecteds.map((challenger) => challenger.id_idea),
      id,
      1
    );
  if (winners.length)
    models.challenger.setWinners(
      winners.map((challenger) => challenger.id_idea),
      id,
      0
    );
  if (update.length) {
    models.challenge
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
  } else res.sendStatus(500);
};

const add = (req, res) => {
  models.challenge
    .insert(req.body)
    .then(([result]) => {
      if (result.insertId) {
        const id = result.insertId;
        if (req.body.assets) {
          checkAssets(req, id);
        }
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
  models.challenge
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
  models.challenge
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
  read,
  edit,
  add,
  destroy,
  batchDestroy,
};
