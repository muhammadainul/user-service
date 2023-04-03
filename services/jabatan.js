const debug = require('debug');
const log = debug('user-service:services:');

const { isEmpty } = require('lodash');

const { 
    Jabatan,
    Logs 
} = require('../models');
const { Op } = require('sequelize');

async function Create (jabatanData, user) {
    const { nama_jabatan } = jabatanData;
    log('[Jabatan] Create', { jabatanData, user });
    try {
        if (!nama_jabatan) throw { error: 'Nama Jabatan harus diisi.' };

        const checkJabatan = await Jabatan.findOne({
            where: { nama_jabatan },
            raw: true
        });
        if (checkJabatan) throw { error: 'Jabatan sudah tersedia.' };

        const created = await Jabatan.create({ nama_jabatan });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Tambah) jabatan dengan nama ${nama_jabatan}`,
            user_id: user.id
        });

        return {
            message: 'Jabatan berhasil ditambah.',
            Jabatan: await Jabatan.findOne({
                where: { id: created.id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Update (jabatan_id, jabatanData, user) {
    const { nama_jabatan } = jabatanData;
    log('[Jabatan] Update', { jabatan_id, jabatanData, user });
    try {
        if (!nama_jabatan) throw { error: 'Nama Jabatan harus diisi.' };

        const checkJabatan = await Jabatan.findOne({
            where: { id: jabatan_id },
            raw: true
        });
        if (!checkJabatan) throw { error: 'Jabatan tidak tersedia.' };

        if (checkJabatan.nama_jabatan !== nama_jabatan) {
            const checkNama = await Jabatan.findOne({
                where: { id: { [Op.ne]: jabatan_id }, nama_jabatan },
                raw: true
            })
            if (checkNama) throw { error: 'Nama Jabatan sudah tersedia.' };
        }

        await Jabatan.update({ nama_jabatan }, { where: { id: jabatan_id } });
        
        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Update) jabatan dengan nama ${nama_jabatan}`,
            user_id: user.id
        });

        return {
            message: 'Jabatan berhasil diubah.',
            Jabatan: checkJabatan
        };
    } catch (error) {
        return error;
    }
}

async function Delete (jabatan_id, user) {
    log('[Jabatan] Delete', { jabatan_id, user });
    try {
        const checkJabatan = await Jabatan.findOne({
            where: { id: jabatan_id },
            raw: true
        });
        if (!checkJabatan) throw { error: 'Jabatan tidak tersedia.' };

        await Jabatan.destroy({ where: { id: jabatan_id } });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Hapus) jabatan dengan nama ${checkJabatan.nama_jabatan}`,
            user_id: user.id
        });

        return {
            message: 'Jabatan berhasil dihapus.'
        };
    } catch (error) {
        return error;
    }
}

async function Get () {
    log('[Jabatan] Get');
    try {
        const jabatanData = await Jabatan.findAll({
            raw: true
        });

        return jabatanData;
    } catch (error) {
        return error;
    }
}

async function GetById (jabatan_id) {
    log('[Jabatan] GetById', jabatan_id);
    try {
        const checkJabatan = await Jabatan.findOne({
            where: { id: jabatan_id },
            raw: true
        });
        if (!checkJabatan) throw { error: 'Jabatan tidak tersedia.' };

        return checkJabatan;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (jabatanData) {
    const { 
        draw, 
        order, 
        start, 
        length, 
        search,
        urutan 
    } = jabatanData;
    log('[Jabatan] GetDatatables', jabatanData);
    try {
        let whereBySearch;
        !isEmpty(search.value)
            ? (whereBySearch = {
                nama_jabatan: { 
                    [Op.iLike]: `%${search.value}%`
                }
            })
            : (whereBySearch = {});

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Jabatan.count({}),
            Jabatan.count({ 
                where: whereBySearch
            }),
            Jabatan.findAll({
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