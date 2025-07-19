const mongoose = require('mongoose');

const GroupSchema = mongoose.Schema({
    name:{
        type: String
    }
});

const GroupModel = mongoose.model('Group', GroupSchema);

module.exports = GroupModel;