 import * as THREE from './libs/three.module.js'
 import { OrbitControls } from './libs/OrbitControls.js'
 import { GLTFLoader } from './libs/GLTFLoader.js'
 import { DRACOLoader } from './libs/DRACOLoader.js';
 import {spriteData} from './spriteData.js';




let init;
let controls,camera,frontCamera,backCamera,renderer,container,scene,camPoint;
let texStore = [];
let spriteArr = [];
let raycaster = new THREE.Raycaster(),mouse = new THREE.Vector2(),SELECTED;
let _T = [
    {
        "url"  : "tex/lobby.png"
    },
    {
         "url"  : "tex/audit.png"
    }
]
$(document).ready(function(){
    let detect = detectWebGL();
    if(detect == 1){
        init = new sceneSetup(45, 1, 50000,-500, 100, 0, 0x919191);
        _T.forEach(element => {        
            texStore.push(init.textureLoad(element.url));
            console.log(texStore);
        });
        init.renderer.domElement.addEventListener('pointerdown', onDocumentMouseDown, true);

        $('.backBtn').on('click',function(){
            init.scene.getObjectByName("globe").material.map = init.textureLoad("tex/Lobby_002.png");
            forShowSprite(spriteData.slice(0,2));
        });
    }else if(detect == 0){       
        alert("PLEASE ENABLE WEBGL IN YOUR BROWSER....");
    }else if(detect == -1){
        alert(detect);
        alert("YOUR BROWSER DOESNT SUPPORT WEBGL.....");
    }
    
  

});
function detectWebGL(){
    // Check for the WebGL rendering context
    if ( !! window.WebGLRenderingContext) {
        var canvas = document.createElement("canvas"),
            names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
            context = false;

        for (var i in names) {
            try {
                context = canvas.getContext(names[i]);
                if (context && typeof context.getParameter === "function") {
                    // WebGL is enabled.
                    return 1;
                }
            } catch (e) {}
        }

        // WebGL is supported, but disabled.
        return 0;
    }

    // WebGL not supported.
    return -1;
};
 let material = {

     carBody : new THREE.MeshPhysicalMaterial( {
        clearcoat: 1.0,
       clearcoatRoughness: 0.1,
      //  metalness: 0.9,
      //  roughness: 0.5,
        color: 0x0000ff
      //  normalMap: normalMap3,
        //normalScale: new THREE.Vector2( 0.15, 0.15 )
    } ),
    cube : new THREE.MeshLambertMaterial({
            //   map:THREE.ImageUtils.loadTexture("assets/Road texture.png"),
               color:0xffffff,
               combine: THREE.MixOperation,
               side: THREE.DoubleSide
            }),            
 }
class sceneSetup{
    constructor(FOV,near,far,x,y,z,ambientColor){
       
        this.container = document.getElementById("canvas");      
        this.scene = new THREE.Scene();
        this.addingCube();
        this.addGlobe();
        this.spriteLoad(spriteData);
        this.camera(FOV,near,far,x,y,z);
        this.ambientLight(ambientColor);     
        this.render();
    }
    camera(FOV,near,far,x,y,z){
        this.cameraMain = new THREE.PerspectiveCamera(FOV, this.container.offsetWidth / this.container.offsetHeight, near, far);
        this.cameraMain.position.set(x,y,z);
        this.cameraMain.lookAt(0,0,0);
        this.scene.add(this.cameraMain); 
        this.rendering();  
    }
    rendering(){
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(0xffff00);
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.container.offsetWidth, this. container.offsetHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;		
        this.container.appendChild( this.renderer.domElement );
        this.controls = new OrbitControls(this.cameraMain , this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target = new THREE.Vector3(this.camPoint.position.x, this.camPoint.position.y, this.camPoint.position.z);
        console.log(this.camPoint);
        this.controls.dampingFactor  =  0.07;
     //   this.controls.minDistance = 100;
     //   this.controls.maxDistance = 300; 
      // this.controls.maxPolarAngle = Math.PI/2 * 115/120;
      // this.controls.minPolarAngle = 140/120;
     //   this.controls.minAzimuthAngle = -280/120;
       // this.controls.maxAzimuthAngle = -115/120; 
    }  
    addingCube(){      
        this.geo = new THREE.BoxBufferGeometry(5,5,5); 
        this.mat = material.cube;
        this.camPoint = new THREE.Mesh(this.geo,this.mat);
        this.scene.add(this.camPoint);
        this.camPoint.position.set(-400,90,0);
    }
    addGlobe(){
        this.geometry = new THREE.SphereGeometry( 1500, 32, 16 );
        this.material = new THREE.MeshLambertMaterial( { 
            map:this.textureLoad("tex/Lobby_001.png"),
            side: THREE.DoubleSide });
        this.sphere = new THREE.Mesh( this.geometry, this.material );
        this.sphere.scale.set(1,1,-1);
        this.sphere.name = "globe";
        this.scene.add( this.sphere );
    }
    ambientLight(ambientColor){
        this.ambiLight = new THREE.AmbientLight(0xffffff);
        this.light= new THREE.HemisphereLight( 0xd1d1d1, 0x080820, 1 );
        //this.scene.add( this.light );
        this.scene.add(this.ambiLight);
    }
    textureLoad(tex){
        let texLoader = new THREE.TextureLoader().load(tex);
        return texLoader;
    }
    spriteLoad(data){
        data.forEach((element,index) => {
            this.map = new THREE.TextureLoader().load( element.src );
            this.material = new THREE.SpriteMaterial( { map: this.map } );
            this.sprite = new THREE.Sprite( this.material );
            this.sprite.position.set(element.posX,element.posY,element.posZ);
            this.sprite.scale.set(75, 75, 75);
            this.sprite.visible = element.vis;
            this.sprite.name = element.name;
            spriteArr.push(this.sprite);
            this.scene.add( this.sprite );
        });
    }
    animate(){   
        requestAnimationFrame(this.animate.bind(this));        
        this.controls.update();
        this.renderer.render(this.scene, this.cameraMain);       
   }
    render(){                
        this.animate();
   }
}

window.addEventListener( 'resize', onWindowResize, false );
function onDocumentMouseDown(event){
    let _getObj = init.scene.getObjectByName("globe");
    event.preventDefault();
    const rect = init.renderer.domElement.getBoundingClientRect();        
    mouse.x = ( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    raycaster.setFromCamera( mouse, init.cameraMain );
    let intersects = raycaster.intersectObjects( spriteArr,true );
    if ( intersects.length > 0 ) {	
        SELECTED = intersects[ 0 ].object;
        switch (SELECTED.name) {
            case "auditorium":
                 _getObj.material.map = init.textureLoad("tex/Auditorium_002.png");
                 forHideSprite(spriteData.slice(0,2));
                break;
            case "exhibitHall":
                _getObj.material.map = init.textureLoad("tex/Exhibit Hall_002.png");
                 forHideSprite(spriteData.slice(0,2));
                break;
            default:
                break;
        }
    }
}
function forHideSprite(data){
     data.forEach(element => {
        init.scene.getObjectByName(element.name).visible = false;
    });
}
function forShowSprite(data){
    data.forEach(element => {
        init.scene.getObjectByName(element.name).visible = true;
    });
}
function onWindowResize(){
    init.cameraMain.aspect = init.container.offsetWidth/ init.container.offsetHeight;
    init.renderer.setSize( init.container.offsetWidth, init.container.offsetHeight  );
    init.cameraMain.updateProjectionMatrix();
}

