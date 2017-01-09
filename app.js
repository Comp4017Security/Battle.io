var express = require('express');
var app = express();
var compression = require('compression');
var favicon = require('serve-favicon');

var port = 8080;


var oneMin = 60000;
var threeSec = 3000;

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(compression());
app.use(favicon(__dirname + '/favicon.ico'));
//app.use(express.static(__dirname + '/public/models', { maxAge: oneDay }));
app.use(express.static(__dirname + '/public', { maxAge: oneMin }));

//socket
var user_count = 0;
var spell_count = 0;
var players=[];
var pos=[];

//init environment
var treesPos = new Array();
var width = 1024;
var long = 1024;
function init_environment(){

// 'ancient_oak_tree', 'large_oak_tree','large_pine_tree', 'mid_oak_tree', 'mid_pine_tree','sapling_oak_tree', 'small_oak_tree', 'small_pine_tree'
var numofTree = new Array(2,2,2,2,2,2,2,2);

for (var i = 0; i < numofTree.length; i++) {
	var tmp = new Array();
	for (var j = 1; j <= numofTree[i]; j++) {
		var x = (Math.random()- 0.5) * (width-100);
		var z = (Math.random()- 0.5) * (long-100);
		tmp.push([x,z]);
	}
	treesPos.push(tmp);
}
//console.log("trees set :");
//console.log(treesPos);
}
init_environment();

function randomBorn(){
	var x = (Math.random()- 0.5) * (width-100);
	var z = (Math.random()- 0.5) * (long-100);
	return [x,z];
}

//當新的使用者連接進來的時候
io.on('connection', function(socket){
	//新user init:
	console.log("new connection !");
	socket.emit('init_environment',treesPos);

	
	socket.on('loading finished',function(msg){
		socket.emit('add others', players);
	});



	socket.on('add user',function(msg){

		socket.username = msg.name+"#"+user_count;
		user_count++;
		console.log("new user:"+msg.name+" logged.");
		io.emit('add user',{
			username: socket.username
		});



	socket.emit('add self', {name:socket.username,pos :randomBorn(),job : msg.job});
		
	});

	socket.on('self added',function(msg){
		console.log('player ' + msg.name + ' has created himself!');
		players.push(msg);
		socket.broadcast.emit('add this player',msg);
	});

	socket.on('releaseSpell',function(msg){
		//console.log('player ' + msg.name + ' releaseSpell!');
		spell_count++;
		msg.id = spell_count;
		io.emit('releaseSpell',msg);
	});
	
	socket.on('releaseSuperSpell',function(msg){
		io.emit('releaseSuperSpell',msg);
	});

	socket.on('show score',function(){
		socket.emit('show score', players.map(function(item) {return {score: item.score, name: item.name};}) );
	});

	socket.on('castSpell',function(msg){
		//console.log('player ' + msg.name + ' castSpell!');
		io.emit('castSpell',msg);
	});

	socket.on('i die',function(msg){
		console.log(msg +" kill "+ socket.username);
		players.forEach(function(item, index, object) {
  			if (msg != socket.username && item.name == msg) {
  			  item.score += 1;
  			  //console.log(item.name + ": " +item.score);
  			  //console.log(players);
 		 	}
 		 });
		//socket.emit('new pos',randomBorn());
		io.emit('show score', players.map(function(item) {return {score: item.score, name: item.name};}) );
		io.emit('player die',{killer: msg , name : socket.username});

		// io.emit('player left',{
		// 	name:socket.username
		// });
		//remove from list
		players.forEach(function(item, index, object) {
  			if (item.name == socket.username) {
  			  players.splice(index, 1);
  			  //console.log(players);
 		 	}
		});

	});

	socket.on('moved',function(msg){
		players.forEach(function(item, index, object) {
  			if (item.name == socket.username) {
  			 item.pos = msg.pos;
  			 item.rotHead = msg.rotHead;
  			 item.rot = msg.rot;
  			 item.shieldPos = msg.shieldPos;
  			 socket.broadcast.emit('moving',item);
 		 	}
		});
	});

	// setInterval(function(){
	// 	players.forEach(function(item, index, object) {
	// 		if(item.ml);
	// 		if(item.mr);
	// 		if(item.mb);
	// 		if(item.mf);
	// 	});
	// 	io.emit('playersInfo',players); 
	// },1000);


	//left
	socket.on('disconnect',function(){
		console.log(socket.username+" left.");
		io.emit('player left',{
			name:socket.username
		});
		players.forEach(function(item, index, object) {
  			if (item.name == socket.username) {
  			  players.splice(index, 1);
  			  //console.log(players);
 		 	}
		});
	});

});