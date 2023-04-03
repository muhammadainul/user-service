'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Gambar', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            originalname: Sequelize.STRING,
            encoding: Sequelize.STRING,
            mimetype: Sequelize.STRING,
            destination: Sequelize.STRING,
            filename: Sequelize.STRING,
            path: Sequelize.STRING,
            size: Sequelize.STRING,
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
        await queryInterface.dropTable('Gambar');
    }
};
