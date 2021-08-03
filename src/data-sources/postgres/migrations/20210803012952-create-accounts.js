const tableName = 'Accounts';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true,
      },
      balance: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
      },
      holder_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      holder_document_number: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
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
  },

  down: (queryInterface) => queryInterface.dropTable(tableName),
};
