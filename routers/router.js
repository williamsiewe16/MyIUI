let express = require('express')
let multer = require("multer");
let UserController = require('../Controllers/UserController')
let ViewController = require('../Controllers/ViewController')
let DocumentController = require('../Controllers/DocumentController')
let PaymentController = require('../Controllers/PaymentController')
let fs = require('file-system')
let FileName = require('../models/fileName')
let functions = require("../functions")


/* Document Store */
let storage =  multer.diskStorage({
    destination: function (req, file, callback) {
        let year = (new Date().getFullYear()-1).toString()+"-"+new Date().getFullYear().toString()
        if(req.session.name != undefined){
            let path = `applications/${year}/${req.session.name}`
            fs.mkdir(path,{},res => {
                callback(null, path);
            })
        }
    },
    filename: function (req, file, callback) {
        FileName.findOne({name: file.fieldname},(err,response) => {
            let extension = file.mimetype.split('/')[1]
            callback(null, `${response.title}.${extension}`);
        })
    }
});


let upload = multer({
    storage: storage,
    fileFilter: (req,file,cb) => {
        let extension = file.mimetype.split('/')[1]
        let acceptedExtensions = ["pdf","png","jpg","jpeg"]
        if(acceptedExtensions.indexOf(extension) === -1){
            return cb(null, false, new Error('goes wrong on the mimetype'))
        }
        cb(null, true)
    }
})

/* Receipt Store */
let storage1 =  multer.diskStorage({
    destination: function (req, file, callback) {
        let year = (new Date().getFullYear()-1).toString()+"-"+new Date().getFullYear().toString()
        if(req.session.name != undefined){
            let path = `applications/${year}/${req.session.name}`
            fs.mkdir(path,{},res => {
                callback(null, path);
            })
        }
    },
    filename: function (req, file, callback) {
        FileName.findOne({name: file.fieldname},(err,response) => {
            let extension = file.mimetype.split('/')[1]
            callback(null, `${response.title}.${extension}`);
        })
    }
});

let upload1 = multer({
    storage: storage1,
    fileFilter: (req,file,cb) => {
        let extension = file.mimetype.split('/')[1]
        let acceptedExtensions = ["pdf","png","jpg","jpeg"]
        if(acceptedExtensions.indexOf(extension) === -1){
            return cb(null, false, new Error('goes wrong on the mimetype'))
        }
        cb(null, true)
    }
})




router = (() => {
    let router = express.Router()

    /*Routes pour recupérer les vues*/
    router.route('/page').get(functions.checkPeriod,ViewController.page)
    router.route('/login').get(ViewController.login)
    router.route('/register').get(ViewController.register)
    router.route('/home').get(functions.checkPeriod,ViewController.home)
    router.route('/portal').get(ViewController.portal)

        /* test routes */
        router.route('/test').get(ViewController.test)
        router.route('/test').post(ViewController.testPost)
        router.route(`/test/237`).post(upload1.single(`file`),function (req,res) {
            res.send('ah oui')
        })


    /* admin routes */
        router.route('/admin').get(ViewController.admin)
        router.route('/admin/:param').get(ViewController.adminContent)
        router.route('/admin/mail').post(DocumentController.mail)
        router.route('/admin/archive/:param').get(DocumentController.archive)
        router.route('/admin/applicationStatus/:param').get(DocumentController.modifyApplicationStatus)

    /* UserController */
    router.route('/login').post(UserController.login,ViewController.page)
    router.route('/register').post(UserController.register)
    router.route('/register/:token').get(UserController.registerValidation,ViewController.page)
    router.route('/sessionDestroy').get(UserController.sessionDestroy)

    /* DocumentController */
    const fields =  (() => {let tab= []; for(let i=0;i<2;i++) tab.push(`file${i}`); return tab})().map(each => {
        return {name: each, maxCount: 1}
    })

    router.route('/page/submit').post(functions.checkPeriod,/*upload.fields(fields),*/DocumentController.treatAllDocuments)

    for(let i=0; i<10;i++){
        router.route(`/page/addFile/10${i}`).post(upload.single(`file10${i}`),DocumentController.modifyDocument)
        router.route(`/page/addFile/20${i}`).post(upload.single(`file20${i}`),DocumentController.modifyDocument)
    }

    router.route('/page/removeFile').post(functions.checkPeriod,DocumentController.deleteDocument)
    router.route('/page/removeFiles').post(functions.checkPeriod,DocumentController.deleteDocuments)
    router.route('/admin/documents/:route').get(functions.checkPeriod,DocumentController.getDocuments)

    /* PaymentController */
    router.route('/payment').get(functions.checkPeriod,ViewController.payment)
    router.route('/payment').post(functions.checkPeriod,PaymentController.payFees)
    router.route('/admin/paymentInfo/:route').get(PaymentController.getPaymentInfo)

      /* PayPal */
    router.route('/payPalPaymentSuccess').get(PaymentController.payPalPaymentSuccess)
    router.route('/payPalPaymentError').get(PaymentController.payPalPaymentError)

      /* DC */
    router.route('/payment/receipt').post(upload1.single("receipt"),DocumentController.modifyReceipt)

    return router
})()

exports.router = router
