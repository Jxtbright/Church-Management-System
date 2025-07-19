const Member = require('../models/members');
const Church = require('../models/churches');
const Group = require('../models/groups');
const ExpressError = require('../utils/ExpressError');
const Arkesel = require('arkesel-js');
const cloudinary = require('../utils/cloudinary')
// const flash = require('connect-flash');


// router.get('/create/:churchId', (req, res) => {
//     const churchId = req.params.churchId;
//     res.render('memberCrud/create', {churchId});
// });
const addmemberpage = async (req, res) => {
    if (req.session.status === 'manager') {
        const churches = await Church.find({});
        return res.render('memberCrud/addMember', { req, churches });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const churches = await Church.find({ groupId: req.session.groupId });
        return res.render('memberCrud/addMember', { req, churches });
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        return res.render('memberCrud/addMember', { req });
    } else {

    }
};

const addmember = async (req, res) => {
    try {
        if (req.body.member.croppedImage === '') {
            if (req.session.status === 'pastor' || req.session.status === 'admin') {
                const churchId = req.session.churchId;
                const church = await Church.findById(churchId);
                const member = new Member({ ...req.body.member, churchId, groupId: church.groupId });
                await member.save();
                req.flash('success', 'Member successfully registered.');
                return res.redirect('/member/addMember');
            } else if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
                const church = await Church.findById(req.body.member.churchId);
                const member = new Member({ ...req.body.member, groupId: church.groupId });
                await member.save();
                req.flash('success', 'Member successfully registered.');
                return res.redirect('/member/addMember');
            }
        } else if (req.body.member.croppedImage !== '') {
            const results = await cloudinary.uploader.upload(req.body.member.croppedImage, { folder: 'images' })
            if (req.session.status === 'pastor' || req.session.status === 'admin') {
                const churchId = req.session.churchId;
                const church = await Church.findById(churchId);
                const member = new Member({ ...req.body.member, churchId, groupId: church.groupId, image: { url: results.secure_url, public_id: results.public_id } });
                await member.save();
                req.flash('success', 'Member successfully registered.');
                return res.redirect('/member/addMember');
            } else if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
                const church = await Church.findById(req.body.member.churchId);
                const member = new Member({ ...req.body.member, groupId: church.groupId, image: { url: results.secure_url, public_id: results.public_id } });
                await member.save();
                req.flash('success', 'Member successfully registered.');
                return res.redirect('/member/addMember');
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const editMemberPage = async (req, res) => {
    const member = await Member.findById(req.params.id)
    return res.render('memberCrud/editMember', { member, req });
};

const updatemember = async (req, res) => {
    if (req.body.member.croppedImage !== '') {
        const member = await Member.findById(req.params.id);
        await cloudinary.uploader.destroy(member.image.public_id);
        const results = await cloudinary.uploader.upload(req.body.member.croppedImage, { folder: 'images' });
        await Member.findByIdAndUpdate(req.params.id, { ...req.body.member, image: { url: results.secure_url, public_id: results.public_id } });
        req.flash('success', 'Member details successfully updated.');
        return res.redirect('/member/memberstable')
    } else {
        await Member.findByIdAndUpdate(req.params.id, { ...req.body.member });
        req.flash('success', 'Member details successfully updated.');
        return res.redirect('/member/memberstable')
    }
};

const deletemember = async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (member.image.public_id) {
        await cloudinary.uploader.destroy(member.image.public_id);
    }
    await Member.findByIdAndDelete(req.params.id);
    req.flash('error', 'Member successfully deleted.');
    return res.redirect('/member/memberstable');
};

const memberstablepage = async (req, res) => {
    if (req.session.status === 'manager') {
        const members = await Member.find({});
        return res.render('memberCrud/membersTable', { members, req });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const churches = await Church.find({ groupId: req.session.groupId })
        const members = [];
        for (church of churches) {
            const arr = await Member.find({ churchId: church._id })
            members.push(...arr)
        }
        return res.render('memberCrud/membersTable', { members, req })
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        const members = await Member.find({ churchId: req.session.churchId });
        return res.render('memberCrud/membersTable', { members, req })
    } else {

    }

};

const workerstablepage = async (req, res) => {
    if (req.session.status === 'manager') {
        const members = await Member.find({ memberstatus: { $eq: "worker" } });
        return res.render('memberCrud/membersTable', { members, req });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const churches = await Church.find({ groupId: req.session.groupId })
        const members = [];
        for (church of churches) {
            const arr = await Member.find({ $and: [{ churchId: church._id }, { memberstatus: { $eq: "worker" } }] });
            members.push(...arr)
        }
        return res.render('memberCrud/membersTable', { members, req })
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        const members = await Member.find({ $and: [{ churchId: req.session.churchId }, { memberstatus: { $eq: "worker" } }] });
        return res.render('memberCrud/membersTable', { members, req })
    } else {

    }
};

const adultstablepage = async (req, res) => {
    if (req.session.status === 'manager') {
        const members = await Member.find({ category: { $eq: "adult" } });
        return res.render('memberCrud/membersTable', { members, req });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const churches = await Church.find({ groupId: req.session.groupId })
        const members = [];
        for (church of churches) {
            const arr = await Member.find({ $and: [{ churchId: church._id }, { category: { $eq: "adult" } }] });
            members.push(...arr)
        }
        return res.render('memberCrud/membersTable', { members, req })
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        const members = await Member.find({ $and: [{ churchId: req.session.churchId }, { category: { $eq: "adult" } }] });
        return res.render('memberCrud/membersTable', { members, req })
    } else {

    }
};

const youthstablepage = async (req, res) => {
    if (req.session.status === 'manager') {
        const members = await Member.find({ category: { $eq: "youth" } });
        return res.render('memberCrud/membersTable', { members, req });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const churches = await Church.find({ groupId: req.session.groupId })
        const members = [];
        for (church of churches) {
            const arr = await Member.find({ $and: [{ churchId: church._id }, { category: { $eq: "youth" } }] });
            members.push(...arr)
        }
        return res.render('memberCrud/membersTable', { members, req })
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        const members = await Member.find({ $and: [{ churchId: req.session.churchId }, { category: { $eq: "youth" } }] });
        return res.render('memberCrud/membersTable', { members, req })
    } else {

    }

};

const childrentablepage = async (req, res) => {
    if (req.session.status === 'manager') {
        const members = await Member.find({ category: { $eq: "children" } });
        return res.render('memberCrud/membersTable', { members, req });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const churches = await Church.find({ groupId: req.session.groupId })
        const members = [];
        for (church of churches) {
            const arr = await Member.find({ $and: [{ churchId: church._id }, { category: { $eq: "children" } }] });
            members.push(...arr)
        }
        return res.render('memberCrud/membersTable', { members, req })
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        const members = await Member.find({ $and: [{ churchId: req.session.churchId }, { category: { $eq: "children" } }] });
        return res.render('memberCrud/membersTable', { members, req })
    } else {

    }

};

const sendMessagePage = async (req, res) => {
    if (req.session.status === 'manager') {
        const churches = await Church.find({});
        const groups = await Group.find({});
        return res.render('memberCrud/sendMessagePage', { req, churches, groups });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        const churches = await Church.find({ groupId: req.session.groupId });
        return res.render('memberCrud/sendMessagePage', { req, churches });
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
        return res.render('memberCrud/sendMessagePage', { req });
    } else {

    }
};

const sendMessage = async (req, res) => {
    async function forChurchLevelUser(churchId, category, salutation, message, add_name) {
        if (category == 'members') {
            const members = await Member.find({ $and: [{ churchId }, { category: { $ne: "children" } }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {
                    for (const member of members) {
                        const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                } else {
                    for (const member of members) {
                        const message = `${salutationTrim},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }

        }
        else if (req.body.category == 'workers') {
            const members = await Member.find({ $and: [{ churchId }, { memberstatus: "worker" }, { category: { $ne: "children" } }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {
                    for (const member of members) {
                        const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                } else {
                    for (const member of members) {
                        const message = `${salutationTrim},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
        else if (req.body.category == 'adults') {
            const members = await Member.find({ $and: [{ churchId }, { category: "adult" }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {
                    for (const member of members) {
                        const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                } else {
                    for (const member of members) {
                        const message = `${salutationTrim},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
        else if (req.body.category == 'youths') {
            const members = await Member.find({ $and: [{ churchId }, { category: "youth" }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {
                    for (const member of members) {
                        const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                } else {
                    for (const member of members) {
                        const message = `${salutationTrim},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
        else if (req.body.category == 'males') {
            const members = await Member.find({ $and: [{ churchId }, { gender: "male" }, { category: { $ne: "children" } }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {
                    for (const member of members) {
                        const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                } else {
                    for (const member of members) {
                        const message = `${salutationTrim},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
        else if (req.body.category == 'females') {
            const members = await Member.find({ $and: [{ churchId }, { gender: "female" }, { category: { $ne: "children" } }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {
                    for (const member of members) {
                        const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                } else {
                    for (const member of members) {
                        const message = `${salutationTrim},\n${messageBody}`
                        const number = '+233' + member.phonenumber;
                        const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                        sms.send(number, message, null, (callback) => {
                        });
                    }
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
    }

    async function forGroupLevelUser(groupId, category, salutation, message, add_name) {
        if (category == 'members') {
            const members = await Member.find({ $and: [{ groupId }, { category: { $ne: "children" } }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {

                } else {

                }
                for (const member of members) {
                    const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, message, null, (callback) => {
                    });
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }

        }
        else if (req.body.category == 'workers') {
            const members = await Member.find({ $and: [{ groupId }, { memberstatus: "worker" }, { category: { $ne: "children" } }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {

                } else {

                }
                for (const member of members) {
                    const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, message, null, (callback) => {
                    });
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
        else if (req.body.category == 'adults') {
            const members = await Member.find({ $and: [{ groupId }, { category: "adult" }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {

                } else {

                }
                for (const member of members) {
                    const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, message, null, (callback) => {
                    });
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
        else if (req.body.category == 'youths') {
            const members = await Member.find({ $and: [{ groupId }, { category: "youth" }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {

                } else {

                }
                for (const member of members) {
                    const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, message, null, (callback) => {
                    });
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
        else if (req.body.category == 'males') {
            const members = await Member.find({ $and: [{ groupId }, { gender: "male" }, { category: { $ne: "children" } }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {

                } else {

                }
                for (const member of members) {
                    const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, message, null, (callback) => {
                    });
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
        else if (req.body.category == 'females') {
            const members = await Member.find({ $and: [{ groupId }, { gender: "female" }, { category: { $ne: "children" } }] });
            const messageBody = message.trim().charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            if (salutation !== '') {
                const salutationTrim = salutation.trim().charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
                if (req.body.agree === 'on') {

                } else {

                }
                for (const member of members) {
                    const message = `${salutationTrim} ${member.firstname},\n${messageBody}`
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, message, null, (callback) => {
                    });
                }
            }
            else {
                for (const member of members) {
                    const number = '+233' + member.phonenumber;
                    const sms = new Arkesel('Asiedu', 'OmF3NGw3dmdya1hiMHFCV2Q=');
                    sms.send(number, messageBody, null, (callback) => {
                    });
                }
            }
        }
    }

    if (req.session.status === 'pastor' || req.session.status === 'admin') {
        forChurchLevelUser(req.session.churchId, req.body.category, req.body.salutation, req.body.message);
    } else if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
        if (!req.body.groupId && req.body.churchId) {
            if (req.body.churchId === 'group') {
                forGroupLevelUser(req.session.groupId, req.body.category, req.body.salutation, req.body.message);
            } else {
                console.log(req.session.churchId)
                forChurchLevelUser(req.body.churchId, req.body.category, req.body.salutation, req.body.message);
            }
        } else if (req.body.groupId && !req.body.churchId) {
            forGroupLevelUser(req.body.groupId, req.body.category, req.body.salutation, req.body.message);
        }
    }
    req.flash('success', 'Message successfully sent.');
    return res.redirect('/member/sendMessagePage');
};



module.exports = {
    addmember,
    addmemberpage,
    workerstablepage,
    memberstablepage,
    adultstablepage,
    youthstablepage,
    childrentablepage,
    updatemember,
    deletemember,
    sendMessagePage,
    sendMessage,
    editMemberPage
};