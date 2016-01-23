var pg = require('pg');
//var db = new pg.Client('postgres://ryan@localhost:5432/tiles');
var connectionString = 'postgres://ryan:ryan@localhost:5432/tiles';
var bcrypt = require('bcrypt');

logRequest = function(req) {
    console.log("req.headers: %j",req.headers);
    console.log("\nreq.url: %j", req.originalUrl);
//    console.log("req.body: %j", req.body);
    console.log("req.params: %j", req.params);
    //for (key in req){
    //console.log(key);
    //};
}
handleError = function(error, res, message, req) {
    console.log("error: " + error);
    res.send({
        message: message
    });
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
authenticateToken = function(token, res, callback) {

    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            done();
            return handleError(err, res.status(500), 'db error', req);
        }

        var statement = {
            name : "authenicate-token",
            text : "SELECT username FROM users WHERE token=$1;",
            values : [token]
        }
        console.log(statement.text + ", " + statement.values);
        client.query(statement, function(err, result) {

            if (result.rows.length == 0)
                return handleError("token invalid", res.status(401), "token invalid");
            console.log('found user: ' + result.rows[0].username);
            callback(result.rows[0].username);
            done();
        });

    });
}

checkPasswordForGoodness = function(pw) {
    return true;
}
checkUsernameForGoodness = function(username) {
    return true;
}


exports.index = function() {
    return function(req, res) {
        logRequest(req);
        res.render('index', {});
    };
}
exports.login = function() {
    return function(req, res) {
        logRequest(req);
        pg.connect(connectionString, function(err, client, done) {
            if (err) {
                done();
                return handleError(err, res.status(500), 'db error', req);
            }
            var username = req.body.username;
            var password = req.body.pass;

            var queryString = "SELECT * FROM users WHERE username = '" + username + "';";
            console.log(queryString);
            var statement = {
                name : "login",
                text : "SELECT * FROM users WHERE username=$1",
                values : [password]
            }
            client.query(statement, function(err, result) {
                console.log("found " + result.rows.length + " row(s)");

                if (err) {
                    done();
                    return handleError(err, res.status(500), "db error", req);
                }
                if (result.rows.length == 0) {
                    done();
                    return handleError('no user found for username:' + username, res.status(401), 'invalid username or password', req);
                }

                var password_hash = result.rows[0].password;

                bcrypt.compare(password, password_hash, function(err, result) {
                    if (err) {
                        done();
                        return handleError(err, res.status(500), 'server error', req);
                    }
                    if (!result) {
                        done();
                        var message = "invalid username or password";
                        return handleError(message, res.status(401), message);
                    };

                    var token = generateToken();
                    var queryString = "UPDATE users SET token = '" + token + "' WHERE username = '" + username + "'";
                    var statement = {
                        name : "set-token",
                        text : "UPDATE users SET token=$1 WHERE username=$2",
                        values : [token, username]
                    }
                    client.query(statement, function(err, result) {
                        console.log("found " + result.rows.length + " row(s)");
                        if (err) {
                            done();
                            return handleError(err, res.status(500), 'db error', req);
                        }
                        if (!result) {
                            done();
                            return handleError(err, res.status(500), 'db error', req);
                        };
                        var queryString = "SELECT name FROM grid_data WHERE username = '" + username + "';";
                        console.log(queryString);
                        var statement = {
                            name : "gridnames",
                            text : "SELECT name FROM grid_data WHERE username=$1",
                            values : [username]
                        }
                        client.query(statement, function(err, result) {
                            console.log("found " + result.rows.length + " row(s)");
                            if (err) {
                                done();
                                return handleError(err, res.status(500), 'db error', req);
                            };
                            grid_names = [];
                            result.rows.forEach(function(row) {
                                grid_names.push(row.name);
                            });
                            var response_body = {
                                grid_names: grid_names,
                                token: token
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

exports.logout = function() {
    return function(req, res) {
        logRequest(req);

        var token = req.body.token;

        pg.connect(connectionString, function(err, client, done) {
            var queryString  = "UPDATE users SET token=NULL WHERE token='" + token + "'";
            var statement = {
                name : "logout",
                text : "UPDATE users SET token=NULL WHERE token=$1",
                values : [token]
            }
            client.query(statement, function(err, result) {
                console.log('erasing token: ' + token);
                res.send();
            });
        });
    }
}

exports.gridnames = function() {

    return function(req, res) {
        logRequest(req);

        var token = req.body.token;
        authenticateToken(token, res, function(username) {

            pg.connect(connectionString, function(err, client, done) {
                var queryString = "SELECT name FROM grid_data WHERE username='" + username + "'";
                console.log(queryString);
                var statement = {
                    name : "gridnames",
                    text : "SELECT name FROM grid_data WHERE username=$1",
                    values : [username]
                }
                client.query(statement, function(err, result) {
                    console.log("found " + result.rows.length + " row(s)");

                    if (err) {
                        done();
                        return handleError(err, res.status(500), 'db error', req);
                    }
                    if (result.rows.length == 0) {
                        done();
                        return handleError('no user found with token:' + token, res.status(401), 'no grids found', req);
                    }

                    var gridnames = [];
                    result.rows.forEach(function(row) {
                        gridnames.push(row.name);
                    });

                    console.log("found gridnames: " + gridnames);

                    res.send({
                        username: result.rows[0].username,
                        grid_names: gridnames
                    });
                });
            });
        });
    }
}

exports.addUser = function() {
    return function(req, res) {
        logRequest(req);

        pg.connect(connectionString, function(err, client, done) {
            if (err) {
                done();
                return handleError(err, res.status(500), 'db error', req);
            }

            var body = req.body;
            var username = body.username;
            var password = body.pass;
            var queryString = "SELECT * FROM users WHERE username = '" + username + "';"
            console.log(queryString);
            var statement = {
                name : "addUser",
                text : "SELECT * FROM users WHERE username=$1",
                values : [username]
            }
            client.query(statement, function(err, result) {
                console.log("found " + result.rows.length + " row(s)");
                if (err) {
                    done();
                    return handleError(err, res.status(500), 'db error', req);
                }
                if (result.rows.length != 0) {
                    done();
                    return handleError("username taken", res.status('403'), 'username unavailable', req);
                }
                if (!checkUsernameForGoodness(username)) {
                    done();
                    return handleError("username is not good enough", res.status('400'), 'username is not good enough', req);
                }
                if (!checkPasswordForGoodness(password)) {
                    done();
                    return handleError("password is not good enough", res.status('400'), 'password is not good enough', req);
                }

                var token = generateToken();
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {

                         var queryString = "INSERT INTO users VALUES ('" + username + "','" + hash + "','" + token + "')";
                         console.log(queryString);
                         var statement = {
                            name : "create-user",
                            text : "INSERT INTO users VALUES ($1, $2, $3)",
                            values : [username, hash, token]
                        }

                        client.query(statement, function(err, result) {
                            if (err) {
                                done();
                                return handleError(err, res.status(500), 'db error', req);
                            }
                            done();
                            res.send({
                                token: token
                            });
                        });
                    });
                });
            });
        });
    }
}

exports.update = function() {
    return saveOrUpdate(true);
}
exports.save = function() {
    return saveOrUpdate(false);
}

saveOrUpdate = function(update) {
    return function(req, res) {
        logRequest(req);

        //authenticate
        var token = req.body.token;
        authenticateToken(token, res, function(username) {

            var body = req.body;
            var name = body.name;
            if (name == '' || name == undefined)
                return handleError("name of grid is blank", res.status(400), 'name of grid is blank', req);
            var border = body.border;
            var background = body.background;
            var color1 = body.colors[0];
            var color2 = body.colors[1];
            var color3 = body.colors[2];
            var prob1 = body.probs[0];
            var prob2 = body.probs[1];
            var prob3 = body.probs[2];
            var side = body.side;
            var squares = body.squares;

            var square_data = "{";
            squares.forEach(function(square, index) {
                square_data += square[1];
                if (index != squares.length - 1)
                    square_data += ",";
            });
            square_data += "}";

            pg.connect(connectionString, function(err, client, done) {
                console.log(update);
                var queryStringInsert = "INSERT INTO grid_data VALUES ('" + name + "','" + username + "','" + border + "','" + background + "','" + color1 + "','" + color2 + "','" + color3 + "'," + prob1 + "," + prob2 + "," + prob3 + "," + side + ",'" + "{square_data}" + "')";
                var insertStatement = {
                    name : 'insert-grid',
                    text : 'INSERT INTO grid_data VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
                    values : [name, username, border, background, color1, color2, color3, prob1, prob2, prob3, side, square_data]
                }
                if (update) {
                    queryStringDelete = "DELETE FROM grid_data WHERE name='" + name + "' AND username='" + username + "';"
                    var deleteStatement = {
                        name : "delete-grid",
                        text : "DELETE FROM grid_data WHERE name=$1 AND username=$2",
                        values : [name, username]
                    }
                    client.query(deleteStatement, function(err, result) {
                        console.log(queryStringDelete);
                        if (err) {
                            done();
                            return handleError(err, res.status(500), 'db error', req);
                        }
                        client.query(insertStatement, function(err, result) {
                            console.log(queryString);
                            if (err) {
                                done();
                                return handleError(err, res.status(500), 'db error', req);
                            }
                        });
                    });
                } else {
                    console.log(queryStringInsert);
                    client.query(insertStatement, function(err, result) {
                        if (err) {
                            done();
                            return handleError(err, res.status(500), 'db error', req);
                        }
                    });
                }

            });


            res.send('saved grid');
        })

    }
}

exports.recallGrid = function(userModel) {
    return function(req, res) {
        logRequest(req);

        var token = req.body.token;
        authenticateToken(token, res, function(username) {

            pg.connect(connectionString, function(err, client, done) {

                var queryString = "SELECT * FROM grid_data WHERE name='" + req.body.name + "' AND username='" + username + "'";
                console.log(queryString);
                var statement = {
                    name: "recallGrid",
                    text: "SELECT * FROM grid_data WHERE name=$1 AND username=$2",
                    values: [req.body.name, username]
                }
                client.query(statement, function(err, result) {
                    if (err) {
                        done();
                        return handleError(err, res.status(500), 'db error', req);
                    }
                    console.log("found " + result.rows.length + " row(s)");

                    var rows = result.rows;
                    if (rows.length > 0) {

                        var row = rows[0];
                        var body = {};
                        row.colors = [row.color1, row.color2, row.color3];
                        row.probs = [row.prob1, row.prob2, row.prob3];

                        var squares = [];
                        var color_map = {
                            0: row.background,
                            1: row.color1,
                            2: row.color2,
                            3: row.color3
                        }
                        row.squares.forEach(function(color_number) {
                            squares.push([color_map[color_number], color_number]);
                        });
                        row.squares = squares;

//                        console.log(row);
                        res.send(row)
                    }
                });
            });
        });
    }
}

exports.delete = function() {
    return function(req, res) {
        console.log('post to /delete');
        logRequest(req);
        var token = req.body.token;
        authenticateToken(token, res, function(username) {

            pg.connect(connectionString, function(err, client, done) {

                var grid_name = req.body.name;
                var queryString = "DELETE FROM grid_data WHERE username='" + username + "'" + " AND name='" + grid_name + "'";
                console.log(queryString);

                client.query({
                    text: "DELETE FROM grid_data WHERE username=$1 AND name=$2",
                    name: "insert-my-data",
                    values: [username, grid_name]
                }, function(err, result) {
                    if (err) {
                        done();
                        return handleError(err, res.status(500), 'db error', req);
                    }
                    //                    var imageFile = './static/images/' + req.body.user + '_' + req.body.name + '.png';
                    //                    fs.unlink(imageFile);
                });
            });
        });
    };
}


/*
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