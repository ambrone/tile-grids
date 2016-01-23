var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var routes = require('./routes');
require("./conf");
var jade = require('jade');
var gm = require('gm').subClass({ imageMagick: true });
//module.exports = mongoose.connections[0];

var app = express();


app.set('views' , 'views');
app.set('view engine' , 'jade');

app.use(bodyParser.json({limit:"500mb"}));
app.use(bodyParser.urlencoded({extended:true, limit:"500mb"}));
app.use(cookieParser('amber'));
//app.use(session({
  //secret: 'amber',
  //store: new MongoStore({ mongooseConnection: mongoose.connection }),
  //resave:true,
  //saveUninitialized: true
//}));
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

/*
app.get('/admin' , routes.admin(bcrypt));


app.post('/saveimg',function(req,res){
  console.log('post to /saveimg '+ req.body.user + req.body.name);
  var file = req.body.img.replace(/^data:image\/png;base64,/,"");
  var name = './static/images/'+req.body.user+'_'+req.body.name;
  console.log('name '+'.png'+ req.body.name);
  fs.writeFile(name+'.png', file,'base64', function (err) {
    console.log('write error: ' + err);
    //if image is smaller than 100x100, make thumbnail same as image, otherwise crop for thumb
    gm(name+'.png').size(function(err,val){
      if(val.height <= 100 || val.width<=100){
        name = name.slice(15);
        gm(name+'.png').write(name+'_th.png',function(err){
          name = name.slice(15);
          res.send(name + '_th.png');
        });
      }else{
        gm(name+'.png').crop(100,100,0,0).write(name+'_th.png',function(err){
          console.log(err)
          name = name.slice(15);
          res.send(name+'_th.png');
        });
      }
    })
  })
})


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
