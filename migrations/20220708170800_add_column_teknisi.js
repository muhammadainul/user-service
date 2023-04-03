module.exports = {
    up: async (queryInterface, Sequelize) =>
        await queryInterface.addColumn(
            'Teknisi',
            'kategori_id',
            {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Kategori',
                    key: 'id'
                }
            }
        ),  
    down: async (queryInterface , Sequelize) => 
        await queryInterface.addColumn(
            'Teknisi',
            'kategori_id',
            {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Kategori',
                    key: 'id'
                }
            }
    ),  
    }