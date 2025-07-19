const express = require('express');
const router = express.Router();
const Group = require('../models/groups');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { grouppastorstatus, managerstatus} = require('../utils/authstatus.js');
const {
    creategroup,
    addGroupPage,
    updatepage,
    updategroup,
    deletegroup, showGroupPage, grouptable} = require('../controllers/groups')

router.use(grouppastorstatus);

router.get('/groupPage', catchAsync(showGroupPage));

router.use(managerstatus);

router.post('/create', catchAsync(creategroup));

router.get('/main', catchAsync(addGroupPage));

router.get('/grouptable', catchAsync(grouptable));

router.get('/:id/edit', catchAsync(updatepage));

router.put('/:id', catchAsync(updategroup));

router.delete('/:id', catchAsync(deletegroup));

module.exports = router;
