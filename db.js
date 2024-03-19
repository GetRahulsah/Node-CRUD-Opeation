const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'postgresql',
    username: 'postgres',
    password: 'root',
    database: 'CRUD',
    host: 'localhost',
});

module.exports = sequelize;
