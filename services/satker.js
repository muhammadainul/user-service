const debug = require('debug');
const log = debug('user-service:services:');

const { isEmpty } = require('lodash');
const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');

const { Satker } = require('../models');
const { Op } = require('sequelize');

async function Create (satkerData) {
    const {
        kode_satker,
        nama_satker,
        akronim,
        lokasi
    } = satkerData;
    log('[Satker] Create', satkerData);
    try {
        if (!kode_satker || !nama_satker || !akronim || !lokasi) throw { error: 'Semua form harus diisi.' };

        const checkKodeSatker = await Satker.findOne({
            where: { kode_satker },
            raw: true
        });
        if (checkKodeSatker) throw { error: 'Kode satker sudah tersedia.' };

        const created = await Satker.create({
            kode_satker,
            nama_satker,
            akronim,
            lokasi
        });

        // await Logs.create({
        //     ip_address: user.ip_address,
        //     browser: user.browser,
        //     browser_version: user.browser_version,
        //     os: user.os,
        //     logdetail: `(Tambah) kewenangan dengan nama ${kewenangan}`,
        //     user_id: user.id
        // });

        return {
            message: 'Satker berhasil ditambah.',
            satker: await Satker.findOne({
                where: { id: created.id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Update (satker_id, satkerData) {
    const {
        kode_satker,
        nama_satker,
        akronim,
        lokasi
    } = satkerData;
    log('[Satker] Update', { satker_id, satkerData });
    try {
        if (!kode_satker || !nama_satker || !akronim || !lokasi) throw { error: 'Semua form harus diisi.' };

        const checkSatker = await Satker.findOne({
            where: { id: satker_id },
            raw: true
        });
        if (!checkSatker) throw { error: 'Satker tidak tersedia.' };

        if (checkSatker.kode_satker !== kode_satker) {
            const checkKodeSatker = await Satker.findOne({
                where: { id: { [Op.ne]: satker_id }, kode_satker },
                raw: true
            })
            if (checkKodeSatker) throw { error: 'Kode satker sudah tersedia.' };
        }

        await Satker.update({
            kode_satker,
            nama_satker,
            akronim,
            lokasi
        }, { where: { id: satker_id } });

        // await Logs.create({
        //     ip_address: user.ip_address,
        //     browser: user.browser,
        //     browser_version: user.browser_version,
        //     os: user.os,
        //     logdetail: `(Update) kewenangan dengan nama ${kewenangan}`,
        //     user_id: user.id
        // });

        return {
            message: 'Satker berhasil diubah.',
            satker: await Satker.findOne({
                where: { id: checkSatker.id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Delete (satker_id) {
    log('[Satker] Delete', { satker_id, user });
    try {
        const checkSatker = await Satker.findOne({
            where: { id: satker_id },
            raw: true
        });
        if (!checkSatker) throw { error: 'Satker tidak tersedia.' };

        await Satker.destroy({ where: { id: satker_id } });

        // await Logs.create({
        //     ip_address: user.ip_address,
        //     browser: user.browser,
        //     browser_version: user.browser_version,
        //     os: user.os,
        //     logdetail: `(Hapus) kewenangan dengan nama ${checkKewenangan.kewenangan}`,
        //     user_id: user.id
        // });

        return {
            message: 'Satker berhasil dihapus.'
        };
    } catch (error) {
        return error;
    }
}

async function GetById (satker_id) {
    log('[Satker] GetById', satker_id);
    try {
        const checkSatker = await Satker.findOne({
            where: { id: satker_id },
            raw: true
        });
        if (!checkSatker) throw { error: 'Satker tidak tersedia.' };

        return checkSatker;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (satkerData) {
    const { 
        draw, 
        order, 
        start, 
        length, 
        search,
        urutan 
    } = satkerData;
    log('[Satker] GetDatatables', satkerData);
    try {
        let whereBySearch;
        !isEmpty(search.value)
            ? (whereBySearch = {
                kode_satker: { 
                    [Op.iLike]: `%${search.value}%`
                }
            })
            : (whereBySearch = {});

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Satker.count({}),
            Satker.count({ 
                where: whereBySearch
            }),
            Satker.findAll({
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

async function Restore (indexData, fileData, user) {
    const { user_id = null } = indexData;
    log('[User Service] Restore', { indexData, fileData, user });
    try {
        if (isEmpty(fileData)) throw { error: 'File csv harus dilampirkan.' };

        const file = path.join(__dirname, `../backup/${fileData.filename}`);
        const data = await csv().fromFile(file);

        let created;
        for (let i of data) {
            created = await Satker.create({
                kode_satker: i.kode_satker,
                nama_satker: i.nama_satker
            });
        }

        fs.unlinkSync(`./backup/${fileData.filename}`);

        return {
            message: 'Restore data berhasil.',
            data: await Satker.findOne({
                where: { id: created.id }, 
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

module.exports = {
    Create,
    Update,
    Delete,
    Restore,
    GetById,
    GetDatatables
}