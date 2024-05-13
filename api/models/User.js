const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true
    },
    password:String
},{timestamps:true})

UserSchema.pre("save",async function(){
    if(!this.isModified("password")) return;
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password,salt);

})

const UserModel = mongoose.model("User",UserSchema);

module.exports = UserModel;

