const AbstractManager = require("./AbstractManager");

class IdeaManager extends AbstractManager {
  constructor() {
    super({ table: "idea", id: "id_idea" });
    this.join = { author: "author", asset: "asset" };
    this.viewers = {};
  }

  find(id, payload) {
    const limitTime = new Date();
    limitTime.setDate(limitTime.getDate() - 1);
    if (!this.viewers[id]) this.viewers[id] = {};
    if (
      !this.viewers[id][payload.sub] ||
      this.viewers[id][payload.sub] <= limitTime
    ) {
      this.viewers[id][payload.sub] = new Date();
      this.database.query(
        `UPDATE ${this.table} SET views = views+1 WHERE id_idea = ?`,
        [id]
      );
    }
    return this.database.query(
      `SELECT i.*,n.id_user,(SELECT json_arrayagg(id_categorie) AS categories FROM idea_categorie AS c WHERE c.id_idea = i.id_idea) AS categories FROM idea AS i LEFT JOIN note AS n ON i.id_idea = n.id_idea AND n.id_user = ? WHERE i.id_idea = ?`,
      [payload.sub, id]
    );
  }

  findAll(searchFilters, orderParams, limit, offset) {
    const initialSql = searchFilters.find((sf) => sf.column === "a.id_user")
      ? `SELECT DISTINCT i.id_idea,i.name,i.description,i.note,i.noted_by,i.id_organisation,i.status,i.views,i.created_at,i.finished_at,i.manager_validated_at,i.ambassador_validated_at,(SELECT JSON_OBJECT('file_name', asset.file_name) FROM ${this.join.asset} AS asset WHERE asset.field = 0 AND asset.${this.id} = i.id_idea) AS poster`
      : `SELECT i.id_idea,i.name,i.description,i.note,i.noted_by,i.id_organisation,i.views,i.status,i.created_at,i.finished_at,i.manager_validated_at,i.ambassador_validated_at,(SELECT JSON_OBJECT('file_name', asset.file_name) FROM ${this.join.asset} AS asset WHERE asset.field = 0 AND asset.${this.id} = i.id_idea) AS poster `;
    const sqlData = [
      ...searchFilters
        .filter((filter) => filter.operator !== "IN")
        .map(({ value }) => value),
      limit,
      offset,
    ];
    let query = searchFilters.reduce(
      (sql, { column, operator, value }, index) => {
        let valuePattern = "";
        switch (operator) {
          case "IN":
            valuePattern = `(${value
              .split(",")
              .map((d) => parseInt(d, 10))
              .filter((d) => !Number.isNaN(d))
              .join(",")})`;
            break;
          case "BETWEEN":
            valuePattern = "FROM_UNIXTIME(?) AND FROM_UNIXTIME(?)";
            break;
          case "AGAINST(":
            valuePattern = "? IN NATURAL LANGUAGE MODE)";
            break;
          default:
            valuePattern = "?";
        }
        return !operator
          ? sql
          : `${sql} ${
              index === 0 ? "WHERE " : "AND "
            } ${column} ${operator} ${valuePattern}`;
      },
      initialSql +
        (searchFilters.find((sf) => sf.column === "a.id_user")
          ? ` FROM ${this.join.author} AS a JOIN ${this.table} AS i ON i.id_idea = a.id_idea`
          : ` FROM  ${this.table} AS i`)
    );

    query += `${
      orderParams && orderParams.length
        ? orderParams.reduce(
            (orders, { column, order }, index) =>
              `${orders} ${index === 0 ? "ORDER BY" : ","} ${column} ${order}`,
            ""
          )
        : " ORDER BY created_at DESC"
    }`;

    return [
      this.database.query(`${query}  LIMIT ? OFFSET ?`, sqlData),
      this.database.query(
        `SELECT COUNT(*) AS total ${query.replace(initialSql, "")}`,
        sqlData
      ),
    ];
  }

  insert(idea) {
    return this.database.query(
      `INSERT INTO ${
        this.table
      } (name, description, problem, solution, gains, finished_at, status, id_organisation) VALUES (?,?,?,?,?,${
        idea.finished_at ? "CURRENT_TIMESTAMP" : "NULL"
      },?,?)`,
      [
        idea.name,
        idea.description,
        idea.problem,
        idea.solution,
        idea.gains,
        idea.status,
        idea.id_organisation,
      ]
    );
  }

  update(id, update) {
    const initialSql = `UPDATE ${this.table}`;
    return this.database.query(
      `${update.reduce(
        (sql, { param }, index) =>
          `${sql} ${index === 0 ? "SET" : ","} ${param} = ${
            param.includes("_at") ? "CURRENT_TIMESTAMP" : "?"
          }`,
        initialSql
      )} WHERE id_idea = ?`,
      [
        ...update
          .filter(({ param }) => !param.includes("_at"))
          .map(({ value }) => value),
        id,
      ]
    );
  }
}

module.exports = IdeaManager;
