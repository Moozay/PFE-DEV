const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const FactureSchema = new mongoose.Schema({
    Nomsociete: {
        type: String,
        required: true
    },
    Reference: {
        type: String,
        required: true
    },
    Date: {
        type: String,
        required: true
    }, 
    Designation: {
        type: String,
        required: true
    },
    Prixtotal: {
        type: String,
        required: true
    }
})



module.exports = mongoose.model('Facture', FactureSchema)
