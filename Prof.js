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


module.exports = mongoose.model('Prof', ProfSchema)
