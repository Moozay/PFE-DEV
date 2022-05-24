const mongoose = require('mongoose');

const chiffreSchema = new mongoose.Schema({
    fig: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('chiffre', chiffreSchema);