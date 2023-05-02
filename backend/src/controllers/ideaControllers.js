const path = require("path");
const fs = require("fs");
const models = require("../models");

const browse = async (req, res) => {
  const searchFilters = [];
  const orderParams = [];
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  limit = Math.min(Number.isNaN(limit) ? 20 : limit, 100);
  page = Number.isNaN(page) ? 1 : page;
  const offset = limit * (page - 1);
  if (req.query.categories && req.query.categories.length) {
    const data = await models.ideaCategorie.findIdeaIdsByCategoriesIds(
      req.query.categories
    );
    if (data[0] && data[0].length) {
      const idsByCategorie = [];
      data[0].forEach(
        (idea) =>
          !idsByCategorie.includes(idea.id_idea) &&
          idsByCategorie.push(idea.id_idea)
      );
      searchFilters.push({
        column: "id_idea",
        value: idsByCategorie.join(","),
        operator: "IN",
      });
    }
  }
  if (req.query.users) {
    searchFilters.push({
      column: "a.id_user",
      value: req.query.users,
      operator: "IN",
    });
  }
  if (req.query.status) {
    searchFilters.push({
      column: "status",
      value: req.query.status,
      operator: "IN",
    });
  }
  if (req.query.organisations) {
    searchFilters.push({
      column: "id_organisation",
      value: req.query.organisations,
      operator: "IN",
    });
  }
  if (
    req.query.teams &&
    req.query.teams.length &&
    req.query.teams.split(",").length
  ) {
    const data = await models.user.findTeams(req.query.teams.split(","));
    if (data[0] && data[0].length) {
      searchFilters.push({
        column: "a.id_user",
        value: data[0].map((user) => user.id_user).join(","),
        operator: "IN",
      });
    }
  }
  if (req.query.search_terms) {
    searchFilters.push({
      column: "MATCH(i.name,i.description,i.problem,i.solution,i.gains)",
      value: req.query.search_terms,
      operator: "AGAINST(",
    });
  }
  if (req.query.created_at_from) {
    searchFilters.push({
      column: "created_at",
      value: parseInt(req.query.created_at_from, 10),
      operator: "BETWEEN",
    });
    searchFilters.push({
      value:
        parseInt(req.query.created_at_to ?? req.query.created_at_from, 10) +
        60 * 60 * 24,
    });
  }
  if (req.query.finished_at_from) {
    searchFilters.push({
      column: "finished_at",
      value: parseInt(req.query.finished_at_from, 10),
      operator: "BETWEEN",
    });
    searchFilters.push({
      value:
        parseInt(req.query.finished_at_to ?? req.query.finished_at_from, 10) +
        60 * 60 * 24,
    });
  }
  if (req.query.manager_validated_at_from) {
    searchFilters.push({
      column: "manager_validated_at",
      value: parseInt(req.query.manager_validated_at_from, 10),
      operator: "BETWEEN",
    });
    searchFilters.push({
      value:
        parseInt(
          req.query.manager_validated_at_to ??
            req.query.manager_validated_at_from,
          10
        ) +
        60 * 60 * 24,
    });
  }
  if (req.query.ambassador_validated_at_from) {
    searchFilters.push({
      column: "ambassador_validated_at",
      value: parseInt(req.query.ambassador_validated_at_from, 10),
      operator: "BETWEEN",
    });
    searchFilters.push({
      value:
        parseInt(
          req.query.ambassador_validated_at_to ??
            req.query.ambassador_validated_at_from,
          10
        ) +
        60 * 60 * 24,
    });
  }
  if (req.query.order_by) {
    const orderingColumns = [
      "created_at",
      "finished_at",
      "id_organisation",
      "status",
      "manager_validated_at",
      "ambassador_validated_at",
    ];
    const orderBy = req.query.order_by
      .split(",")
      .map((e) => parseInt(e, 10))
      .filter((e) => !Number.isNaN(e));
    const orders = req.query.order
      .split(",")
      .map((e) => parseInt(e, 10))
      .filter((e) => !Number.isNaN(e));
    orderBy.forEach((columnIdx, i) => {
      if (orderingColumns[columnIdx])
        orderParams.push({
          column: orderingColumns[columnIdx],
          order: orders[i] === 0 ? "DESC" : "ASC",
        });
    });
  }
  Promise.all(models.idea.findAll(searchFilters, orderParams, limit, offset))
    .then(([[ideas], [totalResult]]) => {
      const total = totalResult[0]?.total ?? 0;
      if (total > 0) {
        models.author
          .find(
            ideas.map((idea) => idea.id_idea),
            true
          )
          .then((authorsResults) => {
            const authors = authorsResults[0] ? authorsResults[0] : [];
            res.json({ ideas, total, authors });
          })
          .catch((err) => {
            console.warn(err);
            res.sendStatus(500);
          });
      } else {
        res.json({
          ideas: [],
          total: 0,
          authors: [],
        });
      }
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const read = (req, res) => {
  const id = parseInt(req.params.id, 10);
  models.idea
    .find(id, req.payload)
    .then(([results]) => {
      if (results === null) {
        res.sendStatus(404);
      } else {
        const idea = { id, ...results[0] };
        Promise.all([
          models.comment.getLastsCommentsOfAnIdeaById(id),
          models.author.find([id]),
          models.asset.findByIdea(id),
        ])
          .then(([commentsResults, authorsResults, assetsResults]) => {
            const comments = [
              {
                comments:
                  commentsResults[0] !== null ? commentsResults[0][0] : [],
                total: -1,
              },
              {
                comments:
                  commentsResults[1] !== null ? commentsResults[1][0] : [],
                total: commentsResults[2][0][0].total,
              },
              {
                comments:
                  commentsResults[3] !== null ? commentsResults[3][0] : [],
                total: commentsResults[4][0][0].total,
              },
              {
                comments:
                  commentsResults[5] !== null ? commentsResults[5][0] : [],
                total: commentsResults[6][0][0].total,
              },
            ];
            const authors = authorsResults[0] != null ? authorsResults[0] : [];
            const assets = assetsResults[0] != null ? assetsResults[0] : [];
            res.json({ idea, authors, comments, assets });
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

const checkAssets = async (req, id) => {
  if (req.body.assets.length) await models.asset.setIdIdea(req.body.assets, id);
  models.asset.findByIdea(id).then(([assets]) => {
    assets
      .filter((asset) => req.body.assets.includes(asset.id_asset))
      .forEach((asset) => {
        const ideaPath = `uploads/idea_${id}`;
        if (!fs.existsSync(ideaPath)) {
          fs.mkdirSync(ideaPath, true);
        }
        const fileName = path.parse(asset.file_name);
        const originalFile = `uploads/idea_undefined/${fileName.name}`;
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
        param: "problem",
        value: req.body.problem.replace(/\/idea_undefined\//g, `/idea_${id}/`),
      },
      {
        param: "solution",
        value: req.body.solution.replace(/\/idea_undefined\//g, `/idea_${id}/`),
      },
      {
        param: "gains",
        value: req.body.gains.replace(/\/idea_undefined\//g, `/idea_${id}/`),
      },
    ];
    models.idea.update(id, update);
  });
};

const edit = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const status = parseInt(req.body.status, 10);
    models.author.find(id).then(([currentAuthors]) => {
      const author = currentAuthors.find((a) => a.is_author);
      if (
        (author.id_user === req.payload.sub &&
          (Number.isNaN(status) || status === 0 || status === 4)) ||
        req.perms.manage_all ||
        (req.perms.manage_ideas_manager &&
          req.payload.team === author.id_team &&
          (status === 2 || status === 4 || status === 5)) ||
        (req.perms.manage_ideas_ambassador &&
          req.payload.organisation === author.id_organisation &&
          status >= 2 &&
          status <= 5)
      ) {
        const authors = [{ isAuthor: true, idUser: author.id_user }];
        if (
          req.body.assets &&
          (req.body.status === 0 || req.body.status === 4)
        ) {
          checkAssets(req, id);
        }
        if (req.body.coauthors && req.body.coauthors.length) {
          req.body.coauthors
            .filter((coauthor) => coauthor !== null)
            .map((coauthor) =>
              typeof coauthor === "number" ? coauthor : coauthor.id_user
            )
            .forEach((coauthor) => {
              authors.push({ isAuthor: false, idUser: coauthor });
            });
        }
        const update = [];
        if (req.body.name) {
          update.push({
            param: "name",
            value: req.body.name,
          });
        }
        if (req.body.description !== undefined) {
          update.push({
            param: "description",
            value: req.body.description,
          });
        }
        if (req.body.problem !== undefined) {
          update.push({
            param: "problem",
            value: req.body.problem.replace(
              /\/idea_undefined\//g,
              `/idea_${id}/`
            ),
          });
        }
        if (req.body.solution !== undefined) {
          update.push({
            param: "solution",
            value: req.body.solution.replace(
              /\/idea_undefined\//g,
              `/idea_${id}/`
            ),
          });
        }
        if (req.body.gains) {
          update.push({
            param: "gains",
            value: req.body.gains.replace(
              /\/idea_undefined\//g,
              `/idea_${id}/`
            ),
          });
        }
        if (req.body.finished_at) {
          update.push({
            param: "finished_at",
            value: req.body.finished_at,
          });
        }
        if (req.body.manager_validated_at) {
          update.push({
            param: "manager_validated_at",
            value: req.body.manager_validated_at,
          });
        }
        if (req.body.ambassador_validated_at) {
          update.push({
            param: "ambassador_validated_at",
            value: req.body.ambassador_validated_at,
          });
        }
        if (!Number.isNaN(status)) {
          update.push({
            param: "status",
            value: status,
          });
        }
        if (req.body.categories) {
          models.ideaCategorie
            .delete(id)
            .then(() => {
              const categoriesData = [];
              req.body.categories.forEach((categorie) => {
                categoriesData.push(categorie);
                categoriesData.push(id);
              });
              models.ideaCategorie
                .add(req.body.categories, categoriesData)
                .then(() => {})
                .catch((err) => {
                  console.warn(err);
                  res.sendStatus(500);
                });
            })
            .catch((err) => {
              console.warn(err);
              res.sendStatus(500);
            });
        }
        if (req.body.coauthors) {
          models.author
            .delete(id)
            .then(() => {
              models.author
                .add(authors, id)
                .then(() => {})
                .catch((err) => {
                  console.warn(err);
                  res.sendStatus(500);
                });
            })
            .catch((err) => {
              console.warn(err);
              res.sendStatus(500);
            });
        }
        if (update.length) {
          models.idea
            .update(id, update)
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
        } else {
          res.sendStatus(204);
        }
      } else {
        res.sendStatus(403);
      }
    });
  } catch (err) {
    console.warn(err);
    res.sendStatus(500);
  }
};

const add = (req, res) => {
  const idea = req.body;
  idea.id_organisation = req.payload.organisation;
  const authors = [{ isAuthor: true, idUser: req.payload.sub }];
  if (req.body.coauthors && req.body.coauthors.length) {
    req.body.coauthors
      .filter((coauthor) => coauthor !== null)
      .map((coauthor) =>
        typeof coauthor === "number" ? coauthor : coauthor.id_user
      )
      .forEach((coauthor) => {
        authors.push({ isAuthor: false, idUser: coauthor });
      });
  }
  idea.status = parseInt(req.body.status, 10) === 1 ? 1 : 0;
  models.idea
    .insert(idea)
    .then(([result]) => {
      const id = result.insertId;
      if (req.body.assets) {
        checkAssets(req, id);
      }
      const challengeId = parseInt(req.body.challenge, 10);

      if (req.body.challenge && !Number.isNaN(challengeId))
        models.challenger.insert(id, challengeId);

      const categoriesData = [];
      for (let i = 0; i < req.body.categories.length; i += 1) {
        categoriesData.push(req.body.categories[i]);
        categoriesData.push(id);
      }
      models.ideaCategorie.add(req.body.categories, categoriesData);
      models.author.add(authors, id).then(() => {
        res.status(201).json({ id });
      });
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const destroy = (req, res) => {
  const id = parseInt(req.params.id, 10);
  models.author
    .find(id)
    .then(([currentAuthors]) => {
      const author = currentAuthors.find((a) => a.is_author);
      if (
        author.id_user === req.payload.sub ||
        req.perms.manage_all ||
        (req.perms.manage_ideas_ambassador &&
          req.payload.organisation === author.id_organisation)
      ) {
        models.asset
          .findToDelete([id])
          .then(([results]) => {
            if (results.length) {
              models.asset
                .deleteIds(results.map((asset) => asset.id_asset))
                .then(([assets]) => {
                  if (assets.affectedRows) {
                    fs.rmSync(`uploads/idea_${id}`, {
                      recursive: true,
                      force: true,
                    });
                  }
                });
            }
            models.idea
              .delete(id)
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
          })
          .catch((err) => {
            console.warn(err);
            res.sendStatus(500);
          });
      } else {
        res.sendStatus(403);
      }
    })
    .catch((err) => {
      console.warn(err);
      res.sendStatus(500);
    });
};

const batchDestroy = (req, res) => {
  const ids = req.query.ids.split(",").filter((id) => !Number.isNaN(id));
  models.asset
    .findToDelete(ids)
    .then(([results]) => {
      if (results.length) {
        models.asset
          .deleteIds(results.map((asset) => asset.id_asset))
          .then(() => {
            ids.forEach((id) =>
              fs.rmSync(`uploads/idea_${id}`, { recursive: true, force: true })
            );
          })
          .catch((err) => {
            console.warn(err);
          });
      }
      models.idea
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
    })
    .catch((err) => {
      console.warn(err);
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
