exports.index =function(db, userModel){
    return function(req, res){
	res.render('index', {});
    };
}


exports.login = function(db,userModel){
    return function(req,res){
	userModel.findOne({'user':req.body.user},function(err,docs){
	    if(docs == null){
		res.send('invalid login');
	    }else if(req.body.pass == docs.pass){
		req.session.user = req.body.user;
		//send list of names of user's grids
		res.send(docs.gridNames);
		//res.send(docs.grids); this one works but is slow and send all the grids at once
	    }else{
		res.send('invalid login');
	    }
	});
    }
}

exports.addUser = function(userModel){
    return function(req,res){
	userModel.findOne({'user':req.body.user},function(err,docs){
	    if(docs != null){
		res.send('username taken');
	    }else{
		console.log('req.body.pass'+req.body.pass);
		var newUser = new userModel(
		    {'user':req.body.user ,
		     'pass':req.body.pass ,
		     'grids':[],
		     'gridNames':[]
		    });
		newUser.save(function(err){console.log('saved ' + newUser.user)});
		res.send(newUser);
		console.log(newUser);
	    }
	});
    }
}


exports.save = function(db,userModel){
    return function(req,res){

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
	console.log('post to /recallGrid');
	//console.log(req.body.name+ '  '+req.body.user);
	var g = userModel.findOne({'user':req.body.user},function(err,docs){
	    var grids = docs.grids;
	    
	    grids.forEach(function(grid,index){
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
	console.log('post to /update');
	//console.log(req.body);
	var g = userModel.findOne({'user':req.body.user},function(err,docs){
	  //  console.log(docs);
	    var match;
	    docs.grids.forEach(function(grid,index){
		if(grid.name == req.body.name){
		    //console.log('grid.name ' +grid.name) 
		    match = index;
		}
	    })
//	    console.log(docs.grids);
	    docs.grids.splice(match,1,req.body);
	    //console.log(docs.grids);
	    docs.save(function(){});
	    res.send(docs.grids[match]);
	});
    }
}

