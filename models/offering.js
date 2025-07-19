const mongoose = require('mongoose');

const OfferingSchema = mongoose.Schema({
    firstoffering: {
        type: Number
    },
    secondoffering: {
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
    },
    attendanceId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Attendance'
    },
    date: {
        type: Date
    }
});

const OfferingModel = mongoose.model('Offering', OfferingSchema);

module.exports = OfferingModel;