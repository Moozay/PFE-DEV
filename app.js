const express = require("express");
const {create} = require('express-handlebars');
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv').config();
const User = require('./User')
const Facture = require('./Facture')
const Seconde = require('./Seconde')
const SecondeA = require('./SecondeA')
const Premiere = require('./Premiere')
const PremiereA = require('./PremiereA')
const Terminale = require('./Terminale')
const TerminaleA = require('./TerminaleA')
const Prof = require('./Prof')
const Appreciation = require('./Appreciation')
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
    const classe = req.cookies.classe
    
    if (token) {
        jwt.verify(token, 'ags', async(err,  decordedToken) =>{
            if(err){
                console.log(err.message);
                res.locals.user = null
                next();
            }else{
                //console.log(decordedToken);
                let user = ''
                if (req.cookies.role == 'professeur') {
                    user = await Prof.findById(decordedToken.id)
                }else if(req.cookies.role == 'tuteur'){
                    switch (classe) {
                        case 'premiere':
                            user = await Premiere.findById(decordedToken.id)
                            break;
                        case 'seconde':
                            user = await Seconde.findById(decordedToken.id)
                            break;
                        case 'terminale':
                            user = await Terminale.findById(decordedToken.id)
                            break;
                    
                        default:
                            break;
                    }
                }
                else{
                    user = await User.findById(decordedToken.id)
                }
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
                res.redirect('/')
            }else{
                next();
            }
        })
    }
    else{
        res.redirect('/')
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

app.get('/logintuteur', (req,res)=>{
    let error = req.query.error 
    res.render("logintuteur", {error});
});

app.get('/logout', (req,res)=>{
    res.cookie('jwt', '', {maxAge: 1}) 
    res.cookie('role','',{maxAge: 1} )
    res.cookie('classe', '', {maxAge: 1})
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

app.get('/archive-user?',mainAuth, async (req,res)=>{
    try {
        archiveUser(req)
        let url = '/eleve?id=' + req.query.classe
        res.redirect(url)
    } catch (error) {
        
    }
})
async function archiveUser(req){
    try{
        switch (req.query.classe) {
            case 'premiere':
                await Premiere.findById({_id : req.query.id}).then((eleve)=>{
                  var newUser = new PremiereA(eleve)
                  newUser._id = mongoose.Types.ObjectId()
                  newUser.isNew = true
                  newUser.save()
                }).catch((e)=>{
                    console.log(e);
                    return null;
                })
                await Premiere.deleteOne({_id: req.query.id}) 
                break;
                case 'seconde':
                    await Seconde.findById({_id : req.query.id}).then((eleve)=>{
                      var newUser = new SecondeA(eleve)
                      newUser._id = mongoose.Types.ObjectId()
                      newUser.isNew = true
                      newUser.save()
                    }).catch((e)=>{
                        console.log(e);
                        return null;
                    })
                    await Seconde.deleteOne({_id: req.query.id}) 
                    break;
                case 'terminale':
                    await Terminale.findById({_id : req.query.id}).then((eleve)=>{
                        var newUser = new TerminaleA(eleve)
                        newUser._id = mongoose.Types.ObjectId()
                        newUser.isNew = true
                        newUser.save()
                    }).catch((e)=>{
                        console.log(e);
                        return null;
                    })
                    await Terminale.deleteOne({_id: req.query.id}) 
                    break;
        
            default:
                break;
        }
        
    } catch(e){
        console.log(e.message);
    }
}

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

app.post('/addnote?', async (req,res)=>{
    try {
        const classe = req.query.classe
        const matiere = req.query.matiere
        const url = '/viewelevesprof?classe='+classe+'&matiere='+matiere
        await addNote(req)
        console.log("note updated");
        res.redirect(url)
    } catch (error) {
        res.redirect('/addnote')
    }
    
});

app.post('/addscolarite?', async (req,res)=>{
    try {
        const classe = req.query.classe
        
        const url = '/viewelevescolarite?classe='+classe
        await addScolarite(req)
        console.log("scolarite updated");
        res.redirect(url)
    } catch (error) {
        res.redirect('/addnote')
    }
    
});

app.post('/addappreciation?', async (req,res)=>{
    try {
        const id = req.query.id
        const url = '/viewappreciation?id='+id
        await addAppreciation(req)
        console.log("Appreciation updated");
        res.redirect(url)
    } catch (error) {
        res.redirect('/addnote')
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

async function addAppreciation(req){
    console.log("starting...");
    try {
        await Appreciation.create({
            Nomprof: req.body.nomprof,
            Matiere: req.body.matiere,
            Ideleve: req.query.id,
            Appreciation: req.body.appreciation,
            Date: req.body.date
        })
    } catch (error) {
        console.log(error.message);
    }
}

async function addNote(req){
    try{
        const note = req.body.note
        const notevalue = req.body.notevalue
        const profapp = req.body.appreciation
        const id = req.query.id
        const classe = req.query.classe
        const matiere = req.query.matiere
        const devoir = 'devoir.'+matiere+'.'+note
        const appreciation = 'devoir.'+matiere+'.appreciation'
        var obj1 = {};
        obj1[devoir] = notevalue;
        var obj2 = {};
        obj2[appreciation] = profapp;
        switch (classe) {
            case 'Premiere':
                await Premiere.updateOne({_id: id},{$set:obj1 })
                await Premiere.updateOne({_id: id},{$set:obj2 })
                break;
            case 'Seconde':
                await Seconde.updateOne({_id: id},{$set:obj1 })
                await Seconde.updateOne({_id: id},{$set:obj2 })
                break;
            case 'Terminale':
                await Terminale.updateOne({_id: id},{$set:obj1 })
                await Terminale.updateOne({_id: id},{$set:obj2 })
                break;
        
            default:
                break;
        }
        
    } catch(e){
        console.log(e.message);
    }
}
async function addScolarite(req){
    try{
        const tranche = req.body.tranche
        const id = req.query.id
        const classe = req.query.classe

        const scolarite = 'scolarite.'+tranche
       
        var obj1 = {};
        obj1[scolarite] = 'PAYÉ';
    
        switch (classe) {
            case 'premiere':
                await Premiere.updateOne({_id: id},{$set: obj1 })
               
                break;
            case 'seconde':
                await Seconde.updateOne({_id: id},{$set:obj1 })
                
                break;
            case 'terminale':
                await Terminale.updateOne({_id: id},{$set:obj1 })
                
                break;
        
            default:
                break;
        }
        
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
                    scolarite:{
                        tranche1: 'NON PAYÉ',
                        tranche2: 'NON PAYÉ'
                    },
                    devoir: {
                        mathematique:{
                           note1 : 0,
                           note2 : 0,
                           note3 : 0,
                           appreciation :''
                        },
                        biologie:{
                            note1 : 0,
                           note2 : 0,
                           note3 : 0,
                           appreciation :''
                         },
                         anglais:{
                            note1 : 0,
                           note2 : 0,
                           note3 : 0,
                           appreciation :''
                         },
                         physique:{
                            note1 : 0,
                           note2 : 0,
                           note3 : 0,
                           appreciation :''
                         },
                         chimie:{
                            note1 : 0,
                            note2 : 0,
                            note3 : 0,
                            appreciation :''
                         },
                         philosophe:{
                            note1 : 0,
                            note2 : 0,
                            note3 : 0,
                            appreciation :''
                         },
                         informatique:{
                            note1 : 0,
                           note2 : 0,
                           note3 : 0,
                           appreciation :''
                         },
                         conduite:{
                            note1 : 0,
                            note2 : 0,
                            note3 : 0,
                            appreciation :''
                         },
                         francais:{
                           note1 : 0,
                           note2 : 0,
                           note3 : 0,
                           appreciation :''
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
                        scolarite:{
                            tranche1: 'NON PAYÉ',
                            tranche2: 'NON PAYÉ'
                        },
                        devoir: {
                            mathematique:{
                               note1 : 0,
                               note2 : 0,
                               note3 : 0,
                               appreciation :''
                            },
                            biologie:{
                                note1 : 0,
                               note2 : 0,
                               note3 : 0,
                               appreciation :''
                             },
                             anglais:{
                                note1 : 0,
                               note2 : 0,
                               note3 : 0,
                               appreciation :''
                             },
                             physique:{
                                note1 : 0,
                               note2 : 0,
                               note3 : 0,
                               appreciation :''
                             },
                             chimie:{
                                note1 : 0,
                                note2 : 0,
                                note3 : 0,
                                appreciation :''
                             },
                             philosophe:{
                                note1 : 0,
                                note2 : 0,
                                note3 : 0,
                                appreciation :''
                             },
                             informatique:{
                                note1 : 0,
                               note2 : 0,
                               note3 : 0,
                               appreciation :''
                             },
                             conduite:{
                                note1 : 0,
                                note2 : 0,
                                note3 : 0,
                                appreciation :''
                             },
                             francais:{
                                note1 : 0,
                                note2 : 0,
                                note3 : 0,
                                appreciation :''
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
                            scolarite:{
                                tranche1: 'NON PAYÉ',
                                tranch2: 'NON PAYÉ'
                            },
                            devoir: {
                                mathematique:{
                                   note1 : 0,
                                   note2 : 0,
                                   note3 : 0,
                                   appreciation :''
                                },
                                biologie:{
                                    note1 : 0,
                                   note2 : 0,
                                   note3 : 0,
                                   appreciation :''
                                 },
                                 anglais:{
                                    note1 : 0,
                                   note2 : 0,
                                   note3 : 0,
                                   appreciation :''
                                 },
                                 physique:{
                                    note1 : 0,
                                   note2 : 0,
                                   note3 : 0,
                                   appreciation :''
                                 },
                                 chimie:{
                                    note1 : 0,
                                    note2 : 0,
                                    note3 : 0,
                                    appreciation :''
                                 },
                                 philosophe:{
                                    note1 : 0,
                                    note2 : 0,
                                    note3 : 0,
                                    appreciation :''
                                 },
                                 informatique:{
                                    note1 : 0,
                                   note2 : 0,
                                   note3 : 0,
                                   appreciation :''
                                 },
                                 conduite:{
                                    note1 : 0,
                                    note2 : 0,
                                    note3 : 0,
                                    appreciation :''
                                 },
                                 francais:{
                                    note1 : 0,
                                    note2 : 0,
                                    note3 : 0,
                                    appreciation :''
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

app.get('/accueiltuteur',mainAuth, (req,res)=>{
    const classe = req.query.classe
    let garcon,fille,enseignant,laureat,reuissite
    Chiffre.find({}).then((result)=>{
        garcon = result[0].nombre;
        fille = result[1].nombre;
        enseignant = result[2].nombre;
        laureat = result[3].nombre;
        reuissite = result[4].nombre;
        let data={garcon,fille,enseignant,laureat,reuissite}
        res.render("accueiltuteur", {data, classe})
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
});

app.get('/accueilcomptable',mainAuth, (req,res)=>{
    let garcon,fille,enseignant,laureat,reuissite
    Chiffre.find({}).then((result)=>{
        garcon = result[0].nombre;
        fille = result[1].nombre;
        enseignant = result[2].nombre;
        laureat = result[3].nombre;
        reuissite = result[4].nombre;
        let data={garcon,fille,enseignant,laureat,reuissite}
        res.render("accueilcomptable", {data})
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
});


app.post('/login',async (req, res, next)=>{
    const {email, password, role} = req.body

    try {
        let user = ''
        if (role == 'professeur') {
             user = await Prof.login(email, password, role)
        } else {
            user = await User.login(email, password, role)
        }
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

app.post('/logintuteur',async (req, res, next)=>{
    const {codeapogee, datenaissance, classe} = req.body

    try {
        let eleve = ''
        switch (classe) {
            case 'premiere':
                eleve = await Premiere.login(codeapogee, datenaissance) 
                break;
            case 'seconde':
                eleve = await Seconde.login(codeapogee, datenaissance) 
                break;
            case 'terminale':
                eleve = await Terminale.login(codeapogee, datenaissance) 
                break;
            default:
                break;
        }
        const token = createToken(eleve._id)
        res.cookie('jwt', token, { maxAge: maxAge * 1000})
        res.cookie('role', 'tuteur', { maxAge: maxAge * 1000})
        res.cookie('classe', classe, { maxAge: maxAge * 1000})
        res.status(200).json({eleve: eleve._id, classe})
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
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("accueilsurveillant");
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/accueilprof',mainAuth,(req,res)=>{
    console.log("sur");
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("accueilprof");
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

app.get('/listedeclassescolarite',mainAuth,(req,res)=>{
    let error = req.query.error
    User.find({}).then((users)=>{
        res.render("listedeclassescolarite");
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
    const classe = req.query.classe
    switch (req.query.classe) {
        case 'premiere':
            Premiere.findById({_id : req.query.id}).then((eleve)=>{
                res.render("attestation", {eleve, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        case 'seconde':
            Seconde.findById({_id : req.query.id}).then((eleve)=>{
                res.render("attestation", {eleve, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
                break;
        case 'terminale':
            Terminale.findById({_id : req.query.id}).then((eleve)=>{
                res.render("attestation", {eleve, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        default:
            break;
    }
    
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
app.get('/viewappreciation?',(req,res)=>{
    const ideleve = req.query.id
    Appreciation.find({Ideleve: ideleve}).then((eleve)=>{
        res.render('viewappreciation', {eleve, ideleve})
        console.log(eleve);
    }).catch((e)=>{
        console.log(e);
        return null;
    })
    
})

app.get('/viewappreciationtuteur?',(req,res)=>{
    const classe = req.query.classe
    const ideleve = req.query.id
    Appreciation.find({Ideleve: ideleve}).then((eleve)=>{
        res.render('viewappreciationtuteur', {eleve, classe})
        console.log(eleve);
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

app.get('/eleveattestation?',(req,res)=>{
    const classe = req.query.id
    switch (req.query.id) {
        case 'premiere':
            Premiere.find({}).then((eleves)=>{
                res.render("viewelevesattestation", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        case 'seconde':
            Seconde.find({}).then((eleves)=>{
                res.render("viewelevesattestation", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
                break;
        case 'terminale':
            Terminale.find({}).then((eleves)=>{
                res.render("viewelevesattestation", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        default:
            break;
    }
})

app.get('/viewelevesprof?',(req,res)=>{
    const classe = req.query.classe
    const matiere = req.query.matiere
    console.log(classe + matiere);
    switch (classe) {
        case 'Premiere':
            Premiere.find({}).then((eleves)=>{
                res.render("viewelevesprof", {eleves, classe});
                console.log(Object.keys(eleves[0].devoir));
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        case 'Seconde':
            Seconde.find({}).then((eleves)=>{
                res.render("viewelevesprof", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
                break;
        case 'Terminale':
            Terminale.find({}).then((eleves)=>{
                res.render("viewelevesprof", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        default:
            break;
    }
})

app.get('/viewelevetuteur?',(req,res)=>{
    const classe = req.query.classe
    const id = req.query.id

    switch (classe) {
        case 'premiere':
            Premiere.findById(id).then((eleve)=>{
                res.render("viewelevetuteur", {eleve, classe});
                console.log(Object.keys(eleves[0].devoir));
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        case 'seconde':
            Seconde.findById(id).then((eleve)=>{
                res.render("viewelevetuteur", {eleve, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
                break;
        case 'terminale':
            Terminale.findById(id).then((eleve)=>{
                res.render("viewelevetuteur", {eleve, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        default:
            break;
    }
})

app.get('/viewelevescolarite?',(req,res)=>{
    const classe = req.query.classe
    
    switch (classe) {
        case 'premiere':
            Premiere.find({}).then((eleves)=>{
                res.render("viewelevescolarite", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
            break;
        case 'seconde':
            Seconde.find({}).then((eleves)=>{
                res.render("viewelevescolarite", {eleves, classe});
            }).catch((e)=>{
                console.log(e);
                return null;
            }) 
                break;
        case 'terminale':
            Terminale.find({}).then((eleves)=>{
                res.render("viewelevescolarite", {eleves, classe});
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

app.get('/viewmatiere',mainAuth,(req,res)=>{

    res.render("viewmatiere")
    
})


app.get('/add_user',(req,res)=>{
    res.render("add_user")
})

app.get('/add_staff',(req,res)=>{
    res.render("add_staff")
})

app.get('/addappreciation',(req,res)=>{
    res.render("addappreciation")
})

app.get('/add_prof',(req,res)=>{
    res.render("add_prof")
})

app.get('/add_eleve',(req,res)=>{
    res.render("add_eleve")
})

app.get('/addnote',(req,res)=>{
    
    res.render("addnote")
})
app.get('/addscolarite',(req,res)=>{
    const classe = req.query.classe
    res.render("addscolarite", {classe})
})

app.post('/classe',(req,res)=>{
    console.log(req.body);
})



app.listen(port, ()=>{
    console.log("listening on port 3000");
});