var pg = require('pg');
var db = new pg.Client('postgres://localhost:5432/tiles');
var connectionString = 'postgres://localhost:5432/tiles';

logRequest = function(req) {
  console.log("req: %j" ,req.session);
}


exports.index =function(){
  return function(req, res){
    logRequest(req);
    res.render('index',{});
  };
}


exports.login = function(bcrypt){
  return function(req,res){
    logRequest(req);
    pg.connect(connectionString, function(err, client, done){
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

      var query = client.query("SELECT * FROM users WHERE username = '" + req.body.user + "';");

      var password_hash;
      query.on('row', function(row) {
        password_hash = row.password;
      });
      query.on('end',function(){

        bcrypt.compare(req.body.pass, password_hash, function(err, response) {
          if(response == true){
            var token = generateToken();
            var q = "UPDATE users SET token = '" + token + "' WHERE username = '" + req.body.user + "'";
            var save_query = client.query(q);
            var grid_names_query = client.query("SELECT gridname FROM grids WHERE username = '" + req.body.user + "';");
            grid_names = [];
            grid_names_query.on('row',function(row) {
              grid_names.push(row.gridname);
            });
            grid_names_query.on('end',function(){
            console.log(grid_names);
            //send list of names of user's grids
            //res.send(docs.gridNames);
            //res.send(docs.grids); this one works but is slow and send all the grids at once
           var response_body = {
             gridNames : grid_names,
             token : token
           }
           console.log("sending response: " + response_body);
           res.send(response_body);
            });
          }else if(response == false){
            res.send('invalid login');
          }
          done();
        });
      });
    });

    //console.log(query);

  }
}


generateToken = function() {
  return randomString(128, "aA#!");
}

function randomString(length, chars) {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '!@#$%^*()';
  if (chars.indexOf('+') > -1) mask += '~`_+-={}[]:;<>?,./|\\';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
  return result;
}

/*
exports.addUser = function(userModel,bcrypt){
  return function(req,res){
    logRequest(req);
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.pass, salt, function(err, hash) {
        // Store hash in your password B.
        userModel.findOne({'user':req.body.user},function(err,docs){
          if(docs != null){
            res.send('username taken');
          }else{
            console.log('req.body.pass'+req.body.pass +' '+hash);
            var newUser = new userModel({
              'user':req.body.user ,
              'pass':hash,
              'grids':[],
              'gridNames':[]
            });
            console.log('req.body.remember '+req.body.remember);
            if(req.body.remember = 'true'){
              req.session.user = req.body.user;
              console.log(60+req.body.remember);
            }
            newUser.save(function(err){console.log('saved ' + newUser.user)});
            res.send(newUser);
            //			console.log(newUser);
            console.log(req.session.user);
          }
        });
      });
    });

  }
}


exports.save = function(userModel , bcrypt){
  return function(req,res){
    logRequest(req);
    var s = userModel.findOne({'user':req.body.user} , function(err,docs){
      var arr = docs.grids;
      arr.push( req.body);
      docs.grids = arr;
      var names = docs.gridNames;
      names.push(req.body.name);
      docs.gridNames = names;
      docs.save(function(){});
      res.send('saved grid');
    });
  }
}

exports.recallGrid = function(userModel){
  return function(req,res){
    logRequest(req);
    var g = userModel.findOne({'user':req.body.user},function(err,docs){
      //var grids = docs.grids;
      docs.grids.forEach(function(grid,index){
        if(grid.name == req.body.name && grid.user == req.body.user){
          res.send(grid);
          return;
        }
      });

    });
  }
}

exports.update = function(userModel){
  return function(req,res){
    logRequest(req);
    var g = userModel.findOne({'user':req.body.user},function(err,docs){
      var match;
      docs.grids.forEach(function(grid,index){
        if(grid.name == req.body.name){
          match = index;
        }
      })
      docs.grids.splice(match,1,req.body);
      docs.save(function(){});
      res.send(docs.grids[match]);
    });
  }
}

exports.delete = function(fs,userModel){
  return function(req,res){
    console.log('post to /delete');
    console.log(req.body);
    logRequest(req);
    var g = userModel.findOne({'user':req.body.user},function(err,docs){
      var match;
      docs.grids.forEach(function(grid,index){
        if(grid.name == req.body.name){
          console.log('found '+grid.name+' for user ' + req.body.user);
          match = index;
          return;
        }
      });
      docs.grids.splice(match,1);
      docs.gridNames.splice(docs.gridNames.indexOf(req.body.name),1);
      docs.save(function(){});
      var imageFile = './static/images/'+req.body.user +'_'+req.body.name+'.png';
      fs.unlink(imageFile);
      res.send(req.body.name +' deleted');

    })
  }
}

exports.logout = function(){
  return function(req,res){
    logRequest(req);
    console.log('logging out ' + req.session.user);
    req.session.destroy(function(){
      res.clearCookie('connect.sid',{path:'/'});
    })
  }
}

var s = 'ryan';
function removeLetters(letter,str){
  if(str[0] == letter){
    return removeLetters(letter,str.slice(1));
  }else{
    return str[0] + removeLetters(letter,str.slice(1));
  }    
}

exports.admin = function(userModel,bcrypt){
  return function(req,res){
    logRequest(req);
    userModel.find({},{'gridNames':1,'user':1},function(err,docs){    
      res.render('admin', {users : docs});
    });
  }
};

exports.adminUpdate = function(userModel){
  return function (req,res){
    console.log(req.body);
    logRequest(req);
    if(req.body.type == 'usernameUpdate'){
      userModel.findOne({user:req.body.user}, function(err,docs){
        if(err) console.log(err);
        docs.user = req.body.newUser;
        docs.save(function(err){console.log(err);});
        res.send('user '+req.body.user+' is now ' + req.body.newUser);
        console.log('user '+req.body.user+' is now ' + req.body.newUser);
      })
    }else if(req.body.type == 'deleteUser'){
      userModel.findOne({user:req.body.user}).remove(function(err,docs){
        console.log(docs);
        if(err)console.log(err);
        res.send('user '+req.body.user+' deleted');
      })
    }

  }
}
*/
