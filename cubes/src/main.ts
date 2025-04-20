import * as THREE from 'three';

let rotationSpeed = 0.01; // default cube rotation speed

const SPEED_THRESHOLD = 1.0 // speed above which we switch to spheres

// Geometries
const cubeGeometry = new THREE.BoxGeometry();
const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);

// Materials
const textureLoader = new THREE.TextureLoader();

function createStripeTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // background black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  // draw diagonal orange stripes
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 16;

  for (let i = -size; i < size * 2; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

const leopardTexture = createStripeTexture();

const cubeBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x4e8cff });
const sphereBaseMaterial = new THREE.MeshStandardMaterial({ map: leopardTexture });

// Track current geometry mode
let isSphere = false;

function currentGeometry() {
  return isSphere ? sphereGeometry : cubeGeometry;
}

// Keep track of cubes in the scene
let cubes: THREE.Mesh[] = [];

function init() {
  // Create the scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // Helper to create N cubes and lay them out in a grid
  function createCubes(count: number) {
    // Remove existing cubes
    cubes.forEach((c) => scene.remove(c));
    cubes = [];

    const spacing = 1.5;
    const gridSize = Math.ceil(Math.sqrt(count));

    for (let i = 0; i < count; i++) {
      const material = (isSphere ? sphereBaseMaterial : cubeBaseMaterial).clone();
      if (!isSphere) {
        material.color.offsetHSL(i / count, 0, 0); // slight color variation for cubes
      }
      const cube = new THREE.Mesh(currentGeometry(), material);

      // Position in grid
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      cube.position.set(
        (col - (gridSize - 1) / 2) * spacing,
        (row - (gridSize - 1) / 2) * spacing,
        0
      );

      scene.add(cube);
      cubes.push(cube);
    }
  }

  // Create a camera
  const camera = new THREE.PerspectiveCamera(
    75, // fov
    window.innerWidth / window.innerHeight, // aspect
    0.1, // near
    1000 // far
  );
  camera.position.z = 5;

  // Create the renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add resize handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Move cube with arrow keys
  window.addEventListener('keydown', (event) => {
    const step = 0.1;
    switch (event.key) {
      case 'ArrowUp':
        cubes.forEach((c) => c.position.y += step);
        break;
      case 'ArrowDown':
        cubes.forEach((c) => c.position.y -= step);
        break;
      case 'ArrowLeft':
        cubes.forEach((c) => c.position.x -= step);
        break;
      case 'ArrowRight':
        cubes.forEach((c) => c.position.x += step);
        break;
      case 'q':
      case 'Q':
        rotationSpeed = Math.max(0, rotationSpeed - 0.005);
        if (rotationSpeed < SPEED_THRESHOLD && isSphere) {
          isSphere = false;
          // replace geometries and materials
          cubes.forEach((c) => {
            c.geometry = cubeGeometry;
            c.material = cubeBaseMaterial.clone();
          });
        }
        break;
      case 'w':
      case 'W':
        rotationSpeed += 0.005;
        if (rotationSpeed >= SPEED_THRESHOLD && !isSphere) {
          isSphere = true;
          cubes.forEach((c) => {
            c.geometry = sphereGeometry;
            c.material = sphereBaseMaterial.clone();
          });
        }
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        createCubes(parseInt(event.key, 10));
        break;
    }
  });

  // Initial cubes
  createCubes(1);

  // Add a light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    cubes.forEach((c) => {
      c.rotation.x += rotationSpeed;
      c.rotation.y += rotationSpeed;
    });

    renderer.render(scene, camera);
  }

  animate();
}

init(); 