const AbstractManager = require("./AbstractManager");

class UserManager extends AbstractManager {
  constructor() {
    super({ table: "user" });
  }

  findAll() {
    return this.database.query(`
    SELECT id_user, firstname, lastname, registration_number, mail, id_organisation, id_team, id_role FROM ${this.table}`);
  }

  find(id) {
    return this.database.query(
      `SELECT firstname, lastname, registration_number, skills, mail, id_organisation, id_team, id_role, rgpd_agreement, mail_notification FROM ${this.table} WHERE id_user = ?`,
      [id]
    );
  }

  update(update, id) {
    const initialSql = `UPDATE ${this.table}`;
    return this.database.query(
      `${update.reduce(
        (sql, { column }, index) =>
          `${sql} ${index === 0 ? " SET" : ", "} ${column} = ?`,
        initialSql
      )} WHERE id_user = ?`,
      [...update.map(({ value }) => value), id]
    );
  }

  insert(user) {
    return this.database.query(
      `INSERT INTO ${this.table} (firstname, lastname, mail, registration_number, id_organisation, id_team, id_role, password) VALLUES (?,?,?,?,?,?,?)`,
      [
        user.firstname,
        user.lastname,
        user.mail,
        user.registration_number,
        user.id_organisation,
        user.id_team,
        user.id_role,
        user.password,
      ]
    );
  }

  findAllBySkills(searchTerms) {
    return this.database.query(
      `
    SELECT id_user, firstname, lastname, mail, skills, id_organisation, id_team FROM ${this.table} WHERE skills LIKE ?`,
      [`%${searchTerms}%`]
    );
  }

  search(searchTerms) {
    const initialSql = `SELECT firstname, lastname, id_user, id_organisation FROM ${this.table}`;
    const data = [];
    searchTerms.forEach((term) => {
      data.push(`%${term}%`);
      data.push(`%${term}%`);
    });
    return this.database.query(
      searchTerms.reduce(
        (sql, _, i) =>
          `${sql} ${
            i === 0 ? "WHERE" : "OR"
          } firstname LIKE ? OR lastname LIKE ?`,
        initialSql
      ),
      data
    );
  }

  getUserByRegistrationNumber(registrationNumber) {
    return this.database.query(
      `SELECT password, id_user, firstname, lastname, id_organisation, id_team, id_role FROM ${this.table} WHERE registration_number = ?`,
      [registrationNumber]
    );
  }

  getUsersFromIds(ids_users) {
    return this.database.query(
      `SELECT firstname, lastname, id_organisation, id_team FROM ${this.table} WHERE id_user IN (?)`,
      [ids_users]
    );
  }
}

module.exports = UserManager;
