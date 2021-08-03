const { DataTypes } = require('sequelize');
const crypto = require('crypto');

const attributes = {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: crypto.randomUUID,
  },
  balance: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  holder_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  holder_document_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
};

const options = {
  tableName: 'Accounts',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
};

const create = (database) => database.define(
  'Account',
  attributes,
  options,
);

module.exports = {
  create,
};
