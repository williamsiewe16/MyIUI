let axios = require('axios')
let Candidate = require('../models/candidate')
let functions = require('../functions')
let dotenv = require('dotenv')
let crypto = require('crypto')

dotenv.config()

module.exports = {
    login: (req, res, next) => {
        let email = req.body.email_connexion == undefined ? "" : req.body.email_connexion ;
        let password = req.body.password_connexion == undefined ? "" : req.body.password_connexion;

        if(email != "" && password!= ""){
            let algorithm = 'sha256';
            let encryptedPassword = crypto.createHash(algorithm).update(password).digest('hex');

            Candidate.findOne({email : email, password : encryptedPassword,signUpToken: ""})
              .then(function (response) {
                if(response != null){
                    req.session.email = response.email
                    req.session.status = response.status
                    req.session.name = response.name+" "+response.surname
                    req.session.token = functions.generateToken(10)
                    res.send('done')
                }
                else{
                    res.json({error: "utilisateur introuvable"});
                }
            });
        }
        else{
            res.send("Veuillez remplir tous les champs");
        }
    } ,
    register: (req, res) => {
        let $errors = Object();
        let email = req.body.email_inscription == undefined ? "" : req.body.email_inscription;
        let number = req.body.number_inscription == undefined ? "" : req.body.number_inscription;
        let password = req.body.password_inscription == undefined ? "" : req.body.password_inscription;
        let name = req.body.name_inscription == undefined ? "" : req.body.name_inscription;
        let surname = req.body.surname_inscription == undefined ? "" : req.body.surname_inscription;
        let birthDate = req.body.birthDate_inscription == undefined ? "" : req.body.birthDate_inscription;
        let gender = req.body.gender_inscription == undefined ? "" : req.body.gender_inscription;
        let country = req.body.country_inscription == undefined ? "" : req.body.country_inscription;
        let city = req.body.city_inscription == undefined ? "" : req.body.city_inscription;
        let countryCode = req.body.countryCode_inscription == undefined ? "" : req.body.countryCode_inscription;
        let level = req.body.level_inscription == undefined ? "" : req.body.level_inscription;
        let lastSchool = req.body.lastSchool_inscription == undefined ? "" : req.body.lastSchool_inscription;

        if (
            email != "" && password != "" && number != "" && name != "" && surname != "" && lastSchool != ""
            && birthDate != "" && gender != "" && city != "" && country != "" && level != "" && countryCode!= ""
        ) {
            //Vérification du numéro
            if(!number.match("^[0-9]{8,12}$")){
                $errors.number_inscription = "Numéro incorrect"
            }

            //Vérification du mot de passe
            if(password.length < 8 && !password.match("[A-Z]+") && !password.match("[0-9]+")){
                $errors.password_inscription = "Mot de passe incorrect"
            }

            //Vérification de l'email
            if (!email.match("^[a-zA-Z0-9\._%+-]+@[a-zA-Z_-]+\.(com|fr|net)$")) {
                $errors.email_inscription = "email invalide";
                res.json($errors)
            } else {
                Candidate.findOne({email: email},(err,response) => {
                    if(err) {throw err}
                    else{
                        if(response == null){
                            //Taille du tableau $errors
                            let $errors_length=0;
                            for(let elt in $errors){
                                $errors_length++;
                            }

                            //Envoi des informations
                            if($errors_length==0){

                                if(level != "GCE A/L") level = level.split(" ").join("+")

                                //Enregistrement du candidat dans la base de données
                                let algorithm = 'sha256'; let token = functions.generateToken(3600,true)
                                let encryptedPassword = crypto.createHash(algorithm).update(password).digest('hex');
                                let candidate = new Candidate({
                                    name: name, surname: surname,
                                    birthDate: birthDate, country: country, city: city,
                                    level: level, lastSchool: lastSchool, gender: gender,
                                    email: email, password: encryptedPassword, number: "+"+(countryCode+number).trim(),
                                    signUpToken: token, applications: [{cycle: "1st"}]
                                });
                                candidate.save().then((response1) => {

                                    //Envoi du mail
                                    let mailOptions = {
                                        from: process.env.email,
                                        to: email,
                                        subject: "Confirmation de la création de votre compte",
                                        html: functions.validationMail({token: token})
                                    };
                                    functions.sendMail(mailOptions,(data) => {})
                                    res.send('done')
                                }).catch(err => console.log(err))
                            }else{
                                res.json($errors);
                            }
                        }else{
                            $errors.email_inscription = "email déjà utilisé";
                            res.json($errors)
                        }
                    }
                })
            }

        }else{
            res.send("Veuillez remplir tous les champs");
        }
    },
    registerValidation: (req,res,next) => {
        let token = req.params.token == undefined ? "" : req.params.token

        if(token != ""){
            functions.verifyToken(token,(err,decoded) => {
                if(err){
                    Candidate.deleteOne({signUpToken : token},(err,response) => {
                        res.redirect('../register')
                    })
                }else{
                    Candidate.findOneAndUpdate({signUpToken: token},{signUpToken: ""},(err,response) => {
                        if(response != null){
                            req.session.email = response.email
                            req.session.status = response.status
                            req.session.name = response.name+" "+response.surname
                            req.session.token = functions.generateToken(3600)
                            res.redirect('../page')
                        }else{
                            res.redirect('../login')
                        }
                    })
                }})
        }
    },
    sessionDestroy: (req,res) => {
        console.log('a')
        req.session.destroy((err) => {
            if(err){console.log(err)}
            res.redirect('./login')
        })
    }
};
