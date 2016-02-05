var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var https = require('https');
var path = require('path');
var routes = require('./routes');
require("./conf");
var jade = require('jade');

var app = express();


app.set('views' , 'views');
app.set('view engine' , 'jade');

app.use(bodyParser.json({limit:"500mb"}));
app.use(bodyParser.urlencoded({extended:true, limit:"500mb"}));
app.use(cookieParser('amber'));
app.use(express.static('./static'));


app.get('/' , routes.index());
app.post('/login' , routes.login());
app.post('/user' , routes.addUser());
app.post('/logout', routes.logout());
app.post('/user/grid_names', routes.gridnames());

app.post('/save', routes.save());
app.post('/update', routes.update());
app.post('/recallGrid' , routes.recallGrid());
app.post('/delete' , routes.delete());
app.post('/saveimg', routes.saveimg());

/*
app.get('/admin' , routes.admin(bcrypt));
app.post('/update',routes.update());
app.post('/adminUpdate' , routes.adminUpdate());
*/

if (environment != 'development') {
  var options = {
    key:fs.readFileSync('./tiles.key'),
    cert:fs.readFileSync('./tiles.crt')
  }
  https.createServer(options, app).listen(443);
  console.log('listening on 443');
} else {
  http.createServer(app).listen(8000);
  console.log('listening on 8000');
}
