$(document).ready(function(){
    function getRand(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /*
    Grid = function(side,id,border,background){
	var s = parseInt(side);
	while(s%11 !=0){
	    s+=1;
	}
	this.side = s;
	this.squares = [];
	this.probs = [];
	this.colors = []
	this.border = border;
	this.background = background;
	this.clear = function(){
	    this.squares.forEach(function(square){
		square.change('white');
		square.isBackground = true;
		square.iteration = 0;
	    });
	    this.changeBorder('black');
	}
	this.changeBorder = function(newColor){
	    $('.square').css('border' , '1px solid '+newColor);
	    this.border = newColor;
	}
	this.changeBackground = function(newColor){
	    this.squares.forEach(function(square){
		if(square.isBackground  == true){
		    square.change(newColor);
		}
	    });
	    this.background = newColor;
	}
    }
   */ 
    CanvasGrid = function(side,id,border,background){
	//Grid.call(this,side,id,border,background);
	var s = parseInt(side);
	while(s%11 !=0){
	    s+=1;
	}
	this.side = s;
	this.squares = [];
	this.probs = [];
	this.colors = []
	this.border = border;
	this.background = background;
	this.clear = function(){
	    this.squares.forEach(function(square){
		square.change('white');
		square.isBackground = true;
		square.iteration = 0;
	    });
	    this.changeBorder('black');
	}
	this.changeBorder = function(newColor){
	    $('.square').css('border' , '1px solid '+newColor);
	    this.border = newColor;
	}
	this.changeBackground = function(newColor){
	    this.squares.forEach(function(square){
		if(square.isBackground  == true){
		    square.change(newColor);
		}
	    });
	    this.background = newColor;
	}

	this.canvas = $('canvas')[0];

	this.build = function(){
	    var sqPerSide = this.side / 11;
	    if (this.squares.length == 0){
		for(var i=0;i<Math.pow(sqPerSide,2);i++){
		    var square = new CanvasSquare(this,'white',10,i);
		    this.squares.push(square);
		}
	    }
	}
	this.draw =function(){
	    var $canvas = $('<canvas id="cantester"></canvas>');	    
	    $('#boxwrapper').empty().append($canvas);
	    var canvas = $canvas[0];
	    canvas.height = this.side+1;
	    canvas.width = this.side+1;
	    //console.log('drawing...');
	    if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = this.border;
		ctx.fillRect(0,0,this.side+1,this.side+1);
		var squaresPerSide = this.side / 11;
		var colorCount = 0
		var now = Date.now();
		for(i=1;i<=squaresPerSide*11;i+=11){
		    for(j=1;j<squaresPerSide*11;j+=11){
			ctx.fillStyle = this.squares[colorCount].color;
			ctx.fillRect(j,i,10,10);
			this.squares[colorCount].pos.x=j;
			this.squares[colorCount].pos.y=i;
			colorCount +=1;
			if(colorCount == this.squares.length){
			    //console.log('build time: '+((Date.now()-now)/1000).toString() + ' seconds' );
			    return;
			}
		    }
		}
	    }
	}

	this.changeBorder = function(newColor){
	    this.border = newColor;
	}
    };

    //CanvasGrid.prototype = Object.create(Grid.prototype);

    Square = function(grid,color, width, index){
	this.color = color;
	this.width = width;
	this.index = index;
	this.grid = grid;
	this.background = this.grid.background;
	this.iteration = 0;
	this.make = function(){
	    var $square = $('<div class="square" style="width'+this.width+'px; height:'+this.width+'px" id="'+index+'" ></div>');
	    $square.css('background-color', this.color);
    	    $square.css('border', 'solid 1px '+this.background);
	    return $square;
	};
	
	this.isBackground = true;

	this.edge = function(){
	    var edges = []
	    var tilesPerSide = this.grid.side/11;
	    var indx = this.index;

	    if(indx <= tilesPerSide){
		edges.push( 'top' );
	    }
	    if(indx % tilesPerSide == 0){
		edges.push( 'left' );
	    }
	    if((indx+1) % tilesPerSide == 0){
		edges.push( 'right' );
	    }
	    
	    if(indx >= Math.pow(tilesPerSide, 2) - tilesPerSide){
		edges.push('bottom');
	    }
	    return edges;
	}
	this.change = function(color){
	    $('#'+this.index).css('background', color);
	    this.color = color;
	    this.isBackground = false;
	}
	this.above = function(){
	    return this.grid.squares[this.index-this.grid.side/11];
	}
	this.right = function(){
	    if (this.edge().indexOf('right') == -1){
		return this.grid.squares[this.index+1];
	    }
	}
	this.left = function(){
	    if (this.edge().indexOf('left') == -1){
		return this.grid.squares[this.index-1];
	    }
	}
	this.below = function(){
	    return this.grid.squares[this.index + this.grid.side/11];
	}
	this.ul = function(){
	    if (this.edge().indexOf('left') == -1){
		return this.grid.squares[this.index-this.grid.side/11-1];
	    }
	}
	this.ur = function(){
	    if (this.edge().indexOf('right') == -1){	    
		return this.grid.squares[this.index-this.grid.side/11+1];
		}
	}
	this.bl = function(){
	    if (this.edge().indexOf('left') == -1){
		return this.grid.squares[this.index + this.grid.side/11-1];
	    }
	}
	this.br = function(){
	    if (this.edge().indexOf('right') == -1){
		return this.grid.squares[this.index + this.grid.side/11+1];
	    }
	}
	this.nabes = [this.above, this.right, this.left, this.below, this.ul, this.ur, this.bl, this.br ]

    }
    
    CanvasSquare = function(grid,color,width,index){
	Square.call(this,grid,color,width,index);
	
	this.change = function(color, iteration, draw){
	    this.color = color;
	    this.iteration = iteration;
	    if (iteration == 0) {
		this.isBackground = true;
	    }else{
		this.isBackground = false;
	    }
	    if(draw == true){
		var canvas = $('canvas')[0].getContext('2d');
		canvas.fillStyle = color;
		canvas.fillRect(this.pos.x,this.pos.y, 10 , 10);
	    }
	}
	this.make = false;
	this.pos = {x:0,y:0};
    }

    CanvasSquare.prototype = Object.create(Square.prototype);
    
     nabes = function(square){
	var nabes = [];
	
	[square.ul(), square.above(), square.ur(), square.left(), square.right(), square.bl(), square.below(), square.br()].forEach(
	    function(neighbor){
		if (typeof neighbor == 'object'){
		    nabes.push(neighbor);
		}
	    });
	return nabes;
    }

    $('#initial , #second, #third').bind('keypress', function(e) {
	if(e.keyCode==13){
	    buildCanvasFromFields();
	}
    });


//change color without rebuilding canvas
    $('.colorBox').bind('keypress' , function(e){
	if(e.which != 13){
	    return;
	}
	var colors =[ $('#color1').val(), $('#color2').val(), $('#color3').val()]

	if(e.which == 13){
	    changeColors(colors);
	}
    });

    function changeColors(newColors){
	
	cg.squares.forEach(function(square){
	    for(var i=0 ; i<=2 ; i++){
		if(square.iteration - 1 == i && newColors[i] != ''){
		    var it = square.iteration;
		    square.change(newColors[i] , it , true);
		}
	    }
	});
	cg.colors = newColors;
    }
	
//change background without rebuilding canvas
    $('#colorBack').bind('keypress', function(e){
	if(e.keyCode == 13){
	    var newColor = $('#colorBack').val();
	    cg.changeBackground(newColor);
	    var canvas = $('canvas')[0].getContext('2d');
	    cg.squares.forEach(function(square){
		if(square.isBackground == true){
		    square.change(newColor , 0, true);
		}
	    })
	}
    });
//change border without rebuilding canvas
    $('#colorBorder').bind('keypress', function(e){
	if(e.which == 13){
	    cg.changeBorder($('#colorBorder').val());
	    cg.draw();
	}
    });
//use up and down arrows to change values and redraw
    $('body').on('keyup', 'input', function(e) {

	var $this = $(this);
	var id = $this.attr('id');
	if (id=='initial' || id=='second' || id=='third'){
	    
	    if (e.which == 38){	
		var changeNumber = .1
	    }
	    else if (e.which == 40){
		var changeNumber = -.1;
	    }

	    if ($this.attr('id') == 'initial'){
		changeNumber = changeNumber / 10;
	    }
	    
	    if (changeNumber){
		var value =  parseFloat($this.val());
		value += changeNumber;
		
		if(value >=1){
		    value = 1;
		    flashRed($this);
		    
		}
		else if (value <= 0){
		    value = 0;
		    flashRed($this);
		    
		}
		value = value.toFixed(2);
		value = value.toString();
		$this.val(value);
	   	
		fill(cg,grabFieldValues());
		cg.draw();
	    }
	}
	
	else if(id=='colorBorder' || id=='colorBack' || id=='color1' || id=='color2' || id == 'color3'){
	    if(e.which == 38 || e.which == 40){
		//console.log(e.which);
		var value = $this.val();
		//console.log(value);
		value = parseInt(value.slice(1),16);
		//console.log(value);
		if(value != value){return;}
		if(e.which == 38){
		    value += 100;
		}
		else{
		    value -=100;
		}
		value = '#' + value.toString(16);
		//console.log(value);
		$this.val(value);
		changeColors([ $('#color1').val(), $('#color2').val(), $('#color3').val()]);
	    }
	}else if(id == 'size'){
	    if(e.which == 13) $('#rebuild').trigger('click');
	}
    });
    
	function flashRed($element){
	    $element.css('background-color', 'red');
	    var timeoutID =  window.setTimeout(function(){ $element.css('background-color','white');} , 500 );
	}
	
	function buildCanvasFromFields(){
	    var values = grabFieldValues();
	    if(values.size >= 5001) {
		alert('thats too big');
		return;
	    }
	    cg = new CanvasGrid(values.size, 'cantester' , values.colorBorder, values.colorBack);
	    cg.build();
	    fill(cg, values);
	    cg.draw($('#cantester')[0]);
	}
	
	
	$('#fillCan').on('click',function(){
	    buildCanvasFromFields();
	});

//311b6955
    fill = function (grid,values){
	grid.colors = [values.color1,values.color2,values.color3]
	grid.probs = [values.initial, values.second, values.third]
	
	partialFill(partialFill(initialFill(grid.squares,values.color1, values.initial, values.colorBack), values.color2, values.second, 2, values.least2), values.color3, values.third, 3, values.least3);
	
	grid.changeBorder(values.colorBorder);	
    }

    initialFill = function(squares, color, prob, background){
	var changedArray = [];
	squares.forEach(function(square){
	    if ( Math.random() < prob ){
		square.change(color, 1, false);
		changedArray.push(square);
	    }
	    else{
		square.change(background , 0, false);
		square.isBackground = true;
	    }
	    
	});
	return changedArray;
    }
    
    partialFill = function(squares, color, prob, iteration, least){
	//squares is array of square objects
	changedArray = [];
	var colorBack = $('#colorBack').val(); 
	squares.forEach(function(square){
	    randArray = randomArray(prob,least);
	    nabes(square).forEach(function(neighbor,index){
		if(randArray[index] == 1){
		    if(neighbor.isBackground == true){
			neighbor.change(color, iteration, false);
			changedArray.push(neighbor);
		    }
		}
	    });
	});
	return changedArray;
    }
    
    function randomArray(prob, least){
	//create a randomly sorted array of length 8 of 1's and 0's, at least 'least' of which are 1, the rest are 1's with probability 'prob' or 0's otherwise
	var aray = [];
	var rest = 8 - least;
	for(var i=0;i<least;i++){
	    aray.push(1);
	}
	for(var i=0;i<rest;i++){
	    if (Math.random() < prob){
		aray.push(1);
	    }else{
		aray.push(0);
	    }
	}
	//shuffle aray and return it
	var shuffled = [];
	for(i=8;i>=1;i--){
	    shuffled.push(aray.splice(Math.floor(i*Math.random()),1)[0])
	};
	return shuffled;
    }
    
    $('#rebuild').on('click', function(){
	var newSide = parseInt( $('#size').val() );
	//console.log(newSide);
	if (newSide == '' || isNaN(newSide)){
	    flashRed($('#size'));
	}
	else if(newSide != '' && !isNaN(newSide)){
	    newSide = parseInt(newSide);
  
	    cg = new CanvasGrid(newSide, 'cantester','white','white');
	    cg.build();
	    fill(cg,grabFieldValues());
	    cg.draw();
	}
    });

    grabFieldValues = function(){
	//gets input values from page return as object
	var $inputs = $('input:text');

	var values = {};
	$inputs.each(function(){
	    values[$(this).attr('id')] = $(this).val();
	});
	return values;
    }
    $('#clear').on('click', function(){
    });

	

	
///////////////////////////////////////////////////////////////////////////////////////

    makeSimpleArray = function(nameOfDesign, grid,user){
	//builds simple grid object for sending to server, simple as in just data no methods
	var simple = {
	    'user':user,
	    'name': nameOfDesign,
	    'border':grid.border, 
	    'background':grid.background, 
	    'colors':grid.colors,
	    'probs':grid.probs,
	    'side':grid.side, 
	    'squares':[]
	};
	grid.squares.forEach(function(square,index){
	    //	    simpleArray['squares'].push(square.color);
	    simple['squares'].push([square.color,square.iteration,square.isBackground]);
	    
	});

	return simple;
    }
/*
    createCanvasFromArray = function(simpleArray, canvas){
	canvas.height = simpleArray.side+12;
	canvas.width = simpleArray.side+12;
	if (canvas.getContext) {
	    var ctx = canvas.getContext('2d');
//	    ctx.fillStyle = simpleArray.background;
//	    ctx.fillRect(0,0,simpleArray.side+12,simpleArray.side+12);
	    var squaresPerSide = simpleArray.side / 12;
	    //console.log('squaresPerSide: '+squaresPerSide);
	    var colorCount = 0
	    for(i=0;i<=squaresPerSide*11;i+=11){
		for(j=0;j<squaresPerSide*12-12;j+=12){
		    ctx.fillStyle = simpleArray.squares[colorCount][0];
		    ctx.fillRect(j,i,10,10);
		    colorCount +=1;
		}
	    }
	    //console.log('colorCount: ' + colorCount);
//	    //console.log('simpleArray.squares.length: '+simpleArray.squares.length);
	
	}
	
    }
*/
    function buildcg(simpleArray){
	var s = simpleArray;
	cg = new CanvasGrid(s.side, 'cantester', s.border, s.background);
	cg.build();
	cg.name = s.name;
	cg.colors = s.colors;
	cg.probs = s.probs;
	var len = cg.squares.length-1;
	//console.log(simpleArray);
	for(var i=0;i<=len;i++){
	    cg.squares[i].change(s.squares[i][0], s.squares[0][1], false);
//	    cg.squares[i].iteration = s.squares[i][1];
//	    cg.squares[i].isBackground = s.squares[i][2];
	}
	//console.log('cg.squares.length: ' + cg.squares.length);

    }


    function applyFieldsToPage(simpleArray, grid){
	//puts grid data from saved grid into inputs on page
	$('#probBox input').each(function(index){
	    $(this).val(simpleArray.probs[index]);
	});
	$('#colorBox input').each(function(index){
	    $(this).val(simpleArray.colors[index]);
	});
	$('#colorBack').val(simpleArray.background);
	$('#colorBorder').val(simpleArray.border);
	$('#gridName').html(simpleArray.name);
	$('.colorBox, #colorBorder, #colorBack').each(function(){
	    $(this).css('background' , $(this).val());
	});
	$('#size').val(simpleArray.side);
    }
    

    function buildLoggedInView(user,gridsArray){
	//change login to welcome
	var welcome = $('<p class="message" name='+user+'>Welcome, '+user+'</p>');
	$('.loginbox').empty().append(welcome).append($('<button id="logout">logout</button>')); 

	//add list of grids
	var gridList = $('#savedList');
	//console.log(gridList.length);
	if(arguments.length >1){
	    gridsArray.forEach(function(gridName,index){
		gridList.append(buildListItem(gridName,user));
	    })
	}
    }

    function buildLoggedOutView(){
	$('#savedList').empty();
	$('.loginbox').empty().append($('<input type="text" name="user" placeholder="username"><input type="password" name="password" placeholder="password"><button id="login" value="login">login</button><button id="addUser">New User?</button><label>remember?<input type="checkbox" id="remember" name="remember"></label>'));
    }

    function buildListItem(name,user){
	return $('<li class="recall" name="'+name+'"><img src="images/'+user+'_'+name+'_th.png" class="thumbnail"/><p>'+name+'</p><button class="delete">delete</button><a href="images/' + user + '_' + name +'.png" target="_blank" download="grid.png">download</a></li>');
    }

////////////////////////////////////////////////////////////////CANVAS
/*    
    makeCanvas = function(){
	html2canvas(document.getElementById('boxwrapper'), {
	    onrendered:function(canvas){
		$('#thumb').children().detach();
		$('#thumb').append($(canvas));
		$('canvas').css('display','none');
	    }
	});
    }
*/
    saveCanvasAsImage = function(canvas){
	var can = canvas.toDataURL('image/png');
	//console.log(can);
	return can;
    }
    
    uploadThumb = function(img, name, user,update){
	//upload image to server, server returns path of image, grid is then added to #savedList
	var dat = {'name':name, 'img':img, 'user':user};
	//console.log('uploading '+dat);
	$.ajax({
	    type:'post',
	    data:JSON.stringify(dat),
	    contentType:'application/json',
	    url:'/saveimg',
	    success:function(data){
		//console.log(data);
		if(update == false){
		    var listItem = buildListItem(name,user);
		    $('#savedList').append(listItem);
		    //$('#savedList').children('li').last().children('img').attr('src' , data);  //'images/'+user+'_'+name+'_th.png');// imageSRC);
		}else{
		    $('#savedList li[name="'+name+'"]').prepend($('<img src="'+data+'"/>').addClass('thumbnail'));
		}
	    }
	});
    }
    

//A!!!!!!!!!!!J!!!!!!!!!!!!A!!!!!!!!!!!!!!!!!!X!!!!!!!!!!!!!!!!!!!AJAX

    
    $(document).on('click','#login', function(){
	var user = $('input[name="user"]').val();
	var pass = $('input[name="password"]').val();
	var remember = $('#remember').prop('checked');
	//console.log(user+pass);
	if(user == ''){
	    flashRed($('input[name="user"]'));
	    return;
	}
	if(pass == ''){
	    flashRed($('input[name="password"]'));
	    return;
	}
	$.ajax({
	    type:'post',
	    url:'/login',
	    data:{'user':user,'pass':pass,'remember':remember},
	    success:function(data){
		if(data =='invalid login'){
		    if($('.loginbox p').length > 0){
			$('.loginbox p').remove();
		    }
		    $('.loginbox').append($('<p class="message">login invalid</p>'));
		}else{
		    buildLoggedInView(user, data);
		    startTimer();

		}
	    }
	})
    });

    var idleTimer;
    function startTimer(){
	//console.log('click');
	if($('.loginbox input').length == 0){
	    if(idleTimer) window.clearTimeout(idleTimer);
	    idleTimer = window.setTimeout(function(){
		$('#logout').trigger('click');
		alert('You have been logged out due to inactivity');
	    }, 1000*60*10);
	}
    }
    $(document).on('click',function(){
	startTimer()
    
    });
    
    function clickLogout(){
	buildLoggedOutView();
	$.ajax({
	    type:'post',
	    url:'/logout',
	    success:function(data){
		//console.log(data +' logged out and cookie deleted');
	    }
	})
    }
    $(document).on('click' , '#logout' , clickLogout);

    $(document).on('click','#addUser', function(){
	var user = $('input[name="user"]').val();
	var pass = $('input[name="password"]').val();
	var remember = $('#remember').prop('checked');
	if(user == ''){
	    flashRed($('input[name="user"]'));
	    return;
	}
	if(pass == ''){
	    flashRed($('input[name="password"]'));
	    return;
	}
	$.ajax({
	    type:'post',
	    url:'/addUser',
	    data:{'user':user,
		  'pass':pass,
		  'remember':remember
		 },
	    success:function(data){
		//console.log(data);
		if (data == 'username taken'){
		    $('.loginbox').append($('<p class="message">try another name</p>'));
		}else{
		    buildLoggedInView(user);
		}
	    }
	});
    });




    $('#save').click(function(e){
	if( $('.message').attr('name') != undefined && $('canvas').length > 0){

	    var nameOfDesign = $('#savename').val();	    	    
	    //console.log(nameOfDesign);
	    if (nameOfDesign == ''){
		alert('name your work then press save');
		return
	    }

	    var imageSRC = saveCanvasAsImage($('canvas')[0]);

	    $('.recall').each(function(){
		if(nameOfDesign == $(this).attr('name')){
		    nameOfDesign += '1';
		}
	    });
	    if ($('canvas').length >=1){
		var grid = cg;
	    }
      	    var testArray = makeSimpleArray(nameOfDesign, grid, $('.message').attr('name'));
	   // testArray.user = $('.message').attr('name');
	    //console.log(testArray.user);
 	    $.ajax({
		type: 'POST',
		data: JSON.stringify(testArray),
		contentType: 'application/json',
		url: '/save',
		success: function(data) {
		    uploadThumb(imageSRC,nameOfDesign, testArray.user,false);
		    //console.log(data);
		    $('#savename').val('');
		    $('#gridName').html(nameOfDesign);
//		    var listItem = buildListItem(nameOfDesign, testArray.user);
//		    $('#savedList').append(listItem);
		    
		}
            });
	}
    });

 
    $(document).on('click', '.thumbnail', function(){
	var entryName = $(this).parents('.recall').attr('name');
	var now;
	var dat = {};
	dat.name = entryName;
	dat.user = $('.message').attr('name');
//	var $this = $(this).clone().removeClass('thumbnail').addClass('tempImage');
	$.ajax({
	    type:'post',
	    data:JSON.stringify(dat),
	    contentType:'application/json',
	    url:'/recallGrid',
	    beforeSend:function(data){
		now = Date.now();
		$('#boxwrapper').empty().append($('<div class="loading"/>'));
		$('#savename').html('');
	    },
	    success:function(data){
		//console.log(data);

		var canvas = $('<canvas id="canvas" ></canvas>');
		$('#boxwrapper').empty().append(canvas);
		buildcg(data);
		cg.draw($('canvas')[0]);
		applyFieldsToPage(data);
		//console.log('load time: ');
		//console.log(Date.now() - now);
		//console.log(cg);

	    }
	});
    });



    $('#test').on('click' , function(){
	$.ajax({
	    type:'get',
	    data:'test',
	    contentType:'text',
	    url:'/test',
	    beforeSend:function(){
		//console.log('sending test...');
	    },
	    success:function(data){
		//console.log(data);
	    }
	});
    });

    $(document).on('click' , '.delete' , function(){
	var $this = $(this);
	var entryName = $this.parents('.recall').attr('name');
	var dat = {};
	dat.name = entryName;
	dat.user = $('.message').attr('name');
	$.ajax({
	    type:'post',
	    data:JSON.stringify(dat),
	    contentType:'application/json',
	    url:'/delete',
	    beforeSend:function(){
		//console.log('sending delete for '+ dat.name+'...');
		$this.parent().remove();
		$('#savename').val('');
	    },
	    success:function(data){
		//console.log('response:');
		if (data){
		    //console.log(data);
		}
	    }
	});
    });
    
    $(document).on('click','#update', function(){

	var $this = $(this);
	var entryName = $this.siblings('#gridName').html();
	//console.log(entryName);
	var user = $('.message').attr('name');
	$.ajax({
	    type:'post',
	    data:JSON.stringify(makeSimpleArray(entryName , cg,user)),
	    contentType:'application/json',
	    url:'/update',
	    beforeSend:function(){
		//console.log('sending update for: ' + entryName);
	    },
	    success:function(data){
		//console.log('successful update');
		//console.log(data);
//		applyFieldsToPage(data,g.squares);
		
		var s = saveCanvasAsImage($('canvas')[0]);
		//console.log('s: '+s);
		uploadThumb(s,entryName,user,true);
		$('#savedList li[name="'+entryName+'"]').children('.thumbnail').detach();
	    }
	});
    });

function buildGridList(gridsArray){
    //console.log(gridsArray);
    gridsArray.forEach(function(gridName){
	
	var nameOfDesign = gridName;
	var user = $('.message').attr('name');
	var listItem = buildListItem(nameOfDesign,user);

	$('#savedList').append(listItem);
//	$('#savedList').children('li').last().children('img').attr('src' , imageSRC);
    })    
}

    $('#can').click(function(){
	var canvas = $('canvas')[0];
	
	$('#thumb').children().detach();
	//$('#thumb').append($(canvas));
	//$('canvas').css('display','none');
	//var canvas =$('canvas')[0];
	var img    = canvas.toDataURL("image/png");
	//console.log(img);
	$('#thumb').append($('<img src="'+img+'"/>'));
	
    });

    
    
    $('.colorBox, #colorBack, #colorBorder').on('change keydown mouseup mousedown keyup click blur' ,  function(){
	var $this = $(this);
	var color = $this.val();
	$this.css('background' , color);
	if(color == 'black'){
	    $this.css('color' , 'white');
	}
	else{
	    $this.css('color' , 'black');
	}
	if(color.length == 6 && color.toLowerCase() != color && color[0] != '#'){
	    color = '#' + color;
	    $(this).val(color);
	}
    });

    $(document).on('click', 'canvas', function(e){
	var xy = getMousePos($(this)[0],e);
	xy.x = parseInt(xy.x);
	xy.y = parseInt(xy.y);
	while(xy.x%11 !=0 ){
	    xy.x -= 1;
	}
	while(xy.y%11 !=0 ){
	    xy.y -= 1;
	}
	xy.x +=1;
	xy.y +=1;
	var clickedSquare = returnClickedSquare(xy.x,xy.y);
	var canvas = $(this)[0].getContext('2d');

	//console.log(nabes(clickedSquare));

	var values = grabFieldValues();
//	changeSquare(clickedSquare , values.color1 , 1 , canvas);
	clickedSquare.change(values.color1 , 1, true);
	var randArray = randomArray(values.second,values.least2);
	//console.log('1st Array: '+randArray);
	var changedNeighbors =[];
	nabes(clickedSquare).forEach(function(neighbor,index){
		if(randArray[index] == 1){
		    if(neighbor.isBackground == true){
//			changeSquare(neighbor, values.color2, 2, canvas);
			neighbor.change(values.color2 , 2, true)
			changedNeighbors.push(neighbor);
		    }
		}
	});

	var changedNeighbors2 = []
	randArray = randomArray(values.third, values.least3);
	//console.log('2nd array '+randArray);
	changedNeighbors.forEach(function(neighbor,index){
	    nabes(neighbor).forEach(function(nabe, index){
		if(randArray[index] == 1){
		    if(nabe.isBackground == true){
//			changeSquare(nabe, values.color3 , 3 , canvas);
			nabe.change(values.color3 , 3, true);
			changedNeighbors2.push(nabe);
		    }
		}
	    });
	});

    });


    function returnClickedSquare(x,y){
	for(var i=0;i<=cg.squares.length;i++){
	    if( cg.squares[i].pos.x == x && cg.squares[i].pos.y == y){
		return cg.squares[i];
	    }
	}
    }

    function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	    x: evt.clientX - rect.left,
	    y: evt.clientY - rect.top
	};
    }
    $('.colorBox').each(function(){
	$(this).css('background-color' , $(this).val());
    });
    
    $('#savedList').on('click' , function(){
	$(this).css('z-index' , 1);
    });

    function randomHex(){
	var str = '01234567890abcdef';
	var num = "#";
	var random = function(){return Math.floor(Math.random() * 16);}
	while(num.length < 7){
	    num = num + str[random()];
	}
	return num
    }

    function fillWithRandomColors(){
	$('#colorBox input').each(function(){
	    $(this).val(randomHex());
	    $(this).trigger('click');
	    $('#size').val(600);

	});
	$('#fillCan').trigger('click');
    }
    
    $('#clear').on('click' , function(){
	fillWithRandomColors()

    });

    $('.adminShowGrids').on('click' , function(){
	var userName = $(this).parent().attr('name');
	$(this).next('.adminGridList').slideToggle();
	$(this).next('.adminGridList').children('li').each(function(index,grid){
	    var gridName = $(grid).attr('name');
	    if($(grid).children('img').length == 0){
		$(grid).append($('<img src="images/'+userName+'_'+gridName+'_th.png"></img>'));
	    }
	});
    });

    $('.adminUsername').on('keyup', function(){
	var $this = $(this);
	if(typeof adminInputTimer == 'number'){
	    window.clearTimeout(adminInputTimer);
	    delete adminInputTimer;
	}
	
	adminInputTimer = window.setTimeout(function(){
	    var dat ={};
	    dat.type = 'usernameUpdate';
	    dat.user = $this.parent().attr('name');
	    dat.newUser = $this.val();
	    $.ajax({
		type:'post',
		url:'/adminUpdate',
		contentType:'application/json',
		data:JSON.stringify(dat),
		beforeSend:function(){
		    //console.log('sending name update for ' + $this.attr('name'));
		},
		success:function(data){
		    //console.log(data);
		    $this.parent().attr('name' , dat.newUser);
		}
	    })
	},3000)
    })

    $('.adminDeleteUser').on('click',function(){
	var wait;
	if(typeof adminInputTimer == 'number'){
	    //window.clearTimeout(adminInputTimer);
	    //delete adminInputTimer;
	    wait = 3;
	}else{
	    wait = .1;
	}
	var $this = $(this);
	var user = $this.parent().attr('name');
	//console.log(user);
	window.setTimeout(function(){
	    if( confirm('are you sure you want to permanately delete user ' + user+'?') ){
		$.ajax({
		    type:'post',
		    url:'/adminUpdate',
		    contentType:'application/json',
		    data:JSON.stringify({'user':user,'type':'deleteUser'}),
		    beforeSend:function(){
			//console.log('sending delete for user '+user);
		    },
		    success:function(data){
			//console.log(data);
			$this.parent().remove();
		    }
		})
	    }
	} , wait );
    })

    $('.adminDeleteGrid').on('click' , function(){
	var $this = $(this);
	var user = $this.closest('.adminUser').attr('name');
	var gridName = $this.closest('.adminGrid').attr('name');
	
	//console.log(user + gridName);
	$.ajax({
	    type:'post',
	    url:'/delete',
	    contentType:'application/json',
	    data:JSON.stringify({'user':user, 'name' : gridName}),
	    success:function(data){
		//console.log(data);
		$this.closest('.adminGrid').remove();
	    }
	})
    });

});




var g;
var cg;
var nabes;
var partialFill;
var initialFill;
var testFill;
var makeSimpleArray;
var testArray;
var hat;
var randomArray;
var grabFieldValues;
var Grid;
var makeImage;
var img;
var uploadThumb;
var saveCanvasAsImage;
var fill;
var createCanvasFromArray;
var CanvasGrid;
var CanvasSquare;
var test;
 
var Square;
