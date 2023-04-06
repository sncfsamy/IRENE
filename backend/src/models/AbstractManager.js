class AbstractManager {
  constructor({ table, id = "id" }) {
    this.table = table;
    this.id = id;
  }

  find(id) {
    return this.database.query(
      `SELECT * FROM  ${this.table} WHERE ${this.id} = ?`,
      [id]
    );
  }

  findAll() {
    return this.database.query(`SELECT * FROM  ${this.table}`);
  }

  delete(id) {
    return this.database.query(
      `DELETE FROM ${this.table} WHERE ${this.id} = ?`,
      [id]
    );
  }

  deleteIds(ids) {
    return this.database.query(
      `DELETE FROM ${this.table} WHERE ${this.id} IN (${ids.join(",")})`
    );
  }

  setDatabase(database) {
    this.database = database;
  }
}

module.exports = AbstractManager;
