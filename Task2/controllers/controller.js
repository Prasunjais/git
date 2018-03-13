const multer  = require('multer');
const otpGenerator = require('otp-generator');
const https = require('https');
//  var Client = require('node-rest-client').Client;
const nodemailer = require('nodemailer');
var User = require('../models/user');
var express = require('express');
var Response = require('./response');
const util = require('util');
class member
{
    constructor(){
        //upload profile picture
        //MAILER
            // create reusable transporter object using the default SMTP transport
        //END MAILER
        const ProfilePictureStorage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/images/profilepic')
            },
            filename: function (req, file, cb) {
                var datetimestamp = Date.now();
                cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
            }
        });
        try{
            this.uploaddp = multer({ storage: ProfilePictureStorage }).any('pic');
        } catch(error){
            console.log(error);
        }
        //Upload Car Images
     };
    async contact(req, res){
        var message = await req.body.message;
        var username = await req.body.name;
        var email = await req.body.email;
        var contact = await req.body.contact;
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'prasun.doodleblue@gmail.com', // generated ethereal user
                pass: 23506795 // generated ethereal password
            }
        });
        var mailOptions = {
                from: '"'+username+'" <'+email+'>', // sender address
                to: 'prasunjais@gmail.com, prasunjai@gmail.com', // list of receivers
                subject: 'Hello ✔ from -- '+ username, // Subject line
                text: message, // plain text body
                html: '<b>'+ message +'</b>' // html body
            };
        transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);

    })
            Response.message(res,200,"EMAIL SEND");
    };
    async home(req, res){
        res.render('home',{title: "Users"});
    };
    async about(req, res){
        var user =await User.getuser(req.session.username);
        res.render('about',{user: user});
    };
    async main(req, res){
        var user_id = req.session.username;
        var user = await User.getuser(user_id);
        console.log("----------->",user);
        res.render('main',{user: user});
    };
    async edit_page(req, res){
    try{
            var user = await User.getuser(req.session.username);
            if (!user) {
                 return Response.badValues(res);
            }
                res.render('edit',{user: user});
    } catch(error) {
        return Response.badValues(res);
    }
    };
    async change_password(req, res){
    try{
        var cpass = req.body.cpass;
        var npass = req.body.pass;
        var email = req.body.email;
        var edata = {
            email: email
        };
        var newpass = await User.gen_bcrypt(npass);
        console.log("NEW PASSWORD-------------> ",newpass);
        var newdata = {
            password: newpass
        };
        if(cpass === npass){
            var result = await User.edit(edata, newdata);
            res.render('home');
        }else{
            return Response.message(res, 400, "PASSWORD DOES NOT MATCH");
        }
    }catch(error){
        console.log("EROOOR------------>",error);
        return Response.badValues(res);
    }
    }
    async verifyotp(req, res){
    try{
        var otp = req.body.otp;
        var email = req.body.email;
        console.log("EMAIL---->",email);
        console.log("OTP---->",otp);
        var result = await User.verifyOTP(otp, email);
        if(result){
            console.log("OTP VERIFIED");
            return res.render('passwordchange',{email: email});
        }else {
            console.log("OTP VERIFICATION FAILED");
            return res.status(400).send({"message":"OTP IS EXPIRED"})
        }
    }catch(error){
        return Response.message(res,400,"SORRY SOME INTERNAL ERROR OCCURED");
    }
    }
    async gen_otp(req, res){
      try{
          var email = req.body.email;
          var ph = await User.getcontact(email);
          console.log("Email : ",email);
          console.log("Ph : ",ph);
          if(ph) {
              var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
              console.log("OTP : ",otp);
              https.get('https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=zZemd13O40uOA1vSSyLUOA&senderid=TESTIN&channel=2&DCS=0&flashsms=0&number='+ph+'&text=Hello%20'+email+'%20your%20OTP%20is%20OTP%20'+otp+'%20Please%20use%20the%20above.&route=13;');
              var result = await User.setOTP(email,otp);
              var message = "Your OTP to reset your password is : "+otp;
              console.log("---------->OTP CHANGED : ",result);
              var transporter = nodemailer.createTransport({
                  host: 'smtp.gmail.com',
                  port: 587,
                  secure: false, // true for 465, false for other ports
                  auth: {
                      user: 'prasun.doodleblue@gmail.com', // generated ethereal user
                      pass: 23506795 // generated ethereal password
                  }
              });
              var mailOptions = {
                  to: email, // list of receivers
                  subject: 'Welcome, '+email+'✔ from Prasun Jaiswal blog', // Subject line
                  text: message, // plain text body
                  html: "Hello,<br> Your One Time Password is --- "+otp+"<br>Note: OTP is valid for upto 25 seconds" // html body
              };
              transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      return console.log(error);
                  }
                  console.log('Message sent: %s', info.messageId);

                });
              if(result){
                  setTimeout(function() {
                      User.delOTP(email)
                  }, 55000);
                  res.render('recover2',{'email': email});
              }else {
                  Response.badValues(res);
              }
          } else {
              return Response.badValues(res);
          }
      }catch(error){
          console.log("ERROR--->",error);
          return Response.badValues(res);
      }
    };
    async recover(req, res){
        try{
            res.render('recover',{user: "Users"});
        }catch(error) {
            return Response.badValues();
        }
    };
    async pedit(req, res) {
      try {
          const upload = util.promisify(this.uploaddp);
          await upload(req, res);
          var exdata = {
              _id: req.body.id
          };
          console.log("----------------FILES*------------");
          console.log("--->",req.files);
          console.log("--------FILES LENGTH------>",req.files.length);
          if(!req.files.length){
              var userdata = {
                  username: req.body.name,
                  contact: req.body.contact,
                  email: req.body.email
              };
          } else {
              var loca = [];
              for(var i=0;i<req.files.length;i++)
              {
                  loca[i]=req.files[i].filename;
              }
              console.log("-------------->",loca);
              var userdata = {
                  username: req.body.name,
                  contact: req.body.contact,
                  email: req.body.email,
                  loc: loca
              };
          }
                  var edit = await User.edit(exdata, userdata);
                  if(edit) {
                      var user = await User.getuser(req.session.username);
                      res.render('main',{'user': user});
                  }
                  else {
                      return Response.badValues(res);
                  }
      } catch(error) {
          res.send(error);
      }
    };
    async login(req, res) {
    try {
        console.log("LOGING INITIATED");
        console.log("User DATA", req.body);
        if (!req.body.pass || !req.body.email ) {
            return Response.message(res, 402, "Please Insert Email And Password");
        }
            var user = await User.authenticate(req.body.email, req.body.pass);
            if (!user) {
                return Response.message(res,401,"User Doesn't Exist!! OR PLEASE VERIFY YOUR ACCOUNT");
            } else {
                req.session.username = user._id;
                return res.render('main', {user: user});
            }

    }catch (error) {
        res.send(error);
    }
    }
    async create(req, res) {
    try {
        console.log(req.body);
        if (req.body.pass == '' || req.body.email == '') {
            return res.status(400).send({message: "Please Insert some data"})
        }
        var rand = Math.floor((Math.random() * 100) + 54);
        var userdata = {
            username: req.body.name,
            contact: req.body.contact,
            email: req.body.email,
            password: req.body.pass,
            rand: rand
        };
        if(req.body.pass !== req.body.cpass) {
            var message = "Password doesn't Match";
            res.status(500).jsonp({ error: message });
        }
        var result = await User.create(userdata);
            if(result) {

                var message = "User Id is Created, Please Activate your account from the link in the given email";
                console.log("Data is Inserted into DB, Please Activate your Account using the Link in the Email to your given email");
                var number = await req.body.contact;
                var username = await req.body.name;
                var pass = await req.body.pass;
                var email = await req.body.email;
                https.get('https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=zZemd13O40uOA1vSSyLUOA&senderid=TESTIN&channel=2&DCS=0&flashsms=0&number='+number+'&text=Welcome%20'+username+'%20to%20My%20Site%20Email%20'+email+'%20Password%20'+pass+'%20Hope%20you%20Enjoy.&route=13;');//var http = 'https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=zZemd13O40uOA1vSSyLUOA&senderid=TESTIN&channel=2&DCS=0&flashsms=0&number=91'+number+'&text=Welcome%20to%20MyTube%20Name%20'+username+'%20Password%20'+pass+'%20Hope%20you%20Enjoy.&route=13;';
                var transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: 'prasun.doodleblue@gmail.com', // generated ethereal user
                        pass: 23506795 // generated ethereal password
                    }
                });
                message = "Please Click on the link to Activate your Account : ";
                var url = "http://"+req.get('host')+"/verify?rand="+rand+"&email="+email;
                var mailOptions = {
                    to: email, // list of receivers
                    subject: 'Welcome, '+ username +'✔ from Prasun Jaiswal blog', // Subject line
                    text: message, // plain text body
                    html: "Hello,<br> Please Click on the link to verify your email.<br><a href="+url+">Click here to verify</a>" // html body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);

            })
                return Response.message(res, 200, message);
            }

    } catch (error) {
        return res.send(error);
    }
    };
    async verify(req, res) {
        try {
            console.log("YEAAAAAAAAAAAAAAAAAAAAAH");
            var rand = req.query.rand;
            var email = req.query.email;
            var result = await User.verify(rand, email);
            if(result) {
                console.log("VERIFIED EMAIL");
                res.render('verify');
            } else{
                console.log("ERROR DURING VERIFICATION");
                return Response.message(res,400,"Error verifying Email");
            }
        } catch(error) {
            return Response.message(res,400,error);
        }
    }
}
member = new member();
module.exports = member