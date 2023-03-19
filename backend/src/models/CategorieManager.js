const AbstractManager = require("./AbstractManager");

class CategorieManager extends AbstractManager {
  constructor() {
    super({ table: "categorie" });
  }

  getIdeaCategories(id_idea) {
    return this.database.query(
      `SELECT json_arrayagg(id_categorie) FROM idea_categorie WHERE id_idea = ?`,
      [id_idea]
    );
  }

  insert(categorie) {
    return this.database.query(
      `insert into ${this.table} (name, id_parent_categorie) values (?, ?)`,
      [categorie.name, categorie.id_parent_categorie]
    );
  }

  update(categorie) {
    return this.database.query(
      `update ${this.table} set name = ?, id_parent_categorie = ? where id = ?`,
      [categorie.name, categorie.id_parent_categorie, categorie.id]
    );
  }
}

module.exports = CategorieManager;
