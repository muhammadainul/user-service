const express = require('express');
const router = express.Router();

const debug = require('debug');
const log = debug('user-service:pegawai:');

const PegawaiService = require('../../services/pegawai');

const { isVerified } = require('../../middlewares/isVerified');
const { isSecured } = require('../../middlewares/isSecured');

router.post('/', [isSecured, isVerified], async (req, res) => {
    const pegawaiData = req.body;
    const user = req.user;

    const result = await PegawaiService.Create(pegawaiData, user);
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

router.put('/:id', [isSecured, isVerified], async (req, res) => {
    const pegawai_id = req.params.id
    const pegawaiData = req.body;
    const user = req.user;

    const result = await PegawaiService.Update(pegawai_id, pegawaiData, user);
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

router.delete('/:id', [isSecured, isVerified], async (req, res) => {
    const pegawai_id = req.params.id
    const user = req.user;

    const result = await PegawaiService.Delete(pegawai_id, user);
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

router.get('/', [isSecured, isVerified], async (req, res) => {
    const result = await PegawaiService.Get();
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
    const pegawai_id = req.params.id

    const result = await PegawaiService.GetById(pegawai_id);
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
    const pegawaiData = req.body;

    const result = await PegawaiService.GetDatatables(pegawaiData);
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