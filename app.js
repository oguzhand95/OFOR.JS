var express  = require('express');
var connect = require('connect');
var bodyParser     = require("body-parser");
var app      = express();
var port     = process.env.PORT || 9000;


app.use(express.static(__dirname + '/public'));
app.use(connect.cookieParser());
app.use(connect.logger('dev'));
 
app.use(connect.json());  
app.use(connect.urlencoded());
app.use(bodyParser.urlencoded({ extended: false }));


// Routes for WebService




require('./routes.js')(app);

app.listen(port,"192.168.43.14");
 
console.log('OFOR.JS running on port ' + port);