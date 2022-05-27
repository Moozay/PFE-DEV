const mongoose = require('mongoose');

const SecondeSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    sexe: {
        type: String,
        required: true
    },
    nompere: {
        type: String,
        required: true
    },
    nommere: {
        type: String,
        required: true
    },
    propere: {
        type: String,
        required: true
    },
    promere: {
        type: String,
        required: true
    },
    nomtuteur: {
        type: String,
        required: true
    },
    protuteur: {
        type: String,
        required: true
    },
    numtuteur: {
        type: String,
        required: true
    },
    devoir: {
        mathematique:{
           note1 : {
               type: String,
           },
           note2 : {
               type: String, 
           },
           note3 : {
            type: String, 
            },
            appreciation : {
                type: String, 
                }  
        },
        biologie:{
            note1 : {
                type: String,
            },
            note2 : {
                type: String, 
            },
            note3 : {
             type: String, 
             },
             appreciation : {
                 type: String, 
                 }  
         },
         anglais:{
            note1 : {
                type: String,
            },
            note2 : {
                type: String, 
            },
            note3 : {
             type: String, 
             },
             appreciation : {
                 type: String, 
                 }  
         },
         physique:{
            note1 : {
                type: String,
            },
            note2 : {
                type: String, 
            },
            note3 : {
             type: String, 
             },
             appreciation : {
                 type: String, 
                 }  
         },
         chimie:{
            note1 : {
                type: String,
            },
            note2 : {
                type: String, 
            },
            note3 : {
             type: String, 
             },
             appreciation : {
                 type: String, 
                 }  
         },
         philosophe:{
            note1 : {
                type: String,
            },
            note2 : {
                type: String, 
            },
            note3 : {
             type: String, 
             },
             appreciation : {
                 type: String, 
                 }  
         },
         informatique:{
            note1 : {
                type: String,
            },
            note2 : {
                type: String, 
            },
            note3 : {
             type: String, 
             },
             appreciation : {
                 type: String, 
                 }  
         },
         conduite:{
            note1 : {
                type: String,
            },
            note2 : {
                type: String, 
            },
            note3 : {
             type: String, 
             },
             appreciation : {
                 type: String, 
                 }  
         },
         francais:{
            note1 : {
                type: String,
            },
            note2 : {
                type: String, 
            },
            note3 : {
             type: String, 
             },
            appreciation : {
                type: String, 
                }  
         },
    },
    codeapogee:{
        type: String,
    }

})

module.exports = mongoose.model('Seconde', SecondeSchema)