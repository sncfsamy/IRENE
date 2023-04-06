const AbstractManager = require("./AbstractManager");

class UserCategorieManager extends AbstractManager {
  constructor() {
    super({ table: "user_categorie", id: "id_user" });
  }

  add(idUser, idsCategorie) {
    const data = [];
    const query = idsCategorie.reduce(
      (sql, _, index) =>
        `${sql} ${index === 0 ? "(id_user,id_categorie) VALUES" : ","} (?, ?)`,
      `INSERT INTO ${this.table}`
    );
    idsCategorie.forEach((categorie) => {
      data.push(idUser);
      data.push(categorie);
    });
    return this.database.query(query, data);
  }
}

module.exports = UserCategorieManager;
