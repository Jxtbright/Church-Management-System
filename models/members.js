const mongoose = require('mongoose');

const MemberSchema = mongoose.Schema({
    firstname:{
        type: String
    },
    lastname:{
        type: String
    },
    email:{
        type: String
    },
    phonenumber:{
        type: Number
    },
    houseAddress:{
        type: String
    },
    gpsAddress:{
        type: String
    },
    gender:{
        type: String
    },
    relationshipstatus:{
        type: String
    },
    category:{
        type: String
    },
    workOrSchool:{
        type: String
    },
    levelOrPosition:{
        type: String
    },
    programOrDepartment:{
        type: String
    },
    emergencyContact:{
        type: String
    },
    emergencyContactName:{
        type: String
    },
    emergencyContactRelation:{
        type: String
    },
    memberstatus:{
        type: String
    },
    image:{
        url:{
            type: String
        },
        public_id:{
            type: String
        }
    },
    churchId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Church'
    },
    groupId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Group'
    }
});

const MemberModel = mongoose.model('Member', MemberSchema);

module.exports = MemberModel;