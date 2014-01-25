$(document).ready(function(){

    function getRand(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    Grid = function(side,id,border,background){
	var s = parseInt(side);
	while(s%12 !=0){
	    s+=1;
	}
	this.side = s;
	this.squares = [];
	this.probs = [];
	this.colors = []
	this.border = border;
	this.background = background;
	this.build = function(squares){
	    var $box = $('<div id='+id+' style="width:'+this.side+'px; height:'+this.side+'px"></div>');
	    $('#boxwrapper').empty().append($box);
	    var sqPerSide = this.side / 12;
	    console.log('sqperSide' + sqPerSide);
	    if (arguments.length == 0){
		var sqIndex = 0;
		for(var i=0;i<Math.pow(sqPerSide,2);i++){
		    var square = new Square(this, 'white', 10, i);
		    this.squares.push(square);
		    $box.append(square.make());
		    sqIndex += 1;
		}
	    }
	}
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
  
    CanvasGrid = function(side,id,border,background){
	Grid.call(this,side,id,border,background);

	this.build = function(){
	    
	    var sqPerSide = this.side / 12;
	    for(var i=0;i<Math.pow(sqPerSide,2);i++){
		var square = new CanvasSquare(this,'white',10,i);
		this.squares.push(square);
	    }
	}
	this.draw =function(canvas){
	    var $canvas = $('<canvas id="cantester"></canvas>');	    
	    $('#boxwrapper').empty().append($canvas);
	    var canvas = $canvas[0];
	    canvas.height = this.side;
	    canvas.width = this.side;
	    console.log('drawing...');
	    if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = this.border;
		ctx.fillRect(0,0,this.side,this.side);
		var squaresPerSide = this.side / 12;
		var colorCount = 0
		var now = Date.now();
		for(i=1;i<=squaresPerSide*12;i+=12){
		    for(j=1;j<squaresPerSide*12;j+=12){
			ctx.fillStyle = this.squares[colorCount].color;
			ctx.fillRect(j,i,10,10);
			this.squares[colorCount].pos.x=j;
			this.squares[colorCount].pos.y=i;
			colorCount +=1;
			if(colorCount == this.squares.length){
			    console.log('build time: ');
			    console.log(Date.now()-now);
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
    CanvasGrid.prototype = Object.create(Grid.prototype);

    function Square(grid,color, width, index){
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
	    var tilesPerSide = this.grid.side/12;
	    var indx = this.index;
//	    console.log('tilesperside ' + tilesPerSide);
//	    console.log('index' + indx);
//	    console.log(indx % tilesPerSide + 1);
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
	    return this.grid.squares[this.index-this.grid.side/12];
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
	    return this.grid.squares[this.index + this.grid.side/12];
	}
	this.ul = function(){
	    if (this.edge().indexOf('left') == -1){
		return this.grid.squares[this.index-this.grid.side/12-1];
	    }
	}
	this.ur = function(){
	    if (this.edge().indexOf('right') == -1){	    
		return this.grid.squares[this.index-this.grid.side/12+1];
		}
	}
	this.bl = function(){
	    if (this.edge().indexOf('left') == -1){
		return this.grid.squares[this.index + this.grid.side/12-1];
	    }
	}
	this.br = function(){
	    if (this.edge().indexOf('right') == -1){
		return this.grid.squares[this.index + this.grid.side/12+1];
	    }
	}
	this.nabes = [this.above, this.right, this.left, this.below, this.ul, this.ur, this.bl, this.br ]
    }
    
    CanvasSquare = function(grid,color,width,index){
	Square.call(this,grid,color,width,index);
	this.change = function(color){
	    this.color = color;
	    this.isBackground = false;
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
	    fill(g,grabFieldValues());
	}
    });

    $('.colorBox').bind('keypress' , function(e){
	if(e.which != 13){
	    return;
	}
	var colors =[ $('#color1').val(), $('#color2').val(), $('#color3').val()]
	console.log(colors);
	
	if(color1 == '' && color2 == '' && color3 == ''){
	    return;
	}

	if(e.which == 13){
	    g.squares.forEach(function(square){
		for(var i=0 ; i<=2 ; i++){
		    if(square.iteration - 1 == i && colors[i] != ''){
			square.change(colors[i]);
			
		    }
		}
	    });
	    g.colors = colors;
	}
    });

    $('#colorBack').bind('keypress', function(e){
	if(e.keyCode == 13){
	    g.changeBackground($('#colorBack').val());
	}
    });

    $('#colorBorder').bind('keypress', function(e){
	if(e.which == 13){
	    g.changeBorder($('#colorBorder').val());
	}
    });

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
		if (value >=1 || value <= 0){
		    if(value >=1){
			value = 1;
		    }
		    else if (value <= 0){
			value = 0;
		    }
		    flashRed($this);
		}
		value = value.toFixed(2);
		value = value.toString();
		$this.val(value);
	   	
		fill(g,grabFieldValues());
	    }
	}    
    });
    
    function flashRed($element){
	$element.css('background-color', 'red');
	var timeoutID =  window.setTimeout(function(){ $element.css('background-color','white');} , 500 );
    }
    
    function buildEditableFromFields(){
	var values = grabFieldValues();
	g = new Grid(values.size, 'tester', values.colorBorder, values.colorBack);
	g.build();
	fill(g,grabFieldValues());
	$('#test').html('editable');
    }

    function buildCanvasFromFields(){
	//$('#boxwrapper').empty();
	var values = grabFieldValues();
	cg = new CanvasGrid(values.size, 'cantester' , values.colorBorder, values.colorBack);
	cg.build();
	fill(cg, values);
	cg.draw($('#cantester')[0]);
	$('#test').html('canvas');
    }

    function swap(){
	if ($('#boxwrapper').children('canvas').length >= 1 || $('#boxwrapper').children('img').length>=1){
	    console.log('swap1');
	    var array = makeSimpleArray('swap', cg);
	    createGridFromArray(array, g);
	    $('#test').html('editable');
	}else{
	    console.log('swap2');
	    buildcg(makeSimpleArray('swap',g));
	    cg.draw($('canvas')[0]);
	    $('#test').html('canvas');
	}
    }
    

    $('#fill').on('click', function (){
	buildEditableFromFields();
    });
    
    $('#fillCan').on('click',function(){
	buildCanvasFromFields();
    });

    $('#swap').on('click',function(){
	swap();
    });

    fill = function (grid,values){
//	grid.clear();

	grid.colors = [values.color1,values.color2,values.color3]
	grid.probs = [values.initial, values.second, values.third]

	partialFill(partialFill(initialFill(grid.squares,values.color1, values.initial, values.colorBack), values.color2, values.second, 2, values.least2), values.color3, values.third, 3, values.least3);

	
	if (values.colorBorder == 'self'){
	    for(i=0;i<g.squares.length;i++){
		var color = $('#'+i).css('background-color'); 
		$('#'+i).css('border', 'solid 1px '+color);
	    }
	}else{
	   // $('.square').css('border', 'solid 1px '+colorBorder);
//	    console.log(values.colorBorder);
	    grid.changeBorder(values.colorBorder);
	}
	
    }

    initialFill = function(squares, color, prob, background){
	var changedArray = [];
	squares.forEach(function(square){
	    if ( Math.random() < prob ){
		square.change(color);
		square.iteration = 1;
		changedArray.push(square);
	    }
	    else{
		square.change(background);
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
	    randArray = testRandom(prob,least);
	    nabes(square).forEach(function(neighbor,index){
		if(randArray[index] == 1){
		    if(neighbor.isBackground == true){
			neighbor.change(color);
			neighbor.iteration = iteration;
			changedArray.push(neighbor);
		    }
		}
	    });
	});
	 return changedArray;
    }
    
    function testRandom(prob, least){
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
	return _.shuffle(aray);
    }
    
    $('#rebuild').on('click', function(){
	var newSide = parseInt( $('#size').val() );
	console.log(newSide);
	if (newSide == '' || isNaN(newSide)){
	    flashRed($('#size'));
	}
	else if(newSide != '' && !isNaN(newSide)){
	    newSide = parseInt(newSide);
	    $('#tester').detach();
	    g = new Grid(newSide, 'tester','white','white');
	    g.build();
	    fill(g,grabFieldValues());
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
    
    $(document).on('click', '.square', function(){
	var values = grabFieldValues();

	console.log(values);
	var indx = $(this).attr('id');
	
	g.squares[indx].change(values.color1);
	var randArray = testRandom(values.second,values.least2);
	console.log('1st Array: '+randArray);
	var changedNeighbors =[];
	nabes(g.squares[indx]).forEach(function(neighbor,index){
		if(randArray[index] == 1){
		    if(neighbor.isBackground == true){
			neighbor.change(values.color2);
			neighbor.iteration = 2;
			changedNeighbors.push(neighbor);
		    }
		}
	});

	var changedNeighbors2 = []
	randArray = testRandom(values.third, values.least3);
	console.log('2nd array '+randArray);
	changedNeighbors.forEach(function(neighbor,index){
   
	    nabes(neighbor).forEach(function(nabe, index){

		if(randArray[index] == 1){
		    if(nabe.isBackground == true){
			nabe.change(values.color3);
			nabe.iteration = 3;
			changedNeighbors2.push(nabe);
		    }
		}
	    });
	});
    
    });

    $('#clear').on('click', function(){
	g.clear();
    });

	

	
///////////////////////////////////////////////////////////////////////////////////////

    makeSimpleArray = function(nameOfDesign, grid){
	var simple = {'name': nameOfDesign,
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
    
    createGridFromArray = function(simpleArray){
	//builds grid on page from database saved grid
	$('#drawing').removeClass('hidden');
	var s = simpleArray;
	console.log('s: '+s);
	g = new Grid(s.side , 'tester' , s.border , s.background);
	g.build();
	var len = g.squares.length-1;
	console.log(simpleArray);
	for(var i=0;i<=len;i++){
	    g.squares[i].change(simpleArray.squares[i][0]);
	    g.squares[i].iteration = simpleArray['squares'][i][1];
	    g.squares[i].isBackground = simpleArray['squares'][i][2];
	}
				

	g.changeBackground(simpleArray['background'])
	g.changeBorder(simpleArray['border']);
	g.colors = simpleArray['colors'];
	g.probs = simpleArray['probs'];
	
	$('#drawing').addClass('hidden');
    }
    
    createCanvasFromArray = function(simpleArray, canvas){
	canvas.height = simpleArray.side+12;
	canvas.width = simpleArray.side+12;
	if (canvas.getContext) {
	    var ctx = canvas.getContext('2d');
//	    ctx.fillStyle = simpleArray.background;
//	    ctx.fillRect(0,0,simpleArray.side+12,simpleArray.side+12);
	    var squaresPerSide = simpleArray.side / 12;
	    console.log('squaresPerSide: '+squaresPerSide);
	    var colorCount = 0
	    for(i=0;i<=squaresPerSide*11;i+=11){
		for(j=0;j<squaresPerSide*12-12;j+=12){
		    ctx.fillStyle = simpleArray.squares[colorCount][0];
		    ctx.fillRect(j,i,10,10);
		    colorCount +=1;
		}
	    }
	    console.log('colorCount: ' + colorCount);
//	    console.log('simpleArray.squares.length: '+simpleArray.squares.length);
	
	}
	
    }

    function buildcg(simpleArray){
	var s = simpleArray;
	cg = new CanvasGrid(s.side, 'cantester', s.border, s.background);
	cg.build();
	cg.name = s.name;
	cg.colors = s.colors;
	cg.probs = s.probs;
	console.log(simpleArray);
//	cg.squares = s.squares.slice(0);
	//fill(cg, grabFieldValues());	
	var len = cg.squares.length-1;
	console.log(simpleArray);
	for(var i=0;i<=len;i++){
	    cg.squares[i].change(s.squares[i][0]);
	    cg.squares[i].iteration = s.squares[i][1];
	    cg.squares[i].isBackground = s.squares[i][2];
	}

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
    }
    
    function buildListItem(name){
	return $('<li class="recall" name="'+name+'"><img src="images/'+name+'.png" class="thumbnail"/><p>'+name+'</p><button class="delete">delete</button></li>');
    }

////////////////////////////////////////////////////////////////CANVAS
    
    makeCanvas = function(){
	html2canvas(document.getElementById('boxwrapper'), {
	    onrendered:function(canvas){
		$('#thumb').children().detach();
		$('#thumb').append($(canvas));
		$('canvas').css('display','none');
	    }
	});
    }

    saveCanvasAsImage = function(canvas){
	var can = canvas.toDataURL('image/png');
	console.log(can);
	return can;
    }
    
    uploadThumb = function(img, name){
	var dat = {'name':name, 'img':img};
	console.log(dat);
	$.ajax({
	    type:'post',
	    data:JSON.stringify(dat),
	    contentType:'application/json',
	    url:'/saveimg',
	    success:function(){
		console.log('success uploading img to '+ dat.name);
	    }
	});
    }
    

//A!!!!!!!!!!!J!!!!!!!!!!!!A!!!!!!!!!!!!!!!!!!X!!!!!!!!!!!!!!!!!!!AJAX
    
    $('#save').click(function(e){
	var imageSRC = saveCanvasAsImage($('canvas')[0]);
	var nameOfDesign = $('#savename').val();

	$('.recall').each(function(){
	    if(nameOfDesign == $(this).attr('name')){
		nameOfDesign += '1';
	    }
	});

	if (nameOfDesign == ''){
	    alert('name your work then press save');
	    return
	}
	if ($('canvas').length >=1){
	    var grid = cg;
	}else{
	    var grid = g;
	    makeCanvas();
	}
      	testArray = makeSimpleArray(nameOfDesign, grid);

 	$.ajax({
	    type: 'POST',
	    data: JSON.stringify(testArray),
	    contentType: 'application/json',
            url: '/save',
            success: function(data) {

		$('#savename').val('');
		$('#gridName').html(nameOfDesign);
		
		var listItem = buildListItem(nameOfDesign);
		uploadThumb(imageSRC,nameOfDesign);
		$('#savedlist').append(listItem);
		$('#savedlist').children('li').last().children('img').attr('src' , imageSRC);
		
            }
        });
    });

    $(document).on('click', '.thumbnail', function(){
	var entryName = $(this).parents('.recall').attr('name');
	var now;
	var dat = {};
	dat.name = entryName;
	var $this = $(this).clone().removeClass('thumbnail').addClass('tempImage');
	$.ajax({
	    type:'post',
	    data:JSON.stringify(dat),
	    contentType:'application/json',
	    url:'/saves',
	    beforeSend:function(data){
		//console.log(data);
		now = Date.now();
		//$('#boxwrapper').empty().append($('<div id="loading">loading...</div>'));
		$('#boxwrapper').empty().append($this);
	    },
	    success:function(data){
		console.log(data[0]);
		var canvas = $('<canvas id="canvas" ></canvas>');
	//	$('#boxwrapper').empty().append(canvas);
		buildcg(data[0]);
	//	cg.draw($('canvas')[0]);
		applyFieldsToPage(data[0]);
		console.log('load time: ');
		console.log(Date.now() - now);
		//canvas.append($this);
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
		console.log('sending test...');
	    },
	    success:function(data){
		console.log(data);
	    }
	});
    });

    $(document).on('click' , '.delete' , function(){
	var $this = $(this);
	var entryName = $this.parents('.recall').attr('name');
	var dat = {};
	dat.name = entryName;
	$.ajax({
	    type:'post',
	    data:JSON.stringify(dat),
	    contentType:'application/json',
	    url:'/delete',
	    beforeSend:function(){
		console.log('sending delete for '+ dat.name+'...');
	    },
	    success:function(data){
		console.log('response:');
		console.log(data);
		if (data == 1){
		    $this.parent().remove();
		    $('#savename').val('');
		}
	    }
	});
    });
    
    $(document).on('click','#update', function(){
	makeCanvas();
	var $this = $(this);
	var entryName = $this.siblings('#gridName').html();
	console.log(entryName);
	console.log(g.colors);
	
	$.ajax({
	    type:'post',
	    data:JSON.stringify(makeSimpleArray(entryName, g)),
	    contentType:'application/json',
	    url:'/update',
	    beforeSend:function(){
		console.log('sending update for: ' + entryName);
	    },
	    success:function(data){
		console.log('successful update');
		console.log(data);
//		applyFieldsToPage(data,g.squares);
		
		var s = saveCanvasAsImage($('canvas')[0]);
		console.log('s: '+s);
		uploadThumb(s,entryName);
		$('#savedlist li[name="'+entryName+'"]').children('.thumbnail').detach();
		console.log($('#savedlist li').last().children('.thumbnail').length);
		$('#savedlist li[name="'+entryName+'"]').prepend($('<img src="'+s+'"/>').addClass('thumbnail'));
	    }
	});
    });
    

    $('#can').click(function(){
	 html2canvas(document.getElementById('boxwrapper'), {

	    onrendered: function(canvas) {
		
		$('#thumb').children().detach();
		$('#thumb').append($(canvas));
		$('canvas').css('display','none');
		var canvas =$('canvas')[0];
		var img    = canvas.toDataURL("image/png");
		$('#thumb').append($('<img src="'+img+'"/>'));

	    }

	 });
    });
    
    	    
//on initial page load, gets last grid posted to database and prints to screen, if none exists, draws one from default values
/*    $.ajax({
	type:'post',
	data:JSON.stringify({'name':$('.recall').last().attr('name')}),
	contentType:'application/json',
	url:'/getlast',
	beforeSend:function(data){
	    console.log('post for /getlast from ' +$('.recall').last().attr('name') );
	},
	success:function(data){
            console.log('success retreving '+$('.recall').last().attr('name'));
            console.log('data[0]'+data[0]);
/*	    if(data[0] != undefined){
		var squares  = data[0];
		test = squares;
		//next three lines build editable dom grid
		//g = new Grid(squares.side, 'tester', squares.border, squares.background);
		//g.build();
		//createGridFromArray(squares , g);
		var canvas = $('<canvas id="canvas"/>');
		$('#boxwrapper').append(canvas);
		createCanvasFromArray(squares, canvas[0]);
//		console.log(squares.side+ ' ' +  squares.border +'  '+ squares.background);
		g = new Grid(squares.side, 'tester', squares.border, squares.background);
		
		applyFieldsToPage(squares, g.squares);

	    }else{

		var values = grabFieldValues();
		g = new Grid(200,'tester',values.colorBorder,values.colorBack);
		g.build();
		fill(g,values);
//	    }	    
	}
    });
*/
    $('.colorBox, #colorBack, #colorBorder').on('keyup , blur, change' , function(){
	var $this = $(this);
	var color = $this.val();
	$this.css('background' , color);
	if(color == 'black'){
	    $this.css('color' , 'white');
	}
	else{
	    $this.css('color' , 'black');
	}
	if(color.length == 6 && color.toLowerCase() != color){
	    color = '#' + color;
	    $(this).val(color);
	}
    });

    $(document).on('click', 'canvas', function(e){
	var xy = getMousePos($(this)[0],e);

	while(xy.x%12 !=0 ){
	    xy.x -= 1;
	}
	while(xy.y%12 !=0 ){
	    xy.y -= 1;
	}
	xy.x +=1;
	xy.y +=1;
	var clickedSquare = returnClickedSquare(xy.x,xy.y);
	console.log(clickedSquare);

	
	var canvas = $(this)[0].getContext('2d');

	console.log(nabes(clickedSquare));
//	nabes(clickedSquare).forEach(function(square){
//	    changeSquare(square, 'red' , 2 , canvas);
//	});

	var values = grabFieldValues();
	changeSquare(clickedSquare , values.color1 , 1 , canvas);
	
	var randArray = testRandom(values.second,values.least2);
	console.log('1st Array: '+randArray);
	var changedNeighbors =[];
	nabes(clickedSquare).forEach(function(neighbor,index){
		if(randArray[index] == 1){
		    if(neighbor.isBackground == true){
			changeSquare(neighbor, values.color2, 2, canvas);
			changedNeighbors.push(neighbor);
		    }
		}
	});

	var changedNeighbors2 = []
	randArray = testRandom(values.third, values.least3);
	console.log('2nd array '+randArray);
	changedNeighbors.forEach(function(neighbor,index){
	    nabes(neighbor).forEach(function(nabe, index){
		if(randArray[index] == 1){
		    if(nabe.isBackground == true){
			changeSquare(nabe, values.color3 , 3 , canvas);
			changedNeighbors2.push(nabe);
		    }
		}
	    });
	});

    });
    
    function changeSquare(square , newColor, iteration, canvas){
	square.change(newColor);
	square.iteration = iteration;
	canvas.fillStyle = newColor;
	canvas.fillRect(square.pos.x,square.pos.y, 10 , 10);
    }

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
var testRandom;
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
