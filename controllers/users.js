const User = require('../models/users');
const Member = require('../models/members');
const Group = require('../models/groups');
const Church = require('../models/churches');

const bcrypt = require('bcryptjs');
const ExpressError = require('../utils/ExpressError');
const cloudinary = require('../utils/cloudinary');
const MemberModel = require('../models/members');

const adduserpage = async (req, res) => {
    if (req.session.status === 'manager') {
        const members = await Member.find({});
        return res.render('userCrud/addUser', { req, members });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const members = await Member.find({ groupId: req.session.groupId });
        return res.render('userCrud/addUser', { req, members });
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        const members = await Member.find({ churchId: req.session.churchId });
        return res.render('userCrud/addUser', { req, members });
    } else {

    }
};

const adduser = async (req, res) => {
    const username = await User.findOne({ username: req.body.user.username });

    if (!/^[a-zA-Z0-9_]+$/.test(req.body.username)) {
        req.flash('error', 'Username can only contain letters, numbers, and underscores.')
        return res.redirect('/user/churchUser');
    }
    if (username) {
        req.flash('error', 'Username already exist.')
        return res.redirect('/user/churchUser');
    } else {
        const password = await bcrypt.hash(req.body.user.password, 12);
        const user = new User({ ...req.body.user, password: password });
        await user.save();
        req.flash('success', 'User successfully added.')
        return res.redirect('/user/churchUser');
    }
};

const editUserPage = async (req, res) => {
    const user = await User.findById(req.params.id)
    res.render('userCrud/editUser', { user, req });
};

const updateuser = async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { ...req.body.user });
    req.flash('success', 'User details successfully updated.')
    return res.redirect('/user/userstable');
};

const deleteuser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'User successfully deleted.')
    res.redirect('/user/userstable');
}; 5

const userstablepage = async (req, res) => {
    if (req.session.status === 'manager') {
        const users = await User.find({ status: { $ne: "manager" } }).populate('memberId');
        return res.render('userCrud/usersTable', { users, req });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const all_users = await User.find({}).populate('memberId');
        const users = [];
        for (const each of all_users) {
            if (each.memberId && each.memberId.groupId) {
                if (each.memberId.groupId.toString() === req.session.groupId.toString()) {
                    users.push(each);
                }
            }
        }
        return res.render('userCrud/usersTable', { users, req: req });
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        const all_users = await User.find({ status: { $nin: ["manager", "grouppastor", "groupadmin"]} }).populate('memberId');
        const users = [];
        for (const each of all_users) {
            if (each.memberId && each.memberId.churchId) {
                if (each.memberId.churchId.toString() === req.session.churchId.toString()) {
                    users.push(each);
                }
            }
        }
        return res.render('userCrud/usersTable', { users, req: req });
    } else {

    }
};

module.exports = {
    adduser,
    adduserpage,
    userstablepage,
    updateuser,
    deleteuser,
    editUserPage
};