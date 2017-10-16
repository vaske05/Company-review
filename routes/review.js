var async = require('async');
var Company = require('../models/company');

module.exports = (app) => {

  app.get('/review/:id', (req, res) => { //Button salje u ovu get funkciju
    var msg = req.flash('success');
    Company.findOne({'_id': req.params.id}, (err, data) => {
      res.render('company/review', { title: 'Company Review', user:req.user, data: data, msg: msg, hasMsg: msg.length>0 }); //Renderujemo review.ejs

    });
  });

  app.post('/review/:id', (req, res) => {
    async.waterfall([
      function(callback){
        Company.findOne({'_id': req.params.id}, (err, result) => {
          callback(err, result);
        });
      },
      function(result, callback){
        Company.update({'_id': req.params.id},
        {
          $push: {
            companyRating: {
              companyName: req.body.sender,
              userFullName: req.user.fullname,
              userRole: req.user.role,
              companyImage: req.user.company.image,
              userRating: req.body.clickedValue,
              userReview: req.body.review,
            },
            ratingNumber: req.body.clickedValue
          },
          $inc: { ratingSum: req.body.clickedValue }
        },(err) => {
          req.flash('success','Your review has been added.');
          res.redirect('/review/'+req.params.id);
        })
      }
    ])

  });






}
