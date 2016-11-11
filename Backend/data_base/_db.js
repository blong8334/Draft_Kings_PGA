const Sequelize = require('sequelize');

const db = new Sequelize('postgres://localhost:5432/mister_drifter', {
    logging: false
});

module.exports = db;
