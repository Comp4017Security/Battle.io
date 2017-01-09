//HUD created by ourselves
'use strict';

var HUD = function(renderer){

	var hud = this;

	var cameraHUD = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, 
		window.innerHeight/2, -window.innerHeight/2, 0, 30 );
	var sceneHUD = new THREE.Scene();
	//sceneHUD.fog = new THREE.FogExp2( 0xaaccff, 0.5 );

	var healthHudBitmap, manaHudBitmap, leaderboardBitmap;
	var healthHudTexture, manaHudTexture, leaderboardTexture;
	var healthBar, manaBar, leaderboard;
	var statusBarWidth = 512, statusBarHeight = 128;
	var leaderboardWidth = 1024, leaderboardHeight = 512;

	var radar;
	var radMyself;
	var loadTexture = function(){

		var loader = new THREE.TextureLoader();

		loader.load(
			// resource URL
			'../../textures/crosshair.png',
			// Function when resource is loaded
			function ( texture ) {
				var material = new THREE.MeshBasicMaterial({map : texture, transparent: true});
				var crosshair = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), material);
				sceneHUD.add( crosshair );
				//initHUD();
			});

		loader.load(
			// resource URL
			'../../textures/radar.png',
			// Function when resource is loaded
			function ( texture ) {
				var material = new THREE.MeshBasicMaterial({map : texture, transparent: true, opacity: 0.7});
				radar = new THREE.Group();
				radMyself = new THREE.Mesh(new THREE.PlaneGeometry(256, 256), material);
				radMyself.position.x = -window.innerWidth/2 + 128;
				radMyself.position.y = window.innerHeight/2 - 128;
				sceneHUD.add( radMyself );
				radMyself.add( radar );
				initHUD();
		});
	};


	var initHUD = function(){

		//create custom textures
		//canvas for hud texture
		var healthHudCanvas = document.createElement('canvas');
		healthHudCanvas.width = statusBarWidth;
		healthHudCanvas.height = statusBarHeight;

		var manaHudCanvas = document.createElement('canvas');
		manaHudCanvas.width = statusBarWidth;
		manaHudCanvas.height = statusBarHeight;

		var leaderboardCanvas = document.createElement('canvas');
		leaderboardCanvas.width = leaderboardWidth;
		leaderboardCanvas.height = leaderboardHeight;

		//edit canvas content
		healthHudBitmap = healthHudCanvas.getContext('2d');
		healthHudBitmap.font = "Normal 40px Arcade";
		healthHudBitmap.textAlign = 'center';
		healthHudBitmap.fillStyle = "rgba(245,245,245,0.75)";
		healthHudBitmap.fillText('Initializing...', statusBarWidth/2, statusBarHeight/2);

		manaHudBitmap = manaHudCanvas.getContext('2d');
		manaHudBitmap.font = "Normal 40px Arcade";
		manaHudBitmap.textAlign = 'center';
		manaHudBitmap.fillStyle = "rgba(245,245,245,0.75)";
		manaHudBitmap.fillText('Initializing...', statusBarWidth/2, statusBarHeight/2);

		leaderboardBitmap = leaderboardCanvas.getContext('2d');
		leaderboardBitmap.font = "Normal 40px Arcade";
		leaderboardBitmap.textAlign = 'center';
		leaderboardBitmap.fillStyle = "rgba(245,245,245,0.75)";
		leaderboardBitmap.fillText('Initializing...', leaderboardWidth/2, leaderboardHeight/2);

		// Create texture from rendered graphics.
		healthHudTexture = new THREE.Texture(healthHudCanvas) 
		healthHudTexture.needsUpdate = true;

		manaHudTexture = new THREE.Texture(manaHudCanvas) 
		manaHudTexture.needsUpdate = true;

		leaderboardTexture = new THREE.Texture(leaderboardCanvas) 
		leaderboardTexture.needsUpdate = true;

		// Create HUD material.
		var healthBarMaterial = new THREE.MeshBasicMaterial( {map: healthHudTexture, transparent: true, opacity: 0.9} );
		var manaBarMaterial = new THREE.MeshBasicMaterial( {map: manaHudTexture, transparent: true, opacity: 0.9} );
		var leaderboardMaterial = new THREE.MeshBasicMaterial( {map: leaderboardTexture, transparent: true, opacity: 0.9} );

		// Create plane to render the HUD
		var healthBarGeometry = new THREE.PlaneGeometry( statusBarWidth, statusBarHeight );
		healthBar = new THREE.Mesh( healthBarGeometry, healthBarMaterial );
		healthBar.position.x = window.innerWidth/2 - statusBarWidth/2 - 20;
		healthBar.position.y = -window.innerHeight/2 + statusBarHeight/2 + 20;
		sceneHUD.add( healthBar );

		var manaBarGeometry = new THREE.PlaneGeometry( statusBarWidth, statusBarHeight );
		manaBar = new THREE.Mesh( manaBarGeometry, manaBarMaterial );
		manaBar.position.x = window.innerWidth/2 - statusBarWidth/2 - 20;
		manaBar.position.y = -window.innerHeight/2 + statusBarHeight/2 - 30;
		sceneHUD.add( manaBar );

		var leaderboardGeometry = new THREE.PlaneGeometry( leaderboardWidth, leaderboardHeight );
		leaderboard = new THREE.Mesh( leaderboardGeometry, leaderboardMaterial );
		//leaderboard.position.x = window.innerWidth/2;
		leaderboard.position.y = window.innerHeight/2 - 100;
		//sceneHUD.add( leaderboard );



	};

	//////////////////////////
	//tab key for scoreboard//
	//////////////////////////
	var tabPressed = false;
	var onTabDown = function( event ){
		if(event.keyCode == 9){
			event.preventDefault();
			if (tabPressed == false) {
				tabPressed = true;
				sceneHUD.add(leaderboard);
				//log('log test')
			}
		}
	};
	var onTabUp = function( event ){
		if (event.keyCode == 9) {
			event.preventDefault();
			tabPressed = false;
			sceneHUD.remove(leaderboard);
		}
	};
	document.addEventListener( 'keydown', onTabDown, false );
	document.addEventListener( 'keyup', onTabUp, false );

	//////////////////
	//message logger//
	//////////////////
	var logWidth = 512, logHeight = 256;
	var loggers = new Array();
	var startY = window.innerHeight/2 - 138;
	var endY = window.innerHeight/2 - 58;
	var interpolatePos = function(u){
		if (u > 1)
			u = 1;
		if (u< 0)
			u = 0;
		//return Math.sinh(5*u-2.5)*(endY-startY)/6 + startY;
		//console.log((Math.sinh(5*u-2.5)/6).toFixed(1)*(endY-startY));
		return (Math.sinh(5*u-2.5)/6).toFixed(1)*(endY-startY) + startY;
	};
	var interpolateSize = function(u){
		if (u > 1)
			u = 1;
		if (u< 0)
			u = 0;
		if(u <=0.5 ){
			//return 1.3-Math.cosh(5*u-2.5)/12;
			//console.log((1.3-Math.cosh(5*u-2.5)/12).toFixed(2));
			return (1.3-Math.cosh(5*u-2.5)/12).toFixed(2);
		}
		else{
			//return 1.2166667;
			return 1.22;
		}
	};
	var interpolateOpacity = function(u){
		if (u > 1)
			u = 1;
		if (u< 0)
			u = 0;
		//return 1-Math.cosh(5*u-2.5)/6;
		return (1-Math.cosh(5*u-2.5)/6).toFixed(2);
	};
	var log = function(msg,color){
		var logCanvas = document.createElement('canvas');
		logCanvas.width = logWidth;
		logCanvas.height = logHeight;

		var logBitmap = logCanvas.getContext('2d');
		logBitmap.font = "Normal 40px Arcade";
		logBitmap.textAlign = 'center';
		switch(color){
			case 'red':
			logBitmap.fillStyle = "rgba(245,0,0,0.75)";
			break;
			case 'blue':
			logBitmap.fillStyle = "rgba(0,0,245,0.75)";
			break;
			default:
			logBitmap.fillStyle = "rgba(245,245,245,0.75)";
		}
		logBitmap.fillText(msg, logWidth/2, logHeight/2);

		var logTexture = new THREE.Texture(logCanvas);
		logTexture.needsUpdate = true;

		// Create log material.
		var logMaterial = new THREE.MeshBasicMaterial( {map: logTexture, transparent: true, opacity: 0.9} );

		// Create plane to render the log
		var logGeometry = new THREE.PlaneGeometry( logWidth, logHeight );
		var logger = new THREE.Mesh( logGeometry, logMaterial );
		logger.curStep = 0;

		loggers.push( logger );
		sceneHUD.add( logger );
	};
	this.log = function(msg,color,player){
		log(msg,color);
		radar.remove(radar.getObjectByName(player));
	}

	//show score board
	var score = [];
	this.updateScore = function(data){
		score = data;
		score.forEach(function(item,index,object){
        	console.log(item.name + ": " + item.score);
        });
	}

	//////////////////
	//initialization//
	//////////////////
	this.init = function(){

		//load picture textures
		loadTexture();
		//initHUD();
	};

	this.render = function(players, myinfo){
		//Update HUD graphics.

		healthHudBitmap.clearRect(0, 0, statusBarWidth, statusBarHeight);
		// healthHudBitmap.fillText("x:" + myinfo.pos.x.toFixed(1) + 
		// 	"y:" + myinfo.pos.y.toFixed(1) + 
		// 	"z:" + myinfo.pos.z.toFixed(1), statusBarWidth / 2, statusBarHeight / 2);
		healthHudBitmap.fillText(" Power : " + ((cooldown/cooldownTime)*100).toFixed(0) +"%", statusBarWidth / 2, statusBarHeight / 2);
		healthHudTexture.needsUpdate = true;

		manaHudBitmap.clearRect(0, 0, statusBarWidth, statusBarHeight);
		// manaHudBitmap.fillText("x:" +  controls.getDirection().x.toFixed(1) + 
		// 	"y:" + controls.getDirection().y.toFixed(1) +
		// 	"z:" + controls.getDirection().z.toFixed(1), 256 / 2, 128 / 2);
		manaHudBitmap.fillText("hp: " + (myinfo.hp<0?0:myinfo.hp), statusBarWidth / 2, statusBarHeight / 2 );
		manaHudTexture.needsUpdate = true;
		//console.log(controls.getDirection());

		if(tabPressed){
			leaderboardBitmap.clearRect(0, 0, leaderboardWidth, leaderboardHeight);
			score.forEach(function(item,index,object){
				
				if(item.name == myinfo.name){
					leaderboardBitmap.fillText("[ " + item.name + ":      " + item.score + " ]",
						leaderboardWidth / 2, leaderboardHeight / 2 + index*40 );
				}else{
					leaderboardBitmap.fillText(item.name + ":      " + item.score,
						leaderboardWidth / 2, leaderboardHeight / 2 + index*40 );
				}
			});
			leaderboardTexture.needsUpdate = true;
		}

		loggers.forEach(function(item,index,object){
			//item.position.y += 0.7;
			if(item.curStep <= 1){
				item.curStep += 0.004;
				item.position.y = interpolatePos(item.curStep);
				var i = interpolateSize(item.curStep);
				item.scale.set(i,i,i);
				var j = interpolateOpacity(item.curStep);
				item.material.opacity = j;
			}else{
				sceneHUD.remove(item);
				loggers.splice(index, 1);
			}
		});

		//update radar
		radar.rotation.z = -myinfo.rot.y;
		players.forEach(function(item,index,object){
			item.radPos = item.position.clone().sub(myinfo.pos).multiplyScalar(0.2);
			item.radPos.y = -item.radPos.z;
			item.radPos.z = 0;
			if(item.radPos.length() <= 116){
				if(!item.radDot){
					item.radDot = new THREE.Mesh(new THREE.PlaneGeometry(10,10), 
						new THREE.MeshBasicMaterial({transparent: true, opacity:0.7}));
					item.radDot.name = item.name;
					//radDot.rotation.z = -myinfo.rot.y;
				}
				if(!item.radPos.parent){
					radar.add(item.radDot);
				}
				item.radDot.position.copy(item.radPos);
				item.radDot.rotation.z = item.rotation.y;
			}else{
				radar.remove(item.radDot);
			}
		});

		renderer.render(sceneHUD, cameraHUD);
	};

	this.resize = function(width, height){

		cameraHUD.left = -width/2;
		cameraHUD.right = width/2;
		cameraHUD.top = height/2;
		cameraHUD.bottom = -height/2;
		cameraHUD.updateProjectionMatrix();
		healthBar.position.x = -width/2 + statusBarWidth/2 + 20;
		manaBar.position.x = width/2 -statusBarWidth/2 -20;
		healthBar.position.y = manaBar.position.y = -height/2 + statusBarHeight/2 - 30;

		radMyself.position.x = -width/2 + 128;
		radMyself.position.y = height/2 - 128;
	};
};