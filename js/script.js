import * as THREE from "../build/three.module.js";

import { OrbitControls } from "../libs/jsm/controls/OrbitControls.js";
import Stats from "../libs/jsm/libs/stats.module.js";
var clock;

window.Tetris = window.Tetris || {};
Tetris.animate = Tetris.animate || false;
Tetris.sounds = {};
Tetris.stats = Tetris.stats || {};

Tetris.init = function () {
  // set the scene size
  var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

  // set some camera attributes
  var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

  Tetris.scene = new THREE.Scene();
  Tetris.camera = new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    WIDTH / HEIGHT,
    NEAR,
    FAR
  );
  //Tetris.camera.position.set(0, 0, 600);
  //Tetris.camera.position.set(-10, 12, 12);
  // Tetris.camera.position.y = 100;
  Tetris.camera.position.z = 1100;

  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
  Tetris.scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 10, 6);
  Tetris.scene.add(light);

  Tetris.renderer = new THREE.WebGLRenderer();
  Tetris.renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  document.body.appendChild(Tetris.renderer.domElement);

  Tetris.stats = new Stats();
  document.body.appendChild(Tetris.stats.dom);

  clock = new THREE.Clock();

  const controls = new OrbitControls(Tetris.camera, Tetris.renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  //space background
  const assetPath = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/";

  const cubemap = new THREE.CubeTextureLoader()
    .setPath(`${assetPath}skybox1_`)
    .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);

  Tetris.scene.background = cubemap;
  // configuration object
  Tetris.boundingBoxConfig = {
    width: 360,
    height: 360,
    depth: 1200,
    splitX: 6,
    splitY: 6,
    splitZ: 20,
  };

  Tetris.blockSize =
    Tetris.boundingBoxConfig.width / Tetris.boundingBoxConfig.splitX;

  var boundingBox = new THREE.Mesh(
    new THREE.CubeGeometry(
      Tetris.boundingBoxConfig.width,
      Tetris.boundingBoxConfig.height,
      Tetris.boundingBoxConfig.depth,
      Tetris.boundingBoxConfig.splitX,
      Tetris.boundingBoxConfig.splitY,
      Tetris.boundingBoxConfig.splitZ
    ),
    new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true })
  );
  Tetris.scene.add(boundingBox);

  // first render
  Tetris.renderer.render(Tetris.scene, Tetris.camera);

  // //Add meshes here
  // const height = 0.4;
  // const cubeGeometry = new THREE.BoxGeometry(3, height, 0.9);
  // const meshMaterial = new THREE.MeshLambertMaterial({ color: 0xdcbbc7 });

  // const cubeMash = new THREE.Mesh(cubeGeometry, meshMaterial);

  // for (let row = 0; row < 20; row++) {
  //   let yPos = row * (height + 0.05);
  //   let offset = -1;
  //   for (let count = 0; count < 3; count++) {
  //     const block = cubeMash.clone();

  //     if (row % 2) {
  //       block.rotation.y = Math.PI / 2;
  //       block.position.set(offset, yPos - 5, 0);
  //     } else {
  //       block.position.set(0, yPos - 5, offset);
  //     }
  //     Tetris.scene.add(block);
  //     offset++;
  //   }
  // }

  window.addEventListener("resize", resize, false);

  document
    .getElementById("play_button")
    .addEventListener("click", function (event) {
      event.preventDefault();
      Tetris.start();
    });

  update();
};

Tetris.start = function () {
  document.getElementById("menu").style.display = "none";
  Tetris.pointsDOM = document.getElementById("points");
  Tetris.pointsDOM.style.display = "block";

  //Tetris.sounds["theme"].pause();

  //Tetris.Block.generate();
  Tetris.animate = true;
};

Tetris.gameStepTime = 1000;

Tetris.frameTime = 0; // ms
Tetris.cumulatedFrameTime = 0; // ms
Tetris._lastFrameTime = Date.now(); // timestamp

Tetris.gameOver = false;

function update() {
  if (Tetris.animate) {
    var time = Date.now();
    Tetris.frameTime = time - Tetris._lastFrameTime;
    Tetris._lastFrameTime = time;
    Tetris.cumulatedFrameTime += Tetris.frameTime;

    while (Tetris.cumulatedFrameTime > Tetris.gameStepTime) {
      // block movement will go here
      Tetris.cumulatedFrameTime -= Tetris.gameStepTime;
    }

    if (Tetris.gameOver) Tetris.animate = false;
  }

  requestAnimationFrame(update);
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
  Tetris.stats.update();
}

function resize() {
  Tetris.camera.aspect = window.innerWidth / window.innerHeight;
  Tetris.camera.updateProjectionMatrix();
  Tetris.renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("load", Tetris.init);
