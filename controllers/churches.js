const Church = require('../models/churches');
const Group = require('../models/groups');
const User = require('../models/users');
const Member = require('../models/members');
const Attendance = require('../models/attendance');
const Offering = require('../models/offering');
const mongoose = require('mongoose');

const { calculateMonthlyAttendanceTotals, getPast12MonthLabels, calculateMonthlyOfferingTotals } = require("../functions/calGeneralReport")



const displaychurch = async (req, res) => {
    const church = await Church.findById(req.params.id);
    const count = await User.aggregate([
        {
            $lookup: {
                from: 'members',
                localField: 'memberId',
                foreignField: '_id',
                as: 'member'
            }
        },
        {
            $unwind: '$member'
        },
        {
            $match: {
                'member.churchId': new mongoose.Types.ObjectId(req.params.id)
            }
        },
        {
            $count: 'total'
        }
    ]);
    const usersCount = count[0]?.total || 0;

    const membersCount = await Member.countDocuments({ churchId: req.params.id });
    const workersCount = await Member.countDocuments({ churchId: req.params.id, memberstatus: 'worker' });
    const adultFemale = await Member.countDocuments({ churchId: req.params.id, gender: 'female', category: 'adult' });
    const adultmale = await Member.countDocuments({ churchId: req.params.id, gender: 'male', category: 'adult' });
    const youthFemale = await Member.countDocuments({ churchId: req.params.id, gender: 'female', category: 'youth' });
    const youthmale = await Member.countDocuments({ churchId: req.params.id, gender: 'male', category: 'youth' });
    const childrenFemale = await Member.countDocuments({ churchId: req.params.id, gender: 'female', category: 'children' });
    const childrenmale = await Member.countDocuments({ churchId: req.params.id, gender: 'male', category: 'children' });

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // start of 12 months ago
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);    // end of current month

    const attendances = await Attendance.find({
        date: { $gte: startDate, $lte: endDate },
        churchId: req.params.id
    });

    const offerings = await Offering.find({
        date: { $gte: startDate, $lte: endDate },
        churchId: req.params.id
    });

    const { firstOffering, secondOffering } = calculateMonthlyOfferingTotals(offerings);

    const { adults, youths, children } = calculateMonthlyAttendanceTotals(attendances);
    const labels = getPast12MonthLabels();

    const demographicCounts = [adultmale, adultFemale, youthmale, youthFemale, childrenmale, childrenFemale];
    return res.render('pages/index', { church, req, usersCount, membersCount, workersCount, 
        labels: JSON.stringify(labels),
        adults: JSON.stringify(adults),
        youths: JSON.stringify(youths),
        children: JSON.stringify(children),
        firstOffering: JSON.stringify(firstOffering),
        secondOffering: JSON.stringify(secondOffering),
        demographicCounts: JSON.stringify(demographicCounts) });
};

const creatChurchesPage = async (req, res) => {
    if (req.session.status === "manager") {
        const groups = await Group.find({});
        return res.render('churchCrud/addChurchPage', { req, groups })
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        return res.render('churchCrud/addChurchPage', { req });
    }
};

const createchurch = async (req, res) => {
    if (req.session.status === 'manager') {
        const church = new Church({ churchname: req.body.church.name, groupId: req.body.church.groupId });
        await church.save();
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const church = new Church({ churchname: req.body.church.name, groupId: req.session.groupId });
        await church.save();
    }
    req.flash('success', 'Church successfully added.')
    return res.redirect('/church/create/page');
};

const churchtable = async (req, res) => {
    if (req.session.status === "manager") {
        const churches = await Church.find({}).populate('groupId');
        return res.render('churchCrud/churchtable', { churches, req });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const churches = await Church.find({ groupId: req.session.groupId }).populate('groupId');
        return res.render('churchCrud/churchtable', { churches, req });
    } else {

    }
};

const updatepage = async (req, res) => {
    const church = await Church.findById(req.params.id);
    res.render('churchCrud/update', { church, req });
};

const updatechurch = async (req, res) => {
    await Church.findByIdAndUpdate(req.params.id, { ...req.body.church });
    req.flash('success', 'Church details successfully updated.')
    res.redirect('/church/churchtable');
};

const deletechurch = async (req, res) => {
    await Church.findByIdAndDelete(req.params.id);
    req.flash('success', 'Church successfully deleted.')
    res.redirect('/church/churchtable');
};

module.exports = {
    displaychurch,
    createchurch,
    creatChurchesPage,
    churchtable,
    updatepage,
    updatechurch,
    deletechurch
}