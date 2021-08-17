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
  holderName: {
    field: 'holder_name',
    type: DataTypes.STRING,
    allowNull: true,
  },
  holderDocumentNumber: {
    field: 'holder_document_number',
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'Accounts',
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
