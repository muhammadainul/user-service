// LOG INTEGRATION schema
module.exports = (sequelize, DataTypes) => {
    const Log_integration = sequelize.define('Log_integration', {
		id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
		last_sync: DataTypes.DATE,
		log: DataTypes.STRING
    },
    { 
        timestamps: false,
        freezeTableName: true
    }
    );

    return Log_integration;
}