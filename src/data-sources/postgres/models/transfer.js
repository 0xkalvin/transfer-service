const { DataTypes } = require('sequelize');
const crypto = require('crypto');

const attributes = {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: crypto.randomUUID,
  },
  source_account_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  target_account_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    allowNull: false,
    values: ['processing', 'settled', 'failed'],
    defaultValue: 'processing',
  },
};

const options = {
  indexes: [
    { fields: ['source_account_id'] },
    { fields: ['target_account_id'] },
    { fields: ['status'] },
  ],
  tableName: 'Transfers',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
};

const create = (database) => database.define(
  'Transfer',
  attributes,
  options,
);

module.exports = {
  create,
};
