const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Ajout de uuid
const { v4: uuidv4 } = require("uuid");

const models = require("../models");

const browse = (req, res) => {
  models.asset
    .find(req.params.id_idea)
    .then(([rows]) => {
      res.send(rows);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const destroy = (req, res) => {
  models.asset
    .delete(req.params.id_asset)
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

const upload = (req, res) => {
  const id = parseInt(req.params.id_idea, 10);
  if (Number.isNaN(id)) {
    res.status(503).json({
      uploaded: 0,
      error: {
        message:
          "Vous devez d'abord enregistrer votre idée avant de pouvoir y joindre des images !",
      },
    });
  } else {
    const start = new Date();
    if (!fs.existsSync(`uploads/idea_${req.params.id_idea}`)) {
      fs.mkdirSync(`uploads/idea_${req.params.id_idea}`, true);
    }
    const runs = [];
    req.files.forEach(async (file) => {
      runs.push(
        new Promise(async (resolve, reject) => {
          try {
            const { originalname, filename, size, mimetype } = file;
            const commentNamePart = req.body.comment_id
              ? `comment_${req.body.comment_id}-`
              : "";
            const uuid = uuidv4();
            let uri = `uploads/idea_${req.params.id_idea}/${uuid}-${commentNamePart}${originalname}`;
            fs.renameSync(`uploads/${filename}`, uri);
            if (mimetype.includes("image")) {
              const newURI = `uploads/idea_${
                req.params.id_idea
              }/${uuid}-${commentNamePart}${
                path.parse(originalname).name
              }.heif`;
              const newURI150 = `uploads/idea_${
                req.params.id_idea
              }/${uuid}-${commentNamePart}${
                path.parse(originalname).name
              }-150.heif`;
              const newURI300 = `uploads/idea_${
                req.params.id_idea
              }/${uuid}-${commentNamePart}${
                path.parse(originalname).name
              }-300.heif`;
              const newURI800 = `uploads/idea_${
                req.params.id_idea
              }/${uuid}-${commentNamePart}${
                path.parse(originalname).name
              }-800.heif`;
              const newURI1080 = `uploads/idea_${
                req.params.id_idea
              }/${uuid}-${commentNamePart}${
                path.parse(originalname).name
              }-1080.heif`;
              await sharp(uri)
                .resize({ height: 150 })
                .heif({ quality: 90 })
                .toFormat("heif")
                .toFile(newURI150);
              await sharp(uri)
                .resize({ height: 300 })
                .heif({ quality: 90 })
                .toFormat("heif")
                .toFile(newURI300);
              await sharp(uri)
                .resize({ height: 800 })
                .heif({ quality: 90 })
                .toFormat("heif")
                .toFile(newURI800);
              await sharp(uri)
                .resize({ height: 1080 })
                .heif({ quality: 90 })
                .toFormat("heif")
                .toFile(newURI1080);
              await sharp(uri)
                // .heif({ quality: 90 })
                .toFormat("heif")
                .toFile(newURI)
                .then(() => fs.rmSync(uri));
              models.asset
                .insert(
                  newURI,
                  size,
                  mimetype,
                  req.params.id_idea,
                  req.body.comment_id ?? null,
                  req.body.field || req.get("Field"),
                  req.body.description || req.get("Description")
                )
                .then(([result]) => {
                  if (result.affectedRows) {
                    resolve({
                      urls: {
                        default: `${process.env.BACKEND_URL}/${newURI}`,
                        150: `${process.env.BACKEND_URL}/${newURI150}`,
                        300: `${process.env.BACKEND_URL}/${newURI300}`,
                        800: `${process.env.BACKEND_URL}/${newURI800}`,
                        1080: `${process.env.BACKEND_URL}/${newURI1080}`,
                      },
                    });
                  } else {
                    fs.rmSync(newURI);
                    fs.rmSync(newURI150);
                    fs.rmSync(newURI300);
                    fs.rmSync(newURI800);
                    fs.rmSync(newURI1080);
                    reject(`Cannot add image ${newURI} to database.`);
                  }
                })
                .catch((err) => reject(err));
            } else {
              models.asset
                .insert(
                  uri,
                  size,
                  mimetype,
                  req.params.id_idea,
                  req.body.comment_id ?? null,
                  req.body.field,
                  req.body.description
                )
                .then(([result]) => {
                  if (result.affectedRows) {
                    resolve({
                      url: `${process.env.BACKEND_URL}/${uri}`,
                      description: req.body.description,
                      idea_id: req.params.id_idea,
                      field: req.body.field,
                      size: size,
                      mimetype: mimetype,
                      comment_id: req.body.comment_id ?? null,
                    });
                  } else {
                    fs.rmSync(uri);
                    reject(`Cannot add file ${uri} to database.`);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            }
          } catch (err) {
            reject(err);
          }
        })
      );
    });
    Promise.all(runs).then(
      (results) => {
        console.info(
          "Durée de traitement du chargement des images:  %dms",
          new Date() - start
        );
        res.status(201).json(results.length === 1 ? results[0] : results);
      },
      (errors) => {
        console.warn(errors);
        res.status(500).json(errors);
      }
    );
  }
};

module.exports = { browse, destroy, upload };
