var pg = require('pg');
var db = new pg.Client('postgres://localhost:5432/tiles');
var connectionString = 'postgres://localhost:5432/tiles';

logRequest = function(req) {
  //console.log("req.headers: %j",req.headers);
  console.log("\nreq.url: %j", req.originalUrl);
  console.log("req.body: %j" ,req.body);
  console.log("req.params: %j", req.params);
  //for (key in req){
    //console.log(key);
  //};
}
handleError = function(error, res, message, req) {
  console.log("error: " + error);
  res.send({message:message});
}

generateToken = function() {
  return randomString(64, "aA#!");
}
randomString = function(length, chars) {
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


exports.index = function(){
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
        handleError(err, res.status(500), 'db error', req);
      }
      var username = req.body.username;
      var password = req.body.pass;

      client.query("SELECT * FROM users WHERE username = '" + username + "';", function(err, result) {

        if (err) {
          return handleError(err, res.status(500), "db error", req);
        }
        if (result.rows.length == 0) {
          return handleError('no user found for username:' + username, res.status(401), 'invalid username or password', req);
        }

        var password_hash = result.rows[0].password;

        bcrypt.compare(password, password_hash, function(err, result) {
          if (err)
            return handleError(err, res.status(500), 'server error', req);
          if (!result) {
            var message = "invalid username or password";
            return handleError(message, res.status(401), message);
          };

          var token = generateToken();
          client.query("UPDATE users SET token = '" + token + "' WHERE username = '" +  username + "'" , function(err, result){
            if (!result) {
              return handleError(err, res.status(500), 'db error', req);
            };
            client.query("SELECT gridname FROM grids WHERE username = '" + username + "';", function(err, result){

              if (err) {
                return handleError(err, res.status(500), 'db error', req);
              };
              grid_names = [];
              result.rows.forEach(function(row){
                grid_names.push(row.gridname);
              });
              var response_body = {
                grid_names : grid_names,
                token : token
              };
              done();
              res.send(response_body);
            });
          });
        });
      });
    });
  }
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
