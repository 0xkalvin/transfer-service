const { DataTypes } = require('sequelize');
const crypto = require('crypto');

const attributes = {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: crypto.randomUUID,
  },
  sourceAccountId: {
    field: 'source_account_id',
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetAccountId: {
    field: 'target_account_id',
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
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    field: 'updated_at',
    type: DataTypes.DATE,
    allowNull: false,
  },
};

const options = {
  indexes: [
    { fields: ['source_account_id'] },
    { fields: ['target_account_id'] },
    { fields: ['status'] },
  ],
  tableName: 'Transfers',
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
