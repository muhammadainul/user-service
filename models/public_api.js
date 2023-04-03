// Public_api Schema
module.exports = (sequelize, DataTypes) => {
    const Public_api = sequelize.define('Public_api',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            client: DataTypes.STRING,
            consumer_id: DataTypes.STRING,
            token: DataTypes.TEXT,
            client_id: DataTypes.STRING,
            client_secret: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        { freezeTableName: true }
    );
    
    return Public_api;
};