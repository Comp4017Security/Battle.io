(function(){
	console.clear();
  
  /**
    * THREE.js Object for having spheres of sound
    * Assumes the audio given to it is browser tested
    * 	i.e. the right filetype provided
    *
    * 	ARGUMENTS:
    *
    * 	options ( Object )
    *	 KEYS:
    *
    *	*	options.reciever (THREE.Object3D)
    *			the object that will detect the sound
    *
    *	*	options.source (THREE.Object3D)
    *			the object that will emit the sound
    *
    *	*	options.radius (Number)
    *		The sound radius. Default is 50.
    *
    *	*	options.url (String)
    *			Path to an audio file to load.
    *
    *	*	options.sound (HTMLAudioElement)
    *			An already-loaded audio file.
  **/
  
  THREE.Audio3D = function (options) {

    THREE.Object3D.call( this );
    
    if (!options) return this;
    
    this.reciever = options.reciever;
    this.soundRadius = options.radius || 50;
    this.onload = options.onload || new Function();
    this.loaded = false;
    
    if (options.url !== undefined) {
      // immediately beging to load if a sound path is attached
      if (typeof options.url === "string") this.load(options.url, this.onload);
      
      // if an audio element is passed in, assume it has been loaded already
      if ((options.sound || {}).toString() === "[object HTMLAudioElement]") this.init( options.sound );
    } 
    
    // attach to an object
    if (options.source) source.add( this );
    
    return this;
  };
	
  
  THREE.Audio3D.prototype = Object.create( THREE.Object3D.prototype );
  
  //Since THREE.js doesn't dispatch any events for matrix updates,
  //I hooked the THREE.Audio3D.update() method into the THREE.Object3D matrixUpdate()
  THREE.Audio3D.prototype.__updateMatrix = THREE.Audio3D.prototype.updateMatrix;
  THREE.Audio3D.prototype.updateMatrix = function(){
    this.update();
    this.__updateMatrix();
  };
  
  
  // The method used to calculate the distance between two objects.
  THREE.Audio3D.prototype.distanceTo = function(reciever, parent) {
    
    if (!reciever || !reciever.position || !parent || !parent.position) return 0;
    
    var p1 = reciever.position,
        p2 = parent.position;
    
    this.position = p1;
    return p1.distanceTo( p2 );
    
  };
  
  
  // Calculates the volume level.
  // Is called after the 'parent', or 'reciever', object's matrix is updated
  THREE.Audio3D.prototype.update = function(){
    
    if (!this.loaded || this.parent === undefined) return;

    var modifier = Math.abs( this.distanceTo(this.reciever, this.parent) );
    var radius = this.soundRadius;
    if ( modifier > radius){
      this.sound.volume = 0;
      return;
    }

    // keep volume within the range of 0 and 1
    this.sound.volume =  Math.min(1,Math.max(0,  1 - (modifier / radius) )); 
  };
  
  
  // Extension of the audio element's 'play' method
  THREE.Audio3D.prototype.play = function(){
    if (!this.loaded) return;
    this.update();
    this.sound.play();
  };
  
  
  // Extension of the audio element's 'pause' method
  THREE.Audio3D.prototype.pause = function(){
    if (!this.loaded) return;
    this.sound.pause();
  };
  

  
	// Initializes a loaded sound file. should be an HTMLAudioElement
  THREE.Audio3D.prototype.init = function(sound){
        this.loaded = true;
        this.sound = sound;
  };
  
  // onload can be overwritten to do whatever,
  // or, actions can be added using THREE.js's eventemitter ie
  // |   Audio3D.addEVentListener("loaded", callback)
  THREE.Audio3D.prototype.onload = function(){};
  
  // Loads an audio file, then calls THREE.Audio3D.init() on the sound
  THREE.Audio3D.prototype.load = function(path, callback){
    
    var that = this, 
        checkReadyState,
        load;
    
    this.addEventListener("loaded", callback);

    checkReadyState = function(sound, intervalId){
      if (sound.readyState === 4) {
        window.clearInterval(intervalId);
			 this.init(sound);
        this.dispatchEvent({"type":"loaded"});
      }
    };
    	
     load = function(path){
		 
      var sound = new Audio( path );
      sound.load();
      
       // no built-in events for audio loads, so periodically check
      var id = window.setInterval((function(){
         checkReadyState.call(that, sound, id);
      }), 50);
       
    };

    load( path );

  };
  
})();