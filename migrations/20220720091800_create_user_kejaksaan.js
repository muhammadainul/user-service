'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('User_kejaksaan', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            nip: Sequelize.STRING,
            full_name: Sequelize.STRING,
            username: Sequelize.STRING,
            email: Sequelize.STRING,
            password: Sequelize.STRING,
            satker_id: Sequelize.INTEGER,
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('User_kejaksaan');
    }
};
