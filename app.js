const express = require("express");
const {create} = require('express-handlebars');
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv').config();
const User = require('./User')
const Seconde = require('./Seconde')
const Premiere = require('./Premiere')
const Terminale = require('./Terminale')
const Prof = require('./Prof')
const Chiffre = require('./Chiffre')
const flash = require('express-flash')
const session = require('express-session')
const app = express();
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')


require('./passport-config')(passport)

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
app.use(express.json())
app.set('view engine', 'ejs')
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET, //add this variable to env file
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())



app.use(express.urlencoded({extended: false}));
app.use(express.json());



//error handler
const handleErrors = (err) =>{
    console.log(err.message, err.code);
    let errors = {email: '', password: '', role: ''}

    //incorrect email
    if(err.message == 'incorrect email'){
        errors.email = "User does not exist"
    }

     //incorrect password
     if(err.message == 'incorrect password'){
        errors.password = "Invalid password"
    }

    //incorrect role
    if(err.message == 'incorrect role'){
        errors.role = "User name does not match role"
    }

    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties})=>{
            errors[properties.path] = properties.message
        })
    }
    return errors
}
const checkUser = (req, res, next)=>{
    const token = req.cookies.jwt
    
    if (token) {
        jwt.verify(token, 'ags', async(err,  decordedToken) =>{
            if(err){
                console.log(err.message);
                res.locals.user = null
                next();
            }else{
                console.log(decordedToken);
                let user = await User.findById(decordedToken.id)
                res.locals.user = user
                next();
            }
        })
    } else{
        res.locals.user = null
        next()
    }
}
const mainAuth = (req, res, next) =>{
    const token = req.cookies.jwt


    if(token){
        jwt.verify(token, 'ags', (err,  decordedToken) =>{
            if(err){
                console.log(err.message);
                res.redirect('/login')
            }else{
                console.log(decordedToken);
                next();
            }
        })
    }
    else{
        res.redirect('/login')
    }
}

app.get('*', checkUser);

app.get("/", (req, res)=>{
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

app.get('/logout', (req,res)=>{
    res.cookie('jwt', '', {maxAge: 1}) 
    res.redirect('/');
});

app.get('/apropos', (req,res)=>{
    let error = req.query.error 
    res.render("apropos");
});

app.get('/contact', (req,res)=>{
    res.render("contact");
});

app.post('/register',mainAuth, async (req,res)=>{
    console.log(req.body);
    try {
        await addUser(req)
        console.log("user added")
        res.redirect('/accueiladmin')
    } catch (error) {
        res.redirect('/add_user')
    }
})

app.post('/add_prof',mainAuth, async (req,res)=>{
    console.log(req.body);
    try {
        await addProf(req)
        console.log("prof added")
        res.redirect('/viewprof')
    } catch (error) {
        res.redirect('/add_user')
    }
});

app.post('/add_eleve', async (req,res)=>{
    try {
        await addEleve(req)
        console.log("user added");
        res.redirect('/listedeclasse')
    } catch (error) {
        res.redirect('/add_eleve')
    }
    
});

async function addUser(req){
    try{
        const salt = await bcrypt.genSalt()
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        await User.create({
            Firstname: req.body.nom,
            Lastname: req.body.prenom,
            Email: req.body.email,
            password: hashPassword,
            role: req.body.role,
            identifiant: req.body.identifiant
        })
    } catch(e){
        console.log(e.message);
    }
}


async function addProf(req){
    try{
        const salt = await bcrypt.genSalt()
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        await Prof.create({
            Firstname: req.body.nom,
            Lastname: req.body.prenom,
            Email: req.body.email,
            identifiant: req.body.identifiant,
            password: hashPassword,
            Matiere: req.body.matiere,
            Classe: req.body.classe,
            identifiant: req.body.identifiant
        })
    } catch(e){
        console.log(e.message);
    }
}

async function addEleve(req){
    try {
        const age = req.body.age.replaceAll('-', '');
        const codeA = req.body.nom.charAt(0) + req.body.prenom.charAt(0) + age
        switch (req.body.classe) {
            case 'Premiere':
                await Premiere.create({
                    nom: req.body.nom,
                    prenom:req.body.prenom,
                    age: req.body.age,
                    sexe: req.body.sexe,
                    nompere: req.body.nompere,
                    nommere: req.body.nommere,
                    propere: req.body.propere,
                    promere: req.body.promere,
                    nomtuteur: req.body.nomtuteur,
                    protuteur: req.body.protuteur,
                    numtuteur: req.body.numtuteur,
                    devoir: {
                        mathematique:{
                           note1 : null,
                           note2 : null,
                           note3 : null,
                           appreciation :null
                        },
                        biologie:{
                            note1 : null,
                            note2 : null,
                            note3 : null,
                            appreciation :null
                         },
                         anglais:{
                            note1 : null,
                            note2 : null,
                            note3 : null,
                            appreciation :null
                         },
                         physique:{
                            note1 : null,
                            note2 : null,
                            note3 : null,
                            appreciation :null
                         },
                         chimie:{
                            note1 : null,
                            note2 : null,
                            note3 : null,
                            appreciation :null
                         },
                         philosophe:{
                            note1 : null,
                            note2 : null,
                            note3 : null,
                            appreciation :null
                         },
                         informatique:{
                            note1 : null,
                            note2 : null,
                            note3 : null,
                            appreciation :null
                         },
                         conduite:{
                            note1 : null,
                            note2 : null,
                            note3 : null,
                            appreciation :null
                         },
                         francais:{
                            note1 : null,
                            note2 : null,
                            note3 : null,
                            appreciation :null
                         }
                    },
                    codeapogee: codeA
                })
                break;
                case 'Seconde':
                    await Seconde.create({
                        nom: req.body.nom,
                        prenom:req.body.prenom,
                        age: req.body.age,
                        sexe: req.body.sexe,
                        nompere: req.body.nompere,
                        nommere: req.body.nommere,
                        propere: req.body.propere,
                        promere: req.body.promere,
                        nomtuteur: req.body.nomtuteur,
                        protuteur: req.body.protuteur,
                        numtuteur: req.body.numtuteur,
                        devoir: {
                            mathematique:{
                               note1 : null,
                               note2 : null,
                               note3 : null,
                               appreciation :null
                            },
                            biologie:{
                                note1 : null,
                                note2 : null,
                                note3 : null,
                                appreciation :null
                             },
                             anglais:{
                                note1 : null,
                                note2 : null,
                                note3 : null,
                                appreciation :null
                             },
                             physique:{
                                note1 : null,
                                note2 : null,
                                note3 : null,
                                appreciation :null
                             },
                             chimie:{
                                note1 : null,
                                note2 : null,
                                note3 : null,
                                appreciation :null
                             },
                             philosophe:{
                                note1 : null,
                                note2 : null,
                                note3 : null,
                                appreciation :null
                             },
                             informatique:{
                                note1 : null,
                                note2 : null,
                                note3 : null,
                                appreciation :null
                             },
                             conduite:{
                                note1 : null,
                                note2 : null,
                                note3 : null,
                                appreciation :null
                             },
                             francais:{
                                note1 : null,
                                note2 : null,
                                note3 : null,
                                appreciation :null
                             }
                        },
                        codeapogee: codeA
                    })
                    break;
                    case 'Terminale':
                        await Terminale.create({
                            nom: req.body.nom,
                            prenom:req.body.prenom,
                            age: req.body.age,
                            sexe: req.body.sexe,
                            nompere: req.body.nompere,
                            nommere: req.body.nommere,
                            propere: req.body.propere,
                            promere: req.body.promere,
                            nomtuteur: req.body.nomtuteur,
                            protuteur: req.body.protuteur,
                            numtuteur: req.body.numtuteur,
                            devoir: {
                                mathematique:{
                                   note1 : null,
                                   note2 : null,
                                   note3 : null,
                                   appreciation :null
                                },
                                biologie:{
                                    note1 : null,
                                    note2 : null,
                                    note3 : null,
                                    appreciation :null
                                 },
                                 anglais:{
                                    note1 : null,
                                    note2 : null,
                                    note3 : null,
                                    appreciation :null
                                 },
                                 physique:{
                                    note1 : null,
                                    note2 : null,
                                    note3 : null,
                                    appreciation :null
                                 },
                                 chimie:{
                                    note1 : null,
                                    note2 : null,
                                    note3 : null,
                                    appreciation :null
                                 },
                                 philosophe:{
                                    note1 : null,
                                    note2 : null,
                                    note3 : null,
                                    appreciation :null
                                 },
                                 informatique:{
                                    note1 : null,
                                    note2 : null,
                                    note3 : null,
                                    appreciation :null
                                 },
                                 conduite:{
                                    note1 : null,
                                    note2 : null,
                                    note3 : null,
                                    appreciation :null
                                 },
                                 francais:{
                                    note1 : null,
                                    note2 : null,
                                    note3 : null,
                                    appreciation :null
                                 }
                            },
                            codeapogee: codeA
                        })
                        break;
        
            default:
                break;
        }
    } catch (error) {
        console.log(error);
    }
}




const maxAge = 3 * 24 * 60 * 60

const createToken = (id) =>{
    return jwt.sign({id}, 'ags', {
        expiresIn: maxAge
    })
}




app.get('/accueildirecteur',mainAuth, (req,res)=>{
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


app.post('/login',async (req, res, next)=>{
    console.log(req.body);
    const {email, password, role} = req.body

    try {
        const user = await User.login(email, password, role)
        const token = createToken(user._id)
        res.cookie('jwt', token, { maxAge: maxAge * 1000})
        res.cookie('role', role, { maxAge: maxAge * 1000})
        res.status(200).json({user: user._id, role})
    } 
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({errors})
    }
    
})

app.get('/accueiladmin',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        console.log(JSON.stringify(users[0]._id));
        res.render("viewuser", {users});
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/viewstaffs',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        console.log(JSON.stringify(users[0]._id));
        res.render("viewstaffs", {users});
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/accueilsurveillant',mainAuth,(req,res)=>{
    console.log("sur");
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("accueilsurveillant");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/staff',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("staff", {users});
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listedeclasse',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listedeclasse");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeeleves',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeeleves");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeclassebulletins',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeclassebulletins");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeelevesbulletin',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeelevesbulletin");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeelevesbulletin',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeelevesbulletin");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/attestationconvocationaccueil',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("attestationconvocationaccueil");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeclasseattestation',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeclasseattestation");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/listeeleveattestation',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listeeleveattestation");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/accueilconvocation',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("accueilconvocation");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})
app.get('/attestation',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("attestation");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})


app.get('/convocation',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("convocation");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})
app.get('/bulletin',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("bulletin");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/viewprof',(req,res)=>{
    let error = req.query.error
    Prof.find({}).then((users)=>{
        res.render("viewprof", {users});
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/eleve?',(req,res)=>{
    const classe = req.query.id
    switch (req.query.id) {
        case 'premiere':
            Premiere.find({}).then((eleves)=>{
                res.render("vieweleves", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        case 'seconde':
            Seconde.find({}).then((eleves)=>{
                res.render("vieweleves", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
                break;
        case 'terminale':
            Terminale.find({}).then((eleves)=>{
                res.render("vieweleves", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        default:
            break;
    }
})


app.get('/liste_classe',mainAuth,(req,res)=>{

    res.render("liste_classe")
    
})


app.get('/add_user',(req,res)=>{
    res.render("add_user")
})

app.get('/add_staff',(req,res)=>{
    res.render("add_staff")
})

app.get('/add_prof',(req,res)=>{
    res.render("add_prof")
})

app.get('/add_eleve',(req,res)=>{
    res.render("add_eleve")
})

app.post('/classe',(req,res)=>{
    console.log(req.body);
})



app.listen(port, ()=>{
    console.log("listening on port 3000");
});