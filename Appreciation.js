const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const AppreciationSchema = new mongoose.Schema({
    Nomprof: {
        type: String,
        required: true
    },
    Matiere: {
        type: String,
        required: true
    },
    Ideleve: {
        type: String,
        required: true
    },
    Appreciation: {
        type: String,
        required: true
    },
    Date: {
        type: String,
        required: true
    }
})



module.exports = mongoose.model('Appreciation', AppreciationSchema)
