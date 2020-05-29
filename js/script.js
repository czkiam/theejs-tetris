import * as THREE from "../build/three.module.js";

import { OrbitControls } from "../libs/jsm/controls/OrbitControls.js";
import { SceneUtils } from "../libs/jsm/utils/SceneUtils.js";
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
  Tetris.camera.position.set(-1000, 12, 1200);
  // Tetris.camera.position.y = 100;
  //Tetris.camera.position.z = 1100;

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

  Tetris.Board.init(
    Tetris.boundingBoxConfig.splitX,
    Tetris.boundingBoxConfig.splitY,
    Tetris.boundingBoxConfig.splitZ
  );

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

  Tetris.Block.generate();
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
      Tetris.Block.move(0, 0, -1);
    }

    if (Tetris.gameOver) Tetris.animate = false;
  }

  requestAnimationFrame(update);
  Tetris.renderer.render(Tetris.scene, Tetris.camera);
  Tetris.stats.update();
}

Tetris.staticBlocks = [];
Tetris.zColors = [
  0x6666ff,
  0x66ffff,
  0xcc68ee,
  0x666633,
  0x66ff66,
  0x9966ff,
  0x00ff66,
  0x66ee33,
  0x003399,
  0x330099,
  0xffa500,
  0x99ff00,
  0xee1289,
  0x71c671,
  0x00bfff,
  0x666633,
  0x669966,
  0x9966ff,
];

// test in dev console
// var i = 0,j = 0,k = 0,interval = setInterval(function () {if (i == 6) {i = 0;j++;}if (j == 6) {j = 0;k++;}if (k == 20) {clearInterval(interval);return;}console.log(`block(${i}, ${j}, ${k})`);Tetris.addStaticBlock(i, j, k);i++;}, 30);

Tetris.addStaticBlock = function (x, y, z) {
  if (Tetris.staticBlocks[x] === undefined) Tetris.staticBlocks[x] = [];
  if (Tetris.staticBlocks[x][y] === undefined) Tetris.staticBlocks[x][y] = [];

  var mesh = SceneUtils.createMultiMaterialObject(
    new THREE.CubeGeometry(
      Tetris.blockSize,
      Tetris.blockSize,
      Tetris.blockSize
    ),
    [
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        flatShading: true,
        wireframe: true,
        transparent: true,
      }),
      new THREE.MeshBasicMaterial({ color: Tetris.zColors[z] }),
    ]
  );

  mesh.position.x =
    (x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize +
    Tetris.blockSize / 2;
  mesh.position.y =
    (y - Tetris.boundingBoxConfig.splitY / 2) * Tetris.blockSize +
    Tetris.blockSize / 2;
  mesh.position.z =
    (z - Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize +
    Tetris.blockSize / 2;
  mesh.overdraw = true;

  Tetris.scene.add(mesh);
  Tetris.staticBlocks[x][y][z] = mesh;
};

Tetris.currentPoints = 0;
Tetris.addPoints = function (n) {
  Tetris.currentPoints += n;
  Tetris.pointsDOM.innerHTML = Tetris.currentPoints;
  Cufon.replace("#points");
};

function resize() {
  Tetris.camera.aspect = window.innerWidth / window.innerHeight;
  Tetris.camera.updateProjectionMatrix();
  Tetris.renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("load", Tetris.init);

//Tetris Block Logic
Tetris.Utils = {};

Tetris.Utils.cloneVector = function (v) {
  return { x: v.x, y: v.y, z: v.z };
};

Tetris.Utils.cloneVector3 = function (v) {
  return new THREE.Vector3(v.x, v.y, v.z);
};

Tetris.Utils.roundVector = function (v) {
  v.x = Math.round(v.x);
  v.y = Math.round(v.y);
  v.z = Math.round(v.z);
};

Tetris.Block = {};

Tetris.Block.shapes = [
  [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 1, y: 1, z: 0 },
    { x: 1, y: 2, z: 0 },
  ],
  [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 2, z: 0 },
  ],
  [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 1, y: 1, z: 0 },
  ],
  [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 2, z: 0 },
    { x: 1, y: 1, z: 0 },
  ],
  [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 1, y: 1, z: 0 },
    { x: 1, y: 2, z: 0 },
  ],
];

Tetris.Block.position = {};

Tetris.Block.generate = function () {
  var geometry, tmpGeometryMesh;

  var type = Math.floor(Math.random() * Tetris.Block.shapes.length);
  this.blockType = type;

  Tetris.Block.shape = [];
  for (var i = 0; i < Tetris.Block.shapes[type].length; i++) {
    Tetris.Block.shape[i] = Tetris.Utils.cloneVector(
      Tetris.Block.shapes[type][i]
    );
  }

  geometry = new THREE.CubeGeometry();

  tmpGeometryMesh = new THREE.Mesh(
    new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize)
  );

  tmpGeometryMesh.updateMatrix();
  geometry.merge(tmpGeometryMesh.geometry, tmpGeometryMesh.matrix);

  for (var i = 1; i < Tetris.Block.shape.length; i++) {
    tmpGeometryMesh = new THREE.Mesh(
      new THREE.CubeGeometry(
        Tetris.blockSize,
        Tetris.blockSize,
        Tetris.blockSize
      )
    );
    tmpGeometryMesh.position.x = Tetris.blockSize * Tetris.Block.shape[i].x;
    tmpGeometryMesh.position.y = Tetris.blockSize * Tetris.Block.shape[i].y;
    tmpGeometryMesh.updateMatrix(); // as needed
    geometry.merge(tmpGeometryMesh.geometry, tmpGeometryMesh.matrix);
  }

  Tetris.Block.mesh = SceneUtils.createMultiMaterialObject(geometry, [
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      flatShading: true,
      wireframe: true,
      transparent: true,
    }),
    new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  ]);

  // initial position
  Tetris.Block.position = {
    x: Math.floor(Tetris.boundingBoxConfig.splitX / 2) - 1,
    y: Math.floor(Tetris.boundingBoxConfig.splitY / 2) - 1,
    z: 15,
  };

  if (Tetris.Board.testCollision(true) === Tetris.Board.COLLISION.GROUND) {
    Tetris.gameOver = true;
    Tetris.pointsDOM.innerHTML = "GAME OVER";
    //Tetris.sounds["gameover"].play();
    Cufon.replace("#points");
  }

  Tetris.Block.mesh.position.x =
    ((Tetris.Block.position.x - Tetris.boundingBoxConfig.splitX / 2) *
      Tetris.blockSize) /
    2;
  Tetris.Block.mesh.position.y =
    ((Tetris.Block.position.y - Tetris.boundingBoxConfig.splitY / 2) *
      Tetris.blockSize) /
    2;
  Tetris.Block.mesh.position.z =
    (Tetris.Block.position.z - Tetris.boundingBoxConfig.splitZ / 2) *
      Tetris.blockSize +
    Tetris.blockSize / 2;
  Tetris.Block.mesh.rotation.set(0, 0, 0);
  Tetris.Block.mesh.overdraw = true;

  Tetris.scene.add(Tetris.Block.mesh);
}; // end of Tetris.Block.generate()

Tetris.Block.rotate = function (x, y, z) {
  Tetris.Block.mesh.rotation.x += (x * Math.PI) / 180;
  Tetris.Block.mesh.rotation.y += (y * Math.PI) / 180;
  Tetris.Block.mesh.rotation.z += (z * Math.PI) / 180;
  //Tetris.Block.mesh.updateMatrix();
  var rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationFromEuler(Tetris.Block.mesh.rotation);

  for (var i = 0; i < Tetris.Block.shape.length; i++) {
    var newVec3 = Tetris.Utils.cloneVector3(
      Tetris.Block.shapes[this.blockType][i]
    );

    Tetris.Block.shape[i] = newVec3.applyMatrix4(rotationMatrix);

    Tetris.Utils.roundVector(Tetris.Block.shape[i]);
  }

  if (Tetris.Board.testCollision(false) === Tetris.Board.COLLISION.WALL) {
    Tetris.Block.rotate(-x, -y, -z); // laziness FTW
  }
};

Tetris.Block.move = function (x, y, z) {
  Tetris.Block.mesh.position.x += x * Tetris.blockSize;
  Tetris.Block.position.x += x;

  Tetris.Block.mesh.position.y += y * Tetris.blockSize;
  Tetris.Block.position.y += y;

  Tetris.Block.mesh.position.z += z * Tetris.blockSize;
  Tetris.Block.position.z += z;

  var collision = Tetris.Board.testCollision(z != 0);

  if (collision === Tetris.Board.COLLISION.WALL) {
    Tetris.Block.move(-x, -y, 0); // laziness FTW
  }
  if (collision === Tetris.Board.COLLISION.GROUND) {
    Tetris.Block.hitBottom();
    //Tetris.sounds["collision"].play();
    Tetris.Board.checkCompleted();
  } else {
    //Tetris.sounds["move"].play();
  }
};

Tetris.Block.hitBottom = function () {
  Tetris.Block.petrify();
  Tetris.scene.remove(Tetris.Block.mesh);
  Tetris.Block.generate();
};

Tetris.Block.petrify = function () {
  var shape = Tetris.Block.shape;
  for (var i = 0; i < shape.length; i++) {
    Tetris.addStaticBlock(
      Tetris.Block.position.x + shape[i].x,
      Tetris.Block.position.y + shape[i].y,
      Tetris.Block.position.z + shape[i].z
    );

    Tetris.Board.fields[Tetris.Block.position.x + shape[i].x][
      Tetris.Block.position.y + shape[i].y
    ][Tetris.Block.position.z + shape[i].z] = Tetris.Board.FIELD.PETRIFIED;
  }
};

window.addEventListener(
  "keydown",
  function (event) {
    var key = event.which ? event.which : event.keyCode;

    switch (key) {
      case 38: // up (arrow)
        Tetris.Block.move(0, 1, 0);
        break;
      case 40: // down (arrow)
        Tetris.Block.move(0, -1, 0);
        break;
      case 37: // left(arrow)
        Tetris.Block.move(-1, 0, 0);
        break;
      case 39: // right (arrow)
        Tetris.Block.move(1, 0, 0);
        break;
      case 32: // space
        Tetris.Block.move(0, 0, -1);
        break;

      case 87: // up (w)
        Tetris.Block.rotate(90, 0, 0);
        break;
      case 83: // down (s)
        Tetris.Block.rotate(-90, 0, 0);
        break;

      case 65: // left(a)
        Tetris.Block.rotate(0, 0, 90);
        break;
      case 68: // right (d)
        Tetris.Block.rotate(0, 0, -90);
        break;

      case 81: // (q)
        Tetris.Block.rotate(0, 90, 0);
        break;
      case 69: // (e)
        Tetris.Block.rotate(0, -90, 0);
        break;
    }
  },
  false
);

//Tetris board logic
Tetris.Board = {};

Tetris.Board.COLLISION = { NONE: 0, WALL: 1, GROUND: 2 };
Object.freeze(Tetris.Board.COLLISION);

Tetris.Board.FIELD = { EMPTY: 0, ACTIVE: 1, PETRIFIED: 2 };
Object.freeze(Tetris.Board.FIELD);

Tetris.Board.fields = [];

Tetris.Board.init = function (_x, _y, _z) {
  for (var x = 0; x < _x; x++) {
    Tetris.Board.fields[x] = [];
    for (var y = 0; y < _y; y++) {
      Tetris.Board.fields[x][y] = [];
      for (var z = 0; z < _z; z++) {
        Tetris.Board.fields[x][y][z] = Tetris.Board.FIELD.EMPTY;
      }
    }
  }
};

Tetris.Board.testCollision = function (ground_check) {
  var x, y, z, i;

  // shorthands
  var fields = Tetris.Board.fields;
  var posx = Tetris.Block.position.x,
    posy = Tetris.Block.position.y,
    posz = Tetris.Block.position.z,
    shape = Tetris.Block.shape;

  for (i = 0; i < shape.length; i++) {
    // 4 walls detection for every part of the shape
    if (
      shape[i].x + posx < 0 ||
      shape[i].y + posy < 0 ||
      shape[i].x + posx >= fields.length ||
      shape[i].y + posy >= fields[0].length
    ) {
      return Tetris.Board.COLLISION.WALL;
    }

    if (
      fields[shape[i].x + posx][shape[i].y + posy][shape[i].z + posz - 1] ===
      Tetris.Board.FIELD.PETRIFIED
    ) {
      return ground_check
        ? Tetris.Board.COLLISION.GROUND
        : Tetris.Board.COLLISION.WALL;
    }
    if (shape[i].z + posz <= 0) {
      return Tetris.Board.COLLISION.GROUND;
    }
  }
};

Tetris.Board.checkCompleted = function () {
  var x,
    y,
    z,
    x2,
    y2,
    z2,
    fields = Tetris.Board.fields;
  var rebuild = false;

  var sum,
    expected = fields[0].length * fields.length,
    bonus = 0;

  for (z = 0; z < fields[0][0].length; z++) {
    sum = 0;
    for (y = 0; y < fields[0].length; y++) {
      for (x = 0; x < fields.length; x++) {
        if (fields[x][y][z] === Tetris.Board.FIELD.PETRIFIED) sum++;
      }
    }

    if (sum == expected) {
      bonus += 1 + bonus; // 1, 3, 7, 15...

      for (y2 = 0; y2 < fields[0].length; y2++) {
        for (x2 = 0; x2 < fields.length; x2++) {
          for (z2 = z; z2 < fields[0][0].length - 1; z2++) {
            Tetris.Board.fields[x2][y2][z2] = fields[x2][y2][z2 + 1];
          }
          Tetris.Board.fields[x2][y2][fields[0][0].length - 1] =
            Tetris.Board.FIELD.EMPTY;
        }
      }
      rebuild = true;
      z--;
    }
  }
  if (bonus) {
    Tetris.addPoints(1000 * bonus);
  }
  if (rebuild) {
    for (var z = 0; z < fields[0][0].length - 1; z++) {
      for (var y = 0; y < fields[0].length; y++) {
        for (var x = 0; x < fields.length; x++) {
          if (
            fields[x][y][z] === Tetris.Board.FIELD.PETRIFIED &&
            !Tetris.staticBlocks[x][y][z]
          ) {
            Tetris.addStaticBlock(x, y, z);
          }
          if (
            fields[x][y][z] == Tetris.Board.FIELD.EMPTY &&
            Tetris.staticBlocks[x][y][z]
          ) {
            Tetris.scene.removeObject(Tetris.staticBlocks[x][y][z]);
            Tetris.staticBlocks[x][y][z] = undefined;
          }
        }
      }
    }
  }
};
