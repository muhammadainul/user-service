// Token schema
module.exports = (sequelize, DataTypes) => {
    const Token = sequelize.define('Token', {
		token: DataTypes.TEXT
    },
    { freezeTableName: true }
    );

    return Token;
}