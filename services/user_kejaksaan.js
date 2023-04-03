const debug = require('debug');
const log = debug('user-service:services:');

const { 
    // Users,
    Satker,
    User_kejaksaan, 
    User_temporary,
    Log_integration,
    sequelize 
} = require('../models');
const { Op, QueryTypes } = require('sequelize');

const jwt = require('jsonwebtoken');
const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');
const { isEmpty, toString } = require('lodash');
const moment = require('moment');
const { v4: uuidv } = require('uuid');

const { hashPassword } = require('../helpers/password');
const { Get, Post } = require('../helpers/helpers');

async function Sync (userKejaksaanData, user) {
    const { sync = true } = userKejaksaanData;
    log('[User Kejaksaan] Sync', { userKejaksaanData, user });
    try {
        const checkTemporary = await User_temporary.findAll({ raw: true });

        const access_token = jwt.sign({ access: true }, config.myConfig.sessionSecret, {});
        const headers = { simandesk_token: access_token };

        const result = await Get({
            url: config.myConfig.cloud_url + 'user_integration/v1/get',
            headers,
            body: {}
        });

        if (sync == true) {
            if (isEmpty(checkTemporary)) {
                for (let i of result.data) {
                    await User_temporary.create({
                        username: i.username,
                        nama_lengkap: i.full_name,
                        email: i.email,
                        password: await hashPassword('coba'),
                        kode_satker: i.kode_satker
                    });
                }
            } else {
                await User_temporary.destroy({ where: {} });

                for (let i of result.data) {
                    await User_temporary.create({
                        username: i.username,
                        nama_lengkap: i.full_name,
                        email: i.email,
                        password: await hashPassword('coba'),
                        kode_satker: i.kode_satker
                    });
                }
            }

            let created;
            const userTemporary = await User_temporary.findAll({ raw: true });
            for (let i of userTemporary) {
                const checkSatker = await Satker.findOne({
                    where: { kode_satker: i.kode_satker },
                    raw: true
                });

                const consumer = await Post({
                    url: config.myConfig.api_gateway_admin + 'consumers',
                    body: { custom_id: toString(i.id) }
                });

                created = await sequelize.query(
                    `INSERT INTO "Users" (id, username, password, nama_lengkap, email, satker_id, consumer_id, 
                        kewenangan_id, "createdAt", "updatedAt")
                    VALUES ('${uuidv()}', '${i.username}', '${i.password}', '${i.nama_lengkap}', '${i.email}', 
                        ${checkSatker.id}, '${consumer.id}', 6, '${moment().format()}', '${moment().format()}') 
                    ON CONFLICT (email) DO NOTHING
                    `,
                    { type: QueryTypes.UPDATE }
                );
            }
            
            const logIntegration = await Log_integration.findOne({ raw: true });
            (!logIntegration) 
                ? 
                await Log_integration.create({
                    last_sync: moment().format(),
                    log: `${created[1]} user telah diperbaharui.`
                })
                :
                await Log_integration.update({
                    last_sync: moment().format(),
                    log: `${created[1]} user telah diperbaharui.`
                },
                { where: { id: logIntegration.id } }
                );

            return {
                message: `Sinkronisasi data berhasil pada ${moment().locale('id').format('D MMMM YYYY, HH:mm:ss')}`,
                data: `${created[1]} user telah diperbaharui.`
            }
        } else {
            return { message: 'Gagal sinkronisasi data. Silahkan coba kembali.' };
        }
    } catch (error) {
        return error;
    }
}

async function GetLog () {
    log('[User Kejaksaan] Get Log Integration');
    try {
        let logData = [];
        const data = await Log_integration.findAll({ raw: true });
        for (let i of data) {
            logData.push({
                last_sync: moment(i.last_sync).locale('id').format('D MMMM YYYY, HH:mm:ss'),
                log: i.log
            });
        }

        return logData[0];
    } catch (error) {
        return error;
    }
}

async function GetUser (user) {
    log('[User Kejaksaan] Get', user);
    try {
        const data = await User_kejaksaan.findAll({ raw: true });

        return data;
    } catch (error) {
        return error;
    }
}

async function GetById (user_kejaksaan_id, user) {
    log('[User Kejaksaan] GetById', { user_kejaksaan_id, user });
    try {
        const data = await User_kejaksaan.findOne({
            where: { id: user_kejaksaan_id },
            raw: true
        });
        if (!data) throw { error: 'Data tidak tersedia.' };

        return data;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (userKejaksaanData, user) {
    const { 
        draw, 
        // order, 
        start, 
        length, 
        // search,
        nip,
        full_name,
        username,
        email,
        urutan 
    } = userKejaksaanData;
    log('[User Kejaksaan] GetDatatables', { userKejaksaanData, user });
    try {
        let whereByNip;
        if (nip !== '') {
            whereByNip = {
                nip: { [Op.iLike]: `%${nip}%` }   
            };
        };

        let whereByFullname;
        if (full_name !== '') {
            whereByFullname = {
                full_name: { [Op.iLike]: `%${full_name}%` }   
            };
        };

        let whereByUsername;
        if (username !== '') {
            whereByUsername = {
                username: { [Op.iLike]: `%${username}%` }   
            };
        };

        let whereByEmail;
        if (email !== '') {
            whereByEmail = {
                email: { [Op.iLike]: `%${email}%` }   
            };
        };

        const where = {
            ...whereByNip,
            ...whereByFullname,
            ...whereByUsername,
            ...whereByEmail
        };

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            User_kejaksaan.count({}),
            User_kejaksaan.count({ where }),
            User_kejaksaan.findAll({
                where,
                order: searchOrder,
                offset: start,
                limit: length,
                raw: true
            })
        ]);

        return {
            draw,
            recordsTotal,
            recordsFiltered,
            data
        };
    } catch (error) {
        return error;
    }
}

async function Restore (userKejaksaanData, files, user) {
    const { user_id = null } = userKejaksaanData;
    log('[User Kejaksaan] Restore', { userKejaksaanData, files, user });
    try {
        if (isEmpty(files)) throw { error: 'File csv harus dilampirkan.' };

        const file = path.join(__dirname, `../uploads/images/${files.filename}`);
        const data = await csv().fromFile(file);

        await User_kejaksaan.destroy({ where: {} });

        let created;
        for (let i of data) {
            created = await User_kejaksaan.create({
                nip: i.nip,
                full_name: i.full_name,
                username: i.username,
                email: i.email,
                password: i.password,
                satker_id: i.satker_id
            });
        }

        fs.unlinkSync(`./uploads/images/${files.filename}`);

        return {
            message: 'Restore data berhasil.',
            data: await User_kejaksaan.findAll({ raw: true })
        };
    } catch (error) {
        return error;
    }
}

module.exports = {
    Sync,
    GetLog,
    GetUser,
    GetById,
    GetDatatables,
    Restore
}