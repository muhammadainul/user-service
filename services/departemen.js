const debug = require('debug');
const log = debug('user-service:services:');

const { isEmpty } = require('lodash');

const { 
    Departemen,
    Logs } = require('../models');
const { Op } = require('sequelize');

async function Create (departemenData, user) {
    const { nama } = departemenData;
    log('[Departemen] Create', { departemenData, user });
    try {
        if (!nama) throw { error: 'Nama departemen harus diisi.' };

        const checkDepartemen = await Departemen.findOne({
            where: { nama },
            raw: true
        });
        if (checkDepartemen) throw { error: 'Departemen sudah tersedia.' };

        const created = await Departemen.create({ nama });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Tambah) departemen dengan nama ${nama}`,
            user_id: user.id
        });

        return {
            message: 'Departemen berhasil ditambah.',
            departemen: await Departemen.findOne({
                where: { id: created.id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Update (departemen_id, departemenData, user) {
    const { nama } = departemenData;
    log('[Departemen] Update', { departemen_id, departemenData, user });
    try {
        if (!nama) throw { error: 'Nama departemen harus diisi.' };

        const checkDepartemen = await Departemen.findOne({
            where: { id: departemen_id },
            raw: true
        });
        if (!checkDepartemen) throw { error: 'Departemen tidak tersedia.' };

        if (checkDepartemen.nama !== nama) {
            const checkNama = await Departemen.findOne({
                where: { id: { [Op.ne]: departemen_id }, nama },
                raw: true
            })
            if (checkNama) throw { error: 'Nama departemen sudah tersedia.' };
        }

        await Departemen.update({ nama }, { where: { id: departemen_id } });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Update) departemen dengan nama ${nama}`,
            user_id: user.id
        });

        return {
            message: 'Departemen berhasil diubah.',
            departemen: await Departemen.findOne({
                where: { id: checkDepartemen.id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Delete (departemen_id, user) {
    log('[Departemen] Delete', { departemen_id, user });
    try {
        const checkDepartemen = await Departemen.findOne({
            where: { id: departemen_id },
            raw: true
        });
        if (!checkDepartemen) throw { error: 'Departemen tidak tersedia.' };

        await Departemen.destroy({ where: { id: departemen_id } });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Hapus) departemen dengan nama ${checkDepartemen.nama}`,
            user_id: user.id
        });

        return {
            message: 'Departemen berhasil dihapus.'
        };
    } catch (error) {
        return error;
    }
}

async function Get () {
    log('[Departemen] Get');
    try {
        const departemenData = await Departemen.findAll({
            raw: true
        });

        return departemenData;
    } catch (error) {
        return error;
    }
}

async function GetById (departemen_id) {
    log('[Departemen] GetById', departemen_id);
    try {
        const checkDepartemen = await Departemen.findOne({
            where: { id: departemen_id },
            raw: true
        });
        if (!checkDepartemen) throw { error: 'Departemen tidak tersedia.' };

        return checkDepartemen;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (departemenData) {
    const { 
        draw, 
        order, 
        start, 
        length, 
        search,
        urutan 
    } = departemenData;
    log('[Departemen] GetDatatables', departemenData);
    try {
        let whereBySearch;
        !isEmpty(search.value)
            ? (whereBySearch = {
                nama: { 
                    [Op.iLike]: `%${search.value}%`
                }
            })
            : (whereBySearch = {});

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Departemen.count({}),
            Departemen.count({ 
                where: whereBySearch
            }),
            Departemen.findAll({
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
    Get,
    GetById,
    GetDatatables
}