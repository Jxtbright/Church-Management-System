const mongoose = require('mongoose');

const ChurchSchema = mongoose.Schema({
    churchname:{
        type: String
    },
    groupId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Group'
    }
});
const ChurchModel = mongoose.model('Church', ChurchSchema);

module.exports = ChurchModel;