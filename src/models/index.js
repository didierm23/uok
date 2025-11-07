// src/models/index.js
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

const models = {};

const files = fs.readdirSync(__dirname).filter(f => f !== 'index.js' && f.endsWith('.js'));

for (const file of files) {
  const modelFactory = require(path.join(__dirname, file));
  const model = modelFactory(sequelize);
  models[model.name] = model;
}

// If you have associations, define them here
Object.keys(models).forEach((name) => {
  if (typeof models[name].associate === 'function') {
    models[name].associate(models);
  }
});

module.exports = {
  sequelize,
  models
};
