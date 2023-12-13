
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Text } from 'troika-three-text';
import gsap, { Power1 } from 'gsap';

import vertexPlaneShader from '../shaders/planes/vertex.glsl';
import fragmentPlaneShader from '../shaders/planes/fragment.glsl';
import vertexBackgroundShader from '../shaders/background/vertex.glsl';
import fragmentBackgroundShader from '../shaders/background/fragment.glsl';
import vertexParticulesShader from '../shaders/particules/vertex.glsl';
import fragmentParticulesShader from '../shaders/particules/fragment.glsl';


//-------------------------------------------------------------------------------------------------------------------
// Global varibale
//-------------------------------------------------------------------------------------------------------------------


// HTML elements
const player = document.querySelector(".player");
const playerClose = document.querySelector(".player-close");
const playerSource = document.querySelector(".player-source");
const counterLoading = document.querySelector(".counterLoading");
const header = document.querySelector("header");
const h1 = document.querySelector("h1");
const footer = document.querySelector("footer");
const loading = document.querySelector(".loading");
const started = document.querySelector(".started");
const startedBtn = document.querySelector(".started-btn");

// Variables
let touchValue = 1;
let videoLook = false;
let scrollI = 0.0;
let initialPositionMeshY = -1;
let initialRotationMeshY = Math.PI * 0.9;
let planeClickedIndex = -1;
let isLoading = false;
let lastPosition = {
    px: null,
    py: null,
    pz: null,
    rx: null,
    ry: null,
    rz: null
};

// Array
let detailsImage = [
    {
        url: "https://www.youtube.com/watch?v=87MPqPynrXc",
        name: "Transformation Dark Vador\n - Anakin devient Dark Vador"
    },
    {
        url: "https://www.youtube.com/watch?v=FX8rsh83bGk",
        name: "Arrivée Dark Vador\n Étoile de la Mort"
    },
    {
        url: "https://www.youtube.com/watch?v=wxL8bVJhXCM",
        name: "Darth Vader's rage"
    },
    {
        url: "https://www.youtube.com/watch?v=Ey68aMOV9gc",
        name: "VADER EPISODE 1: SHARDS\n OF THE PAST"
    },
    {
        url: "https://www.youtube.com/watch?v=3vZsVKD8BQg",
        name: "Je suis ton père!"
    },
    {
        url: "https://www.youtube.com/watch?v=7Zp66FhjlPU",
        name: "Darth Vader Goes Shopping"
    },
    {
        url: "https://www.youtube.com/watch?v=68vPtAE3cZE",
        name: "Votre manque de foi\n me consterne"
    },
    {
        url: "https://www.youtube.com/watch?v=kocd_C2M9RU",
        name: "LA SOUFFRANCE MÈNE\n AU CÔTÉ OBSCUR"
    },
    {
        url: "https://www.youtube.com/watch?v=k21ONzrwVLY",
        name: "Lord Vader: A Star\n Wars Story"
    },
    {
        url: "https://www.youtube.com/watch?v=JucYYmeh_QY",
        name: 'Dark vador "Hommage"'
    }
];



//-------------------------------------------------------------------------------------------------------------------
// Base
//-------------------------------------------------------------------------------------------------------------------

// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector(".main-webgl")

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color("#fff")

// Background Scene
const backgroundScene = new THREE.Scene()

// Sizes
const sizesCanvas = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Update sizes on window resize
window.addEventListener("resize", () => {
    sizesCanvas.width = window.innerWidth
    sizesCanvas.height = window.innerHeight
})

// Raycaster
const raycatser = new THREE.Raycaster()
let currentIntersect = null

// Mouse move
let mouse = new THREE.Vector2()

window.addEventListener("mousemove", e => {
    mouse.x = e.clientX / sizesCanvas.width * 2 - 1
    mouse.y = - (e.clientY / sizesCanvas.height) * 2 + 1
})

// Audio
const music = new Audio("sounds/music.mp3")
music.volume = 0.05

const respiration = new Audio("sounds/respiration.mp3")
respiration.volume = 0.01

//-------------------------------------------------------------------------------------------------------------------
// Loaders
//-------------------------------------------------------------------------------------------------------------------

class LoadingManager {
    constructor() {
        this.manager = new THREE.LoadingManager(
            this.onLoaded.bind(this),
            this.onProgress.bind(this)
        );
    }

    onLoaded() {
        setTimeout(() => {
            gsap.to(header, 0.5, {
                top: 10,
                left: 10,
                transform: "translate(0, 0)",
                ease: Power1.easeIn
            });

            gsap.to(h1, 0.5, {
                fontSize: 25,
                top: 10,
                left: 10,
                transform: "translate(0, 0)",
                width: 150,
                ease: Power1.easeIn
            });

            gsap.to(footer, 0.5, {
                delay: 0.4,
                opacity: 1,
                ease: Power1.easeIn
            });

            gsap.to(counterLoading, 0.5, {
                delay: 0.4,
                opacity: 0,
                ease: Power1.easeIn
            });

            gsap.to(started, 0.5, {
                delay: 0.9,
                opacity: 1
            });

            startedBtn.addEventListener("click", () => continueAnimation());
        }, 50);
    }

    onProgress(itemUrl, itemsLoaded, itemsTotal) {
        const progressRatio = itemsLoaded / itemsTotal;

        counterLoading.innerHTML = `${(progressRatio * 100).toFixed(0)}%`;
        header.style.width = `${(progressRatio * 550).toFixed(0)}px`;
    }
}

const loadingManager = new LoadingManager();

const startAnimation = () => {
    music.play()
    respiration.play()

    gsap.to(started, 0.5, {
        opacity: 0
    })

    gsap.to(loading, 0.5, {
        opacity: 0
    })

    gsap.from(camera.position, 1.5, {
        x: 4.0,
        z: - 8.5,
        y: 3.0
    })

    setTimeout(() => {
        loading.style.visibility = "hidden"
        started.style.visibility = "hidden"
        groupPlane.visible = true
        groupText.visible = true
        isLoading = true
    }, 250);
}

const textureLoader = new THREE.TextureLoader(loadingManager)

const loadImages = (paths) => {
    return Promise.all(paths.map(path => textureLoader.load(path)))
}

const imagePaths = [
    "./images/img1.jpg",
    "./images/img2.jpg",
    "./images/img3.jpg",
    "./images/img4.jpg",
    "./images/img5.jpg",
    "./images/img6.jpg",
    "./images/img7.jpg",
    "./images/img8.jpg",
    "./images/img9.jpg",
    "./images/img10.jpg"
]

loadImages(imagePaths).then(images => {
    startAnimation()
})

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const loadngManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadngManager);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

const models = [];
const debgObject = { envMapIntensity: 5 };

const loadModel = (url, positionY, rotationY, onLoad) => {
 gltfLoader.load(
    url,
    (gltf) => {
      gltf.scene.scale.set(12, 12, 12);
      gltf.scene.position.y = positionY;
      gltf.scene.rotation.y = rotationY;

      scene.add(gltf.scene);
      models.push(gltf.scene);

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.envMapIntensity = debgObject.envMapIntensity;
          child.material.needsUpdate = true;
        }
      });

      onLoad && onLoad(gltf);
    },
    undefined,
    (err) => {
      console.log(err);
    }
 );
};

// Load models
loadModel("models/Dark_vador/scene.gltf", initialPositionMeshY, initialRotationMeshY);
loadModel("models/Rock/scene.gltf", initialPositionMeshY - 1.73, initialRotationMeshY, () => {
 const handleScroll = (e, isTouchEvent, touchStartY, scrollDirection) => {
    if (isTouchEvent) {
      const touchCurrentY = e.touches[0].clientY;
      const scrollDistance = touchStartY - touchCurrentY;

      if (scrollDirection === "up") {
        animationScroll(e, scrollDistance);
      } else {
        animationScroll(e, scrollDistance);
      }
    } else {
      const scrollDistance = e.deltaY;
      animationScroll(e, scrollDistance);
    }
 };

 if ("ontouchstart" in window) {
    let startTouch = 0;

    window.addEventListener('touchstart', (e) => {
      startTouch = e.touches[0].clientY;
    }, false);

    window.addEventListener('touchmove', (e) => {
      handleScroll(e, true, startTouch, startTouch < e.touches[0].clientY ? "up" : "down");
    }, false);

 } else {
    window.addEventListener("wheel", (e) => handleScroll(e, false, null, null), false);
 }
});

import { Mesh, OrthographicCamera, PlaneBufferGeometry, PerspectiveCamera, Scene, ShaderMaterial, Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { vertexBackgroundShader, fragmentBackgroundShader, vertexPlaneShader, fragmentPlaneShader } from './shaders';
import Text from './Text';

class SceneSetup {
 constructor(canvas, sizesCanvas) {
    this.canvas = canvas;
    this.sizesCanvas = sizesCanvas;
    this.scrollI = 0;
    this.touchValue = 0;
    this.scene = new Scene();
    this.camera = this.createCamera();
    this.controls = this.createControls();
    this.backgroundCamera = this.createBackgroundCamera();
    this.createLights();
    this.createModels();
 }

 createCamera() {
    const camera = new PerspectiveCamera(75, this.sizesCanvas.width / this.sizesCanvas.height, 0.1, 100);
    camera.position.set(0, 0, -5);
    return camera;
 }

 createControls() {
    const controls = new OrbitControls(this.camera, this.canvas);
    controls.enabled = false;
    controls.enableZoom = false;
    return controls;
 }

 createBackgroundCamera() {
    return new OrthographicCamera(-1, 1, 1, -1, -1, 0);
 }

 createLights() {
    const ambientLight = new THREE.AmbientLight(0xff0000, 1.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 15);
    pointLight.position.set(-5.5, 5.5, -5);
    this.scene.add(pointLight);
 }

 createModels() {
    this.createBackground();
    this.createPlanesAndText();
 }

 createBackground() {
    const backgroundPlane = new PlaneBufferGeometry(2, 2);
    const backgroundMaterial = new ShaderMaterial({
      vertexShader: vertexBackgroundShader,
      fragmentShader: fragmentBackgroundShader,
      uniforms: {
        uScrollI: { value: this.scrollI },
        uResoltion: { value: new Vector2(this.sizesCanvas.width, this.sizesCanvas.height) },
        uTime: { value: 0.0 }
      }
    });

    this.backgroundScene = new Scene();
    this.backgroundScene.add(new Mesh(backgroundPlane, backgroundMaterial));
 }

 createPlanesAndText() {
    this.groupPlane = new THREE.Group();
    this.groupText = new THREE.Group();
    this.groupPlane.visible = false;
    this.groupText.visible = false;
    this.scene.add(this.groupPlane, this.groupText);

    const planeGeometry = new PlaneGeometry(2, 1.25, 32, 32);
    this.planesMaterial = [];

    for (let i = 0; i < 10; i++) {
      this.planesMaterial.push(new ShaderMaterial({
        side: THREE.DoubleSide,
        vertexShader: vertexPlaneShader,
        fragmentShader: fragmentPlaneShader,
        uniforms: {
          uScrollI: { value: this.scrollI },
          uTexture: { value: images[i] },
          uTime: { value: 0.0 },
          uTouch: { value: this.touchValue }
        }
      }));

      const plane = new Mesh(planeGeometry, this.planesMaterial[i]);
      plane.position.setFromSphericalCoords(1, i * Math.PI / 5, - Math.PI / 2);
      plane.lookAt(0, plane.position.y, 0);
      
      this.groupPlane.add(plane);

      const newText = new Text();
      newText.text = detailsImage[i].name;
      newText.fontSize = 0.1;
      newText.position.copy(plane.position);
      
      this.groupText.add(newText);
    }
 }
}

export default SceneSetup;

//-------------------------------------------------------------------------------------------------------------------
// Particules
//-------------------------------------------------------------------------------------------------------------------

function createParticules() {
    const particuleGeometry = new THREE.BufferGeometry()
    const particulesCount = 30
    const particulesPositions = new Float32Array(particulesCount * 3)
    const particulesScales = new Float32Array(particulesCount)

    for (let i = 0; i < particulesCount; i++) {
        const i3 = i * 3

        particulesPositions[i3] = (Math.random() - 0.5) * 10
        particulesPositions[i3 + 1] = (Math.random() * 1.5) - 2
        particulesPositions[i3 + 2] = ((Math.random() - 0.5) * 10) + 2.5

        particulesScales[i] = Math.random()
    }

    particuleGeometry.setAttribute("position", new THREE.BufferAttribute(particulesPositions, 3))
    particuleGeometry.setAttribute("aScale", new THREE.BufferAttribute(particulesScales, 1))

    const particulesMaterial = new THREE.ShaderMaterial({
        blanding: THREE.AdditiveBlending,
        vertexShader: vertexParticulesShader,
        fragmentShader: fragmentParticulesShader,
        uniforms: {
            uTime: { value: 0.0 },
            uSize: { value: 10.0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        }
    })

    const particules = new THREE.Points(particuleGeometry, particulesMaterial)
    return particules
}

const particules = createParticules()
scene.add(particules)

//-------------------------------------------------------------------------------------------------------------------
// Renderer
//-------------------------------------------------------------------------------------------------------------------

function createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizesCanvas.width, sizesCanvas.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.autoClear = false
    return renderer
}

const renderer = createRenderer(canvas)


//-------------------------------------------------------------------------------------------------------------------
// Animation
//-------------------------------------------------------------------------------------------------------------------

const animationScroll = (e, touchEvent, value, downOrUp) => {
    let deltaY;

    if (touchEvent) deltaY = value;
    else deltaY = e.deltaY;

    if (videoLook === false && isLoading) {
        if (scrollI <= 435 && scrollI >= 0 && models.length === 2) {
            updateMeshAndPlanes(touchEvent, downOrUp, deltaY);
        }
    }
}

const updateMeshAndPlanes = (touchEvent, downOrUp, deltaY) => {
    const scrollSpeed = 0.005;

    updateMesh(deltaY, scrollSpeed);
    updatePlanesAndText(touchEvent, downOrUp, scrollSpeed);
}

const updateMesh = (deltaY, scrollSpeed) => {
    models.forEach((model, index) => {
        // rotation
        model.rotation.y = (initialRotationMeshY) - scrollI * 0.01355; // End front of camera

        // position
        if (index === 0) model.position.y = (initialPositionMeshY) - scrollI * (scrollSpeed * 0.8);
        else if (index === 1) model.position.y = (initialPositionMeshY - 1.73) - scrollI * (scrollSpeed * 0.8);

        model.position.z = - scrollI * (scrollSpeed * 0.75);
    });
}

const updatePlanesAndText = (touchEvent, downOrUp, scrollSpeed) => {
    for (let i = 0; i < groupPlane.children.length; i++) {
        const plane = groupPlane.children[i];
        const text = groupText.children[i];

        // Planes -------
        // Position
        plane.position.z = - Math.sin(i + 1 * scrollI * (scrollSpeed * 10)) * Math.PI;
        plane.position.x = - Math.cos(i + 1 * scrollI * (scrollSpeed * 10)) * Math.PI;
        plane.position.y = (i - 14.2) + (scrollI * (scrollSpeed * 10));

        // Rotation
        plane.lookAt(0, plane.position.y, 0);

        // Text -------
        // Position
        text.position.z = plane.position.z - 0.5;
        text.position.x = plane.position.x;
        text.position.y = plane.position.y - 0.3;

        // Rotation
        text.lookAt(plane.position.x * 2, plane.position.y - 0.3, plane.position.z * 2);
    }
}

function getVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);

    return (match && match[2].length === 11)
      ? match[2]
      : null;
}

// Extracted to handle multiple events
const handlePlaneClick = (index) => {
    music.pause()
    respiration.pause()

    const plane = groupPlane.children[index]
    lastPosition = plane.position.clone()

    const {x, y, z} = camera.position
    gsap.to(plane.position, 0.5, {
        z: z + 0.5,
        x, y,
        ease: Power1.easeIn
    })

    gsap.to(plane.rotation, 0.5, {
        z: 0, x: 0, y: 0,
        ease: Power1.easeIn
    })

    const videoId = getVideoId(detailsImage[index].url)
    playerSource.src = "https://www.youtube.com/embed/" + videoId

    setTimeout(() => {
        player.style.visibility = "visible"
        gsap.to(player, 0.5, {opacity: 1, ease: Power1.easeIn})
    }, 400)

    videoLook = true
}

const handlePlaneClose = () => {
    playerSource.src = ""
    music.play()
    respiration.play()

    gsap.to(player, 0.5, {opacity: 0, ease: Power1.easeIn})
    player.style.visibility = "hidden"

    gsap.to(groupPlane.children[planeClickedIndex].position, 0.5, {
        x: lastPosition.x,
        y: lastPosition.y,
        z: lastPosition.z,
        ease: Power1.easeIn
    })

    gsap.to(groupPlane.children[planeClickedIndex].rotation, 0.5, {
        x: lastPosition.rx,
        y: lastPosition.ry,
        z: lastPosition.rz,
        ease: Power1.easeIn
    })

    planeClickedIndex = -1

    setTimeout(() => {
        videoLook = false
    }, 500)
}

// Updated to use extracted function
window.addEventListener("click", () => {
    if (currentIntersect && videoLook === false && isLoading) {
        for (let i = 0; i < groupPlane.children.length; i++) {
            if (groupPlane.children[i] === currentIntersect.object) {
                handlePlaneClick(i)
                break
            }
        }
    }
})

playerClose.addEventListener("click", handlePlaneClose)


let goalValue = 0;

const changeTouchValue = (index) => {
    if (index >= 0) {
        const interval = setInterval(() => {
            if (goalValue === 1) touchValue += 0.01;
            else if (goalValue === 0) touchValue -= 0.01;

            groupPlane.children[index].material.uniforms.uTouch.value = touchValue;

            if (parseFloat(touchValue.toFixed(1)) === goalValue) {
                clearInterval(interval);
                goalValue = goalValue === 0 ? 1 : 0;
            }
        }, 7);
    }
}

const clock = new THREE.Clock();

let callChangeTouchValue = 0;
let touchI = -1;

const update = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update shaders
    planesMaterial.forEach(plane => {
        plane.uniforms.uTime.value = elapsedTime;
        plane.uniforms.uScrollI.value = scrollI;
    });
    backgroundMaterial.uniforms.uScrollI.value = scrollI;
    backgroundMaterial.uniforms.uTime.value = elapsedTime;
    particulesMaterial.uniforms.uTime.value = elapsedTime;

    // Upadate raycaster
    if (!("ontouchstart" in window)) raycatser.setFromCamera(mouse, camera);
    const intersects = raycatser.intersectObjects(groupPlane.children);

    // black and white to colo animation with raycaster
    if (isLoading) {
        if (intersects.length === 1) {
            if (currentIntersect === null) {
                currentIntersect = intersects[0];
            } else {
                for (let i = 0; i < groupPlane.children.length; i++) {
                    if (groupPlane.children[i] === currentIntersect.object) {
                        if (callChangeTouchValue === 0) {
                            touchI = i;
                            changeTouchValue(i);
                            callChangeTouchValue = 1;
                            document.body.style.cursor = "pointer";
                        }
                    }
                }
            }
        } else {
            if (callChangeTouchValue === 1 && touchI >= 0) {
                changeTouchValue(touchI);
                callChangeTouchValue = 0;
                document.body.style.cursor = "auto";
                currentIntersect = null;
                touchI = -1;
            }
        }
    }

    // Update renderer
    renderer.render(scene, camera);
    renderer.render(backgroundScene, backgroundCamera);
}

const animate = () => {
    update();
    requestAnimationFrame(animate);
}

animate();