const mongoose = require('mongoose');

const AttendanceSchema = mongoose.Schema({

    reason: {
        type: String
    },
    date: {
        type: Date
    },
    adultmale: {
        type: Number
    },
    adultfemale: {
        type: Number
    },
    youthmale: {
        type: Number
    },
    youthfemale: {
        type: Number
    },
    childrenmale: {
        type: Number
    },
    childrenfemale: {
        type: Number
    },
    newcomersmales: {
        type: Number
    },
    newcomersfemales: {
        type: Number
    },
    dayName: {
        type: String
    },
    churchId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Church'
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Group'
    }
});

const AttendanceModel = mongoose.model('Attendance', AttendanceSchema);

module.exports = AttendanceModel;