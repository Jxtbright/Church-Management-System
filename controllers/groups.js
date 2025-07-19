const Group = require('../models/groups');
const Church = require('../models/churches');
const User = require('../models/users');
const Member = require('../models/members');
const Attendance = require('../models/attendance');
const Offering = require('../models/offering');
const ExpressError = require('../utils/ExpressError');
const { calculateMonthlyAttendanceTotals, getPast12MonthLabels, calculateMonthlyOfferingTotals } = require("../functions/calGeneralReport")



const showGroupPage = async (req, res) => {
    const churchCount = await Church.countDocuments({ groupId: req.session.groupId });

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
                'member.groupId': req.session.groupId
            }
        },
        {
            $count: 'total'
        }
    ]);
    const usersCount = count[0]?.total || 0;

    const membersCount = await Member.countDocuments({ groupId: req.session.groupId });
    const workersCount = await Member.countDocuments({ groupId: req.session.groupId, memberstatus: 'worker' });
    const adultFemale = await Member.countDocuments({ groupId: req.session.groupId, gender: 'female', category: 'adult' });
    const adultmale = await Member.countDocuments({ groupId: req.session.groupId, gender: 'male', category: 'adult' });
    const youthFemale = await Member.countDocuments({ groupId: req.session.groupId, gender: 'female', category: 'youth' });
    const youthmale = await Member.countDocuments({ groupId: req.session.groupId, gender: 'male', category: 'youth' });
    const childrenFemale = await Member.countDocuments({ groupId: req.session.groupId, gender: 'female', category: 'children' });
    const childrenmale = await Member.countDocuments({ groupId: req.session.groupId, gender: 'male', category: 'children' });

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // start of 12 months ago
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);    // end of current month

    const attendances = await Attendance.find({
        date: { $gte: startDate, $lte: endDate },
        groupId: req.session.groupId
    });

    const offerings = await Offering.find({
        date: { $gte: startDate, $lte: endDate },
        groupId: req.session.groupId
    });

    const { firstOffering, secondOffering } = calculateMonthlyOfferingTotals(offerings);

    const { adults, youths, children } = calculateMonthlyAttendanceTotals(attendances);
    const labels = getPast12MonthLabels();

    const demographicCounts = [adultmale, adultFemale, youthmale, youthFemale, childrenmale, childrenFemale];
    return res.render('pages/index2', {
        req, churchCount, usersCount, membersCount, workersCount,
        labels: JSON.stringify(labels),
        adults: JSON.stringify(adults),
        youths: JSON.stringify(youths),
        children: JSON.stringify(children),
        firstOffering: JSON.stringify(firstOffering),
        secondOffering: JSON.stringify(secondOffering),
        demographicCounts: JSON.stringify(demographicCounts)
    });
}

const addGroupPage = async (req, res) => {
    const groups = await Group.find({});
    res.render('groupCrud/addGroupPage', { req });
};

const creategroup = async (req, res) => {
    const group = new Group(req.body.group)
    await group.save();
    req.flash('success', 'Group successfully added.')
    res.redirect('/group/main');
};

const grouptable = async (req, res) => {
    const groups = await Group.find({});
    res.render('groupCrud/grouptable', { groups, req });
};

const updatepage = async (req, res) => {
    const group = await Group.findById(req.params.id);
    res.render('groupCrud/update', { group, req });
};

const updategroup = async (req, res) => {
    await Group.findByIdAndUpdate(req.params.id, { ...req.body.group });
    req.flash('success', 'Group details successfully updated.')
    res.redirect('/group/grouptable')
};

const deletegroup = async (req, res) => {
    await Group.findByIdAndDelete(req.params.id);
    req.flash('error', 'Group successfully deleted.')
    res.redirect('/group/grouptable');
};

module.exports = {
    creategroup,
    addGroupPage,
    updatepage,
    updategroup,
    deletegroup,
    showGroupPage,
    grouptable
};