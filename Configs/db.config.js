const Sequelize = require("sequelize");
const sequelize = new Sequelize('certekup', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
}); const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
module.exports = db.sequelize; 