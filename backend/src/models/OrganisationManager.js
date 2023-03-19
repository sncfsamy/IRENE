const AbstractManager = require("./AbstractManager");

class OrganisationManager extends AbstractManager {
  constructor() {
    super({ table: "organisation" });
  }

  insert(organisation) {
    return this.database.query(`insert into ${this.table} (name) values (?)`, [
      organisation.name,
    ]);
  }

  update(organisation) {
    return this.database.query(
      `update ${this.table} set name = ? where id = ?`,
      [organisation.name, organisation.id]
    );
  }
}

module.exports = OrganisationManager;
