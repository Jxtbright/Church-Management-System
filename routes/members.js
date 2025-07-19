const express = require('express');
const router = express.Router();
const Member = require('../models/members');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const {
    addmember,
    addmemberpage,
    workerstablepage,
    memberstablepage,
    adultstablepage,
    youthstablepage,
    childrentablepage,
    updatepage,
    updatemember,
    deletemember, 
    sendMessagePage, 
    sendMessage,
    editMemberPage} = require('../controllers/members')

// router.get('/create/:churchId', (req, res) => {
//     const churchId = req.params.churchId;
//     res.render('memberCrud/create', {churchId});
// });


router.get('/addMember', catchAsync(addmemberpage));

router.post('/create', catchAsync(addmember));

router.get('/workerstable', catchAsync(workerstablepage));

router.get('/memberstable', catchAsync(memberstablepage));

router.get('/adultstable', catchAsync(adultstablepage));

router.get('/youthstable', catchAsync(youthstablepage));

router.get('/childrentable', catchAsync(childrentablepage));

router.get('/sendMessagePage', catchAsync(sendMessagePage));

router.get('/:id/editMemberPage', catchAsync(editMemberPage));

router.post('/sendMessage', catchAsync(sendMessage));





// router.get('/read/:id', catchAsync( async (req, res) => {
//     const member = await Member.findById(req.params.id);
//     res.render('memberCrud/readMember', {member});
// }));

// router.get('/:id/edit', catchAsync(updatepage));

router.put('/:id', catchAsync(updatemember));

router.delete('/:id/delete', catchAsync(deletemember));

module.exports = router;