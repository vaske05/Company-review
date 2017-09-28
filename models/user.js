//User Schema 
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');


var userSchema = mongoose.Schema({
    fullname: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String }, //Nema require zbog facebook konekcije
    role: { type: String, default: '' },
    company: {
        name: { type: String, default: '' },
        image: { type: String, default: '' }
    },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Date, default: Date.now },
    facebook: { type: String, default:'' },
    tokens: Array
});

//Encryption for password
userSchema.methods.encryptPassword = (password) => {  
    return bcrypt.hashSync(password); 
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password,this.password); //Ovde je problem ali ne znam zasto(REŠENO)
}

module.exports = mongoose.model('User', userSchema); 