const AbstractManager = require("./AbstractManager");

class ItemManager extends AbstractManager {
  constructor() {
    super({ table: "idea" });
    this.viewers = {};
  }

  find(id,payload) {
    const limiteTime = new Date();
    limiteTime.setDate(limiteTime.getDate() - 1);
    if (!this.viewers[id]) this.viewers[id] = {};
    if (!this.viewers[id][payload.sub] || this.viewers[id][payload.sub] <= limiteTime) {
      this.viewers[id][payload.sub] = new Date();
      this.database.query(
        `UPDATE ${this.table} SET views = views+1 WHERE id = ?`,
        [id]
      );
    }
    return this.database.query(
      `SELECT i.*,tmp.categories FROM idea AS i, (SELECT json_arrayagg(id_categorie) AS categories FROM idea_categorie WHERE id_idea = ?) AS tmp WHERE id_idea = ?`,
      [id,id]
    );
  }

  findAll(searchFilters, orderParams, limit, offset) {
    const initialSql = `SELECT * FROM ${this.table} `;
    const sqlData = [
      ...searchFilters
        .filter((filter) => filter.operator !== "IN")
        .map(({ value }) => value),
      limit,
      offset,
    ];
    let sql = searchFilters.reduce(
      (sql, { column, operator, value }, index) => {
        let valuePattern = "";
        switch (operator) {
          case "IN":
            const data = value
              .split(",")
              .map((d) => parseInt(d, 10))
              .filter((d) => !Number.isNaN(d));
            valuePattern = `(${data.join(",")}) `;
            break;
          case "BETWEEN":
            valuePattern = "FROM_UNIXTIME(?) AND FROM_UNIXTIME(?) ";
            break;
          case "AGAINST(":
            valuePattern = "? IN BOOLEAN MODE) ";
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
      initialSql
    );
    sql += `${
      orderParams
        ? orderParams.reduce(
            (orders, { column, order }, index) =>
              `${orders} ${index === 0 ? "ORDER BY" : ","} ${column} ${order}`,
            ""
          )
        : " ORDER BY created_at desc"
    } LIMIT ? OFFSET ?`;
    console.log(sql,sqlData)
    return [
      this.database.query(sql, sqlData),
      this.database.query(
        `SELECT COUNT(*) AS total FROM ${this.table} ${sql.replace(
          initialSql,
          ""
        )}`,
        sqlData
      ),
    ];
  }

  insert(idea) {
    return this.database.query(
      `INSERT INTO ${
        this.table
      } (name, description, problem, solution, gains, finished_at, status, user_id, organisation_id) VALUES (?,?,?,?,?,${
        idea.finished_at ? "CURRENT_TIMESTAMP" : "NULL"
      },?,?,?)`,
      [
        idea.name,
        idea.description,
        idea.problem,
        idea.solution,
        idea.gains,
        idea.status,
        idea.user_id,
        idea.organisation_id,
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
      )} WHERE id = ?`,
      [
        ...update
          .filter(({ param }) => !param.includes("_at"))
          .map(({ value }) => value),
        id,
      ]
    );
  }

  destroy(id) {
    return this.database.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
  }
}

module.exports = ItemManager;
