const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { pastorstatus } = require('../utils/authstatus.js');
const {
    adduser,
    adduserpage,
    userstablepage,
    updateuser,
    deleteuser,
    editUserPage} = require('../controllers/users')


router.get('/userstable', catchAsync(userstablepage));

router.use(pastorstatus);

router.post('/create', catchAsync(adduser));

router.get('/churchUser', catchAsync(adduserpage));

router.get('/:id/editUserPage', catchAsync(editUserPage));

router.put('/:id', catchAsync(updateuser));

router.delete('/:id', catchAsync(deleteuser));

module.exports = router;