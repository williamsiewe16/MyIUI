let PORT = process.env.PORT || 3000

let axios = require("axios");
let app = require('express')();
let router = require('./routers/router')
let bodyParser = require('body-parser')
let mongoose = require('mongoose')
let session = require('express-session')
let cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session);
let dotenv = require('dotenv')

dotenv.config()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'SESS_ID',
    cookie: {maxAge: 60000*20},
    rolling: true,
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({ url: process.env.MONGO_URI })
}))
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true ,useNewUrlParser: true })
    .then(() => {
      console.log('connected')

        //Le serveur utilise le routeur
        app.use('/admission',router.router)
       /* app.use('/',(req,res) => {
            res.redirect('/admission/home')
        })*/

        //route pour recupérer les ressources
        app.use('/:dir/:a',function(req, res){
            let {dir,a} = req.params
         res.sendFile(__dirname+`/${dir}/${a}`)
        })
        app.use('/:dir/:a/:b',function(req, res){
            let {dir,a,b} = req.params
         res.sendFile(__dirname+`/${dir}/${a}/${b}`)
        })
        app.use('/:dir/:a/:b/:c',function(req, res){
            let {dir,a,b,c} = req.params
            res.sendFile(__dirname+`/${dir}/${a}/${b}/${c}`)
        })
        app.use('/:dir/:a/:b/:c/:d',function(req, res){
            let {dir,a,b,c,d} = req.params
            res.sendFile(__dirname+`/${dir}/${a}/${b}/${c}/${d}`)
        })
        app.use('/:dir/:a/:b/:c/:d/:e',function(req, res){
            let {dir,a,b,c,d,e} = req.params
            res.sendFile(__dirname+`/${dir}/${a}/${b}/${c}/${d}/${e}`)
        })

   })
    .catch((err) => {
      throw err
    })



/*
app.use('/assets/audios/:name',function(req, res){
  res.sendFile(__dirname+"/assets/audios/"+req.params.name)
})*/

app.listen(PORT);


