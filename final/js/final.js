	var renderer;
	var scene;
	var camera;
	var groundPlane;
	var player;
	var mouse = new THREE.Vector2();
	var projector = new THREE.Projector();
	var raycaster = new THREE.Raycaster();
	var pos = new THREE.Vector3();
	var zom = [], blocked = [];
	var ammo = 7;
	var Pammo = 7, Uammo = 0;
	var reloading = false
	var isPaused = false
	var stop = false;
	var shot = false;
	var time = 1;
	var gunBox = [];
	var up = false;
	var pistol = true;
	var uzi = false;
	var clicking = false;
	var clicked = false;
	var start = false;
	var GO =false;
	var score=0, money=0;
	var horde = 1;
	var zomSpeed = 10;
	
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	Physijs.scripts.worker = 'libs/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
	
	function init()
	{
		scene = new Physijs.Scene();
		scene.setGravity(new THREE.Vector3( 0, 0, -30 ));

		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

		setupRenderer();
		setupCamera();
		addSpotLight();
		loadSounds();

		createGroundPlane();
		createPlayer();

		createVerticalWall(-200,75);
		createVerticalWall(-200,-75);
		createVerticalWall(200,75);
		createVerticalWall(200,-75);
		createHorizonalWall(-115,125);
		createHorizonalWall(115,125);
		createHorizonalWall(-115,-125);
		createHorizonalWall(115,-125);
		createBox(-95,-55);
		createBox(95,-55);
		createBox(95,55);
		createBox(-95,55);
		createZombie(-204,8);
		createZombie(204,8);
		createZombie(0,-129);
		createZombie(0,129);
		text("$500",-102,-56);
		text("$500",86,-56);
		text("$500",-102,53);
		text("$500",86,53);
		//zom.setLinearVelocity( new THREE.Vector3(0, 1, 0));

		document.addEventListener( 'mousemove', onMouseMove, false ); 
		window.addEventListener( 'resize', onWindowResize, false );
		window.addEventListener( 'mousedown', onMouseDown, false ); 
		window.addEventListener( 'mouseup', onMouseUp, false ); 

		//document.getElementById("starting").innerHTML = ""; 

		document.body.appendChild( renderer.domElement );
		
		render();
	}
	
	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth-20, window.innerHeight-20 );
		//renderer.setViewport(200,0,window.innerWidth-20,window.innerHeight-20);
		renderer.shadowMapEnabled = true;
		renderer.shadowMapType = THREE.PCFSoftShadowMap;
	}

	function render()
	{
		if (!isPaused && start && !GO)
		{
        	playerMovement();
        	updateAmmo();
		
			//player.setLinearVelocity(new THREE.Vector3(0,0,0));
			//player.setAngularVelocity(new THREE.Vector3(0,0,0));
			player.position.z = 6;
			
			if(Key.isDown(Key.R) && pistol)
			{
				reloading = true;
				document.getElementById( "isReload").innerHTML = "RELOADING";
				setTimeout(function(){
					reloading=false;
					document.getElementById( "isReload").innerHTML = "";
					ammo = 7;
					Pammo = 7;
				}, 1500);
				
			}

			//document.getElementById( "ammo").innerHTML = ammo;
			document.getElementById( "Uammo").innerHTML = Uammo;
			document.getElementById( "Pammo").innerHTML = Pammo;

			if(pistol)
			{
				if(ammo <= 0)
				{
					reloading = true;
					document.getElementById( "isReload").innerHTML = "RELOADING";
					setTimeout(function(){
						reloading=false;
						document.getElementById( "isReload").innerHTML = "";
					}, 1500);
					Pammo = 7;
					ammo = 7;
				}
			}

			if(Key.isDown(Key.U) && isPaused)
			{
				isPaused = false;
				scene.onSimulationResume();
			}
			if(Key.isDown(Key.P) && !isPaused)
			{
				isPaused = true;
			}

			if(Key.isDown(Key.F) && isPlayerAroundaBox())
			{
				givePlayeraGun();
				crate.play();
			}
			
			if(Key.isDown(Key._1))
			{
				ammo = Pammo;
				pistol = true;
				uzi = false;//other gun
			}
			if(Key.isDown(Key._2))
			{
				ammo = Uammo;
				uzi = true;
				pistol = false;//other gun
			}

			camera.position.x = player.position.x;
			camera.position.y = player.position.y;

			if(score >= 250 && horde == 1)
			{
				createZombie(-196,8);
				createZombie(196,8);
				createZombie(8,-121);
				createZombie(8,121);
				horde++;
			}
			if(score >= 600 && horde == 2)
			{
				createZombie(-196,0);
				createZombie(196,0);
				createZombie(0,-121);
				createZombie(0,121);
				horde++;
			}
			if(score >= 1100 && horde == 3)
			{
				createZombie(-196,-8);
				createZombie(196,-8);
				createZombie(-8,-121);
				createZombie(-8,121);
				horde++;
			}
			if(score >= 1700 && horde == 4)
			{
				createZombie(-204,-8);
				createZombie(204,-8);
				createZombie(-8,-129);
				createZombie(-8,129);
				horde++;
			}
			if(score >= 2400 && horde == 5)
			{
				createZombie(-204,0);
				createZombie(204,0);
				createZombie(8,-129);
				createZombie(8,129);
				horde++;
			}
			if(score >= 1500)
				zomSpeed = score/150;

			//zom.setLinearVelocity(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
			
			for(var i = 0; i < zom.length; i++)
			{
				zombieMovement(zom[i],zomSpeed);
				if((zom[i].position.x >= player.position.x -8 && player.position.x+8 >= zom[i].position.x) && (player.position.y-8 <= zom[i].position.y && player.position.y+8 >= zom[i].position.y))
					gameOver();
			}
			//zom._dirtyPosition = true;
			//zom._dirtyRotation = true;

			document.getElementById( "score").innerHTML = score;
			document.getElementById( "money").innerHTML = "$"+money;

	    	if(time >= 1) up = false;
			if(time <= 0.8) up = true;
			if(up) time += .005;
			if(!up) time -= .005;

			for(var i = 0; i < gunBox.length; i++)
			{
				gunBox[i].material.uniforms.time.value = time;
			}

        	scene.simulate();
    	}
    	requestAnimationFrame( render );
    	renderer.render( scene, camera );
		
	}
	
	function setupCamera()
	{
		
		camera.position.z = 200;
		//camera.lookAt( scene.position );
	}

	function addSpotLight()
	{
        var spotLight = new THREE.SpotLight( 0xeeeeee );
        spotLight.position.set( 0, 0, 1000 );
        spotLight.shadowCameraNear = 200;
        spotLight.shadowCameraFar = 4000;
        spotLight.castShadow = true;
		spotLight.intensity = .8;
		//spotLight.shadowCameraVisible = true;
		spotLight.angle = Math.PI/2;
        
        scene.add(spotLight);

        //var light = new THREE.AmbientLight( 0x404040 );
        //light.intensity = .01;
		//scene.add( light );

		var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, .5 );
		scene.add( light );
	}

	var shotsound, crate, death, GameO;
	function loadSounds()
	{
		shotsound = new Audio("sounds/shot.wav");
		crate = new Audio("sounds/crate.mp3");
		death = new Audio("sounds/death.wav");
		death.volume = .3;
		GameO = new Audio("sounds/GO.wav");
	}

	function createGroundPlane()
	{
		var texture = THREE.ImageUtils.loadTexture('images/dirt.jpg');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 18, 12 );
		var planeGeometry = new THREE.PlaneGeometry( 750, 400, 2);
		var planeMaterial = new THREE.MeshLambertMaterial({map:texture});//friction,restitution
		var mat = createCustomMaterialFromGLSLCode2('fragment2');
		groundPlane = new Physijs.PlaneMesh( planeGeometry, planeMaterial, 0 );
		groundPlane.receiveShadow = true;
		//groundPlane.castShadow = true;
		//groundPlane.position.x = 50;
		groundPlane.name = "GroundPlane";
		//groundPlane.position.set(0,0,0);
		
		scene.add( groundPlane );

		groundPlane.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
		{
			if( other_object.name == "Bullet" || other_object.name == "Blood")
			{
				scene.remove(other_object);
				groundPlane.material.uniforms.x.value = other_object.position.x;
				groundPlane.material.uniforms.y.value = other_object.position.y;
			}
		});
	}

	function createVerticalWall(x, y)
	{
		var texture = THREE.ImageUtils.loadTexture('images/hedge.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 5 );
		var geo = new THREE.BoxGeometry(20, 120, 10);
		var mat = new THREE.MeshLambertMaterial({map:texture});
		var wall = new Physijs.BoxMesh(geo, mat, 0);
		wall.name = "Wall";

		wall.position.x = x;
		wall.position.y = y;
		wall.position.z = 5;

		scene.add(wall);
	}

	function createHorizonalWall(x, y)
	{
		var texture = THREE.ImageUtils.loadTexture('images/hedge.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 7, 1 );
		var geo = new THREE.BoxGeometry(190, 20, 10);
		var mat = new THREE.MeshLambertMaterial({map:texture});
		var wall = new Physijs.BoxMesh(geo, mat, 0);
		wall.name = "Wall";

		wall.position.x = x;
		wall.position.y = y;
		wall.position.z = 5;

		scene.add(wall);
	}

	function createBox(x, y)
	{
		var geo = new THREE.BoxGeometry(20, 20, 10);
		var mat = createCustomMaterialFromGLSLCode1('fragment1');
		box = new Physijs.BoxMesh(geo, mat, 0);
		box.name = "Box";

		box.position.x = x;
		box.position.y = y;
		box.position.z = 5;
		box.castShadow = true;

		gunBox.push(box);
		blocked.push(box);
		scene.add(box);

		box.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
		{
			if( other_object.name == "Player" )
			{
				//scene.remove(wall);
				
			}
		});
	}

	function createPlayer()
	{

		var geo = new THREE.CylinderGeometry(4,4,10);
		var mat = new THREE.MeshLambertMaterial({color:0x000FFF, reflectivity: .1});
		//var mat = createCustomMaterialFromGLSLCode2('fragment2');
		player = new THREE.Mesh(geo, mat);
		player.name = "Player";
		player.castShadow = true;
		
		player.position.set(0,0,6);
		player.rotation.x = Math.PI/2;
		//player.__dirtyPosition = true;
		scene.add(player);

		/*player.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
		{
			if( other_object.name == "Wall" )
			{
				//blocked = true;
				//setTimeout(function(){blocked = false;}, 500);
				//player.;
				//player.setLinearFactor(new THREE.Vector3(0,0,0));
				//player.setAngularFactor(new THREE.Vector3(0,0,0));
			}
		});*/
		/*
		var loader = new THREE.JSONLoader();
		loader.load('models/glock.json', function(geometry, materials)
		{
			var mesh = new THREE.Mesh(geometry, materials);
			//mesh.scale.set( 2, 2, 2 );
			mesh.position.y = 2.5;
			mesh.rotation.x = Math.PI/2;
			mesh.position.z = 4;
			scene.add(mesh);
			
		});*/
	}

	function createZombie(x, y)
	{
		//var texture = THREE.ImageUtils.loadTexture('images/zom2.jpg');
		var geo = new THREE.CylinderGeometry(4,4,10);
		var mat = new THREE.MeshLambertMaterial({color:0x27FF00});
		var zombie = new Physijs.CylinderMesh(geo, mat);
		/*var zombie;
		var loader = new THREE.OBJMTLLoader();
		loader.load(
			// OBJ resource URL
			'models/Slasher.obj',

			// MTL resource URL	
			'models/Slasher.mtl',
			
			// Function when both resources are loaded			// Function when both resources are loaded
			function ( object ) 
			{
				zombie = object;
				// Added to fix raycasting
				object.castShadow = true;
				//object.receiveShadow = true;
				object.scale.set( 30, 30, 30 );
				
				var obj = new Physijs.Object3D();
				//obj.name = 'Zombie';
				//object.parent = obj;
				obj.add( object );
				//pieceList[index] = obj;
				
				obj.rotation.x = (Math.PI/2);
				scene.add(obj);
			}
		);*/

		/*function handle_load(geometry, materials)
		{
			//var material = new THREE.MultiMaterial(materials);
			zombie = new THREE.Mesh(geometry, materials);
			//scene.add(zombie);
		}*/
		
		zombie.name = "Zombie";
		
		zombie.position.x = x;
		zombie.position.y = y;
		zombie.position.z = 6;
		zombie.rotation.x = Math.PI/2;
		zombie._dirtyPosition = true;
		zombie.castShadow = true;
		zombie.health = 5;
		zom.push(zombie);

		scene.add(zombie);
		
		zombie.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
		{
			if( other_object.name == "Bullet" )
			{
				shot = true;
				zombie.setLinearVelocity(linear_velocity.multiplyScalar(-.1));
				setTimeout(function(){shot=false;}, 300);
				//scene.remove(zombie);
				//zombie.position.set(x,y,6);
				//setTimeout(function(){scene.add(zombie);}, 1500);
				scene.remove(other_object);
				blood(zombie.position.x,zombie.position.y);
				if(pistol) zombie.health -= 2;
				if(uzi) zombie.health -= 3;
				if(zombie.health <= 0)
				{
					death.play();
					score+=25;money+=25;
					scene.remove(zombie);
					zombie.position.set(x,y,6);
					setTimeout(function(){scene.add(zombie);zombie.health=5;}, 1500);
				}
			}
		});
	}

	function zombieMovement(zom, speed)
	{

		if(!shot)
		{
			if(zom.position.x > player.position.x)
			{
				zom.setLinearVelocity(new THREE.Vector3(-speed, 0, 0));
			}
			if(zom.position.x < player.position.x)
			{
				zom.setLinearVelocity(new THREE.Vector3(speed, 0, 0));
			}
			if(zom.position.y < player.position.y)
			{
				zom.setLinearVelocity(new THREE.Vector3(0, speed, 0));
			}
			if(zom.position.y > player.position.y)
			{
				zom.setLinearVelocity(new THREE.Vector3(0, -speed, 0));
			}
			if(zom.position.x > player.position.x && zom.position.y > player.position.y)
			{
				zom.setLinearVelocity(new THREE.Vector3(-speed, -speed, 0));
			}
			if(zom.position.x < player.position.x && zom.position.y > player.position.y)
			{
				zom.setLinearVelocity(new THREE.Vector3(speed, -speed, 0));
			}
			if(zom.position.x > player.position.x && zom.position.y < player.position.y)
			{
				zom.setLinearVelocity(new THREE.Vector3(-speed, speed, 0));
			}
			if(zom.position.x < player.position.x && zom.position.y < player.position.y)
			{
				zom.setLinearVelocity(new THREE.Vector3(speed, speed, 0));
			}
		}
		if(zom.position.z > player.position.z)
			zom.setLinearVelocity(new THREE.Vector3(0, 0, -10));
		//zom.setAngularVelocity(new THREE.Vector3(0,0,0));
		//zom.rotation.x = Math.PI/2;
		//zom.rotation.y = 0;
	}

	function onMouseDown(event)
	{ 
		event.preventDefault();
		if(!start)
		{
			document.getElementById("Start").style.visibility = "hidden";
			//document.getElementById("Instructions").style.visibility = "hidden";
			start = true;
			return;
		}
		clicking = true;
		//if(clicked)
			//return;
		//clicked = true;
		if(!reloading)
		{
			if(pistol)
			{
				bullet();

				ammo = ammo - 1;
				Pammo--;
			}
			if(uzi)
			{
				if(amiClicking() && Uammo > 0)
				{
					setTimeout(function(){onMouseDown(event);},150);
					bullet();
					ammo--;
					Uammo--;
					
				}

			}
		}
	}
	
	function onMouseMove( event )
	{
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
		
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		projector.unprojectVector( vector, camera );
		raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
	}

	function onMouseUp( event ) 
	{
		event.preventDefault();
		
		clicking = false;
		var temp = Uammo;
		Uammo=0;
		setTimeout(function(){Uammo=temp;},100);
	}

	function givePlayeraGun()
	{
		uzi = true;
		pistol = false;//other gun
		ammo = 100;
		Uammo = 100;
		money-=500;
	}

	function amiClicking()
	{
		return clicking;
	}

	function playerMovement()
	{
		if(Key.isDown(Key.W))
		{
			newx = player.position.x;
			newy = player.position.y+1;
			if(newy <= 111)
			{
				for(var i = 0; i < blocked.length; i++)
				{
					if((newx >= blocked[i].position.x -13 && newx <= blocked[i].position.x +13) && (newy >= blocked[i].position.y -13 && newy <= blocked[i].position.y +13))
						stop = true;
				}
				if(!stop)
					player.position.y += 1;
				stop = false;
			}
			//player.__dirtyPosition = true;
			//player.setLinearVelocity(new THREE.Vector3(0,100,0));
			//setTimeout(function(){player.setLinearVelocity(new THREE.Vector3(0,0,0));}, 100);
		}
		if(Key.isDown(Key.S))
		{
			newx = player.position.x;
			newy = player.position.y-1;
			if(player.position.y - 1 >= -111)
			{
				for(var i = 0; i < blocked.length; i++)
				{
					if((newx >= blocked[i].position.x -13 && newx <= blocked[i].position.x +13) && (newy >= blocked[i].position.y -13 && newy <= blocked[i].position.y +13))
						stop = true;
				}
				if(!stop)
					player.position.y -= 1;
				stop = false;
			}
			//player.__dirtyPosition = true;
			//player.setLinearVelocity(new THREE.Vector3(0,-100,0));
			//setTimeout(function(){player.setLinearVelocity(new THREE.Vector3(0,0,0));}, 100);
		}
		if(Key.isDown(Key.A))
		{
			newx = player.position.x-1;
			newy = player.position.y;
			if(player.position.x - 1 >= -186)
			{
				for(var i = 0; i < blocked.length; i++)
				{
					if((newx >= blocked[i].position.x -13 && newx <= blocked[i].position.x +13) && (newy >= blocked[i].position.y -13 && newy <= blocked[i].position.y +13))
						stop = true;
				}
				if(!stop)
					player.position.x -= 1;
				stop = false;
			}
			//player.__dirtyPosition = true;
			//player.setLinearVelocity(new THREE.Vector3(-100,0,0));
			//setTimeout(function(){player.setLinearVelocity(new THREE.Vector3(0,0,0));}, 100);
		}
		if(Key.isDown(Key.D))
		{
			newx = player.position.x+1;
			newy = player.position.y;
			if(player.position.x + 1 <= 186)
			{
				for(var i = 0; i < blocked.length; i++)
				{
					if((newx >= blocked[i].position.x -13 && newx <= blocked[i].position.x +13) && (newy >= blocked[i].position.y -13 && newy <= blocked[i].position.y +13))
						stop = true;
				}
				if(!stop)
					player.position.x += 1;
				stop = false;
			}
			//player.__dirtyPosition = true;
			//player.setLinearVelocity(new THREE.Vector3(100,0,0));
			//setTimeout(function(){player.setLinearVelocity(new THREE.Vector3(0,0,0));}, 100);
		}
	}

	function isPlayerAroundaBox()
	{
		for(var i = 0; i < blocked.length; i++)
		{
			if((player.position.x >= blocked[i].position.x -20 && player.position.x <= blocked[i].position.x +20) && (player.position.y >= blocked[i].position.y -20 && player.position.y <= blocked[i].position.y +20))
				if(money>=500)
					return true;
		}
		return false;
	}

	function blood(x, y)
	{
		for(var i = 0; i < 3; i++)
		{
			var drop = new Physijs.SphereMesh(new THREE.SphereGeometry(.5), new THREE.MeshLambertMaterial({color:'red'}));
			drop.position.set(x,y,4);
			drop.name = "Blood";
			scene.add(drop);
			
		}
	}

	function loadShader(shadertype) 
	{
		return document.getElementById(shadertype).textContent;
	}

	var textureUniform1 = { time: {type: 'f', value: 0}, tDiffuse: {type: "t", value: THREE.ImageUtils.loadTexture('images/uzi.jpg') } };
	function createCustomMaterialFromGLSLCode1(fragmentName)
	{
		var frag = loadShader(fragmentName);
		var vert = loadShader("vertex");
		var shaderMaterial = new THREE.ShaderMaterial({uniforms:textureUniform1,vertexShader:vert,fragmentShader:frag});
		return shaderMaterial;
	}

	//var timeUniform = { time: { type: 'f', value: 0.0 } };
	var textureUniform2 = { time: {type: 'f', value: 0}, tDiffuse: {type: "t", value: THREE.ImageUtils.loadTexture('images/dirt.jpg') } };
	//var textureUniform3 = { time: {type: 'f', value: 0}, tDiffuse: {type: "t", value: THREE.ImageUtils.loadTexture('images/grass3.jpg') } };
	function createCustomMaterialFromGLSLCode2(fragmentName)
	{
		var frag = loadShader(fragmentName);
		var vert = loadShader("vertex");
		var shaderMaterial = new THREE.ShaderMaterial({uniforms:textureUniform2,vertexShader:vert,fragmentShader:frag});
		return shaderMaterial;
	}

	var gun1t = null;
	function text(amount, x, y)
	{
		var gun1 = amount;
		var mat1 = new THREE.MeshLambertMaterial({
		color: 0xFF0000
		});
		var geo1 = new THREE.TextGeometry(gun1, {
		size: 5,
		height: 0.4,
		curveSegments: 10,
		bevelEnabled: false
		});
		gun1 = new THREE.Mesh(geo1, mat1);
		gun1.position.set(x,y,15);
		//gun1.rotation.x = 60 * Math.PI / 180;
		//gun1.rotation.y = 20 * Math.PI / 180;
		scene.add(gun1);
	}

	var ammoObject = null;
	function updateAmmo()
	{
		if( ammoObject != null )
		{
			scene.remove( ammoObject );
		}
			
		var ammoString = "" + ammo;
			
		var ammoObjectGeometry = new THREE.TextGeometry( ammoString,
		{
			size: 2,
			height: 0.4,
			curveSegments: 10,
			bevelEnabled: false
		});
			
		var ammoObjectMaterial = new THREE.MeshLambertMaterial({color:'white'});
			
		ammoObject = new THREE.Mesh( ammoObjectGeometry, ammoObjectMaterial );
		ammoObject.position.x = player.position.x-1;
		ammoObject.position.y = player.position.y-1;
		ammoObject.position.z = 12;
		//ammoObject.rotation.x =  Math.PI ;
		//ammoObject.rotation.x =  Math.PI  ;
		//ammoObject.rotation.y =  Math.PI  ;
		//ammoObject.rotation.z =  Math.PI /2 ;
		//ammoObject.rotation.z = -(3*Math.PI/2) ;
		scene.add( ammoObject );
	}

	function bullet()
	{
		var ballMaterial = new THREE.MeshPhongMaterial( { color: 'black' } );
			 
		var ballMass = 1; 
		var ball = new Physijs.SphereMesh( 
			new THREE.SphereGeometry( .5 ), 
			ballMaterial,
			ballMass
		);
		ball.name = "Bullet";
		//ball.castShadow = true;
		//ball.receiveShadow = true;
		ball.setCcdMotionThreshold(1);
		ball.setCcdSweptSphereRadius(.2);
		//ball.position.copy(raycaster.ray.direction);
		ball.position.copy(player.position);
		ball.position.x += raycaster.ray.direction.x;
		ball.position.y += raycaster.ray.direction.y;
		//ball.position.add(raycaster.ray.direction.multiplyScalar(2));
		//ball._dirtyPosition = true;
						
		scene.add(ball);
		
		pos.copy( raycaster.ray.direction );
		//pos.multiplyScalar(100);
		ball.setLinearVelocity( new THREE.Vector3( pos.x*1500, pos.y*1500, pos.z ) );
	}

	function gameOver()
	{
		GO = true;
		document.getElementById("gameover").innerHTML = "YOU DIED";
		document.getElementById("endscore").innerHTML = "Score: " + score;
		document.getElementById("END").style.visibility = "visible";
		GameO.play();
	}

	function onWindowResize()
	{
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	window.onload = init;

