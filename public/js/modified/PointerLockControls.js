/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );
	//camera.position.z += 40;
	camera.position.y += 5;

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 15;
	yawObject.add( pitchObject );


	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;


		//yawObject.__dirtyRotation = true;
		//yawObject.__dirtyPosition = true;
		yawObject.rotation.y -= movementX * 0.002;
		//rotTarget = new THREE.Vector3(0, -movementX * 0.5, 0);

		//yawObject.setAngularVelocity(new THREE.Vector3(0,-movementX * 0.5,0));
		
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	this.dispose = function() {

		document.removeEventListener( 'mousemove', onMouseMove, false );

	};

	document.addEventListener( 'mousemove', onMouseMove, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.getObjectPitch = function () {

		return pitchObject;

	};


	this.getRotation = function(){
		return yawObject.rotation;
	};

	this.getRotationPitch = function(){
		return pitchObject.rotation;
	};


	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var dir = new THREE.Vector3( 0, 0, - 1 );
		var rot = new THREE.Euler( 0, 0, 0, "YXZ" );

		rot.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

		var v = new THREE.Vector3();
		v.copy(dir).applyEuler(rot);

		return v.normalize();

	};

	this.getMoveDirection = function() {

		// assumes the camera itself is not rotated

		var dir = new THREE.Vector3( 0, 0, - 1 );
		var rot = new THREE.Euler( 0, 0, 0, "YXZ" );

		rot.set( 0, yawObject.rotation.y, 0 );

		var v = new THREE.Vector3();
		v.copy(dir).applyEuler(rot);

		return v.normalize();

	};

};
