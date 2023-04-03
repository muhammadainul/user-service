module.exports = {
    up: async (queryInterface, Sequelize) =>
        await queryInterface.addColumn(
            'Kategori',
            'akronim',
            {
                type: Sequelize.STRING,
                allowNull: true
            }
        ),  
    down: async (queryInterface , Sequelize) => 
        await queryInterface.addColumn(
            'Kategori',
            'akronim',
            {
                type: Sequelize.STRING,
                allowNull: true
            }
    ),  
    }