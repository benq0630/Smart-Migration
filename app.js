var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const cors = require('cors');
var indexRouter = require('./routes/index');
var intermediaryRouter = require('./routes/intermediary');

var app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'super secret string',
    secure: false
}));

app.use(function(req,res,next){
    console.log("The current user is:"+req.session.username);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/intermediary', intermediaryRouter);

module.exports = app;
