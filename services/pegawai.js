const debug = require('debug');
const log = debug('user-service:services:');

const { isEmpty } = require('lodash');

const { 
    Users, 
    Pegawai,
    Departemen,
    Jabatan,
    Kategori,
    Teknisi,
    Logs
} = require('../models');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

async function Create (pegawaiData, user) {
    const { 
        user_id,
        departemen,
        jabatan
    } = pegawaiData
    log('[Pegawai] Create', { pegawaiData, user });
    try {
        if (!user_id) 
            throw { error: 'Form harus diisi.' };

        const checkUser = await Users.findOne({
            where: { id: user_id },
            raw: true
        });
        if (!checkUser) {
            throw { error: 'User tidak tersedia.' };
        }

        const checkPegawai = await Pegawai.findAll({
            attributes: [sequelize.fn('MAX', sequelize.col('order'))],
            raw: true
        });

        const created = await Pegawai.create({
            user_id,
            departemen,
            jabatan,
            order: checkPegawai[0].max + 1
        });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Tambah) data pegawai atas nama ${checkUser.nama_lengkap}`,
            user_id: user.id
        });

        return {
            message: 'Pegawai berhasil ditambah.',
            user: await Pegawai.findOne({ 
                where: { id: created.id },
                raw: true 
            })
        }
    } catch (error) {
        return error;
    }
}

async function Update (pegawai_id, pegawaiData, user) {
    const { 
        user_id,
        departemen,
        jabatan
    } = pegawaiData
    log('[Pegawai] Update', { pegawai_id, pegawaiData, user });
    try {
        if (!user_id) 
            throw { error: 'Form harus diisi.' };

        const checkPegawai = await Pegawai.findOne({
            where: { id: pegawai_id },
            raw: true
        });
        if (!checkPegawai) throw { error: 'Pegawai tidak tersedia.' };

        const checkUser = await Users.findOne({
            where: { id: user_id },
            raw: true
        });
        if (!checkUser) {
            throw { error: 'User tidak tersedia.' };
        }

        await Pegawai.update({
            user_id,
            departemen,
            jabatan
        },
        { where: { id: pegawai_id } }
        );

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Update) data pegawai atas nama ${checkUser.nama_lengkap}`,
            user_id: user.id
        });

        return {
            message: 'Pegawai berhasil diubah.',
            pegawai: checkPegawai
        };
    } catch (error) {
        return error;
    }
}

async function Delete (pegawai_id, user) {
    log('[Pegawai] Delete', { pegawai_id, user });
    try {
        const checkPegawai = await Pegawai.findOne({
            where: { id: pegawai_id },
            raw: true
        });
        if (!checkPegawai) throw { error: 'Pegawai tidak tersedia.' };

        const checkUser = await Users.findOne({
            where: { id: checkPegawai.user_id },
            raw: true
        });

        await Pegawai.destroy({ where: { id: pegawai_id } });

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Hapus) data pegawai atas nama ${checkUser.nama_lengkap}`,
            user_id: user.id
        });

        return {
            message: 'Pegawai berhasil dihapus.'
        };
    } catch (error) {
        return error;
    }
}

async function Get () {
    log('[Pegawai] Get');
    try {
        const pegawaiData = await Pegawai.findAll({
            include: [
                { 
                    model: Users,
                    attributes: ['nip', 'nama_lengkap', 'alamat'],
                    as: 'user'
                },
                {
                    model: Teknisi,
                    attributes: ['pegawai_id', 'kategori_id'],
                    as: 'teknisi',
                    required: false,
                    include: {
                        model: Kategori,
                        attributes: ['kategori'],
                        as: 'kategori'
                    }
                }
            ],
            nest: true
        });

        return pegawaiData;
    } catch (error) {
        return error;
    }
}

async function GetById (pegawai_id) {
    log('[Pegawai] GetById', pegawai_id);
    try {
        const pegawaiData = await Pegawai.findOne({
            include: [
                { 
                    model: Users,
                    attributes: ['nip', 'nama_lengkap', 'alamat'],
                    as: 'user'
                }
            ],
            where: { id: pegawai_id },
            raw: true,
            nest: true
        });
        if (!pegawaiData) {
            throw { error: 'Pegawai tidak tersedia.' };
        }

        return pegawaiData;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (pegawaiData) {
    const { 
        draw, 
        order, 
        start, 
        length, 
        search,
        nip, 
        nama_lengkap,
        alamat,
        departemen,
        jabatan,
        urutan 
    } = pegawaiData;
    log('[Pegawai] GetDatatables', pegawaiData);
    try {
        let whereByNip;
        if (nip !== '') {
            whereByNip = {
                '$user.nip$': { [Op.iLike]: `%${nip}%` }   
            };
        };

        let whereByNamaLengkap;
        if (nama_lengkap !== '') {
            whereByNamaLengkap = {
                '$user.nama_lengkap$': { [Op.iLike]: `%${nama_lengkap}%` }   
            };
        };

        let whereByAlamat;
        if (alamat !== '') {
            whereByAlamat = {
                '$user.alamat$': { [Op.iLike]: `%${alamat}%` }   
            };
        };

        let whereByDepartemen;
        if (departemen !== '') {
            whereByDepartemen = {
                departemen: { [Op.iLike]: `%${departemen}%`}
            };
        };

        let whereByJabatan;
        if (jabatan !== '') {
            whereByJabatan = {
                jabatan: { [Op.iLike]: `%${jabatan}%`}
            };
        };

        const where = {
            ...whereByNip,
            ...whereByNamaLengkap,
            ...whereByAlamat,
            ...whereByDepartemen,
            ...whereByJabatan
        };

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Pegawai.count({}),
            Pegawai.count({ 
                include: [
                    {
                        model: Users,
                        attributes: ['nama_lengkap', 'nip', 'alamat'],
                        as: 'user'
                    }
                ],
                where 
            }),
            Pegawai.findAll({
                include: [
                    {
                        model: Users,
                        attributes: ['nama_lengkap', 'nip', 'alamat'],
                        as: 'user'
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