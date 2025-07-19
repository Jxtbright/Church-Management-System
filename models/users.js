const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
    status:{
        type: String
    },
    username:{
        type: String,
        unique: true,
    },
    password:{
        type: String
    },
    memberId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Member'
    },
    passwordChangedAt: Date,
    hashedresettoken: String,
    passwordResetTokenExpires: Date
});


const UsersModel = mongoose.model('User', UsersSchema);

module.exports = UsersModel;