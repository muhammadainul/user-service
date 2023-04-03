module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Public_api', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            client: {
                type: Sequelize.STRING,
                allowNull: true
            },
            consumer_id: {
                type: Sequelize.STRING,
                allowNull: true
            },
            token: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Public_api');
    }
};
