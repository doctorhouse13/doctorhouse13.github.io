import * as THREE from 'three';
// import { OrbitControls } from './jsm/controls/OrbitControls.js';
// import { OrbitControls } from 'https://unpkg.com/three@0.131.0/examples/jsm/controls/OrbitControls.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';
// import *  as TWEEN from "https://unpkg.com/tween.js/src/Tween.js"

import { Mesh } from 'three';

var scene;
var camera;
var renderer;
var controls;
var gui;

var skydom;
var skydomWithTexture;
var skydomTexture;

const skyboxPath = 'skybox/clouds1/' ;
const front = "clouds1_north.bmp";
const back = "clouds1_south.bmp";
const up = "clouds1_up.bmp";
const down = "clouds1_down.bmp";
const right = "clouds1_east.bmp";
const left = "clouds1_west.bmp";
var skyboxTexture;

var planeMesh;

var ambientLight;
var ambientLightColor = new THREE.Color(0xffffff);
var hemiLight;
var hemiLightSkyColor = new THREE.Color(0xffffff);
var hemiLightGroundColor = new THREE.Color(0x444444);
var dirLight;
var dirLightColor  = new THREE.Color(0xffffff );

function init() {
    scene = new THREE.Scene();
    // scene.background = new THREE.Color( 0xa0a0a0 );
    
                    
    // scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    scene.fog = new THREE.Fog( 0xaaaaaa, 15, 50 );
    scene.fog.isFog = true;

    //camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;
    camera.position.y = 2;
        // camera.rotation.set(0, -90, 0);
    //renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; //PCFSoftShadowMap;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //objects
    // const geometryPlatform = new THREE.BoxGeometry( 30, 0.1, 30 );
    // const materialPlatform = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );
    // const cubePlatform = new THREE.Mesh( geometryPlatform, materialPlatform );
    // cubePlatform.position.set(0,-0.55,0);
    // cubePlatform.receiveShadow = true;
    // scene.add( cubePlatform );

    // ground


    planeMesh = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshStandardMaterial( { color: 0x97935C, depthWrite: true } ) );
    planeMesh.position.y = -0.50
    planeMesh.rotation.x = - Math.PI / 2;
    planeMesh.receiveShadow = true;
    scene.add( planeMesh );

    // const groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
    // const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff, depthWrite: false } );
    // groundMat.color.setHSL( 0.095, 1, 0.75 );
    // const ground = new THREE.Mesh( groundGeo, groundMat );
    // ground.rotation.x = - Math.PI / 2;
    // ground.receiveShadow = true;
    // scene.add(ground);

    

    createSkydom();

    //skybox texture
    // scene.background = skyboxTexture;
   

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const matParams = {
        color: 0x00ff00,
        emissive: 0x000000,
        roughness: 1.0, //0-1
        metalness: 0.0, //0-1
        reflectivity: 0.5, //0-1
        wireframe: false,
    };
    const material = new THREE.MeshPhysicalMaterial ( matParams );
    const cube = new THREE.Mesh( geometry, material );
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add( cube );


    //OrbitControls
    controls = new OrbitControls( camera, renderer.domElement );

        // controls.target.set( 0, 0.5, 0 ); 
    controls.target.set(cube.position.x,cube.position.y,cube.position.z  ); 

    controls.enablePan = false;
    controls.panSpeed = 1;
        // Defines how the camera's position is translated when panning.
        // If true, the camera pans in screen space. Otherwise, the camera pans in the plane orthogonal to the camera's up direction. 
        // Default is true for OrbitControls; false for MapControls.
    controls.screenSpacePanning = true;

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.enableRotate = true;
    controls.rotateSpeed = 1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 4;

    //horizontal angle
    controls.maxAzimuthAngle = Infinity;
        // 1 * Math.PI
    controls.minAzimuthAngle = -Infinity;

    //vertical angle
    controls.maxPolarAngle = 0.52* Math.PI;
    controls.minPolarAngle = 0.3* Math.PI;


    controls.enableZoom = true;
    controls.zoomSpeed = 1;
        //only perspective camera
    controls.maxDistance = 5;
    controls.minDistance = 1;


    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    }

    controls.update();

    //lights
    createAmbientLight();

    // const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    // hemiLight.position.set( 0, 20, 0 );
    // scene.add( hemiLight );


    createHemiLight();

    // const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    // scene.add( hemiLightHelper );

    createDirLight();
    
}

function createDirLight() {
    
    dirLight = new THREE.DirectionalLight( dirLightColor);
    dirLight.position.set( - 3, 10, - 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    // // //Set up shadow properties for the light
    dirLight.shadow.mapSize.width = 512; // default
    dirLight.shadow.mapSize.height = 512; // default
    // dirLight.shadow.camera.near = 0.5; // default
    // dirLight.shadow.camera.far = 500; // default
    scene.add( dirLight );
}

function createAmbientLight() {
   
    ambientLight = new THREE.AmbientLight( ambientLightColor ,1 ); // soft white light
    scene.add( ambientLight );
}

function createHemiLight() {
    hemiLight = new THREE.HemisphereLight( hemiLightSkyColor, hemiLightGroundColor , 1 );
    // hemiLight.color.setHSL( 0.6, 1, 0.6 );
    // hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );
}

function createSkydom() {

    //skydome

    const skyGeo = new THREE.SphereGeometry( 40, 32, 16 );
    const skyMat = new THREE.MeshPhongMaterial( { color: 0x0000ff } );
    skydom = new THREE.Mesh( skyGeo, skyMat );
    skydom.material.side = THREE.BackSide;
    scene.add( skydom );
}
function createSkydomWithTexture()  {
//skydome texture
    // var loader  = new THREE.TextureLoader();
    // skydomTexture = loader.load( "skydome/philo_sky1_2k.jpg" );
    const skyGeo = new THREE.SphereGeometry( 40, 32, 16 );
    const skyMat = new THREE.MeshPhongMaterial( { map: skydomTexture } );
    skydomWithTexture = new THREE.Mesh( skyGeo, skyMat );
    skydomWithTexture.material.side = THREE.BackSide;
    scene.add( skydomWithTexture );

}


function createGui() {
    gui = new GUI();
    const skyFolder = gui.addFolder('Skies');

    const api ={};
    api.sky = 'skydom';
    const skies = ['skydom','skydom with texture','skybox with texture'];

    
    const clipCtrl = skyFolder.add( api, 'sky' ).options( skies );

    clipCtrl.onChange( function () {

        scene.remove(skydom);
        scene.remove(skydomWithTexture);
        scene.background = new THREE.Color( 0xa0a0a0 );

        if(api.sky === 'skydom')
        {
            createSkydom();
        }
        else if(api.sky === 'skydom with texture'){
            createSkydomWithTexture();
        }
        else if(api.sky === 'skybox with texture')
        {
            scene.background = skyboxTexture;
        }

    } );

    skyFolder.open();

    //----------------
    const cameraPositionsFolder = gui.addFolder('camera Positions');
    api.cameraPosition = 'Position 0';
    const camerapositionNames = ['Position 0','Position 1'];
    const cameraPositions = [ [1,2,5], [1,1,1] ]
    const clipCtrl2 = cameraPositionsFolder.add( api, 'cameraPosition' ).options( camerapositionNames );
    clipCtrl2.onChange( function () {
        if(api.cameraPosition == 'Position 0')
        {
            tweenCamera(camera, cameraPositions[0],  3000);
        }
        else if(api.cameraPosition == 'Position 1'){
            tweenCamera(camera, cameraPositions[1],  3000);
        }
    })

    //--------------
    api['plane color'] = planeMesh.material.color.getHex();
    
    // console.log(planeMesh.color, planeMesh.color.toHex());
    gui.addColor( api, 'plane color' ).onChange( function ( val ) {

        planeMesh.material.color.setHex( val );
        // console.log(val);

    } );
    //--------------
    api['autorotate'] = true;
    
    // console.log(planeMesh.color, planeMesh.color.toHex());
    gui.add( api, 'autorotate' ).onChange( function ( val ) {

        controls.autoRotate = val;

    } );
    //---------------
    const ambientFolder = gui.addFolder('Ambient  Light');
    api['ambient Light'] = true;
    ambientFolder.add( api, 'ambient Light' ).onChange( function ( val ) {

        if(val)
        {
            createAmbientLight();
        }
        else {
            scene.remove(ambientLight);
        }

    } );
    //---------------
    api['ambient Color'] = ambientLightColor.getHex();
    ambientFolder.addColor( api, 'ambient Color' ).onChange( function ( val ) {
        ambientLightColor.setHex(val);
        ambientLight.color.setHex(val);

    } );
    //---------------
    const hemiFolder = gui.addFolder('Hemi Light');
    api['hemi Light'] = true;
    hemiFolder.add( api, 'hemi Light' ).onChange( function ( val ) {

        if(val)
        {
            createHemiLight();
        }
        else {
            scene.remove(hemiLight);
        }

    } );
    //-----------------
    api['hemi Sky Color'] = hemiLightSkyColor.getHex();
    hemiFolder.addColor( api, 'hemi Sky Color' ).onChange( function ( val ) {
        hemiLightSkyColor.setHex(val);
        hemiLight.color.setHex(val);

    } );
    //-----------------
    api['hemi Ground Color'] = hemiLightGroundColor.getHex();
    gui.addColor( api, 'hemi Ground Color' ).onChange( function ( val ) {
        hemiLightGroundColor.setHex(val);
        hemiLight.groundColor.setHex(val);

    } );
    //---------------
    const dirFolder = gui.addFolder('Dir Light');
    api['dir Light'] = true;
    dirFolder.add( api, 'dir Light' ).onChange( function ( val ) {

        if(val)
        {
            createDirLight();
        }
        else {
            scene.remove(dirLight);
        }

    } );
    //---------------
    api['dir Color'] = dirLightColor.getHex();
    dirFolder.addColor( api, 'dir Color' ).onChange( function ( val ) {
        dirLightColor.setHex(val);
        dirLight.color.setHex(val);

    } );
}



window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

};



function animate() {
	requestAnimationFrame( animate );

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    TWEEN.update();
    // camera.lookAt(scene.position);
    controls.update();

	renderer.render( scene, camera );
}

function tweenCamera(camera, position, duration) {        
    new TWEEN.Tween(camera.position).to({
      x: position[0],
      y: position[1],
      z: position[2]
    }, duration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start();

}


var loaderPromise = new Promise(function(resolve, reject) {
    function loadDone(x) {
        console.log("loader successfully completed loading task");
        resolve(x); // it went ok!
    }
     //skybox

    // 'px.png',
    // 	'nx.png',
    // 	'py.png',
    // 	'ny.png',
    // 	'pz.png',
    // 	'nz.png'
    const loader = new THREE.CubeTextureLoader();
    skyboxTexture = loader.setPath(skyboxPath).load( [
        right,
        left,
        up,
        down,
        front,
        back
    ],loadDone );

    // scene.background = new THREE.CubeTextureLoader()
    //     .setPath(skyboxPath )
    //     .load( [
    //         right,
    //         left,
    //         up,
    //         down,
    //         front,
    //         back
    //     ],loadDone );
});

var loaderPromise2 = new Promise(function(resolve, reject) {
    function loadDone(x) {
        console.log("loader 2 successfully completed loading task");
        resolve(x); // it went ok!
    }
 
    var loader  = new THREE.TextureLoader();
    skydomTexture = loader.load( "skydome/philo_sky1_2k.jpg",loadDone );

});


Promise.allSettled([loaderPromise,loaderPromise2])
    .then(function(response) {
        document.getElementById('lds-ring').style.display = "none";
        // spriteMap = response; //assign loaded image data to a variable

        init();
        createGui();
        animate();
        
    }, function(err) {
        console.log(err);
    });