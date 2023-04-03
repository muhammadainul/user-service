module.exports = {
    up: async (queryInterface, Sequelize) =>
        await queryInterface.addColumn(
            'Pegawai',
            'type',
            {
                type: Sequelize.STRING,
                allowNull: true
            }
        ),  
    down: async (queryInterface , Sequelize) => 
        await queryInterface.addColumn(
            'Pegawai',
            'type',
            {
                type: Sequelize.STRING,
                allowNull: true
            }
    ),  
    }