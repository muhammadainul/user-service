// USER TEMPORARY schema
module.exports = (sequelize, DataTypes) => {
    const User_temporary = sequelize.define('User_temporary', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        enabled: DataTypes.BOOLEAN,
        nip: DataTypes.STRING,
        nama_lengkap: DataTypes.STRING,
        email: DataTypes.STRING,
        telepon: DataTypes.STRING,
        alamat: DataTypes.TEXT,
        kewenangan_id: DataTypes.INTEGER,
        satker_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        // consumer_id: DataTypes.STRING,
        kode_satker: DataTypes.STRING,
        last_login: DataTypes.DATE
    },
    { freezeTableName: true }
    );

    return User_temporary;
}