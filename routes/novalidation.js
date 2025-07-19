const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const {
    loginpage,
    takelogindetails,
    resetpasswordpage,
    checktokenpage,
    resetpassword, showManagerPage} = require('../controllers/novalidation')


router.get('/', loginpage);

router.get('/managerPage', catchAsync(showManagerPage));

router.post('/', catchAsync(takelogindetails));

router.post('/resetpassword', catchAsync(resetpasswordpage));

router.post('/token', catchAsync(checktokenpage));

router.patch('/newpassword', catchAsync(resetpassword));

module.exports = router;
