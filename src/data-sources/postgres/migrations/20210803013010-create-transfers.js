const tableName = 'Transfers';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true,
      },
      source_account_id: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      target_account_id: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
      },
      status: {
        type: Sequelize.DataTypes.ENUM,
        values: ['processing', 'settled', 'failed'],
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      tableName,
      ['source_account_id'],
      {
        concurrently: true,
      },
    );

    await queryInterface.addIndex(
      tableName,
      ['target_account_id'],
      {
        concurrently: true,
      },
    );

    await queryInterface.addIndex(
      tableName,
      ['status'],
      {
        concurrently: true,
      },
    );
  },

  down: (queryInterface) => queryInterface.dropTable(tableName),
};
