const debug = require('debug');
const log = debug('user-service:services:');

const { isEmpty, toString } = require('lodash');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { 
    Users, 
    Gambar,
    Kewenangan, 
    Pegawai,
    Teknisi,
    Satker,
    Kategori,
    Token,
    Menu,
    Level,
    Logs 
} = require('../models');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

const { hashPassword, verifyPassword } = require('../helpers/password');
const { Upload } = require('../helpers/uploads');
const { Post } = require('../helpers/helpers');

async function Create (userData, files, user) {
    const { 
        username,
        password, 
        repassword,
        enabled,
        nip,
        nama_lengkap,
        email,
        telepon,
        alamat,
        departemen,
        jabatan,
        satker_id
    } = userData
    log('[User] Create', { userData, files, user });
    try {
        var checkUser;
        if (username) {
            checkUser = await Users.findOne({
                where: { username  },
                raw: true
            });
            if (checkUser) {
                throw { error: 'Username sudah digunakan.' };
            }
        }

        if (email) {
            checkUser = await Users.findOne({
                where: { email },
                raw: true
            });
            if (checkUser) {
                throw { error: 'Email sudah digunakan.' };
            }
        };

        if (nip) {
            checkUser = await Users.findOne({
                where: { nip },
                raw: true
            });
            if (checkUser) {
                throw { error: 'NIP sudah digunakan.' };
            }
        };

        if (telepon) {
            checkUser = await Users.findOne({
                where: { telepon },
                raw: true
            });
            if (checkUser) {
                throw { error: 'Nomor telepon sudah digunakan.' };
            }
        };

        if (password !== repassword) {
            throw { error: 'Password tidak cocok.' }
        }

        if (!satker_id) throw { error: 'Satker harus dipilih.' };

        const checkSatker = await Satker.findOne({
            where: { id: satker_id },
            raw: true
        });
        if (!checkSatker) throw { error: 'Satker tidak tersedia.' };

        const passwordEncrypted = await hashPassword(password);

        let created;
        if (!isEmpty(files)) {
            await Upload(files);

            const destination = process.env.DESTINATION_IMAGE;
            const path = process.env.PATH_IMAGE;
            var createImage = await Gambar.create({
                originalname: files.originalname,
                encoding: files.encoding,
                mimetype: files.mimetype,
                destination,
                filename: files.filename,
                path,
                size: files.size
            });
            
            created = await Users.create({
                username: username ? username : null,
                password: passwordEncrypted,
                enabled: enabled ? enabled : null,
                nip: nip ? nip : null,
                nama_lengkap: nama_lengkap ? nama_lengkap : null,
                email: email ? email : null,
                telepon: telepon ? telepon : null,
                alamat: alamat ? alamat : null,
                gambar_id: !isEmpty(createImage.id) ? createImage.id : null,
                satker_id: satker_id
            });

            await Pegawai.create({
                user_id: created.id,
                departemen,
                jabatan
            });

            await Logs.create({
                ip_address: user.ip_address,
                browser: user.browser,
                browser_version: user.browser_version,
                os: user.os,
                logdetail: `(Tambah) data pegawai dengan jabatan ${jabatan}.`,
                user_id: user.id
            });
        } else {
            created = await Users.create({
                username: username ? username : null,
                password: passwordEncrypted,
                enabled: enabled ? enabled : null,
                nip: nip ? nip : null,
                nama_lengkap: nama_lengkap ? nama_lengkap : null,
                email: email ? email : null,
                telepon: telepon ? telepon : null,
                alamat: alamat ? alamat : null,
                satker_id: satker_id
            });

            await Pegawai.create({
                user_id: created.id,
                departemen: departemen ? departemen : null,
                jabatan: jabatan ? jabatan : null
            });

            await Logs.create({
                ip_address: user.ip_address,
                browser: user.browser,
                browser_version: user.browser_version,
                os: user.os,
                logdetail: `(Tambah) data pegawai dengan jabatan ${jabatan}.`,
                user_id: user.id
            });
        }

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Tambah) data user dengan username ${username}`,
            user_id: user.id
        });

        const consumer = await Post({
            url: config.myConfig.api_gateway_admin + 'consumers',
            body: { custom_id: toString(created.id) }
        });

        await Users.update(
            { consumer_id: consumer.id },
            { where: { id: created.id } }
        );

        return {
            message: 'Data user berhasil ditambah.',
            user: await Users.findOne({ 
                where: { id: created.id },
                raw: true 
            })
        }
    } catch (error) {
        return error;
    }
}

async function UpdateRole (userData, user) {
    const {
        user_id,
        kewenangan_id,
        type = 'email',
        kategori_id = null
    } = userData;
    log('[User] UpdateRole', { userData, user });
    try {
        if (!user_id || !kewenangan_id) throw { error: 'User dan kewenangan harus dipilih.' };

        const checkUser = await Users.findOne({
            where: { id: user_id },
            raw: true
        });
        if (!checkUser) throw { error: 'User tidak tersedia.' };

        const checkKewenangan = await Kewenangan.findOne({
            where: { id: kewenangan_id },
            raw: true
        });
        if (!checkKewenangan) throw { error: 'Kewenangan tidak tersedia.' };

        if (type) {
            if (kewenangan_id !== 5) throw { error: 'Jika tipe email dipilih, kewenangan harus operator.' };
        }

        const checkOrder = await Pegawai.findAll({
            attributes: [sequelize.fn('MAX', sequelize.col('order'))],
            raw: true
        });

        // if (checkUser.kewenangan_id !== null) {
        //     const checkUserKewenangan = await Kewenangan.findOne({
        //         where: { id: checkUser.kewenangan_id },
        //         raw: true
        //     });

        //     if (checkUser.kewenangan_id !== null) 
        //         throw { error: `User atas nama ${checkUser.nama_lengkap} sudah didaftarkan role ${checkUserKewenangan.kewenangan}.` };
        // }

        let checkKategori;
        if (kategori_id) {
            checkKategori = await Kategori.findOne({
                where: { id: kategori_id },
                raw: true
            });
            if (!checkKategori) throw { error: 'Kategori tidak tersedia.' };
        }

        const checkPegawai = await Pegawai.findOne({
            where: { user_id },
            raw: true
        });

        if (checkUser.kewenangan_id == 3 || checkUser.kewenangan_id == 4) {
            await Pegawai.update({
                level: null
            },
            { where: { id: checkPegawai.id } } 
            )
        }

        await Users.update({
            kewenangan_id
        },
        { where: { id: user_id } }
        );

        if (kewenangan_id !== 4) {
            if (checkUser.kewenangan_id == 4) {
                await Teknisi.destroy({ where: { pegawai_id: checkPegawai.id } });
            }
        }

        if (kewenangan_id == 4) { // jika kewenangan yg dipilih adalah tim teknis, create teknisi
            await Teknisi.create({
                pegawai_id: checkPegawai.id,
                kategori_id: kategori_id ? kategori_id : null
            });

            await Logs.create({
                ip_address: user.ip_address,
                browser: user.browser,
                browser_version: user.browser_version,
                os: user.os,
                logdetail: `(Tambah) data teknisi`,
                user_id: user.id
            });
        } 
        
        // Update order operator + 1
        if (kewenangan_id == 5) {
            await Pegawai.update({
                order: checkOrder[0].max + 1, 
                type
            },
            { where: { user_id } }
            );
        }

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Tambah) role pengguna dengan role ${checkKewenangan.kewenangan}`,
            user_id: user.id
        });

        return {
            message: 'Role pengguna berhasil di-update.',
            user: await Users.findOne({
                where: { id: user_id },
                raw: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function Register (userData, files) {
    const { 
        username,
        password, 
        repassword,
        nama_lengkap,
        email,
        telepon,
        alamat
    } = userData
    log('[User] Register', { userData, files });
    try {
        var checkUser;
        if (username) {
            checkUser = await Users.findOne({
                where: { username  },
                raw: true
            });
            if (checkUser) {
                throw { error: 'Username sudah digunakan.' };
            }
        }

        if (email) {
            checkUser = await Users.findOne({
                where: { email },
                raw: true
            });
            if (checkUser) {
                throw { error: 'Email sudah digunakan.' };
            }
        };

        if (telepon) {
            checkUser = await Users.findOne({
                where: { telepon },
                raw: true
            });
            if (checkUser) {
                throw { error: 'Nomor telepon sudah digunakan.' };
            }
        };

        if (password !== repassword) {
            throw { error: 'Password tidak cocok.' }
        }

        const passwordEncrypted = await hashPassword(password);

        const newToken = await Token.create({ 
            token: crypto.randomBytes(50).toString('hex')
        });

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_AUTH_USER,
                pass: process.env.MAIL_AUTH_PASS
            }
        })
        
        const template = require('../config/email/template').verified(nama_lengkap, newToken.token);
        const mailOptions = {
            from: "no-reply@helpesk.com",
            to: email,
            subject: "Verifikasi Akun",
            html: template.html
        } 

        await transporter.sendMail(mailOptions);

        if (!isEmpty(files)) {
            await Upload(files);

            const destination = process.env.DESTINATION_IMAGE;
            const path = process.env.PATH_IMAGE;
            var createImage = await Gambar.create({
                originalname: files.originalname,
                encoding: files.encoding,
                mimetype: files.mimetype,
                destination,
                filename: files.filename,
                path,
                size: files.size
            });
            
            var created;
            created = await Users.create({
                username: username ? username : null,
                password: passwordEncrypted,
                enabled: false,
                nama_lengkap: nama_lengkap ? nama_lengkap : null,
                email: email ? email : null,
                telepon: telepon ? telepon : null,
                alamat: alamat ? alamat : null,
                kewenangan_id: 6,
                gambar_id: !isEmpty(createImage.id) ? createImage.id : null,
                token_id: newToken.id
            });

            await Logs.create({
                logdetail: `(Registrasi) user dengan username ${username}`,
                user_id: created.id
            });
    
            return {
                message: `Verifikasi akun telah terkirim ke ${email}. Silahkan melakukan cek email`,
                user: await Users.findOne({ 
                    where: { id: created.id },
                    raw: true 
                })
            };
        } else {
            created = await Users.create({
                username: username ? username : null,
                password: passwordEncrypted,
                enabled: false,
                nama_lengkap: nama_lengkap ? nama_lengkap : null,
                email: email ? email : null,
                telepon: telepon ? telepon : null,
                alamat: alamat ? alamat : null,
                kewenangan_id: 6,
                token_id: newToken.id
            });

            await Logs.create({
                logdetail: `(Registrasi) user dengan username ${username}`,
                user_id: created.id
            });
    
            return {
                message: `Verifikasi akun telah terkirim ke ${email}. Silahkan melakukan cek email`,
                user: await Users.findOne({ 
                    where: { id: created.id },
                    raw: true 
                })
            };
        }

        // const consumer = await Post({
        //     url: myConfig.api_gateway_admin + 'consumers',
        //     body: { custom_id: toString(createUser.id) }
        // });

        // await User.update(
        //     { consumer_id: consumer.id },
        //     { where: { id: createUser.id } }
        // );
    } catch (error) {
        return error;
    }
}

async function Verified (tokenData) {
    log('[User] Verified', tokenData);
    try {
        const checkToken = await Token.findOne({
            where: { token: tokenData },
            raw: true
        });
        if (!checkToken) throw { error: 'Token tidak tersedia.' };

        const checkUser = await Users.findOne({
            where: { token_id: checkToken.id },
            raw: true
        });

        await Users.update({ 
            enabled: true,
            token_id: null
        }, 
            { where: { token_id: checkToken.id } 
        });

        await Token.destroy({ where: { id: checkToken.id } });

        await Logs.create({
            logdetail: `(Verifikasi) akun`,
            user_id: checkUser.id
        });

        return {
            message: 'Akun anda telah terverifikasi. Silahkan login.',
            user: checkUser
        };
    } catch (error) {
        return error;
    }
}

async function GetById (userId) {
    log('[User] GetById', userId);
    try {
        const userData = await Users.findOne({
            include: [
                { 
                    model: Gambar,
                    attributes: ['id', 'filename', 'originalname', 'path', 'destination'],
                    as: 'files'
                },
                {
                    model: Pegawai,
                    attributes: ['user_id', 'departemen', 'jabatan'],
                    as: 'pegawai',
                    include: [
                        {
                            model: Teknisi,
                            attributes: ['pegawai_id', 'kategori_id'],
                            as: 'teknisi',
                            include: {
                                model: Kategori,
                                attributes: ['kategori'],
                                as: 'kategori'
                            }
                        }
                    ]
                },
                { 
                    model: Kewenangan,
                    attributes: ['kewenangan'],
                    as: 'kewenangan'
                },
                {
                    model: Satker,
                    attributes: ['id', 'kode_satker', 'nama_satker', 'akronim', 'lokasi'],
                    as: 'satker'
                }
            ],
            where: { id: userId },
            nest: true
        });
        if (!userData) {
            throw { error: 'User tidak tersedia.' };
        }

        return userData;
    } catch (error) {
        return error;
    }
}

async function GetDatatables (userData) {
    const { 
        draw, 
        order, 
        start, 
        length, 
        search,
        username, 
        nip, 
        nama_lengkap,
        enabled,
        kewenangan_id,
        urutan 
    } = userData;
    log('[User] GetDatatables', userData);
    try {
        let whereByUsername;
        if (username !== '') {
            whereByUsername = {
                username: {
                    [Op.iLike]: `%${username}%`
                }
            };
        };

        let whereByNip;
        if (nip !== '') {
            whereByNip = {
                nip: { 
                    [Op.iLike]: `%${nip}%`
                }
            };
        };

        let whereByNamaLengkap;
        if (nama_lengkap !== '') {
            whereByNamaLengkap = {
                nama_lengkap: {
                    [Op.iLike]: `%${nama_lengkap}%`
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
            whereByKewenangan = {
                kewenangan_id
            };
        };

        const where = {
            ...whereByUsername,
            ...whereByNip,
            ...whereByNamaLengkap,
            ...whereByStatus,
            ...whereByKewenangan
        };

        let searchOrder;
        if (urutan) {
            searchOrder = [['createdAt', urutan]];
        };

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            Users.count({}),
            Users.count({ 
                include: [
                    { 
                        model: Gambar,
                        attributes: ['filename', 'originalname', 'path', 'destination'],
                        as: 'files'
                    },
                    { 
                        model: Kewenangan,
                        attributes: ['kewenangan'],
                        as: 'kewenangan'
                    },
                ],
                where 
            }),
            Users.findAll({
                include: [
                    { 
                        model: Gambar,
                        attributes: ['id', 'filename', 'originalname', 'path', 'destination'],
                        as: 'files'
                    },
                    {
                        model: Pegawai,
                        attributes: ['id', 'user_id', 'departemen', 'jabatan'],
                        as: 'pegawai',
                        include: [
                            {
                                model: Teknisi,
                                attributes: ['pegawai_id', 'kategori_id'],
                                as: 'teknisi',
                                include: {
                                    model: Kategori,
                                    attributes: ['kategori'],
                                    as: 'kategori'
                                }
                            }
                        ]
                    },
                    { 
                        model: Kewenangan,
                        attributes: ['kewenangan'],
                        as: 'kewenangan',
                        include: {
                            model: Menu,
                            attributes: [['menu', 'master_menu']],
                            as: 'menu'
                        }
                    },
                    {
                        model: Satker,
                        attributes: ['id', 'kode_satker', 'nama_satker', 'akronim', 'lokasi'],
                        as: 'satker'
                    }
                ],
                where,
                order: searchOrder,
                offset: start,
                limit: length,
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

async function GetByKewenangan (kewenangan_id, userData) {
    const { user_id } = userData;
    log('[User] GetByKewenangan', { kewenangan_id, userData });
    try {
        if (!user_id) throw { error: 'User harus dilampirkan.' };

        const checkKewenangan = await Kewenangan.findOne({
            where: { id: kewenangan_id },
            raw: true
        });
        if (!checkKewenangan) throw { error: 'Kewenangan tidak tersedia' };

        const checkUser = await Users.findOne({
            where: { id: user_id },
            raw: true
        });
        if (!checkUser) throw { error: 'User tidak tersedia.' };

        const userData = await Users.findAll({ 
            attributes: ['id', 'username', 'nama_lengkap'],
            include: [
                {
                    model: Kewenangan,
                    attributes: ['kewenangan'],
                    as: 'kewenangan'
                },
                {
                    model: Pegawai,
                    attributes: ['id', 'user_id'],
                    as: 'pegawai',
                    include: {
                        model: Teknisi,
                        attributes: ['pegawai_id'],
                        as: 'teknisi',
                        include: {
                            model: Kategori,
                            attributes: ['kategori'],
                            as: 'kategori'
                        }
                    }
                },
                {
                    model: Satker,
                    attributes: ['kode_satker', 'nama_satker', 'akronim', 'lokasi'],
                    as: 'satker'
                }
            ],
            where: { 
                [Op.and]: [
                    { kewenangan_id },
                    { id: { [Op.ne]: user_id } }
                ] 
            },
            raw: true,
            nest: true
        });

        return userData;
    } catch (error) {
        return error;
    }
}

async function GetByLevel (level_id, userData) {
    const { user_id } = userData;
    log('[User] GetByLevel', { level_id, userData });
    try {
        if (!user_id) throw { error: 'User harus dilampirkan.' };

        if (!level_id) throw { error: 'Level id harus dilampirkan.' };

        const checkLevel = await Level.findOne({
            where: { id: level_id },
            raw: true
        });
        if (!checkLevel) throw { error: 'Level tidak tersedia' };

        const checkUser = await Users.findOne({
            where: { id: user_id },
            raw: true
        });
        if (!checkUser) throw { error: 'User tidak tersedia.' };

        const pegawaiData = await Pegawai.findAll({
            attributes: ['id', 'user_id'],
            include: {
                model: Users,
                attributes: ['id', 'username', 'nama_lengkap'],
                as: 'user',
                include: {
                    model: Kewenangan,
                    attributes: ['kewenangan'],
                    as: 'kewenangan'
                }
            },
            where: {
                [Op.and]: [
                    { level: level_id },
                    { '$user.id$': { [Op.ne]: user_id } },
                    { '$user.enabled$': true }
                ]
            },
            raw: true,
            nest: true
        });

        return pegawaiData;
    } catch (error) {
        return error;
    }
}

async function UpdateProfile (user_id, files, userData, user) {
    const {
        username,
        enabled,
        nip,
        nama_lengkap,
        email,
        telepon,
        alamat,
        gambar_id,
        departemen,
        jabatan,
        satker_id
    } = userData;
    log('[User] UpdateProfile', { user_id, files, userData, user });
    try {
        if (!satker_id) throw { error: 'Satker harus dipilih.' };

        const checkUser = await Users.findOne({
            where: { id: user_id },
            raw: true
        });
        if (!checkUser) {
            throw { error: 'User tidak tersedia.' };
        }

        if (checkUser.username !== username) {
            const checkUsername = await Users.findOne({
                where: { id: { [Op.ne]: user_id }, username }
            })
            if (checkUsername) {
                throw { error: 'Username sudah digunakan.' };
            }
        }

        if (checkUser.email !== email) {
            const checkEmail = await Users.findOne({
                where: { id: { [Op.ne]: user_id }, email }
            })
            if (checkEmail) {
                throw { error: 'Email sudah digunakan.' };
            }
        }

        if (checkUser.telepon !== telepon) {
            const checkTelepon = await Users.findOne({
                where: { id: { [Op.ne]: user_id }, telepon }
            })
            if (checkTelepon) {
                throw { error: 'Telepon sudah digunakan.' };
            }
        }

        if (checkUser.nip !== nip) {
            const checkNip = await Users.findOne({
                where: { id: { [Op.ne]: user_id }, nip }
            })
            if (checkNip) {
                throw { error: 'NIP sudah digunakan.' };
            }
        }

        if (checkUser.satker_id !== satker_id) {
            const checkSatker = await Satker.findOne({
                where: { id: satker_id },
                raw: true
            });
            if (!checkSatker) throw { error: 'Satker tidak tersedia.' };
        }

        const checkPegawai = await Pegawai.findOne({
            where: { user_id: checkUser.id },
            raw: true
        });
        if (checkPegawai) {
            await Pegawai.update({
                departemen: departemen ? departemen : null,
                jabatan: jabatan ? jabatan : null
            },
            { where: { user_id: checkUser.id } }
            );

            await Logs.create({
                ip_address: user.ip_address,
                browser: user.browser,
                browser_version: user.browser_version,
                os: user.os,
                logdetail: `(Update) data pegawai.`,
                user_id: user.id
            });

            const checkTeknisi = await Teknisi.findOne({
                where: { pegawai_id: checkPegawai.id },
                raw: true
            });
            if (checkTeknisi) {
                await Teknisi.update({
                    kategori_id: null
                },
                { where: { pegawai_id: checkPegawai.id } }
                );

                await Logs.create({
                    ip_address: user.ip_address,
                    browser: user.browser,
                    browser_version: user.browser_version,
                    os: user.os,
                    logdetail: `(Update) data teknisi.`,
                    user_id: user.id
                });
            }
        } else {
            await Pegawai.create({
                user_id,
                departemen: departemen ? departemen : null,
                jabatan: jabatan ? jabatan : null
            });

            await Logs.create({
                ip_address: user.ip_address,
                browser: user.browser,
                browser_version: user.browser_version,
                os: user.os,
                logdetail: `(Tambah) data pegawai.`,
                user_id: user.id
            });
        }

        if (!gambar_id) {
            if (!isEmpty(files)) {
                const destination = process.env.DESTINATION_IMAGE;
                const path = process.env.PATH_IMAGE;
                const createdGambar = await Gambar.create({
                    originalname: files.originalname,
                    encoding: files.encoding,
                    mimetype: files.type,
                    destination,
                    filename: files.filename,
                    path,
                    size: files.size
                });
            
                await Upload(files);    
                
                await Users.update({
                    username: username ? username : null,
                    enabled: enabled ? enabled : null,
                    nip: nip ? nip : null,
                    nama_lengkap: nama_lengkap ? nama_lengkap : null,
                    email: email ? email : null,
                    telepon: telepon ? telepon : null,
                    alamat: alamat ? alamat : null,
                    gambar_id: createdGambar.id,
                    satker_id: satker_id
                    },
                    { where: { id: user_id } }
                )
            } else {
                await Users.update({
                    username: username ? username : null,
                    enabled: enabled ? enabled : null,
                    nip: nip ? nip : null,
                    nama_lengkap: nama_lengkap ? nama_lengkap : null,
                    email: email ? email : null,
                    telepon: telepon ? telepon : null,
                    alamat: alamat ? alamat : null,
                    satker_id: satker_id
                    },
                    { where: { id: user_id } }
                )
            }
        } else {
            const checkGambar = await Gambar.findOne({ 
                where: { id: gambar_id },
                raw: true
            });
            if (!checkGambar) {
                throw { error: 'Gambar tidak tersedia.' };
            }
    
            if (!isEmpty(files)) {
                const destination = process.env.DESTINATION_IMAGE;
                const path = process.env.PATH_IMAGE;
                await Gambar.update({
                    originalname: files.originalname,
                    encoding: files.encoding,
                    mimetype: files.type,
                    destination,
                    filename: files.filename,
                    path,
                    size: files.size
                    },
                    { where: { id: gambar_id } }
                );
    
                await Upload(files);

                await Users.update({
                    username: username ? username : null,
                    enabled: enabled ? enabled : null,
                    nip: nip ? nip : null,
                    nama_lengkap: nama_lengkap ? nama_lengkap : null,
                    email: email ? email : null,
                    telepon: telepon ? telepon : null,
                    alamat: alamat ? alamat : null,
                    satker_id: satker_id
                    },
                    { where: { id: user_id } }
                )
            } else {
                await Users.update({
                    username: username ? username : null,
                    enabled: enabled ? enabled : null,
                    nip: nip ? nip : null,
                    nama_lengkap: nama_lengkap ? nama_lengkap : null,
                    email: email ? email : null,
                    telepon: telepon ? telepon : null,
                    alamat: alamat ? alamat : null,
                    satker_id: satker_id
                    },
                    { where: { id: user_id } }
                )
            }
        }
        
        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Update) profile atas nama ${username}`,
            user_id: user.id
        });

        return {
            message: 'Data user telah berhasil diubah.',
            user: await Users.findOne({
                include: [{ 
                    model: Gambar,
                    attributes: ['id', 'filename', 'originalname', 'path', 'destination'],
                    as: 'files',
                    required: false
                }],
                where: { id: user_id },
                raw: true,
                nest: true
            })
        };
    } catch (error) {
        return error;
    }
}

async function UpdatePassword (user_id, userData, user) {
    const { 
        old_password, 
        password, 
        repassword
    } = userData;
    log('[User] UpdatePassword', { user_id, userData, user });
    try {
        const checkUser = await Users.findOne({
            where: { id: user_id },
            raw: true
        })
        if (!checkUser) {
            throw { error: 'User tidak tersedia.' };
        }

        const checkPassword = await verifyPassword(
            old_password,
            checkUser.password
        );
        if (!checkPassword) throw { error: 'Password lama tidak sesuai.' };

        if (password !== repassword) {
            throw { error: 'Password tidak cocok.' };
        }

        if (user.id !== user_id) throw { error: 'Maaf, ini bukan akun anda.' };

        const encryptedPassword = await hashPassword(password);

        await Users.update(
            { password: encryptedPassword },
            { where: { id: user_id } }
        );

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Update) password atas nama ${checkUser.username}`,
            user_id: user.id
        })

        return {
            message: 'Password berhasil diubah.',
            user: await Users.findOne({
                where: { id: user_id },
                raw: true
            })
        }
    } catch (error) {
        return error;
    }
}

module.exports = {
    Create,
    UpdateRole,
    Register,
    Verified,
    GetById,
    GetByKewenangan,
    GetByLevel,
    GetDatatables,
    UpdateProfile,
    UpdatePassword
}