// Pegawai Schema
module.exports = (sequelize, DataTypes) => {
    const Pegawai = sequelize.define('Pegawai', {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            user_id: DataTypes.UUID,
            departemen: DataTypes.STRING,
            jabatan: DataTypes.STRING,
            next: DataTypes.BOOLEAN,
            order: DataTypes.INTEGER,
            level: DataTypes.INTEGER,
            type: DataTypes.STRING,
            kategori_id: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        { freezeTableName: true }
    );
    
    Pegawai.associate = function (models) {
        Pegawai.belongsTo(models.Users, {
            foreignKey: 'user_id',
            as: 'user'
        });
        models.Users.hasOne(Pegawai, {
            foreignKey: 'user_id',
            as: 'pegawai'
        });
    }
    return Pegawai;
};