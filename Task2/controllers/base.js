var express = require('express');
var router = express.Router();
var User = require('../models/user');
var controller = require('./controller');
var fs = require('fs');
var multer = require('multer');
router.get('/',(req,res)=>{
    controller.home(req,res);
});
router.get('/edit',(req, res)=>{
   controller.edit_page(req,res);
});
router.post('/change_password', function(req, res){
   controller.change_password(req, res);
});
router.post('/pedit', function(req, res){
    controller.pedit(req, res);
});
router.post('/login', function(req, res){
    controller.login(req, res);
});
router.post('/verifyotp', function(req, res){
   controller.verifyotp(req, res);
});
router.get('/logout', function(req, res){
        if (req.session) {
            // delete sessi on object
            req.session.destroy(function (err) {
                if (err) {
                    return res.send(err);
                } else {
                    return res.redirect('/');
                }
            });
        }
    });

router.post('/contact', function(req, res){
   controller.contact(req, res);
});
router.post('/gen_otp', function(req, res){
   controller.gen_otp(req, res);
});
router.get('/verify', function(req,res){
   controller.verify(req, res);
});
router.get('/recover', function(req, res){
   controller.recover(req, res);
});
router.post('/create', function(req, res){
    controller.create(req, res);
});
router.get('/about',function(req,res){
   controller.about(req, res);

});
router.get('/signup', function(req, res) {
    res.render('signup');
});
router.get('/main', function(req, res) {
    controller.main(req, res);
});
router.get('*',function (req, res, next) {
    // var err = new Error('File Not Found');
    return res.send({message:"PAGE NOT FOUND,Please Contact Prasun Jaiswal!!"})
});


module.exports = router;