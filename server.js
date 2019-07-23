var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(8900, function(){
	console.log("Project Manager Server has started on port 8900")
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: '!@#APOLLO89!@#',
	resave: false,
	saveUninitialized: true
}));


var router = require('./router/main')(app, fs);
