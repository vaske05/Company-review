var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');


var app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/rateme'); //Povezujem Mongoose sa mojom MongoDB bazom

require('./config/passport');
require('./secret/secret');

app.use(express.static('public'));
app.engine('ejs', engine);
app.set('view engine','ejs');
app.use(cookieParser());


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(validator());

app.use(session({
    secret: 'Thisismytestkey',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}) //session data save to database
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

require('./routes/user')(app, passport);
require('./routes/company')(app);
require('./routes/review')(app);

var port = 3000;
app.listen(port, function(){
    console.log('Application running on port:' + port);
});
