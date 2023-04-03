module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                'Public_api',
                'client_id',
                {
                    type: Sequelize.STRING,
                    allowNull: true
                }
            ),
            queryInterface.addColumn(
                'Public_api',
                'client_secret',
                {
                    type: Sequelize.STRING,
                    allowNull: true
                }
            ),
        ])
    },
    down: async (queryInterface , Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                'Public_api',
                'client_id',
                {
                    type: Sequelize.STRING,
                    allowNull: true
                }
            ),
            queryInterface.addColumn(
                'Public_api',
                'client_secret',
                {
                    type: Sequelize.STRING,
                    allowNull: true
                }
            ),
        ])
    }
}