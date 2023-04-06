require("dotenv").config();

const fs = require("fs");
const mysql = require("mysql2/promise");

const migrate = async () => {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  await connection.query(`drop database if exists ${DB_NAME}`);
  await connection.query(`create database ${DB_NAME}`);
  await connection.query(`use ${DB_NAME}`);

  const sql = fs.readFileSync("./database.sql", "utf8");
  const fakeData = fs.readFileSync("./fake_data_base.sql", "utf8");
  const fakeUserData = fs.readFileSync("./fake_data_user.sql", "utf8");
  const fakeIdeaData = fs.readFileSync("./fake_data_idea.sql", "utf8");
  const fakeAssetData = fs.readFileSync("./fake_data_asset.sql", "utf8");
  // const fakeCommentData = fs.readFileSync("./fake_data_comment.sql", "utf8");
  try {
    await connection.query(sql);
    await connection.query(fakeData);
    await connection.query(fakeUserData);
    await connection.query(fakeIdeaData);
    await connection.query(fakeAssetData);
    // await connection.query(fakeCommentData);
  } catch (error) {
    console.error(error);
  }
  connection.end();
};

try {
  migrate();
} catch (err) {
  console.error(err);
}
