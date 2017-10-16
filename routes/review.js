var Company = require('../models/company');
var User = require('../models/user');

module.exports = (app) => {
  app.get('/review/:id', (req, res) => { //Button salje u ovu get funkciju
    Company.findOne({'_id': req.params.id}, (err, data) => {
      res.render('company/review', { title: 'Company Review', user:req.user, data: data }); //Renderujemo review.ejs

    });
  });


}
