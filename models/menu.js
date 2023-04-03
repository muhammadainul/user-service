// Menu schema
module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define('Menu',
        {
            kewenangan_id: DataTypes.INTEGER,
            menu: DataTypes.ARRAY(DataTypes.STRING)
        },
        { freezeTableName: true }
    );

    return Menu;  
};