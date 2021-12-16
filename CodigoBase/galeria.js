import * as THREE from '../resources/threejs/build/three.module.js';

import { PointerLockControls } from '../resources/threejs/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '../resources/threejs/examples/jsm/loaders/GLTFLoader.js';
import {VRButton} from '../resources/threejs/examples/jsm/webxr/VRButton.js';

//Definição de variáveis globais 
let camera, scene, renderer, controls,raycaster, position,boxGeometry;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();

const objects = [];
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

var manager,ready, user, curve, pointsPath;
var pathIndex = 0;
var cycle = 0;

init();

function init() {
	//SCENE
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

	//LOADMANAGER
	initLoadManager();

	//Curva - caminho da camera
	curve = new THREE.EllipseCurve(
		0,  0,            // ax, aY
		20, 10,           // xRadius, yRadius
		0,  2 * Math.PI,  // aStartAngle, aEndAngle
		false,            // aClockwise
		0                 // aRotation
	);
	
	pointsPath = curve.getPoints( 700 );
	const geometry = new THREE.BufferGeometry().setFromPoints( pointsPath );
	const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
	curve = new THREE.Line( geometry, material );
	curve.rotateX(-Math.PI/2);
	curve.position.set(-3,7,-4.5)
	curve.visible = false;
	scene.add(curve);

	//CAMERA
	user = new THREE.Group();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	
	user.position.y = 7;
	user.add(camera);
	camera.position.y = 2;
	scene.add(user);

	//CUBEMAP
	const path          = "../resources/Textures/Cubemaps/";
    	const textCubeMap   =    [   path + "galaxyposx.png", 
                                path + "galaxynegx.png",
                                path + "galaxyposy.png", 
                                path + "galaxynegy.png",
                                path + "galaxyposz.png", 
                                path + "galaxynegz.png"
                            ];

    	const textureCube   = new THREE.CubeTextureLoader().load( textCubeMap );
    	scene.background    = textureCube;

	controls = new PointerLockControls( user, document.body );

	const blocker = document.getElementById( 'blocker' );
	const instructions = document.getElementById( 'instructions' );

	instructions.addEventListener( 'click', function () {

		controls.lock();

	} );

	controls.addEventListener( 'lock', function () {

		instructions.style.display = 'none';
		blocker.style.display = 'none';

	} );

	controls.addEventListener( 'unlock', function () {

		blocker.style.display = 'block';
		instructions.style.display = '';

	} );

	window.addEventListener( 'resize', onWindowResize );

	scene.add( controls.getObject() );

	//Mantido os controles manuais para disponibilizacao da versao do projeto sem VR

	const onKeyDown = function ( event ) {

		switch ( event.code ) {

			case 'ArrowUp':
			case 'KeyW':
				moveForward = true;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = true;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
				break;

		}

	};

	const onKeyUp = function ( event ) {

		switch ( event.code ) {

			case 'ArrowUp':
			case 'KeyW':
				moveForward = false;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = false;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'keydown', onKeyDown );
	document.addEventListener( 'keyup', onKeyUp );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 50 );

	//Carrega os GLTF
	loadObjects()

	// Construção do chão
	buildFloor()
	
	//Constução do telhado
	buildRoof()

	//Construção das paredes
	buildWalls()

	//RENDERER - VR mode
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );

	//VR
	
	renderer.xr.enabled = true;
	document.body.appendChild(VRButton.createButton(renderer));

	//Carrega as luzes
	loadLight();

	//entra no loop do render(), esperando o loadmanager dar ok pra começar o animate()
	render();
}

function initLoadManager(){
	ready = false;
	manager = new THREE.LoadingManager();
	manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

		console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

	};

	manager.onLoad = function ( ) {

		console.log( 'Loading complete!');
		ready = true;

	};


	manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

		console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

	};

	manager.onError = function ( url ) {

		console.log( 'There was an error loading ' + url );

	};
}

function render() {
	if (ready){
		renderer.setAnimationLoop(animate);
	}
	else{
		renderer.setAnimationLoop(render);
	}
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


//Função responsável pela animação
function animate() {
	//lista de orgãos que são animados
	let organs = ['brain','skull','eye', 'heart','stomach','pelvic', 'lung','skull', 'heart', 'excretory','eye','skeleton','brain']
	cycle+=1;
	

	const time = performance.now();


	//Mantido a função dos controles manuais para versão sem VR do projeto que será disponibilizada
	if ( controls.isLocked === true ) {

		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y -= 10;

		const intersections = raycaster.intersectObjects( objects, false );

		const onObject = intersections.length > 0;

		const delta = ( time - prevTime ) / 6000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize(); // this ensures consistent movements in all directions

		if ( moveForward || moveBackward ) velocity.z -= direction.z * 800.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 800.0 * delta;

		if ( onObject === true ) {

			velocity.y = Math.max( 0, velocity.y );
		}

		controls.moveRight( - velocity.x * delta );
		controls.moveForward( - velocity.z * delta );

		controls.getObject().position.y += ( velocity.y * delta ); // new behavior

		if ( controls.getObject().position.y < 7) {

			velocity.y = 0;
			controls.getObject().position.y = 7;


		}

	}

	//Animação dos orgãos de acordo com o tipo do mesmo
	organs.forEach(element => {
		animateOrgans(element, time, cycle);
	});

	prevTime = time;

	updateCamera();
	renderer.render( scene, camera );
	renderer.setAnimationLoop(animate);

}

//Função que anima os orgãos por tipo
function animateOrgans(organName, time, cycle){

	var obj = scene.getObjectByName(organName);
	
	if ((organName === 'stomach') || (organName === 'brain') ){
		obj.position.y = Math.sin((time*0.001)%2*Math.PI)/5+10;
	}
	if (organName === 'lung' || organName === 'excretory' ||
	 organName === 'pelvic') {
		obj.position.y += Math.sin((time*0.001)%2*Math.PI)/15;
	}
	
	if((organName === 'heart')){
		if(cycle%10==0)
			obj.scale.set(1.5,1.5,1.5);
		else if (cycle%87==0)
			obj.scale.set(1.8,1.8,1.8);
	}
	if(organName === 'skull'){
		obj.rotateY( Math.PI *  0.005);
	}
	if(organName === 'eye'){
		obj.position.y += Math.sin((time*0.001)%2*Math.PI)/30;
		obj.lookAt( user.position );
	}
	if(organName === 'skeleton'){
		obj.position.y += Math.sin((time*0.001)%2*Math.PI)/30;
		obj.lookAt( user.position );
	}
}

function updateCamera() {
	const newPosition = pointsPath[pathIndex];
   	user.position.x = newPosition.x;
	user.position.z =  newPosition.y;

	pathIndex += 1;
	if (pathIndex >= pointsPath.length){
		pathIndex = 0;
	}
 };
 
//carrega luzes ambiente e do objeto
function loadLight(){
	
	let d = 2;
    let r = 3;

	const dirLight = new THREE.PointLight (0xffffa0, 0.4);
   	dirLight.position.set( 0, 20, -3 );
  
   	dirLight.castShadow = true;
    dirLight.shadow.radius = r;
    dirLight.distance = 150;
	dirLight.decay = 2;
	dirLight.bias = 0.001;
   	dirLight.shadow.camera.top = dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.bottom = dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 200;
	scene.add(dirLight);
   

	const dirLight2 = new THREE.PointLight (0xffffad, 0.3);
   	dirLight2.position.set( 0, 20, 3 );
   	dirLight2.castShadow = true;
    dirLight2.shadow.radius = r;
	dirLight2.distance = 150;
	dirLight2.decay = 2;
	dirLight2.bias = 0.001;
    
  	dirLight2.shadow.camera.top = dirLight.shadow.camera.right = d;
    dirLight2.shadow.camera.bottom = dirLight.shadow.camera.left = -d;
    dirLight2.shadow.camera.near = 1;
  	dirLight2.shadow.camera.far = 200;
	scene.add(dirLight2);
    
	
	//Ligth of object lampTable
	const dirLight3 = new THREE.PointLight (0xffffad, 0.3);
	dirLight3.position.set(-38, 8.1, -18);
   	dirLight3.castShadow = true;
    dirLight3.shadow.radius = r;
	dirLight3.distance = 20;
	dirLight3.decay = 2;
	dirLight3.bias = 0.001;
	dirLight3.intensity = 1;
    
	scene.add(dirLight3);

	// // // Luz ambiente
	var ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.4 );
	ambientLight.name = 'ambient';
	scene.add(ambientLight);
}

function buildWalls() {
	let wallMatrix =  [
		[1, 1, 2, 1, 1, 1, 1, 2, 1, 1,],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 1,], 
		[1, 0, 0, 3, 0, 3, 0, 3, 0, 1,],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 2,],
		[1, 1, 0, 0, 0, 0, 0, 0, 1, 1,],
		[1, 3, 0, 0, 0, 0, 0, 0, 3, 1,], 
		[1, 1, 0, 0, 0, 0, 0, 0, 1, 1,],
		[1, 0, 3, 0, 3, 0, 3, 0, 3, 1,], 
		[2, 0, 0, 0, 0, 0, 0, 0, 0, 2,],
		[1, 1, 2, 1, 1, 1, 2, 1, 1, 1,],
	 ];

	var posX;
	var posZ;

	for (var i = 0; i < 10; i++) {
		
		for (var j = 0, m = wallMatrix[i].length; j < m; j++) {
		
			if (wallMatrix[i][j] > 0) {

				let element = wallMatrix[i][j];
				
				if( i == 0 && j == 0 || i == 0 && j == 9 || i == 9 && j == 0 || i == 9 && j == 9 || element == 3 ) {
					boxGeometry = new THREE.BoxGeometry( 10, 10, 10 ).toNonIndexed();
				}
				else if( j == 0 || j == 9) {
					boxGeometry = new THREE.BoxGeometry( 2, 10, 10 ).toNonIndexed();
				} else {
					boxGeometry = new THREE.BoxGeometry( 10, 10, 2 ).toNonIndexed();
				}

				posX = j* 10- 50;
				posZ = i * 10 - 50;

				buidWall(posX, posZ, element)
				
			}
		}
	}
}

function buidWall(posX, posZ, element) {

	let wallTexture;
	if(element ==3 )
	 	wallTexture = new THREE.TextureLoader().load( '../resources/Images/metal-grid.jpg' );
	else 
		wallTexture = new THREE.TextureLoader().load( '../resources/Images/marmore2.jpg' );

	wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;

	wallTexture.repeat.set(1, 1);	

	let boxMaterial;

	for (var i = 0; i < 3; i++) {

		if((element == 2 && i == 1)) {
			boxMaterial = new THREE.MeshBasicMaterial({
				color: 'cyan',
				transparent: true,
				opacity: 0.4
			});
		} else {
			boxMaterial = new THREE.MeshPhongMaterial( { map: wallTexture } );
		}

		if((element != 3 || i == 0)) {

			let box = new THREE.Mesh( boxGeometry, boxMaterial);

			box.receiveShadow = true;
			box.castShadow = true;

			box.position.x = posX
			box.position.y = 10* i ;
			box.position.z = posZ;
	
			scene.add( box );
			objects.push( box );
		}
	}
}

function buildRoof() {

	let roofGeometry = new THREE.PlaneGeometry( 230, 230, 2, 2 );
	roofGeometry.rotateX( Math.PI / 2 );
	roofGeometry.translate(1, 25, 1);


	let roofTexture = new THREE.TextureLoader().load( '../resources/Images/teto_tri.jpg' );

	roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;

	roofTexture.repeat.set(80, 80);	

	position = roofGeometry.attributes.position;

	roofGeometry = roofGeometry.toNonIndexed()

	position = roofGeometry.attributes.position;
	position.sety = 10;
	const colorsRoof = [];


	for ( let i = 0, l = position.count; i < l; i ++ ) {

		color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		colorsRoof.push( color.r, color.g, color.b );

	}

	roofGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsRoof, 3 ) );

	const roofMaterial = new THREE.MeshPhongMaterial( { map: roofTexture} );

	const roof = new THREE.Mesh( roofGeometry, roofMaterial );
	scene.add( roof );
}

function buildFloor() {


	let floorGeometry = new THREE.PlaneGeometry( 230, 230, 2, 2 );
	floorGeometry.rotateX( - Math.PI / 2 );

	let floorTexture = new THREE.TextureLoader().load( '../resources/Images/pisonovo.jpg' );

	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;

	floorTexture.repeat.set(5, 5);	

	position = floorGeometry.attributes.position;

	floorGeometry = floorGeometry.toNonIndexed()

	position = floorGeometry.attributes.position;
	const colorsFloor = [];

	for ( let i = 0, l = position.count; i < l; i ++ ) {

		color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		colorsFloor.push( color.r, color.g, color.b );

	}

	floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );

	const floorMaterial = new THREE.MeshPhongMaterial( { 
		map: floorTexture,
		dithering: true
	
	} );


	let floor = new THREE.Mesh( floorGeometry, floorMaterial );
	floor.receiveShadow = true;
	
	scene.add( floor );

}

function loadObjects() {


	// Load Mesh - Brain
	const gltfLoader = new GLTFLoader(manager);
	gltfLoader.load('../resources/Models/glTF/brain/scene.gltf', function(object){
		let root = object.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true; }
		} );
		root.name = 'brain';
		root.scale.set(0.02, 0.02, 0.02);
		root.position.set(-35, 12, 0.0);
		scene.add(root);
	});

	// Load Mesh - Eye
	gltfLoader.load('../resources/Models/glTF/eye/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true; }
		} );
		root.name = 'eye';
		root.scale.set(3, 3, 3);
		root.position.set(28, 13.2, 0);
		scene.add(root);
	});
	
	// Load Mesh - Skeleton
	gltfLoader.load('../resources/Models/glTF/skeleton/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true; }
		} );
		root.name = 'skeleton';
		root.scale.set(0.08, 0.08, 0.08);
		root.position.set(0, 6.5, -30);
		scene.add(root);
	});

	
	// Load Mesh - Excretory System
	gltfLoader.load('../resources/Models/glTF/excretory_system/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true; }
		} );
		root.name = 'excretory';
		root.scale.set(0.8, 0.8, 0.8);
		root.position.set(-30, 17.0, 20);
		scene.add(root);
	});

	// Load Mesh - Heart
	gltfLoader.load('../resources/Models/glTF/heart/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true; }
		} );
		root.name = 'heart';
		root.scale.set(1.8, 1.8, 1.8);
		root.position.set(-10, 10.0, 20);
		scene.add(root);
	});
	
	// Load Mesh - Skull
	gltfLoader.load('../resources/Models/glTF/skull/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true; }
		} );
		root.name = 'skull';
		root.scale.set(3, 3, 3);
		root.position.set(-20, 8.2, -30);
		scene.add(root);
	});
	

	// Load Mesh - Lung
	gltfLoader.load('../resources/Models/glTF/lung_model/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true; }
		} );
		root.name = 'lung';
		root.scale.set(0.03, 0.03, 0.03);
		root.position.set(30, 16, 25);
		scene.add(root);
	});

	// Load Mesh - Pelvic
	gltfLoader.load('../resources/Models/glTF/pelvic/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true; }
		} );
		root.name = 'pelvic';
		root.scale.set(0.15, 0.15, 0.15);
		root.position.set(25, 0, -40);
		scene.add(root);
	});

	// Load Mesh - Stomach
	gltfLoader.load('../resources/Models/glTF/stomach/scene.gltf', function (mesh) {
		let root = mesh.scene;
		root.traverse(function (node) {
			if (node.isMesh) { node.castShadow = true; }
		});
		root.name = 'stomach';
		root.scale.set(30, 30, 30);
		root.position.set(10, 10, 14);
		scene.add(root);
	});

	// Load Mesh - painting 1 
	gltfLoader.load('../resources/Models/glTF/monalisa/scene.gltf', function (mesh) {
			let root = mesh.scene;
			root.name = 'monalisa';
			root.scale.set(1.05, 1.05, 1.05);
			root.position.set(-14, 11.1, -48);
			scene.add(root);
	});

	//Load Mesh cabinet
	gltfLoader.load('../resources/Models/glTF/cabinet/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) {  }
		} );
		root.name = 'cabinet';
		root.scale.set(0.08, 0.08, 0.08);
		root.position.set(-6, 0, -36);
		scene.add(root);
	});

	//Load chandelier
	gltfLoader.load('../resources/Models/glTF/chandelier/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = false }
		} );
		root.name = 'chandelier';
		root.scale.set(0.007, 0.007, 0.007);
		root.position.set(0, 15, 0);
		scene.add(root);
	});

	// Load Mesh - painting 2 
	gltfLoader.load('../resources/Models/glTF/old_painting/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = false }
		} );
		root.name = 'painting2';
		root.scale.set(12, 12, 12);		
		root.position.set(-3, 6.0, 39);
		root.rotateY(Math.PI);
		scene.add(root);
	});

	// Load Mesh - camera security 1
	gltfLoader.load('../resources/Models/glTF/security_camera/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = false }
		} );
		root.name = 'camera1';
		root.scale.set(0.4, 0.4, 0.4);
		root.position.set(-36, 17.2, 13.0);
		scene.add(root);
	});

	// Load Mesh - camera security 2
	gltfLoader.load('../resources/Models/glTF/security_camera/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = false }
		} );
		root.name = 'camera2';
		root.scale.set(0.4, 0.4, 0.4);
		root.position.set(-25, 17.2, -46.0);
		scene.add(root);
	});

	// Load Mesh - camera security 3
	gltfLoader.load('../resources/Models/glTF/security_camera/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = false }
		} );
		root.name = 'camera3';
		root.scale.set(0.4, 0.4, 0.4);
		root.position.set(27, 17.2, -14.0);
		root.rotateY(Math.PI);
		scene.add(root);
	});

		

	//// Load Mesh - Table
	gltfLoader.load('../resources/Models/glTF/table/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true }
		} );
		root.name = 'table';
		root.scale.set(0.07, 0.07, 0.07);		
		root.position.set(-37, 2.6, -18);
		root.rotateY(Math.PI/2);
		scene.add(root);
	});

	// Load Mesh - Lamp in Table
	gltfLoader.load('../resources/Models/glTF/office_lamp/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true }
		} );
		root.name = 'lampTable';
		root.scale.set(0.07, 0.07, 0.07);		
		root.position.set(-38, 5.3, -18);
		root.rotateY(Math.PI/3);
		scene.add(root);
	});

	// Load Mesh - book
	gltfLoader.load('../resources/Models/glTF/open_book/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true }
		} );
		root.name = 'openBook';
		root.scale.set(0.03, 0.03, 0.03);		
		root.position.set(-37, 7.3, -21);
		scene.add(root);
	});

	// Load Mesh - pen holder
	gltfLoader.load('../resources/Models/glTF/pen_holder/scene.gltf', function(mesh){
		let root = mesh.scene;
		root.traverse( function( node ) {
			if ( node.isMesh ) { node.castShadow = true }
		} );
		root.name = 'pen';
		root.scale.set(0.83, 0.83, 0.83);		
		root.position.set(-37, 6, -15);
		scene.add(root);
	});
}
