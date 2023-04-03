// USER_KEJAKSAAN schema
module.exports = (sequelize, DataTypes) => {
    const User_kejaksaan = sequelize.define('User_kejaksaan', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
		nip: DataTypes.STRING,
		full_name: DataTypes.STRING,
		username: DataTypes.STRING,
		email: DataTypes.STRING,
		password: DataTypes.STRING,
		satker_id: DataTypes.INTEGER
    },
    { freezeTableName: true }
    );

    return User_kejaksaan;
}