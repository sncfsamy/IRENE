const AbstractManager = require("./AbstractManager");

class CategorieManager extends AbstractManager {
  constructor() {
    super({ table: "categorie", id: "id_categorie" });
    this.join = {
      userCategories: "user_categorie",
      idea: "idea",
      ideaCategorie: "idea_categorie",
    };
  }

  findAll(searchFilters, orderParams, limit, offset) {
    const initialSql = `SELECT DISTINCT c.${this.id},c.name,c.id_parent_categorie,(SELECT COUNT(*) AS ideas FROM ${this.join.ideaCategorie} AS ic WHERE ic.${this.id} = c.${this.id}) AS ideas,(SELECT COUNT(*) AS users FROM ${this.join.userCategories} AS uc WHERE uc.${this.id} = c.${this.id}) AS users`;
    const sqlData = [
      ...searchFilters.map(({ value, operator }) =>
        operator === "LIKE" ? `%${value}%` : value
      ),
      limit,
      offset,
    ];
    let query = searchFilters.reduce(
      (sql, { column, operator, value }, index) => {
        return !operator
          ? sql
          : `${sql} ${
              index === 0 ? "WHERE " : "AND "
            } ${column} ${operator} ${value}`;
      },
      `${initialSql} FROM ${this.table} AS c`
    );
    query += `${
      orderParams && orderParams.length
        ? orderParams.reduce(
            (orders, { column, order }, index) =>
              `${orders} ${index === 0 ? "ORDER BY" : ","} ${column} ${order}`,
            ""
          )
        : ` ORDER BY ${this.id} DESC`
    } LIMIT ? OFFSET ?`;
    return [
      this.database.query(query, sqlData),
      this.database.query(
        `SELECT COUNT(*) AS total ${query.replace(initialSql, "")}`,
        sqlData
      ),
    ];
  }

  getIdeaCategories(idIdea) {
    return this.database.query(
      `SELECT json_arrayagg(id_categorie) FROM idea_categorie WHERE id_idea = ?`,
      [idIdea]
    );
  }

  insert(categorie) {
    return this.database.query(
      `INSERT INTO ${this.table} (name, id_parent_categorie) VALUES (?, ?)`,
      [categorie.name, categorie.id_parent_categorie]
    );
  }

  update(update, id) {
    const initialSql = `UPDATE ${this.table}`;
    const data = [...update.map(({ value }) => value), id];
    return this.database.query(
      `${update.reduce(
        (sql, { column }, i) => `${sql} ${i === 0 ? "SET" : ","} ${column} = ?`,
        initialSql
      )} WHERE id_categorie = ?`,
      data
    );
  }
}

module.exports = CategorieManager;
