const debug = require('debug');
const log = debug('user-service:services:');

const { isEmpty } = require('lodash');

const { Kewenangan, Logs, Users } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

async function Create (kewenanganData, user) {
    const { kewenangan } = kewenanganData;
    log('[Kewenangan] Create', { kewenanganData, user });
    try {
        if (!kewenangan) throw { error: 'Kewangan harus diisi.' };

        const checkKewenangan = await Kewenangan.findOne({
            where: { kewenangan },
            raw: true
        });
        if (checkKewenangan) throw { error: 'Kewenangan sudah tersedia.' };

        const created = await Kewenangan.create({ kewenangan });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Tambah) kewenangan dengan nama ${kewenangan}`,
            user_id: user.id
        });

        return {
            message: 'Kewenangan berhasil ditambah.',
            kewenangan: await Kewenangan.findOne({
                where: { id: created.id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Update (kewenangan_id, kewenanganData, user) {
    const { kewenangan } = kewenanganData;
    log('[Kewenangan] Update', { kewenangan_id, kewenanganData, user });
    try {
        if (!kewenangan) throw { error: 'Kewenangan harus diisi.' };

        const checkKewenangan = await Kewenangan.findOne({
            where: { id: kewenangan_id },
            raw: true
        });
        if (!checkKewenangan) throw { error: 'Kewenangan tidak tersedia.' };

        if (checkKewenangan.kewenangan !== kewenangan) {
            const checkNama = await Kewenangan.findOne({
                where: { id: { [Op.ne]: kewenangan_id }, kewenangan },
                raw: true
            })
            if (checkNama) throw { error: 'Kewenangan sudah tersedia.' };
        }

        await Kewenangan.update({ kewenangan }, { where: { id: kewenangan_id } });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Update) kewenangan dengan nama ${kewenangan}`,
            user_id: user.id
        });

        return {
            message: 'Kewenangan berhasil diubah.',
            kewenangan: await Kewenangan.findOne({
                where: { id: checkKewenangan.id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Delete (kewenangan_id, user) {
    log('[Kewenangan] Delete', { kewenangan_id, user });
    try {
        const checkKewenangan = await Kewenangan.findOne({
            where: { id: kewenangan_id },
            raw: true
        });
        if (!checkKewenangan) throw { error: 'Kewenangan tidak tersedia.' };

        await Kewenangan.destroy({ where: { id: kewenangan_id } });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Hapus) kewenangan dengan nama ${checkKewenangan.kewenangan}`,
            user_id: user.id
        });

        return {
            message: 'Kewenangan berhasil dihapus.'
        };
    } catch (error) {
        return error;
    }
}

async function Get () {
    log('[Kewenangan] Get');
    try {
        const kewenanganData = await Kewenangan.findAll({
            raw: true
        });

        return kewenanganData;
    } catch (error) {
        return error;
    }
}

async function GetKewenangan () {
    log('[Kewenangan] GetKewenangan');
    try {
        const kewenanganData = await Kewenangan.findAll({
            attributes: [
                'id', 
                'kewenangan'
            ],
            include: {
                model: Users,
                attributes: [
                    'id',
                    [sequelize.fn('COUNT', sequelize.col('user.id')), 'user_id']],
                as: 'user'
            },
            where: { '$user.kewenangan_id$': `${kewenangan.id}` }
        });

        return kewenanganData;
    } catch (error) {
        return error;
    }
}

async function GetById (kewenangan_id) {
    log('[Kewenangan] GetById', kewenangan_id);
    try {
        const checkKewenangan = await Kewenangan.findOne({
            where: { id: kewenangan_id },
            raw: true
        });
        if (!checkKewenangan) throw { error: 'Kewenangan tidak tersedia.' };

        return checkKewenangan;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (kewenanganData) {
    const { 
        draw, 
        order, 
        start, 
        length, 
        search,
        urutan 
    } = kewenanganData;
    log('[Kewenangan] GetDatatables', kewenanganData);
    try {
        let whereBySearch;
        !isEmpty(search.value)
            ? (whereBySearch = {
                kewenangan: { 
                    [Op.iLike]: `%${search.value}%`
                }
            })
            : (whereBySearch = {});

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Kewenangan.count({}),
            Kewenangan.count({ 
                where: whereBySearch
            }),
            Kewenangan.findAll({
                where: whereBySearch,
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

module.exports = {
    Create,
    Update,
    Delete,
    GetKewenangan,
    Get,
    GetById,
    GetDatatables
}