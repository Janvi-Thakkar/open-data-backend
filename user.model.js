const mongoose = require('mongoose');



const data = new mongoose.Schema({
    link: {
        type: String,
    },
    file: {
        type: String
    },
    title: {
        type: String,
    },
    desc: {
        type: String,
    },
    keywords: {
        type: String,
    },
    category: {
        type: String,
    },
    license: {
        type: String,
    },
    comment: {
        type: String,
    },
    date: {
        type: String
    },
    id:{
        type:String
    }
}
)
const Register = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    org: {
        type: String,
        required: true
    },
    data: [data]
},
    { collection: 'UserData' }
)




const model = mongoose.model("UserData", Register);
module.exports = model;