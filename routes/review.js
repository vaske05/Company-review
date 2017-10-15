module.exports = (app) => {
  app.get('/review/:id', (req, res) => { //Button salje u ovu get funkciju
    res.render('company/review', { title: 'Company Review', user:req.user }); //Renderujemo review.ejs
  });


}
