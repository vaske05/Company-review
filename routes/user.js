//var passport = require('passport');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');

var crypto = require('crypto');
var User = require('../models/user');
var secret = require('../secret/secret');


module.exports = (app, passport) => {

    app.get('/', (req, res, next) => {

        if(req.session.cookie.originalMaxAge !== null) {
            res.redirect('/home');
        }
        else {
            res.render('index', {title: 'Index || RateMe'});
        }
    });

    app.get('/signup', (req,res) => {
        var errors = req.flash('error');
        console.log(errors);
        res.render('user/signup', {title: 'Sign Up || RateMe', messages: errors, hasErrors:errors.length > 0});

    });

    app.post('/signup', validateSignup, passport.authenticate('local.signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/login', (req,res) => {
        var errors = req.flash('error');
        res.render('user/login', {title: 'Login || RateMe', messages: errors,
        hasErrors: errors.length > 0});

    });

    app.post('/login', validateLogin, passport.authenticate('local.login', {
        //successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }), (req,res) => {
        if(req.body.rememberme){
            req.session.cookie.maxAge = 30*24*60*60*100 // 30 days
        }
        else {
            req.session.cookie.expires = null;
        }
        res.redirect('home');
    });

    app.get('/auth/facebook', passport.authenticate('facebook', {scope:'email'}));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }))

    app.get('/home', (req,res) => {
        res.render('home', {title: 'Home || RateMe', user: req.user});
    });

    app.get('/forgot', (req,res) => {
        var errors = req.flash('error');
        var info = req.flash('info');
        res.render('user/forgot', {title: 'Request Password Reset', messages: errors,
        hasErrors: errors.length > 0, info: info, noErrors: info.length > 0});
    });

    //Password recovery POST
    app.post('/forgot', (req,res,next) => {
        async.waterfall([
            function(callback){
                crypto.randomBytes(20, (err,buf) => {
                    var rand = buf.toString('hex');
                    callback(err, rand);

                });
            },
            function(rand, callback) {
                User.findOne({'email':req.body.email}, (err,user) => {
                    if(!user){
                        req.flash('error','Email is Invalid');
                        return res.redirect('/forgot');
                    }

                    user.passwordResetToken = rand;
                    user.passwordResetExpires = Date.now() + 60*60*1000;

                    user.save((err) => {
                        callback(err, rand, user);
                    });
                })
            },
            function(rand, user, callback) {
                //debugger;
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });

                var mailOptions = {
                    to:user.email,
                    from: 'RateMe'+'<'+secret.auth.user+'>',
                    subject: 'RateMe App Password Reset Token',
                    text: 'You have requested for password reset token. \n\n'+
                    'Please click on the link to complete process:\n\n'+
                    'http://localhost:3000/reset/' + rand + '\n\n'
                };
                smtpTransport.sendMail(mailOptions, (err,res) => {
                    req.flash('info','A password reset token has been sent to ' + user.email);
                    return callback(err,user);
                });
            }
        ], (err) =>{
            if(err){
                return next(err);
            }
            res.redirect('/forgot');
        })
    });

    app.get('/reset/:token', (req,res) => {

        User.findOne( {passwordResetToken: req.params.token
            ,passwordResetExpires: {$gt: Date.now()}}, (err, user) => {

                if(!user) {
                    req.flash('error','Password reset token has expired or is invalid. Enter your email again to get a new token.');
                    return res.redirect('/forgot');
                }

                var errors = req.flash('error');
                var success = req.flash('success');
                res.render('user/reset', {title: 'Reset Your Password',messages: errors,
                hasErrors: errors.length > 0, success: success, noErrors: success.length > 0});
        });
    });

    app.post('/reset/:token', (req,res) => {
        async.waterfall([
            function(callback){
                User.findOne( {passwordResetToken: req.params.token
                    ,passwordResetExpires: {$gt: Date.now()}}, (err, user) => {

                    if(!user) {
                        req.flash('error','Password reset token has expired or is invalid. Enter your email again to get a new token.');
                        return res.redirect('/forgot');
                    }
                    //debugger;
                    req.checkBody('password', 'Password is Required!').notEmpty();
                    req.checkBody('password', 'Password Must Not Be Less Than 5!').isLength({min:5});
                    req.check("password", "Password Must Contain at least 1 Number and 1 letter!").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

                    var errors = req.validationErrors();

                    if(req.body.password == req.body.cpassword){
                        if(errors) {
                            var messages = [];
                            errors.forEach((error) => {
                                messages.push(error.msg);
                            });
                            req.flash('error',messages);
                            res.redirect('/reset/' + req.params.token);
                        }
                        else {
                            user.password = user.encryptPassword(req.body.password); //Update new password
                            user.passwordResetToken = undefined;
                            user.passwordResetExpires = undefined;
                            console.log('Pre save')
                            req.flash('success', 'Your password has been successfully updated.');

                            user.save((err) =>{
                                //req.flash('success', 'Your password has been successfully updated.');
                                return callback(err,user);
                            });
                        }
                    }
                    else {
                        req.flash('error','Password and confirm password are not equal');
                        res.redirect('/reset/' + req.params.token);
                    }
                });
            },
            function(user, callback) {
                debugger;
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });

                var mailOptions = {
                    to:user.email,
                    from: 'RateMe'+'<'+secret.auth.user+'>',
                    subject: 'Your password has been updated',
                    text: 'This is the confirmation that you updated the password for: ' + user.email
                };
                smtpTransport.sendMail(mailOptions, (err,res) => {

                    callback(err, user);

                   /* var error = req.flash('error');
                    var success = req.flash('success');

                    res.render('user/login', {title: 'Reset Your Password', messages: error, hasErrors: error.length > 0, success:success, noErrors:success.length > 0});
                */

                });
            }
        ], (err) =>{
            if(err){
                return next(err);
            }
            res.redirect('/');
            this.alert('Check your email adress.');
        }
    )
    });

    app.get('/logout', (req,res) => {
        req.logout();
        req.session.destroy((err) => {
            res.redirect('/');

        });

    });

    app.get('/user/:id', (req,res) => {
      res.render('user/user-profile', { title: 'User Profile || RateMe', user: req.user, id: req.params.id });

    });

    app.post('/user/:id', (req,res) => {

      User.update({'_id': req.params.id},
            {$set: {
               'fullname': req.body.fullName ,
               'city': req.body.city ,
               'country': req.body.country ,
               //'profileImage': req.body.upload

            }}, function(err, result) {
                  if(err){
                    console.log("ERROR u UPDATE PROFILE" + err);
                  }
                  res.redirect('/user/' + req.params.id);

            });
    });

    //Snimanje uploadovane slike u folder:uploads
    app.post('/uploadProfileImage', (req,res) => {
        var form = new formidable.IncomingForm();

        form.uploadDir = path.join(__dirname,'../public/uploads');

        form.on('file', (field, file) => {
            fs.rename(file.path, path.join(form.uploadDir,file.name), (err) => {
                if(err){
                    throw err;
                }
                console.log('File has been renamed');
            });
        });

        form.on('error', (err) => {
            console.log('An error occured:', err);
        });

        form.on('end', () => {
            console.log('File was uploaded successfull!');

            User.update({'_id': req.params.id},
                  {$set: {
                     'profileImage': req.body.upload

                  }}, function(err, result) {
                        if(err){
                          console.log("ERROR u UPDATE PROFILE" + err);
                        }
                        res.redirect('/user/' + req.params.id);

            });
        });

        form.parse(req);
    });

}

function validateSignup(req,res,next){
    //Full name
    req.checkBody('fullname', 'Fullname is Required!').notEmpty();
    req.checkBody('fullname', 'Fullname Must Not Be Less Than 5!').isLength({min:5});
    //Email
    req.checkBody('email', 'Email is Required!').notEmpty();
    req.checkBody('email', 'Email is Invalid!').isEmail();
    //Password
    req.checkBody('password', 'Password is Required!').notEmpty();
    req.checkBody('password', 'Password Must Not Be Less Than 5!').isLength({min:5});
    req.check("password", "Password Must Contain at least 1 Number").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var errors = req.validationErrors(); //req.getValidationResult()

    if(errors) {
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });

        req.flash('error',messages);
        res.redirect('/signup');
    }
    else {
        return next();
    }
}

function validateLogin(req,res,next){
    //Email
    req.checkBody('email', 'Email is Required!').notEmpty();
    req.checkBody('email', 'Email is Invalid!').isEmail();
    //Password
    req.checkBody('password', 'Password is Required!').notEmpty();
    req.checkBody('password', 'Password Must Not Be Less Than 5 Characters!').isLength({min:5});
    req.check("password", "Password Must Contain at least 1 Number").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var loginErrors = req.validationErrors(); //req.getValidationResult()

    if(loginErrors) {
        var messages = [];
        loginErrors.forEach((error) => {
            messages.push(error.msg);
        });

        req.flash('error',messages);
        res.redirect('/login');
    }
    else {
        return next();
    }
}
