module.exports = {
    up: async (queryInterface, Sequelize) =>
        await queryInterface.createTable("Log_integration", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            last_sync: {
                type: Sequelize.DATE,
                allowNull: false
            },
            log: {
                type: Sequelize.STRING,
                allowNull: true
            }
        }),
    down: async (queryInterface /* , Sequelize */) => await queryInterface.dropTable("Log_integration"),
  }