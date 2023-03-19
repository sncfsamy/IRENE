const models = require("../models");

/* affichage des innovs répondant aux filtrages et aux ordonnancements:
  body = {
    search_filters = {
      users: [1,2,...],
      status: [0,1,2,...],
      organisation: [2,3,17,...],
      keywords: "expression à rechercher",
      created_at: { from: date, to: date },
      finished_at: { from: date, to: date },
      manager_validated_at: { from: date, to: date },
      ambassador_validated_at: { from: date, to: date }
    },
    ordering = [ {  order: x, column: y } ]
  }

  Pour le parametre ordering: 
    x = 0 pour ASC et 1 pour DESC
    y = int dans ces colonnes:
*/
const orderingColumns = [
  "created_at", // 0
  "finished_at", // 1
  "organisation", // 2
  "user", // 3
  "status", // 4
  "manager_validated_at", // 5
  "ambassador_validated_at", // 6
];
const browse = async (req, res) => {
  const searchFilters = [];
  const orderParams = [];
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  limit = Number.isNaN(limit) ? 20 : limit;
  page = Number.isNaN(page) ? 1 : page;
  const offset = limit * (page - 1);
  if (req.query.categories) {
    const data = await models.ideaCategorie.findIdeaIdsByCategoriesIds(
      req.query.categories
    );
    if (data[0] && data[0].length) {
      const idsByCategorie = [];
      data[0].forEach((ideaId) => idsByCategorie.push(ideaId.idea_id));
      searchFilters.push({
        column: "id",
        value: idsByCategorie.join(","),
        operator: "IN",
      });
    }
  }
  if (req.query.user_id) {
    searchFilters.push({
      column: "user_id",
      value: req.query.user_id,
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
      column: "organisation_id",
      value: req.query.organisations,
      operator: "IN",
    });
  }
  if (req.query.keywords) {
    searchFilters.push({
      column: "MATCH(name,description,problem,solution,gains)", // nécessite un index fulltext sur ces colonnes
      value: req.query.keywords,
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
  if (req.query.order) {
    req.query.order.forEach((orderElement) =>
      orderParams.push({
        column: orderingColumns[orderElement.column],
        order: parseInt(orderElement.order, 10) === 1 ? "DESC" : "ASC",
      })
    );
  }
  Promise.all(models.idea.findAll(searchFilters, orderParams, limit, offset))
    .then(([[ideas], [[{ total }]]]) => {
      if (total > 0) {
        models.ideaCoauthor
          .find(ideas, true)
          .then((authorsResults) => {
            const authors = authorsResults[0] ? authorsResults[0] : [];
            res.json({ ideas, total, authors });
                 
          })
          .catch((err) => {
            console.warn("ideaController:model.ideaCoauthor.find: ", err);
            res.sendStatus(500);
          });
      } else {
        res.json({
          ideas: [],
          total: 0,
          coauthors: [],
          users: [],
          categories: [],
        });
      }
    })
    .catch((err) => {
      console.warn("ideaController:model.idea.findAll: ", err);
      res.sendStatus(500);
    });
};

const note = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const noted = parseInt(req.body.note, 10);
  models.idea
    .find(id)
    .then(([results]) => {
      if (results === null) {
        res.sendStatus(404);
      } else {
        const noted_by = results[0].noted_by ?? "";
        const total = parseInt(results[0].note, 10) + noted;
        let voters = noted_by.split(",");
        if (!voters.includes(req.payload.sub.toString())) {
          voters.push(req.payload.sub);
          const update = [
            {
              param: "note",
              value: total,
            },
            {
              param: "noted_by",
              value: voters.join(","),
            },
          ];
          console.log(update);
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
              console.error(err);
              res.sendStatus(500);
            });
        }
      }
    })
    .catch((err) => {
      console.warn("ideaController:note:model.idea.find: ", err);
      res.sendStatus(500);
    });
};

const read = (req, res) => {
  const start = new Date();
  const id = parseInt(req.params.id, 10);
  models.idea
    .find(id)
    .then(([results]) => {
      if (results === null) {
        res.sendStatus(404);
      } else {
        const idea = { id, ...results[0] };
        models.comment
          .getLastsCommentsOfAnIdeaById(idea.id_user)
          .then((commentsResults) => {
            const comments = [
              commentsResults[0] !== null ? commentsResults[0][0] : [],
              commentsResults[1] !== null ? commentsResults[1][0] : [],
              commentsResults[2] !== null ? commentsResults[2][0] : [],
              commentsResults[3] !== null ? commentsResults[3][0] : [],
            ];
            models.author
              .find([idea.id_idea])
              .then((authorsResults) => {
                const authors =
                  authorsResults[0] != null ? authorsResults[0] : [];
                models.user
                  .getUsersFromIds(ideas, authors, comments)
                  .then(([users]) => {
                    console.info(
                      "Durée de traitement:  %dms",
                      new Date() - start
                    );
                    
                    res.json({ idea, coauthors, users, comments });
                  })
                  .catch((err) => {
                    console.warn(
                      "ideaController:model.user.getUsersFromIdeasAndCoauthorsAndComments: ",
                      err
                    );
                    res.sendStatus(500);
                  });
              })
              .catch((err) => {
                console.warn("ideaController:model.ideaCoauthor.find: ", err);
                res.sendStatus(500);
              });
          })
          .catch((err) => {
            console.error(
              "ideaControllers:model.comment.getFirstsCommentsOfAnIdeaById: ",
              err
            );
            res.sendStatus(500);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const edit = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const status = parseInt(req.body.status, 10);
    const update = [];
    if (req.body.name) {
      update.push({
        param: "name",
        value: req.body.name,
      });
    }
    if (req.body.description) {
      update.push({
        param: "description",
        value: req.body.description,
      });
    }
    if (req.body.problem) {
      update.push({
        param: "problem",
        value: req.body.problem,
      });
    }
    if (req.body.solution) {
      update.push({
        param: "solution",
        value: req.body.solution,
      });
    }
    if (req.body.gains) {
      update.push({
        param: "gains",
        value: req.body.gains,
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
      console.log(status);
      update.push({
        param: "status",
        value: status,
      });
    }
    if (req.body.categories) {
      models.ideaCategorie
        .delete(id)
        .then(() => {
          models.ideaCategorie
            .add(req.body.categories, id)
            .then(() => {})
            .catch((err) => {
              console.warn("ideaControllers:ideaCoauthor: ", err);
              res.sendStatus(500);
            });
        })
        .catch((err) => {
          console.warn("ideaControllers:ideaCategorie: ", err);
          res.sendStatus(500);
        });
    }
    if (req.body.coauthors) {
      models.ideaCoauthor
        .delete(id)
        .then(() => {
          models.ideaCoauthor
            .add(
              req.body.coauthors.split(",").filter((c) => c != "" && c != ","),
              id
            )
            .then(() => {})
            .catch((err) => {
              console.warn("ideaControllers:ideaCoauthor: ", err);
              res.sendStatus(500);
            });
        })
        .catch((err) => {
          console.warn("ideaControllers:ideaCategorie: ", err);
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
          console.error(err);
          res.sendStatus(500);
        });
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

/*  req.body = {
      name,
      description,
      problem,
      solution,
      gains,
      finished_at,
      status,
      user_id,
      organisation_id,
      categories
    }
*/
const add = (req, res) => {
  const idea = req.body;
  idea.user_id = req.payload.sub;
  idea.organisation_id = req.payload.organisation;
  idea.status = models.idea
    .insert(idea)
    .then(([result]) => {
      const id = result.insertId;
      models.ideaCategorie
        .add(req.body.categories, id)
        .then(() => {
          if (req.body.coauthors && req.body.coauthors.length) {
            models.ideaCoauthor
              .add(req.body.coauthors, id)
              .then(() => {
                console.log(id);
                res.status(201).json({ id });
              })
              .catch((err) => {
                console.error(err);
                res.sendStatus(500);
              });
          } else {
            res.status(201).json({ id });
          }
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const destroy = (req, res) => {
  const id = parseInt(req.params.id, 10);
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
  note,
};
