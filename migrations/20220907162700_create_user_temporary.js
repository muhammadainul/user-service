module.exports = {
    up: async (queryInterface, Sequelize) =>
        await queryInterface.createTable("User_temporary", {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            username: {
                type: Sequelize.STRING,
                allowNull: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true
            },
            enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true
            },
            nip: {
                type: Sequelize.STRING,
                allowNull: true
            },
            nama_lengkap: {
                type: Sequelize.STRING,
                allowNull: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            alamat: Sequelize.TEXT,
            telepon: Sequelize.STRING,
            satker_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Satker',
                    key: 'id'
                }
            },
            kewenangan_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Kewenangan',
                    key: 'id'
                }
            },
            last_login: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }),
    down: async (queryInterface /* , Sequelize */) => await queryInterface.dropTable("User_temporary"),
  }