const User = require('../models/users');
const Group = require('../models/groups');
const Church = require('../models/churches');
const Member = require('../models/members');
const Attendance = require('../models/attendance');
const Offering = require('../models/offering');
const bcrypt = require('bcryptjs');
const ExpressError = require('../utils/ExpressError');
const nodemailer = require('nodemailer');

const { calculateMonthlyAttendanceTotals, getPast12MonthLabels, calculateMonthlyOfferingTotals } = require("../functions/calGeneralReport")


const loginpage = (req, res) => {
    res.render('login');
};

const showManagerPage = async (req, res) => {
    const groupCount = await Group.countDocuments();
    const churchCount = await Church.countDocuments();
    const usersCount = await User.countDocuments({ status: { $ne: 'manager' } });
    const membersCount = await Member.countDocuments();
    const adultFemale = await Member.countDocuments({ gender: 'female', category: 'adult' });
    const adultmale = await Member.countDocuments({ gender: 'male', category: 'adult' });
    const youthFemale = await Member.countDocuments({ gender: 'female', category: 'youth' });
    const youthmale = await Member.countDocuments({ gender: 'male', category: 'youth' });
    const childrenFemale = await Member.countDocuments({ gender: 'female', category: 'children' });
    const childrenmale = await Member.countDocuments({ gender: 'male', category: 'children' });

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // start of 12 months ago
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);    // end of current month

    const attendances = await Attendance.find({
        date: { $gte: startDate, $lte: endDate }
    });

    const offerings = await Offering.find({
        date: { $gte: startDate, $lte: endDate }
    });

    const { firstOffering, secondOffering } = calculateMonthlyOfferingTotals(offerings);

    const { adults, youths, children } = calculateMonthlyAttendanceTotals(attendances);
    const labels = getPast12MonthLabels();

    const demographicCounts = [adultmale, adultFemale, youthmale, youthFemale, childrenmale, childrenFemale];
    res.render('pages/index3', {
        req, groupCount, churchCount, usersCount, membersCount,
        labels: JSON.stringify(labels),
        adults: JSON.stringify(adults),
        youths: JSON.stringify(youths),
        children: JSON.stringify(children),
        firstOffering: JSON.stringify(firstOffering),
        secondOffering: JSON.stringify(secondOffering),
        demographicCounts: JSON.stringify(demographicCounts)
    });
};

const takelogindetails = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).populate('memberId');
    if (user && await bcrypt.compare(password, user.password)) {
        if (user.status === 'manager') {
            req.session.status = user.status;
            req.session.userId = user._id;
            req.session.isloggedin = true;
            return res.redirect('/managerPage');
        } else if (user.status === 'grouppastor' || user.status === 'groupadmin') {
            req.session.status = user.status;
            req.session.groupId = user.memberId.groupId;
            req.session.userId = user._id;
            req.session.isloggedin = true;
            return res.redirect('/group/groupPage');
        } else if (user.status === 'pastor' || user.status === 'admin') {
            req.session.status = user.status;
            req.session.churchId = user.memberId.churchId;
            req.session.userId = user._id;
            req.session.isloggedin = true;
            return res.redirect(`/church/read/${user.memberId.churchId}`);
        };
    }
    else {
        req.flash('error', 'Username or password is incorrect.')
        return res.redirect('/');
    };
};

const resetpasswordpage = async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.redirect('/');
    };
    const resettoken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedresettoken = await bcrypt.hash(resettoken, 6);
    const passwordResetTokenExpires = Date.now();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Email,
            pass: process.env.password
        }
    });

    const mailOptions = {
        from: process.env.Email,
        to: req.body.email,
        subject: 'Sending Email using Node.js',
        text: `A Password Reset Request has been received. Please use the six digit token below
         to reset your password.\n\n\n${resettoken}
        \n\nNOTE\nThis token is valid for Only five minutes.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            req.flash('error', 'Something went wrong')
            return res.redirect('/');
        }
        else {
        }
    });
    await User.findByIdAndUpdate(user._id, { hashedresettoken, passwordResetTokenExpires })
    req.flash('success', 'Resettoken sent to Email.\nToken is only valid for five minutes.')
    return res.render('token');
};

const checktokenpage = async (req, res) => {
    const { resettoken, email } = req.body;
    const user = await User.findOne({ email });
    const time = user.passwordResetTokenExpires;
    const timediff = Date.now() - time;
    if (user && await bcrypt.compare(resettoken, user.hashedresettoken) && timediff < '300000') {
        res.render('inputpass');
        req.session.globaluserId = user._id;
    }
    else {
        req.flash('error', 'Invalid token')
        res.redirect('/');
    }
};

const resetpassword = async (req, res) => {
    globaluserId = req.session.globaluserId;

    const { password, confirm, } = req.body;
    // if the manager wants to change the password of a user he can do 
    // it straight from his/her portal therefore the id of the user will 
    // be added automatically hence the Id of the user can be gotten from the req.body
    // if not then the Id of the user will be obtained from the globaluserId.
    const userId = req.body.userId;
    if (userId) {
        globaluserId = userId;
    }
    if (password !== confirm) {
        req.flash('error', 'Re-enter password')
        return res.render('inputpass');
    }
    else {
        const hashedpassword = await bcrypt.hash(password, 12);
        const userfound = await User.findByIdAndUpdate(globaluserId, { password: hashedpassword });
        //Here i want to check if its the manger then He will be redirected to "view user details" page.
        // if not then the user will be redirected to the log In page to log In from there
        // so if there was a userId in the req.body then that means the request is from the manager.
        if (userId) {
            return res.redirect(`user/read/${userId}`);
        }
        req.flash('success', 'Password reset successful')
        return res.redirect('/');
    }
};

module.exports = {
    loginpage,
    takelogindetails,
    resetpasswordpage,
    checktokenpage,
    resetpassword,
    showManagerPage
};
