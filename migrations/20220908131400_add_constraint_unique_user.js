module.exports = {
    up: async (queryInterface, Sequelize) =>
    await queryInterface.addConstraint(
            'Users',
            {
                fields: ['email'],
                type: 'unique'
            }
        ),  
    down: async (queryInterface , Sequelize) => 
        await queryInterface.addConstraint(
            'Users',
            {
                fields: ['email'],
                type: 'unique'
            }
    ),  
}