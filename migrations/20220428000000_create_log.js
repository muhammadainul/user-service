'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Logs', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true
            },
            ip_address: Sequelize.STRING,
            browser: Sequelize.STRING,
            browser_version: Sequelize.STRING,
            os: Sequelize.STRING,
            logtime: { 
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('now')
            },
            logdetail: Sequelize.STRING,
            user_id: {
                type: Sequelize.UUID,
                allowNull: true
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Logs');
    }
};
