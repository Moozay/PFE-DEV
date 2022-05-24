const express = require('express')
const route = express.Router()





route.get('/', (req, res)=>{
    let garcon,fille,enseignant,laureat,reuissite
    Chiffre.find({}).then((result)=>{
        garcon = result[0].nombre;
        fille = result[1].nombre;
        enseignant = result[2].nombre;
        laureat = result[3].nombre;
        reuissite = result[4].nombre;
        let data={garcon,fille,enseignant,laureat,reuissite}
        res.render("index",{data})
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
});

route.get('/login', (req,res)=>{
    let error = req.query.error 
    res.render("login", {error});
});

route.get('/apropos', (req,res)=>{
    let error = req.query.error 
    res.render("apropos");
});
route.get('/contact', (req,res)=>{
    res.render("contact");
});

route.post('/entre',(req,res)=>{
    console.log(req.body)
    
})

route.get('/accueiladmin',(req,res)=>{
    let error = req.query.error
    User.find({}).then((result)=>{
        console.log(result);
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    res.render("accueiladmin", {results});
});



module.exports = route
