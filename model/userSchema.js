const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
    username : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : true,
    },
    phone : {
        type : Number,
         require : true
    },
    password : {
        type : String,
        require : true
    },
    cpassword:{
        type : String,
        require : true
    } ,

    token : {
        type : String
    }

});


const user = mongoose.model('user', userschema);
module.exports = user;