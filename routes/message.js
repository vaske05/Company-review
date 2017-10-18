module.exports = (app) => {

  app.get('/message/:id', (req, res) => {
    res.render('messages/message', {title:'Private Message', user: req.user});

  });

}
