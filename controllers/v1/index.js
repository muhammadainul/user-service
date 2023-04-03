const express = require('express');
const router = express.Router();

const debug = require('debug');
const log = debug('user-service:');

const UserService = require('../../services/user');
const LogService = require('../../services/log');
const ApiService = require('../../services/public_api');
const SatkerService = require('../../services/satker');

const { isVerified } = require('../../middlewares/isVerified');
const { isSecured } = require('../../middlewares/isSecured');

router.post('/', [isVerified, isSecured], async (req, res) => {
    const files = req.file;
    const userData = req.body;
    const user = req.user;

    const result = await UserService.Create(userData, files, user);
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

router.post('/register', async (req, res) => {
    const files = req.file;
    const userData = req.body;

    const result = await UserService.Register(userData, files);
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

router.get('/confirmation/token/:token', async (req, res) => {
    const tokenData = req.params.token;

    const result = await UserService.Verified(tokenData);
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

router.get('/get/:id', [isVerified, isSecured], async (req, res) => {
    const userId = req.params.id;

    const result = await UserService.GetById(userId);
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

router.get('/kewenangan/:id', [isVerified, isSecured], async (req, res) => {
    const kewenangan_id = req.params.id;
    const userData = req.body;

    const result = await UserService.GetByKewenangan(kewenangan_id, userData);
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

router.get('/level/:id', [isVerified, isSecured], async (req, res) => {
    const level_id = req.params.id;
    const userData = req.body;

    const result = await UserService.GetByLevel(level_id, userData);
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

router.post('/datatables', [isVerified, isSecured], async (req, res) => {
    const userData = req.body;

    const result = await UserService.GetDatatables(userData);
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

router.post('/update/role', [isVerified, isSecured], async (req, res) => {
    const userData = req.body;
    const user = req.user;
    
    const result = await UserService.UpdateRole(userData, user);
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

router.put('/update/profile/:id', [isVerified, isSecured], async (req, res) => {
    const user_id = req.params.id;
    const files = req.file;
    const userData = req.body;
    const user = req.user;

    const result = await UserService.UpdateProfile(user_id, files, userData, user);
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

router.put('/update/password/:id', [isVerified, isSecured], async (req, res) => {
    const user_id = req.params.id;
    const userData = req.body;
    const user = req.user;

    const result = await UserService.UpdatePassword(user_id, userData, user);
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

router.post('/restore', [isVerified, isSecured], async (req, res) => {
    const indexData = req.body;
    const fileData = req.file;
    const user = req.user;

    const result = await SatkerService.Restore(indexData, fileData, user);
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

// Public api
router.post('/public', [isVerified, isSecured], async (req, res) => {
    const userData = req.body;

    const result = await ApiService.Create(userData);
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

router.put('/public/:id', [isVerified, isSecured], async (req, res) => {
    const userData = req.body;
    const public_id = req.params.id;

    const result = await ApiService.Update(public_id, userData);
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

router.delete('/public/:id', [isVerified, isSecured], async (req, res) => {
    const public_id = req.params.id;

    const result = await ApiService.Delete(public_id);
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

router.get('/public/:id', [isVerified, isSecured], async (req, res) => {
    const public_id = req.params.id;

    const result = await ApiService.GetById(public_id);
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

router.post('/public/datatables', [isVerified, isSecured], async (req, res) => {
    const userData = req.body;

    const result = await ApiService.GetDatatables(userData);
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

// Log
router.post('/log/add', [isVerified, isSecured], async (req, res) => {
    const logData = req.body;

    const result = await LogService.Create(logData);
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

router.post('/log/datatables', [isVerified, isSecured], async (req, res) => {
    const logData = req.body;

    const result = await LogService.GetDatatables(logData);
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

router.post('/log/history', [isVerified, isSecured], async (req, res) => {
    const logData = req.body;

    const result = await LogService.GetHistoryData(logData);
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