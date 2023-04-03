const express = require('express');
const router = express.Router();

const debug = require('debug');
const log = debug('user-service:user_kejaksaan:');

const UserKejaksaanService = require('../../services/user_kejaksaan');

const { isVerified } = require('../../middlewares/isVerified');
const { isSecured } = require('../../middlewares/isSecured');

router.post('/sync', [isSecured, isVerified], async (req, res) => {
    const userKejaksaanData = req.body;
    const user = req.user;

    const result = await UserKejaksaanService.Sync(userKejaksaanData, user);
    log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

router.get('/log', [isSecured, isVerified], async (req, res) => {
    const result = await UserKejaksaanService.GetLog();
    log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

router.post('/restore', [isSecured, isVerified], async (req, res) => {
    const userKejaksaanData = req.body;
    const files = req.file;
    const user = req.user;

    const result = await UserKejaksaanService.Restore(userKejaksaanData, files, user);
    log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

router.get('/get', [isSecured, isVerified], async (req, res) => {
    const user = req.user;

    const result = await UserKejaksaanService.GetUser(user);
    log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

router.get('/get/:id', [isSecured, isVerified], async (req, res) => {
    const user_kejaksaan_id = req.params.id
    const user = req.user;

    const result = await UserKejaksaanService.GetById(user_kejaksaan_id, user);
    log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

router.post('/datatables', [isSecured, isVerified], async (req, res) => {
    const userKejaksaanData = req.body;
    const user = req.user;

    const result = await UserKejaksaanService.GetDatatables(userKejaksaanData, user);
    log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

module.exports = router;