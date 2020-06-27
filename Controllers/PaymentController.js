let Candidate = require('../models/candidate')
let FileName = require('../models/fileName')
let mongoose = require('mongoose')
let dotenv = require('dotenv').config()
let functions = require('../functions')
let axios = require("axios");
let paypal = require("paypal-rest-sdk");

module.exports = {

    getPaymentInfo: async (req,res) => {
        let year = req.params.route, token = req.query.token

        if(token == req.session.token){
            let Unwind = {$unwind: "$applications"}
            let Match = {$match: {$and: [
                        {"applications.creationDate" : {"$gte": new Date(`${year.trim()}-01-01`)}},
                        {"applications.creationDate" : {"$lte": new Date(`${year.trim()}-09-01`)}},
                        {_id: mongoose.Types.ObjectId(req.query.id)}
                    ],
                }}
            let Project = {$project: {"applications.paymentInfo": 1, "_id": 0}}
            let data = await Candidate.aggregate([Unwind,Match,Project])
            res.send({paymentInfo: data[0].applications.paymentInfo, server: process.env.SERVER})
        }else res.send('no token')
    },

    payFees: async (req, res) => {
        if (req.session.token != req.body.token) {
            res.redirect('./login')
        }
        else {
            let candidate = await Candidate.findOne({email: req.session.email})
            let application = candidate.applications[candidate.applications.length-1]
            let formFields1 =  await FileName.find({cycle: application.cycle == "1st" ? 0 : 1})

            if(application.documents.length != formFields1.length){
                res.redirect('./page')
            }else{
                let paymentMethod = req.body.paymentMethod
                if (paymentMethod == "OM") payFeesViaOM(req,res,candidate);
                else if (paymentMethod == "PayPal") payFeesViaPayPal(req,res,candidate);
                else if (paymentMethod == "BD") payFeesViaDeposit(req,res,candidate);
            }
        }
    },

    payPalPaymentSuccess: async (req,res) => {
        let paymentInfo = {
            paymentId: req.query.paymentId,
            payerId: req.query.PayerID
        }

        let payment = {
            "payer_id": paymentInfo.payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": process.env.FEES
                }
            }]
        }
        let candidate = await Candidate.findOne({email: req.session.email})
        paypal.payment.execute(paymentInfo.paymentId,payment,function(err,payment){
            if(err) console.error(err)

            let application = candidate.applications[candidate.applications.length-1]
            let paymentInfo = {paid: true, method: "PayPal"}
            application.paymentInfo = paymentInfo
            application.submissionDate = new Date()
            application.status = 1
            candidate.applications.pop()
            candidate.applications.push(application)
            candidate.lockAccount = 1

            Candidate.replaceOne({email: req.session.email},candidate,(err) => {
                res.render("home.ejs",{status: req.session.status, paid: true})
            })
        })
    },

    payPalPaymentError: (req,res) => {
        console.log("payment error")
    }
};


    payFeesViaPayPal =  (req, res, candidate) => {
        console.log('paypal')
        paypal.configure({
            'mode': 'sandbox', //sandbox or live
            'client_id': process.env.PAYPAL_CLIENT_ID,
            'client_secret': process.env.PAYPAL_CLIENT_SECRET
        });

        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `${process.env.SERVER}/admission/payPalPaymentSuccess`,
                "cancel_url": `${process.env.SERVER}/admission/payPalPaymentError`
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "inscription fees",
                        "sku": "item",
                        "price": process.env.FEES,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": process.env.FEES
                },
                "description": "inscription fees"
            }]
        };


        paypal.payment.create(create_payment_json, function (error, payment) {
            console.log("Create Payment...");
            if (error) {
                throw error;
            } else {
                console.log("Create Payment Response");
                payment.links.forEach((l) => {
                    if(l.rel == "approval_url") res.redirect(l.href);
                })
            }
        });
    }

    payFeesViaDeposit =  (req, res, candidate) => {
        let application = candidate.applications[candidate.applications.length-1]
        if(application.paymentInfo == undefined) res.redirect('./payment')
        else if(application.paymentInfo.proof == undefined) res.redirect('./payment')

        let paymentInfo = {paid: true, method: "Bank Deposit", proof: application.paymentInfo.proof}
        application.paymentInfo = paymentInfo
        application.submissionDate = new Date()
        application.status = 1
        let applications = candidate.applications.filter((app) => app.id != application.id)
        applications.push(application)
        candidate.applications = applications
        candidate.lockAccount = 1

        Candidate.replaceOne({email: req.session.email},candidate,(err) => {
            res.render("home.ejs",{status: req.session.status, paid: true})
        })
    }

    payFeesViaOM = (req, res, candidate) => {
        let application = candidate.applications[candidate.applications.length-1]

        /*let paymentInfo = {paid: true, method: "DC", proof: application.proof}
        application.paymentInfo = paymentInfo
        application.submissionDate = new Date()
        application.status = 1
        let applications = candidate.applications.filter((app) => app.id != application.id)
        applications.push(application)
        candidate.applications = applications
        candidate.lockAccount =

        Candidate.replaceOne({email: req.session.email},candidate,(err) => {
            res.send("payment successfully completed")
        })    */
    }
