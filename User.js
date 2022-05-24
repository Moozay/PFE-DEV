const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    Firstname: {
        type: String,
        required: true
    },
    Lastname: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    }, 
    identifiant: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});
module.exports = mongoose.model('User', UserSchema)
const User = mongoose.model('user', UserSchema);