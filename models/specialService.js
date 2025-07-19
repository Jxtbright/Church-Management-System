const mongoose = require('mongoose');

const SpecialServiceSchema = mongoose.Schema({
    date: {
        type: Date
    },
    adults: {
        type: Number
    },
    youths: {
        type: Number
    },
    children: {
        type: Number
    },
    category: {
        type: String
    },
    churchId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Church'
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Group'
    }
});

const SpecialServiceModel = mongoose.model('SpecialService', SpecialServiceSchema);

module.exports = SpecialServiceModel;