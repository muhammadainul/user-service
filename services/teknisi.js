const debug = require('debug');
const log = debug('user-service:services:');

const { isEmpty } = require('lodash');

const { 
    Users, 
    Teknisi,
    Pegawai,
    Kategori,
    Logs 
} = require('../models');
const { Op } = require('sequelize');

async function Create (teknisiData, user) {
    const { pegawai_id, kategori_id } = teknisiData
    log('[Teknisi] Create', { teknisiData, user });
    try {
        if (!pegawai_id || !kategori_id) throw { error: 'Form harus diisi.' };

        const checkPegawai = await Pegawai.findOne({
            where: { id: pegawai_id },
            raw: true
        });
        if (!checkPegawai) {
            throw { error: 'Pegawai tidak tersedia.' };
        }

        const checkUser = await Users.findOne({
            where: { id: checkPegawai.user_id },
            raw: true
        });

        const checkKategori = await Kategori.findOne({
            where: { id: kategori_id },
            raw: true
        });
        if (!checkKategori) throw { error: 'Kategori tidak tersedia.' };

        const created = await Teknisi.create({
            pegawai_id,
            kategori_id
        });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Tambah) data teknisi atas nama ${checkUser.nama_lengkap}`,
            user_id: user.id
        });

        return {
            message: 'Teknisi berhasil ditambah.',
            teknisi: await Teknisi.findOne({ 
                where: { id: created.id },
                raw: true 
            })
        }
    } catch (error) {
        return error;
    }
}

async function Update (teknisi_id, teknisiData, user) {
    const { pegawai_id, kategori_id } = teknisiData
    log('[Teknisi] Update', { teknisi_id, teknisiData, user });
    try {
        if (!pegawai_id || !kategori_id) 
            throw { error: 'Form harus diisi.' };

        const checkTeknisi = await Teknisi.findOne({
            where: { id: teknisi_id },
            raw: true
        });
        if (!checkTeknisi) throw { error: 'Teknisi tidak tersedia.' };

        const checkPegawai = await Pegawai.findOne({
            where: { id: pegawai_id },
            raw: true
        });
        if (!checkPegawai) throw { error: 'Pegawai tidak tersedia.' };

        const checkUser = await Users.findOne({
            where: { id: checkPegawai.user_id },
            raw: true
        });
        if (!checkUser) {
            throw { error: 'User tidak tersedia.' };
        }

        // await Pegawai.update({
        //     user_id,
        //     departemen_id,
        //     jabatan_id
        // },
        // { where: { id: teknisi_id } }
        // );

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Update) data teknisi atas nama ${checkUser.nama_lengkap}`,
            user_id: user.id
        });

        return {
            message: 'Teknisi berhasil diubah.',
            teknisi: checkTeknisi
        };
    } catch (error) {
        return error;
    }
}

async function Delete (teknisi_id, user) {
    log('[Teknisi] Delete', { teknisi_id, user });
    try {
        const checkTeknisi = await Teknisi.findOne({
            where: { id: teknisi_id },
            raw: true
        });
        if (!checkTeknisi) throw { error: 'Teknisi tidak tersedia.' };

        const checkPegawai = await Pegawai.findOne({
            where: { id: checkTeknisi.pegawai_id },
            raw: true
        });

        const checkUser = await Users.findOne({
            where: { id: checkPegawai.user_id },
            raw: true
        });

        await Teknisi.destroy({ where: { id: teknisi_id } });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Hapus) data teknisi atas nama ${checkUser.nama_lengkap}`,
            user_id: user.id
        });

        return {
            message: 'Teknisi berhasil dihapus.'
        };
    } catch (error) {
        return error;
    }
}

async function Get () {
    log('[Teknisi] Get');
    try {
        const teknisiData = await Teknisi.findAll({
            include: [
                {
                    model: Pegawai,
                    as: 'pegawai',
                    attributes: ['id', 'user_id', 'departemen', 'jabatan'],
                    include: [
                        { 
                            model: Users,
                            attributes: ['nip', 'nama_lengkap', 'telepon', 'email'],
                            as: 'user'
                        }
                    ],
                },
                {
                    model: Kategori,
                    attributes: ['kategori'],
                    as: 'kategori'
                }
            ],
            raw: true,
            nest: true
        });

        return teknisiData;
    } catch (error) {
        return error;
    }
}

async function GetById (teknisi_id) {
    log('[Teknisi] GetById', teknisi_id);
    try {
        const teknisiData = await Teknisi.findOne({
            attributes: ['id', 'pegawai_id', 'kategori_id'],
            include: [
                {
                    model: Pegawai,
                    as: 'pegawai',
                    attributes: ['id', 'user_id', 'departemen', 'jabatan'],
                    include: [
                        { 
                            model: Users,
                            attributes: ['nip', 'nama_lengkap', 'telepon', 'email'],
                            as: 'user'
                        }
                    ],
                },
                {
                    model: Kategori,
                    attributes: ['kategori'],
                    as: 'kategori'
                }
            ],
            where: { id: teknisi_id },
            raw: true,
            nest: true
        });
        if (!teknisiData) {
            throw { error: 'Teknisi tidak tersedia.' };
        }

        return teknisiData;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (teknisiData) {
    const { 
        draw, 
        order, 
        start, 
        length, 
        search,
        nip, 
        nama_lengkap,
        kategori_id,
        urutan 
    } = teknisiData;
    log('[Teknisi] GetDatatables', teknisiData);
    try {
        let whereByNip;
        if (nip !== '') {
            whereByNip = {
                '$pegawai.user.nip$': { [Op.iLike]: `%${nip}%` }   
            };
        };

        let whereByNamaLengkap;
        if (nama_lengkap !== '') {
            whereByNamaLengkap = {
                '$pegawai.user.nama_lengkap$': { [Op.iLike]: `%${nama_lengkap}%` }   
            };
        };

        let whereByKategori;
        if (kategori_id !== '') {
            whereByKategori = {
                kategori_id
            };
        };

        const where = {
            ...whereByNip,
            ...whereByNamaLengkap,
            ...whereByKategori
        };

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Teknisi.count({}),
            Teknisi.count({ 
                include: [
                    {
                        model: Pegawai,
                        as: 'pegawai',
                        include: { 
                            model: Users,
                            attributes: ['nip', 'nama_lengkap'],
                            as: 'user'
                        }
                    },
                    {
                        model: Kategori,
                        attributes: ['kategori'],
                        as: 'kategori'
                    }
                ],
                where 
            }),
            Teknisi.findAll({
                attributes: ['id', 'pegawai_id', 'kategori_id'],
                include: [
                    {
                        model: Pegawai,
                        as: 'pegawai',
                        attributes: ['id', 'user_id', 'departemen', 'jabatan'],
                        include: [
                            { 
                                model: Users,
                                attributes: ['nip', 'nama_lengkap', 'telepon', 'email'],
                                as: 'user'
                            }
                        ],
                    },
                    {
                        model: Kategori,
                        attributes: ['kategori'],
                        as: 'kategori'
                    }
                ],
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

module.exports = {
    Create,
    Update,
    Delete,
    Get,
    GetById,
    GetDatatables
}