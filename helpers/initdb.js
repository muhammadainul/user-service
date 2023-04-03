const { hashPassword } = require('./password');
const { Kewenangan, Users, Pegawai } = require('../models');
const { Post } = require('../helpers/helpers');
const { toString } = require('lodash');

function initDB () {
    new Promise(async (resolve, reject) => {
        console.log('Init Roles');
        try {
            const kewenanganData = await Kewenangan.findOne({
                where: { id: 1 },
                raw: true
            });
            if (!kewenanganData) await Kewenangan.create({ kewenangan: 'Superadmin' });

            const userData = await Users.findOne({});
            if (!userData) {
                const created = await Users.create({
                    username: 'superadmin',
                    password: await hashPassword('superadmin'),
                    nip: null,
                    nama_lengkap: 'Superadmin',
                    email: null,
                    enabled: 1,
                    kewenangan_id: 1,
                    satker_id: 1,
                    gambar_id: null
                });

                const consumer = await Post({
                    url: config.myConfig.api_gateway_admin + 'consumers',
                    body: { custom_id: toString(created.id) }
                });

                await Users.update(
                    { consumer_id: consumer.id },
                    { where: { id: created.id } }
                );

                await Pegawai.create({
                    user_id: created.id,
                    departemen: 'Teknologi & Informasi',
                    jabatan: 'Staff IT'
                });
            }
            resolve(true);
        } catch (error) {
            console.log('error', error);
            reject(error);
        }
    })
}

module.exports = { initDB }