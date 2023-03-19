const AbstractManager = require("./AbstractManager");

class IdeaCategorieManager extends AbstractManager {
  constructor() {
    super({ table: "idea_categorie" });
  }

  find(idIdea) {
    return this.database.query(
      `select categorie_id from  ${this.table} where idea_id = ?`,
      [idIdea]
    );
  }

  findAll(idsIdeas) {
    return this.database.query(
      `select * from  ${this.table} where idea_id in (?)`,
      [idsIdeas]
    );
  }

  findIdeaIdsByCategoriesIds(categoriesIds) {
    const data = categoriesIds
      .split(",")
      .map((d) => parseInt(d, 10))
      .filter((d) => !Number.isNaN(d));
    return this.database.query(
      `select idea_id from idea_categorie where categorie_id in (${data.join(",")})`,
      []
    );
  }

  delete(idIdea) {
    return this.database.query(`delete from ${this.table} where idea_id = ?`, [
      idIdea,
    ]);
  }

  add(categories, idIdea) {
    const initialSql = `insert into ${this.table}`;
    const data = [];
    for (let i = 0; i < categories.length; i += 1) {
      data.push(categories[i]);
      data.push(idIdea);
    }
    const query = categories.reduce(
      (sql, _, index) =>
        `${sql} ${
          index === 0 ? "(categorie_id, idea_id) values " : ", "
        } (?, ?)`,
      initialSql
    );
    return this.database.query(query, data);
  }
}

module.exports = IdeaCategorieManager;
