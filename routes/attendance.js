const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance.js');
const ExpressError = require('../utils/ExpressError.js');
const catchAsync = require('../utils/catchAsync.js');
const Offering = require('../models/offering')
const puppeteer = require('puppeteer');
const {checkDate, getDates, saveattendanceandoffering, 
    showcalendar, updatepage, update, deleteattendance, 
    searchattendance, attendancereport_monthly, attendancereport_general,
    generateattendancereport_monthly, generateattendancereport_general, generateReportPage, 
    generateMonthlyPage, addAttendancePage, readAttendance, 
    setChurchId, showSpecialServicePage, saveSpecialService, 
    SpecialServiceTable, EditSpecialServicePage, updatespecialservice, 
    deletespecialservice} = require('../controllers/attendence')


router.post('/create/:date', catchAsync(saveattendanceandoffering));

router.post('/saveSpecialService', catchAsync(saveSpecialService));

router.get('/check-date/:date', checkDate);

router.get('/get-dates/:date', getDates);

router.get('/calendar', catchAsync(showcalendar));

router.get('/specialService', catchAsync(showSpecialServicePage));

router.get('/specialServiceTable', catchAsync(SpecialServiceTable));

router.get('/:id/specialService', catchAsync(EditSpecialServicePage));

router.get('/calendar/:id', catchAsync(setChurchId));

router.get('/:id/readAttendance', catchAsync(readAttendance));

router.get('/:id/:date/attendancePage', catchAsync(addAttendancePage));

router.get('/:id/editpage', catchAsync(updatepage));

router.get('/report', catchAsync(generateReportPage));

router.get('/monthlyreport', catchAsync(generateMonthlyPage));

router.put('/specialservice/:id', catchAsync(updatespecialservice));

router.put('/:id/:date', catchAsync(update));

router.delete('/:id/delete', catchAsync(deleteattendance));

router.delete('/:id/deletespecialservice', catchAsync(deletespecialservice));

router.post('/search/:id', catchAsync(searchattendance));

router.post('/attendancereport_monthly', catchAsync(attendancereport_monthly));

router.post('/attendancereport_general', catchAsync(attendancereport_general));

router.get('/download_monthly', catchAsync(generateattendancereport_monthly));

router.get('/download_general', catchAsync(generateattendancereport_general));

module.exports = router;