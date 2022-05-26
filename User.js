const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

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
})

//static method to login user
UserSchema.statics.login = async function(email, password, role){
    const user = await this.findOne({ Email: email });
   

    if (user) {
       const auth= await bcrypt.compare(password, user.password)
       if (auth) {
        if (user.role === role) {
           return user
        }
        throw Error ('incorrect role')
       }
       throw Error ('incorrect password')
    }
    throw Error ('incorrect email')
}



module.exports = mongoose.model('User', UserSchema)
const User = mongoose.model('user', UserSchema);