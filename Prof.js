const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const ProfSchema = new mongoose.Schema({
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
    Matiere: {
        type: String,
        required: true
    },
    Classe: {
        type: String,
        required: true
    }
})
ProfSchema.statics.login = async function(email, password, role){
    const user = await this.findOne({ Email: email });
    if (user) {
       const auth= await bcrypt.compare(password, user.password)
       if (auth) {
        return user
       }
       throw Error ('incorrect password')
    }
    throw Error ('incorrect email')
}


module.exports = mongoose.model('Prof', ProfSchema)
