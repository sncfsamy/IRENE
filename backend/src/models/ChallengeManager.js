const AbstractManager = require("./AbstractManager");

class ChallengeManager extends AbstractManager {
  constructor() {
    super({ table: "challenge", id: "id_challenge" });
    this.join = {
      challenger: "challenger",
      idea: "idea",
      asset: "asset",
    };
  }

  find(idChallenge) {
    return this.database.query(
      `SELECT c.${this.id},c.name,c.description,UNIX_TIMESTAMP(c.started_at) AS started_at,UNIX_TIMESTAMP(c.expired_at) AS expired_at,c.id_organisation,(SELECT JSON_OBJECT('file_name', a.file_name, 'id_asset', a.id_asset) FROM ${this.join.asset} AS a WHERE a.${this.id} = c.${this.id} LIMIT 1) AS poster,(SELECT json_arrayagg(JSON_OBJECT('id_idea', ci.id_idea,'status', i.status, 'name', i.name, '${this.id}', ci.${this.id}, 'selected', ci.selected ,'winner', ci.winner,'authors',(SELECT json_arrayagg(JSON_OBJECT('id_idea', a.id_idea, 'id_user', u.id_user, 'firstname', u.firstname, 'lastname', u.lastname, 'is_author', a.is_author)) FROM author AS a INNER JOIN user AS u ON a.id_user = u.id_user WHERE a.id_idea = ci.id_idea))) FROM ${this.join.challenger} AS ci INNER JOIN ${this.join.idea} AS i ON ci.id_idea = i.id_idea WHERE ci.${this.id} = c.${this.id}) AS challengers FROM ${this.table} AS c WHERE c.${this.id} = ?`,
      [idChallenge]
    );
  }

  findAll(limit, orderBy, order, organisations, full) {
    return this.database.query(
      `SELECT c.${this.id},c.name,${
        full
          ? "c.description,UNIX_TIMESTAMP(c.started_at) AS started_at,UNIX_TIMESTAMP(c.expired_at) AS expired_at,c.id_organisation,"
          : ""
      }(SELECT JSON_OBJECT('file_name', a.file_name${
        full ? ", 'id_asset', a.id_asset" : ""
      }) FROM ${this.join.asset} AS a WHERE a.${this.id} = c.${
        this.id
      } LIMIT 1) AS poster,(SELECT json_arrayagg(JSON_OBJECT('id_idea', ci.id_idea, 'name', i.name, '${
        this.id
      }', ci.${this.id}, 'selected', ci.selected ,'winner', ci.winner${
        full
          ? ",'authors',(SELECT json_arrayagg(JSON_OBJECT('id_idea', a.id_idea, 'id_user', u.id_user, 'firstname', u.firstname, 'lastname', u.lastname, 'is_author', a.is_author)) FROM author AS a INNER JOIN user AS u ON a.id_user = u.id_user WHERE a.id_idea = ci.id_idea)"
          : ""
      })) FROM ${this.join.challenger} AS ci INNER JOIN ${
        this.join.idea
      } AS i ON ci.id_idea = i.id_idea WHERE ci.${this.id} = c.${
        this.id
      }) AS challengers FROM ${this.table} AS c ${
        organisations && organisations.length
          ? `WHERE (c.id_organisation IN (${organisations.join(
              ","
            )}) OR c.id_organisation IS NULL)`
          : ""
      } ORDER BY ${orderBy ?? "c.expired_at"} ${
        order === 0 ? "DESC" : "ASC"
      } LIMIT ${limit ?? 20}`
    );
  }

  insert(challenge) {
    return this.database.query(
      `INSERT INTO ${this.table} (name, description, started_at, expired_at, id_organisation) VALUES (?,?,FROM_UNIXTIME(?),FROM_UNIXTIME(?),?)`,
      [
        challenge.name,
        challenge.description,
        challenge.started_at,
        challenge.expired_at,
        challenge.id_organisation,
      ]
    );
  }

  update(challengeData, idChallenge) {
    const initialSql = `UPDATE ${this.table}`;
    const sqlData = [...challengeData.map(({ value }) => value), idChallenge];
    return this.database.query(
      `${challengeData.reduce(
        (sql, { column }, i) =>
          `${sql} ${i === 0 ? "SET" : ","} ${column} = ${
            column.includes("_at") ? "FROM_UNIXTIME(?)" : "?"
          }`,
        initialSql
      )} WHERE id_challenge = ?`,
      sqlData
    );
  }
}

module.exports = ChallengeManager;
