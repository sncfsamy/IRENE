const AbstractManager = require("./AbstractManager");

class IdeaCategorieManager extends AbstractManager {
  constructor() {
    super({ table: "idea_categorie", id: "id_idea" });
  }

  find(idIdea) {
    return this.database.query(
      `SELECT id_categorie FROM  ${this.table} WHERE ${this.id} = ?`,
      [idIdea]
    );
  }

  findAll(idsIdeas) {
    return this.database.query(
      `SELECT * FROM  ${this.table} WHERE ${this.id} IN (?)`,
      [idsIdeas]
    );
  }

  findIdeaIdsByCategoriesIds(categoriesIds) {
    const data = categoriesIds
      .split(",")
      .map((d) => parseInt(d, 10))
      .filter((d) => !Number.isNaN(d));
    return this.database.query(
      `SELECT id_idea FROM idea_categorie WHERE id_categorie IN (${data.join(
        ","
      )})`,
      []
    );
  }

  add(categories, data) {
    const initialSql = `INSERT INTO ${this.table}`;
    const query = categories.reduce(
      (sql, _, index) =>
        `${sql} ${
          index === 0 ? "(id_categorie, id_idea) VALUES " : ", "
        } (?, ?)`,
      initialSql
    );
    return this.database.query(query, data);
  }
}

module.exports = IdeaCategorieManager;
