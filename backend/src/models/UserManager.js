const AbstractManager = require("./AbstractManager");

class UserManager extends AbstractManager {
  constructor() {
    super({ table: "user", id: "id_user" });
    this.join = {
      organisation: "organisation",
      team: "team",
    };
  }

  findAll(searchTerms, limit, offset) {
    const initialSql = `SELECT id_user, firstname, lastname, registration_number, mail, id_organisation, id_team, id_role FROM ${this.table}`;
    const initialSqlWithSearch = `SELECT u.id_user, u.firstname, u.lastname, u.registration_number, u.mail, u.id_organisation, u.id_team, u.id_role FROM ${this.table} AS u`;
    let countSql = `SELECT COUNT(*) AS total FROM ${this.table} AS u`;
    const details = ` INNER JOIN ${this.join.organisation} AS o ON u.id_organisation = o.id_organisation INNER JOIN ${this.join.team} AS t ON u.id_team = t.id_team`;
    let sql = initialSql;
    const sqlData = [];
    if (searchTerms && searchTerms.length) {
      sql = `${initialSqlWithSearch}${details} WHERE MATCH(u.firstname,u.lastname) AGAINST(? IN NATURAL LANGUAGE MODE) OR MATCH(o.name) AGAINST(? IN NATURAL LANGUAGE MODE) AND MATCH(t.name) AGAINST(? IN NATURAL LANGUAGE MODE)`;
      countSql = `${countSql} ${sql.replace(initialSqlWithSearch, "")}`;
      sqlData.push(searchTerms);
      sqlData.push(searchTerms);
      sqlData.push(searchTerms);
      sqlData.push(searchTerms);
      sqlData.push(searchTerms);
    }
    const totalData = [...sqlData];
    sqlData.push(limit);
    sqlData.push(offset);
    return [
      this.database.query(`${sql} LIMIT ${limit} OFFSET ${offset}`, sqlData),
      this.database.query(
        searchTerms && searchTerms.length
          ? countSql
          : sql.replace(initialSql, countSql),
        totalData
      ),
    ];
  }

  find(idUser) {
    return this.database.query(
      `SELECT firstname, lastname, registration_number, skills, mail, id_organisation, id_team, id_role, rgpd_agreement, mail_notification FROM ${this.table} WHERE id_user = ?`,
      [idUser]
    );
  }

  findSome(idUsers) {
    return this.database.query(
      `SELECT firstname, lastname, id_user, id_organisation, id_team FROM ${
        this.table
      } WHERE ${this.id} IN (${idUsers.join(",")})`
    );
  }

  findTeams(idTeams) {
    return this.database.query(
      `SELECT id_user, firstname, lastname, id_organisation, id_team, id_role FROM ${
        this.table
      } WHERE id_team IN (${idTeams.join(",")})`
    );
  }

  findManager(idTeam) {
    return this.database.query(
      `SELECT firstname, lastname, id_user, mail FROM ${this.table} WHERE id_role = 2 AND id_team = ?`,
      [idTeam]
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
      `INSERT INTO ${this.table} (firstname, lastname, mail, registration_number, id_organisation, id_team, id_role, password) VALUES (?,?,?,?,?,?,?,?)`,
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

  findAllBySkills(searchTerms, offset) {
    return [
      this.database.query(
        `SELECT id_user, firstname, lastname, mail, skills, id_organisation, id_team FROM ${this.table} WHERE skills LIKE ? LIMIT 20 OFFSET ?`,
        [`%${searchTerms}%`, offset]
      ),
      this.database.query(
        `SELECT COUNT(*) AS total FROM ${this.table} WHERE skills LIKE ?`,
        [`%${searchTerms}%`]
      ),
    ];
  }

  search(searchTerms) {
    const initialSql = `SELECT u.firstname, u.lastname, u.id_user, u.id_organisation, u.id_team FROM ${this.table} AS u INNER JOIN ${this.join.organisation} AS o ON u.id_organisation = o.id_organisation INNER JOIN ${this.join.team} AS t ON u.id_team = t.id_team`;
    const data = [];
    searchTerms.split(" ").forEach((term) => {
      data.push(`${term}`);
    });
    return this.database.query(
      `${searchTerms
        .split("s+")
        .reduce(
          (sql, _, i) =>
            `${sql} ${
              i === 0 ? "WHERE" : "OR"
            } (MATCH(u.firstname,u.lastname,o.name,t.name) AGAINST(? IN NATURAL LANGUAGE MODE))`,
          initialSql
        )} LIMIT 5`,
      data
    );
  }

  getUserByRegistrationNumber(registrationNumber) {
    return this.database.query(
      `SELECT password, id_user, firstname, lastname, id_organisation, id_team, id_role FROM ${this.table} WHERE registration_number = ?`,
      [registrationNumber]
    );
  }

  getUsersFromIds(idsUser) {
    return this.database.query(
      `SELECT firstname, lastname, id_organisation, id_team FROM ${this.table} WHERE id_user IN (?)`,
      [idsUser]
    );
  }
}

module.exports = UserManager;
