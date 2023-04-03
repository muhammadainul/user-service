const multer = require('multer');
const express = require('express');
const app = express();

const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');
const moment = require('moment');

require('dotenv').config();

global.config = require('./config/config')[process.env.NODE_ENV];

const multerMiddleware = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null,  "./uploads/images")
        },
        filename: (req, file, cb) => {
            cb(null, moment(Date.now()).format('YYYY-MM-DDhh:mm:ss') + '-helpdesk' + path.extname(file.originalname))
        }
    }),
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

app.use(
    multerMiddleware.single('files')
)

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

require("./config/passport")(passport);
app.use(passport.initialize());

app.use(async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, simandesk_token'
    );
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );
        return res.status(200).json({});
    }
    next();
});

const { initDB } = require('./helpers/initdb');
initDB();

app.use('/v1', require('./controllers/v1/index'));
app.use('/v1/kewenangan', require('./controllers/v1/kewenangan'));
app.use('/v1/departemen', require('./controllers/v1/departemen'));
app.use('/v1/jabatan', require('./controllers/v1/jabatan'));
app.use('/v1/pegawai', require('./controllers/v1/pegawai'));
app.use('/v1/teknisi', require('./controllers/v1/teknisi'));
app.use('/v1/satker', require('./controllers/v1/satker'));
app.use('/v1/user_kejaksaan', require('./controllers/v1/user_kejaksaan'));

module.exports = app;