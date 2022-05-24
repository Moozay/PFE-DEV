const express = require("express");
const session = require('express-session');
const {create} = require('express-handlebars');
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv').config();
const User = require('./User')
const Chiffre = require('./Chiffre')
const app = express();

const port = process.env.PORT || 3000;




const URI = process.env.MONGODB_URL
     mongoose.connect
     (URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }).then(()=>{
        console.log('connected to db');
    }).catch
    ((e)=>{
        console.log('error:' , e);
    })



//Middleware
app.use(express.static('public'))
// app.use(express.urlencoded({extended: true}))
app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(session({
    secret: "verygoodsecret", //add this variable to env file
    resave: false,
    saveUninitialized: true
}));


app.use(express.urlencoded({extended: false}));
app.use(express.json());


//passport.js
app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser(function (user, done){
    done(null, user.id);
});

passport.deserializeUser(function (id, none){
    User.findById(id, function (err, user){
        done(err, user);
    });
});

passport.use(new localStrategy(function (username, password, done){
    User.findOne({username: username}, function(err, user){
        if(err) return done(err);
        if(!user) return done(null, false, {message: 'Incorrect username.'});

        bcrypt.compare(password, user.password, function(err, res){
            if(err) return done(err);
            if (res === false) return done(null, false, {message: 'Incorrect password.'});

            return done(null, user);
        });
    });
}));
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect('/');
}

function isLoggedOut(req, res, next){
    if(!req.isAuthenticated()) return next();
    res.redirect('/');
}







app.get('/', (req, res)=>{
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

app.get('/login', (req,res)=>{
    let error = req.query.error 
    res.render("login", {error});
});

app.get('/apropos', (req,res)=>{
    let error = req.query.error 
    res.render("apropos");
});

app.get('/contact', (req,res)=>{
    res.render("contact");
});


app.get('/accueildirecteur', (req,res)=>{
    let garcon,fille,enseignant,laureat,reuissite
    Chiffre.find({}).then((result)=>{
        garcon = result[0].nombre;
        fille = result[1].nombre;
        enseignant = result[2].nombre;
        laureat = result[3].nombre;
        reuissite = result[4].nombre;
        let data={garcon,fille,enseignant,laureat,reuissite}
        res.render("accueildirecteur", {data})
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
});


app.post('/login',(req,res)=>{
    switch (req.body.role) {
        case "admin":
            res.redirect("/accueiladmin")
                break;
        case "directeur":
            res.redirect("/accueildirecteur");
                break;
        case "comptable":

                break;
        case "surveillant":
            res.redirect("/accueilsurveillant");
                break;

        case "professeur":

            break;      
        case "principal":

            break; 
        default:
            break;
    }
})

app.get('/accueiladmin',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("viewuser", {users});
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/accueilsurveillant',(req,res)=>{
    console.log("sur");
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("accueilsurveillant");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/staff',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("staff", {users});
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listedeclasse',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listedeclasse");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeeleves',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeeleves");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeclassebulletins',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeclassebulletins");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeelevesbulletin',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeelevesbulletin");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeelevesbulletin',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeelevesbulletin");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/attestationconvocationaccueil',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("attestationconvocationaccueil");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeclasseattestation',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeclasseattestation");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeeleveattestation',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeeleveattestation");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/accueilconvocation',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("accueilconvocation");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/bulletin',(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("bulletin");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/add_user',(req,res)=>{
    res.render("add_user")
})


app.listen(port, ()=>{
    console.log("listening on port 3000");
});