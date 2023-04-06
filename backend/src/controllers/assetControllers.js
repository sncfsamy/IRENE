const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const models = require("../models");

const browse = (req, res) => {
  models.asset
    .findFirsts(req.params.id_idea)
    .then(([assets]) => {
      const data = assets.map((asset) => {
        return {
          ...asset,
          urls: { original: `${process.env.BACKEND_URL}/${asset.file_name}` },
        };
      });
      res.json(data);
    })
    .catch(() => {
      res.sendStatus(500);
    });
};

const destroy = (req, res) => {
  models.asset
    .find(req.params.id_asset)
    .then(([results]) => {
      if (results[0]) {
        models.asset.deleteIds([req.params.id_asset]).then(([result]) => {
          if (result.affectedRows === 0) {
            try {
              fs.rmSync(
                `uploads/idea_${results[0].file_name}/${results[0].file_name}`
              );
            } catch (e) {
              console.warn(e);
            }
            if (results[0].type.includes("image")) {
              const file = path.parse(results[0].file_name);
              try {
                fs.rmSync(
                  `uploads/idea_${results[0].file_name}/${file.name}-150${file.ext}`
                );
                fs.rmSync(
                  `uploads/idea_${results[0].file_name}/${file.name}-300${file.ext}`
                );
                fs.rmSync(
                  `uploads/idea_${results[0].file_name}/${file.name}-800${file.ext}`
                );
                fs.rmSync(
                  `uploads/idea_${results[0].file_name}/${file.name}-1080${file.ext}`
                );
              } catch (e) {
                console.warn(e);
              }
            }
            res.sendStatus(404);
          } else {
            res.sendStatus(204);
          }
        });
      } else res.sendStatus(404);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const upload = (req, res) => {
  const start = new Date();
  const isChallenge =
    req.body.challenge === "true" || req.get("Challenge") === "true";
  const challengeId =
    req.body.challenge === "true"
      ? (req.body.id_challenge !== "undefined" && req.body.id_challenge) ||
        undefined
      : (req.get("ChallengeId") !== "undefined" && req.get("ChallengeId")) ||
        undefined;
  if (
    isChallenge &&
    !fs.existsSync(`uploads/challenges/challenge_${challengeId}`)
  ) {
    fs.mkdirSync(`uploads/challenges/challenge_${challengeId}`, {
      recursive: true,
    });
  } else if (
    !isChallenge &&
    !fs.existsSync(`uploads/idea_${req.params.id_idea}`)
  ) {
    fs.mkdirSync(`uploads/idea_${req.params.id_idea}`, { recursive: true });
  }
  const runs = [];
  req.files.forEach(async (file) => {
    runs.push(
      new Promise((resolve, reject) => {
        try {
          const { originalname, filename, size, mimetype } = file;
          const commentPartName = req.body.id_comment
            ? `comment_${req.body.id_comment}-`
            : "";
          const uuid = uuidv4();
          const originalFile = `${uuid}-${commentPartName}${originalname.replace(
            /\s+/g,
            "_"
          )}`;
          const ideaPath = `uploads/${
            isChallenge
              ? `challenges/challenge_${challengeId}`
              : `idea_${req.params.id_idea}`
          }`;
          if (
            (req.params.id_idea || challengeId) &&
            parseInt(req.body.field, 10) === 0
          ) {
            models.asset
              .findPoster(
                isChallenge ? -1 : req.params.id_idea,
                isChallenge ? challengeId : -1
              )
              .then((assets) => {
                if (assets.length) {
                  assets.forEach((asset) => {
                    try {
                      if (fs.existsSync(`${ideaPath}/${asset.file_name}`))
                        fs.rmSync(`${ideaPath}/${asset.file_name}`);
                      const parsedFile = path.parse(asset.file_name);
                      if (
                        fs.existsSync(`${ideaPath}/${parsedFile.name}-150.heif`)
                      )
                        fs.rmSync(`${ideaPath}/${parsedFile.name}-150.heif`);
                      if (
                        fs.existsSync(`${ideaPath}/${parsedFile.name}-300.heif`)
                      )
                        fs.rmSync(`${ideaPath}/${parsedFile.name}-300.heif`);
                      if (
                        fs.existsSync(`${ideaPath}/${parsedFile.name}-800.heif`)
                      )
                        fs.rmSync(`${ideaPath}/${parsedFile.name}-800.heif`);
                      if (
                        fs.existsSync(
                          `${ideaPath}/${parsedFile.name}-1080.heif`
                        )
                      )
                        fs.rmSync(`${ideaPath}/${parsedFile.name}-1080.heif`);
                    } catch (err) {
                      console.warn(err);
                    }
                  });
                  models.asset.deleteIds(assets.map((asset) => asset.id_asset));
                }
              })
              .catch((err) => console.warn(err));
          }
          fs.renameSync(`uploads/${filename}`, `uploads/${originalFile}`);
          if (
            mimetype.includes("image") ||
            (mimetype === "application/octet-stream" &&
              path.parse(originalname).ext.toLowerCase() === ".heif")
          ) {
            const image = sharp(`uploads/${originalFile}`);
            image
              .metadata()
              .then(async (metadata) => {
                const fileName = `${path.parse(originalFile).name}.heif`;
                const fileName150 = `${path.parse(originalFile).name}-150.heif`;
                const fileName300 = `${path.parse(originalFile).name}-300.heif`;
                const fileName800 = `${path.parse(originalFile).name}-800.heif`;
                const fileName1080 = `${
                  path.parse(originalFile).name
                }-1080.heif`;
                if (metadata.width > 150)
                  await image
                    .resize({ height: 150 })
                    .heif({ quality: 90 })
                    .toFormat("heif")
                    .toFile(`${ideaPath}/${fileName150}`);
                if (metadata.width > 300)
                  await image
                    .resize({ height: 300 })
                    .heif({ quality: 90 })
                    .toFormat("heif")
                    .toFile(`${ideaPath}/${fileName300}`);
                if (metadata.width > 800)
                  image
                    .resize({ height: 800 })
                    .heif({ quality: 90 })
                    .toFormat("heif")
                    .toFile(`${ideaPath}/${fileName800}`);
                if (metadata.width > 1080)
                  image
                    .resize({ height: 1080 })
                    .heif({ quality: 90 })
                    .toFormat("heif")
                    .toFile(`${ideaPath}/${fileName1080}`);
                await image
                  .toFormat("heif")
                  .heif({ quality: 90 })
                  .toFile(`${ideaPath}/${fileName}`)
                  .then(() => fs.rmSync(`uploads/${originalFile}`));
                models.asset
                  .insert(
                    fileName,
                    size,
                    mimetype,
                    req.params.id_idea,
                    req.body.id_comment ?? null,
                    challengeId,
                    req.body.field || req.get("Field"),
                    req.body.description || req.get("Description")
                  )
                  .then(([result]) => {
                    if (result.insertId) {
                      const forCKEditor = req.get("CKEditorUploader");
                      resolve({
                        id_asset: result.insertId,
                        size,
                        type: "image/heif",
                        urls: {
                          default: `${
                            forCKEditor
                              ? `${process.env.BACKEND_URL}/${ideaPath}/`
                              : ""
                          }${fileName}`,
                          150:
                            metadata.width > 150 &&
                            `${
                              forCKEditor
                                ? `${process.env.BACKEND_URL}/${ideaPath}/`
                                : ""
                            }/${fileName150}`,
                          300:
                            metadata.width > 300 &&
                            `${
                              forCKEditor
                                ? `${process.env.BACKEND_URL}/${ideaPath}/`
                                : ""
                            }/${fileName300}`,
                          800:
                            metadata.width > 800 &&
                            `${
                              forCKEditor
                                ? `${process.env.BACKEND_URL}/${ideaPath}/`
                                : ""
                            }/${fileName800}`,
                          1080:
                            metadata.width > 1080 &&
                            `${
                              forCKEditor
                                ? `${process.env.BACKEND_URL}/${ideaPath}/`
                                : ""
                            }${fileName1080}`,
                        },
                      });
                    } else {
                      if (fs.existsSync(`${ideaPath}/${fileName}`))
                        fs.rmSync(`${ideaPath}/${fileName}`);
                      if (fs.existsSync(`${ideaPath}/${fileName150}`))
                        fs.rmSync(`${ideaPath}/${fileName150}`);
                      if (fs.existsSync(`${ideaPath}/${fileName300}`))
                        fs.rmSync(`${ideaPath}/${fileName300}`);
                      if (fs.existsSync(`${ideaPath}/${fileName800}`))
                        fs.rmSync(`${ideaPath}/${fileName800}`);
                      if (fs.existsSync(`${ideaPath}/${fileName1080}`))
                        fs.rmSync(`${ideaPath}/${fileName1080}`);
                      reject(
                        new Error(
                          `Cannot add image ${originalFile} to database.`
                        )
                      );
                    }
                  })
                  .catch((err) => reject(new Error(err)));
              })
              .catch((err) => reject(new Error(err)));
          } else {
            fs.renameSync(
              `uploads/${originalFile}`,
              `${ideaPath}/${originalFile}`
            );
            models.asset
              .insert(
                originalFile,
                size,
                mimetype,
                req.params.id_idea ?? null,
                req.body.id_comment ?? null,
                challengeId,
                req.body.field,
                req.body.description
              )
              .then(([result]) => {
                if (result.insertId) {
                  resolve({
                    id_asset: result.insertId,
                    urls: { default: originalFile },
                    size,
                    type: mimetype,
                  });
                } else {
                  fs.rmSync(`${ideaPath}/${originalFile}`);
                  reject(
                    new Error(
                      `Cannot add file "${ideaPath}/${originalFile}" to database.`
                    )
                  );
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
  Promise.all(runs)
    .then(
      (results) => {
        console.info(
          "Durée de traitement du chargement des images:  %dms",
          new Date() - start
        );
        res.status(201).json(results.length === 1 ? results[0] : results);
      },
      (errors) => {
        console.error(errors);
        res.status(500).json(errors);
      }
    )
    .catch((errors) => {
      console.error(errors);
      res.status(500).json(errors);
    });
};

module.exports = { browse, destroy, upload };
