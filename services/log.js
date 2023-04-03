const debug = require('debug');
const log = debug('user-service:log:services:');

const { isEmpty } = require('lodash');
const moment = require('moment');

const { 
    Users, 
    Kewenangan,
    Logs 
} = require('../models');
const { Op } = require('sequelize');

async function Create (logData) {
    const { 
        ip_address, 
        browser,
        browser_version,
        os,
        logdetail,
        email
    } = logData;
    log('[Log] Create', logData);
    try {
        const checkUser = await Users.findOne({
            where: { 
                [Op.and]: [
                    { email },
                    { enabled: true },
                    { kewenangan_id: 6 }
                ]
            },
            raw: true
        });
        if (!checkUser) {
            throw { error: 'User tidak tersedia.' };
        }

        const created = await Logs.create({
            ip_address,
            browser,
            browser_version,
            os,
            logdetail,
            user_id: checkUser.id
        })

        return {
            message: 'Log berhasil dibuat.',
            log: await Logs.findOne({
                where: { id: created.id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function GetDatatables (logData) {
    const { 
        draw, 
        order, 
        start, 
        length, 
        search,
        urutan, 
        ip_address, 
        nama_lengkap,
        os, 
        browser,
        logdetail,
        enabled,
        kewenangan_id,
        start_date,
        end_date
    } = logData;
    log('[Log] GetDatatables', logData);
    try {
        let whereByDate;
        if (start_date !== '' || end_date !== '') {
            whereByDate = {
                [Op.and]: [
                    { logtime: { [Op.gte]: moment(start_date).format() } },
                    { logtime: { [Op.lte]: moment(end_date).format() } }
                ]
            };
        };

        let whereByIpaddress;
        if (ip_address !== '') {
            whereByIpaddress = {
                ip_address: {
                    [Op.iLike]: `%${ip_address}%`
                }
            };
        };

        let whereByNamaLengkap;
        if (nama_lengkap !== '') {
            whereByNamaLengkap = {
                '$user.nama_lengkap$': { [Op.iLike]: `%${nama_lengkap}%` }   
            }
        };

        let whereByOs;
        if (os !== '') {
            whereByOs = {
                os: { 
                    [Op.iLike]: `%${os}%`
                }
            };
        };

        let whereByBrowser;
        if (browser !== '') {
            whereByBrowser = {
                browser: { 
                    [Op.iLike]: `%${browser}%`
                }
            };
        };

        let whereByLogdetail;
        if (logdetail !== '') {
            whereByLogdetail = {
                logdetail: { 
                    [Op.iLike]: `%${logdetail}%`
                }
            };
        };

        let whereByStatus;
        if (enabled !== '') {
            whereByStatus = {
                enabled
            };
        };

        let whereByKewenangan;
        if (kewenangan_id !== '') {
            const checkKewenangan = await Kewenangan.findOne({
                where: { id: kewenangan_id },
                raw: true
            });
            if (!checkKewenangan) throw { error: 'Kewenangan tidak tersedia.' };
            
            whereByKewenangan = {
                '$user.kewenangan_id$': kewenangan_id
            };
        }

        const where = {
            ...whereByIpaddress,
            ...whereByNamaLengkap,
            ...whereByOs,
            ...whereByBrowser,
            ...whereByStatus,
            ...whereByKewenangan,
            ...whereByLogdetail,
            ...whereByDate
        };

        let searchOrder;
        (urutan) ? (searchOrder = [['logdetail', urutan]] ) : (searchOrder = [['logdetail', 'desc']]);

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Logs.count({}),
            Logs.count({ 
                include: [{ 
                    model: Users,
                    attributes: ['username', 'nama_lengkap', 'kewenangan_id'],
                    as: 'user',
                    required: false
                }],
                where 
            }),
            Logs.findAll({
                include: [{ 
                    model: Users,
                    attributes: ['username', 'nama_lengkap', 'kewenangan_id'],
                    as: 'user',
                    required: false
                }],
                where,
                order: searchOrder,
                offset: start,
                limit: length,
                raw: true,
                nest: true
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

async function GetHistoryData (logData) {
    const { 
        start_date, 
        end_date,
        kewenangan_id 
    } = logData;
    log('[Log] GetHistoryData', logData);
    try {
        if (!start_date || !end_date) throw { error: 'Rentan tanggal harus dipilih.' };

        let whereByKewenangan;
        if (kewenangan_id !== '') {
            const checkKewenangan = await Kewenangan.findOne({
                where: { id: kewenangan_id },
                raw: true
            });
            if (!checkKewenangan) throw { error: 'Kewenangan tidak tersedia.' };
            
            whereByKewenangan = {
                '$user.kewenangan_id$': kewenangan_id
            };
        }

        const where = {
            ...whereByKewenangan
        };
        
        const historyData = await Logs.findAll({
            include: {
                model: Users,
                attributes: ['username', 'nama_lengkap', 'nip', 'kewenangan_id'],
                as: 'user'
            },
            where: {
                [Op.and]: [
                    { logtime: { [Op.gte]: moment(start_date).format() } },
                    { logtime: { [Op.lte]: moment(end_date).format() } },
                    where
                ]
            },
            order: [['logtime', 'desc']],
            nest: true
        });

        return historyData;
    } catch (error) {
        return error;
    }
}

module.exports = {
    Create,
    GetDatatables,
    GetHistoryData
}