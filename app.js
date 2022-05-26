const express = require("express");
const {create} = require('express-handlebars');
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv').config();
const User = require('./User')
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
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
        res.cookie('role', role, {httpOnly: true, maxAge: maxAge * 1000})
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

app.get('/bulletin',mainAuth,(req,res)=>{
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