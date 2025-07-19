const express = require('express');
const router = express.Router();
const { grouppastorstatus } = require('../utils/authstatus.js');
// const managerstatus = require('../utils/authmanager');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const { 
    displaychurch,
    createchurch, 
    creatChurchesPage, 
    churchtable, 
    updatepage, 
    updatechurch, 
    deletechurch} = require('../controllers/churches')


router.get('/read/:id', catchAsync(displaychurch));

router.use(grouppastorstatus);

router.get('/create/page', catchAsync(creatChurchesPage));

router.get('/churchtable', catchAsync(churchtable));

router.post('/create', catchAsync(createchurch));

router.get('/:id/edit', catchAsync(updatepage));

router.put('/:id', catchAsync(updatechurch));

router.delete('/:id', catchAsync(deletechurch));

module.exports = router;