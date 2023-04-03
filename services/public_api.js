const debug = require('debug');
const log = debug('user-service:services:');

const { Public_api } = require('../models');
const { Op } = require('sequelize');

const { toString } = require('lodash');

// const { hashPassword } = require('../helpers/password');
const { Post } = require('../helpers/helpers');

async function Create (userData) {
    const { client } = userData
    log('[Public API] Create', userData);
    try {
        if (!client) throw { error: 'Nama client harus diisi.' };

        const checkClient = await Public_api.findOne({
            where: { client },
            raw: true
        });
        if (checkClient) throw { error: 'Nama client sudah tersedia.' };

        const created = await Public_api.create({
            client,
            token: null
        });

        const consumer = await Post({
            url: config.myConfig.api_gateway_admin + 'consumers',
            body: { custom_id: toString(`${created.id}-${client}`) }
        });

        const consumerOauth2 = await Post({
            url:
                config.myConfig.api_gateway_admin +
                `consumers/${consumer.id}/oauth2`,
            body: {
                name: toString(`${created.id}-${client}`),
                redirect_uris: ['http://localhost/']
            }
        });

        const public = await Post({
            url: config.myConfig.api_gateway_url + 'public/oauth2/token',
            body: {
                client_id: consumerOauth2.client_id,
                client_secret: consumerOauth2.client_secret,
                provision_key: 'oauth2provisionkey',
                authenticated_userid: toString(created.id),
                grant_type: 'password',
                scope: 'read write'
            }
        });

        await Public_api.update({ 
            token: public.access_token,
            consumer_id: consumer.id,
            client_id: consumerOauth2.client_id,
            client_secret: consumerOauth2.client_secret 
        }, 
        { where: { id: created.id } 
        });

        return {
            message: 'Data berhasil ditambah.',
            user: await Public_api.findOne({ 
                where: { id: created.id },
                raw: true 
            })
        }
    } catch (error) {
        return error;
    }
}

async function Update (public_id, userData) {
    const { client } = userData
    log('[Public API] Update', { public_id, userData });
    try {
        if (!client) throw { error: 'Form harus diisi.' };

        const checkData = await Public_api.findOne({
            where: { id: public_id },
            raw: true
        });
        if (!checkData) throw { error: 'Data tidak tersedia.' };

        const checkClient = await Public_api.findOne({
            where: {
                [Op.and]: [
                    { client },
                    { id: { [Op.ne]: public_id } }
                ]
            },
            raw: true
        });
        if (checkClient) throw { error: 'Nama client sudah tersedia.' };

        await Public_api.update({
            client
        },
        { where: { id: public_id } }
        );

        return {
            message: 'Data berhasil diubah.',
            data: await Public_api.findOne({
                where: { id: public_id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Delete (public_id) {
    log('[Public API] Delete', { public_id });
    try {
        const checkData = await Public_api.findOne({
            where: { id: public_id },
            raw: true
        });
        if (!checkData) throw { error: 'Data tidak tersedia.' };

        await Public_api.destroy({ where: { id: public_id } });

        return {
            message: 'Data berhasil dihapus.'
        };
    } catch (error) {
        return error;
    }
}

async function GetById (public_id) {
    log('[Public API] GetById', public_id);
    try {
        const data = await Public_api.findOne({
            where: { id: public_id },
            raw: true,
            nest: true
        });
        if (!data) throw { error: 'Data tidak tersedia.' };

        return data;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (userData) {
    const { 
        draw, 
        // order, 
        start, 
        length, 
        // search,
        client,
        urutan 
    } = userData;
    log('[Public API] GetDatatables', userData);
    try {
        let whereByClient;
        if (client !== '') {
            whereByClient = {
                client: { [Op.iLike]: `%${client}%` }   
            };
        };

        const where = {
            ...whereByClient
        };

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Public_api.count({}),
            Public_api.count({ where }),
            Public_api.findAll({
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

module.exports = {
    Create,
    Update,
    Delete,
    GetById,
    GetDatatables
}