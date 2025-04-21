import * as THREE from 'three';

export function init() {
  const scene = new THREE.Scene();
  // Darker ambience for dungeon
  scene.background = new THREE.Color(0x111111);
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create a blocky "Roblox‐style" humanoid from basic box geometries

  function createRobloxCharacter(): THREE.Group {
    const group = new THREE.Group();

    // Materials
    const skin = new THREE.MeshStandardMaterial({ color: 0xffe0bd });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x337ab7 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });

    // Head
    const headGeo = new THREE.BoxGeometry(1, 1, 1);
    const head = new THREE.Mesh(headGeo, skin);
    head.position.y = 3.5;
    head.name = 'head';

    // Add a simple face (two eyes and a mouth)
    const featureMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    // Puppy‑style big round eyes (white sclera, black pupil, small shine)
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const scleraGeo = new THREE.CircleGeometry(0.18, 24);
    const pupilGeo = new THREE.CircleGeometry(0.09, 24);
    const shineGeo = new THREE.CircleGeometry(0.03, 16);

    function addPuppyEye(offsetX: number) {
      const sclera = new THREE.Mesh(scleraGeo, whiteMat);
      sclera.position.set(offsetX, 0.12, 0.53);

      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0, 0.02);
      sclera.add(pupil);

      const shine = new THREE.Mesh(shineGeo, shineMat);
      shine.position.set(-0.04, 0.04, 0.025);
      pupil.add(shine);

      head.add(sclera);
    }

    addPuppyEye(-0.24);
    addPuppyEye(0.24);

    // Mouth
    const mouthGeo = new THREE.BoxGeometry(0.3, 0.05, 0.01);
    const mouth = new THREE.Mesh(mouthGeo, featureMaterial);
    mouth.position.set(0, -0.2, 0.51);

    head.add(mouth);
    group.add(head);

    // Stylish blocky hair (top plate, fringe, and sides)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xffe27a }); // blonde

    // Slightly bulkier top hair for a boyish style
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.3), hairMat);
    hairTop.position.y = 0.45; // above the head center
    head.add(hairTop);

    // Removed frontal bangs to avoid eyebrow‑like appearance

    // Add a few short spikes on the top for a casual messy look
    const spikeGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    for (let i = -1; i <= 1; i++) {
      const spike = new THREE.Mesh(spikeGeo, hairMat);
      spike.position.set(i * 0.3, 0.75, 0);
      spike.rotation.x = -Math.PI / 12;
      head.add(spike);
    }

    // Shorter side hair blocks
    const sideGeo = new THREE.BoxGeometry(0.3, 0.5, 1.0);
    const leftSideHair = new THREE.Mesh(sideGeo, hairMat);
    leftSideHair.position.set(-0.8, -0.05, 0);
    const rightSideHair = leftSideHair.clone();
    rightSideHair.position.x = 0.8;
    head.add(leftSideHair, rightSideHair);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.5, 1.5, 0.8);
    const torso = new THREE.Mesh(torsoGeo, shirt);
    torso.position.y = 2.25;
    torso.name = 'torso';
    group.add(torso);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const leftArm = new THREE.Mesh(armGeo, skin);
    leftArm.position.set(-0.95, 2.25, 0);
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.95;
    rightArm.name = 'rightArm';
    group.add(leftArm, rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
    const leftLeg = new THREE.Mesh(legGeo, pants);
    leftLeg.position.set(-0.3, 0.75, 0);
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.3;
    rightLeg.name = 'rightLeg';
    group.add(leftLeg, rightLeg);

    return group;
  }

  // Helper to create a girl character with longer hair / different colors
  function createGirlCharacter(): THREE.Group {
    const group = new THREE.Group();

    // Materials with different colors
    const skin = new THREE.MeshStandardMaterial({ color: 0xffe0bd });
    const shirt = new THREE.MeshStandardMaterial({ color: 0xff8da1 }); // pinkish
    const pants = new THREE.MeshStandardMaterial({ color: 0x5d4037 }); // brown

    // Head
    const headGeo = new THREE.BoxGeometry(1, 1, 1);
    const head = new THREE.Mesh(headGeo, skin);
    head.position.y = 3.5;
    head.name = 'head';

    // Face (reuse simple eyes and mouth)
    const featureMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const whiteMatG = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMatG = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const shineMatG = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const scleraGeoG = new THREE.CircleGeometry(0.18, 24);
    const pupilGeoG = new THREE.CircleGeometry(0.09, 24);
    const shineGeoG = new THREE.CircleGeometry(0.03, 16);

    function addPuppyEyeG(offsetX: number) {
      const sclera = new THREE.Mesh(scleraGeoG, whiteMatG);
      sclera.position.set(offsetX, 0.12, 0.53);

      const pupil = new THREE.Mesh(pupilGeoG, pupilMatG);
      pupil.position.set(0, 0, 0.02);
      sclera.add(pupil);

      const shine = new THREE.Mesh(shineGeoG, shineMatG);
      shine.position.set(-0.04, 0.04, 0.025);
      pupil.add(shine);

      head.add(sclera);
    }

    addPuppyEyeG(-0.24);
    addPuppyEyeG(0.24);

    const mouthGeo = new THREE.BoxGeometry(0.3, 0.05, 0.01);
    const mouth = new THREE.Mesh(mouthGeo, featureMaterial);
    mouth.position.set(0, -0.2, 0.51);
    head.add(mouth);

    // Hair – longer style
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xffe27a }); // blonde
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.3), hairMat);
    hairTop.position.y = 0.45;
    head.add(hairTop);

    // Removed girl front bangs to thin out eyebrow area

    // Side hair down to shoulders
    const sideGeo = new THREE.BoxGeometry(0.4, 1.5, 0.7);
    const leftSide = new THREE.Mesh(sideGeo, hairMat);
    leftSide.position.set(-0.75, -0.25, 0);
    const rightSide = leftSide.clone();
    rightSide.position.x = 0.75;
    head.add(leftSide, rightSide);

    // Back hair
    const backGeo = new THREE.BoxGeometry(1.3, 1.6, 0.4);
    const backHair = new THREE.Mesh(backGeo, hairMat);
    backHair.position.set(0, -0.25, -0.55);
    head.add(backHair);

    group.add(head);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.5, 1.5, 0.8);
    const torso = new THREE.Mesh(torsoGeo, shirt);
    torso.position.y = 2.05;
    torso.name = 'torso';
    group.add(torso);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const leftArm = new THREE.Mesh(armGeo, skin);
    leftArm.position.set(-0.95, 2.25, 0);
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.95;
    rightArm.name = 'rightArm';
    group.add(leftArm, rightArm);

    // Legs / skirt style (shorter legs + skirt block)
    const legGeo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
    const leftLeg = new THREE.Mesh(legGeo, pants);
    leftLeg.position.set(-0.3, 0.6, 0);
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.3;
    rightLeg.name = 'rightLeg';
    group.add(leftLeg, rightLeg);

    // Optional skirt
    const skirtGeo = new THREE.BoxGeometry(1.6, 0.6, 0.9);
    const skirt = new THREE.Mesh(skirtGeo, shirt);
    skirt.position.set(0, 1.2, 0);
    group.add(skirt);

    return group;
  }

  // Create characters and position
  const boy = createRobloxCharacter();
  boy.position.x = -3;

  const girl = createGirlCharacter();
  girl.position.x = 3;

  // ---- Simple Dungeon Environment ----
  // Large inside‑out box to act as room
  const roomGeo = new THREE.BoxGeometry(20, 10, 20);
  const roomMat = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.BackSide });
  const dungeonRoom = new THREE.Mesh(roomGeo, roomMat);
  scene.add(dungeonRoom);

  // Floor plane with slightly lighter tone so characters aren't floating visually
  const floorGeo = new THREE.PlaneGeometry(20, 20);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0; // characters already at ground height
  scene.add(floor);

  // Add characters into the room
  scene.add(boy, girl);

  camera.position.set(0, 2, 6);
  camera.lookAt(0, 2, 0);

  // Add simple lighting so MeshStandardMaterial is visible
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 7.5);
  scene.add(directional);

  // ================= Simple VS Game Setup =================
  interface Fighter {
    group: THREE.Group;
    facing: number; // 1 or -1
    health: number;
    isAttacking: boolean;
    attackTimer: number;
    attackLimb: THREE.Object3D | null;
    attackType: 'punch' | 'kick' | null;
    isBlocking: boolean;
    blockTimer: number; // seconds remaining of blocking state
    forceActiveTimer: number;
    forceCooldown: number;
    forceMesh: THREE.Group | null;
    shieldKey: string;
    controls: {
      left: string;
      right: string;
      punch: string;
      kick: string;
      block: string;
    };
  }

  const fighter1: Fighter = {
    group: boy,
    facing: 1,
    health: 100,
    isAttacking: false,
    attackTimer: 0,
    attackLimb: boy.getObjectByName('rightArm') ?? null,
    attackType: null,
    isBlocking: false,
    blockTimer: 0,
    forceActiveTimer: 0,
    forceCooldown: 0,
    forceMesh: null,
    shieldKey: 'KeyG',
    controls: { left: 'KeyA', right: 'KeyD', punch: 'KeyF', kick: 'KeyH', block: 'KeyR' }
  };

  const fighter2: Fighter = {
    group: girl,
    facing: -1,
    health: 100,
    isAttacking: false,
    attackTimer: 0,
    attackLimb: girl.getObjectByName('rightLeg') ?? null,
    attackType: null,
    isBlocking: false,
    blockTimer: 0,
    forceActiveTimer: 0,
    forceCooldown: 0,
    forceMesh: null,
    shieldKey: 'KeyZ',
    controls: { left: 'ArrowLeft', right: 'ArrowRight', punch: 'Slash', kick: 'KeyL', block: 'KeyP' }
  };

  // Flip girl to face left
  fighter2.group.scale.x = -1;

  // Input tracking
  const keys: Record<string, boolean> = {};
  window.addEventListener('keydown', (e) => (keys[e.code] = true));
  window.addEventListener('keyup', (e) => (keys[e.code] = false));

  // Visual health bar (container with gradient fill)
  function createHealthBar(anchor: 'left' | 'right'): { container: HTMLDivElement; fill: HTMLDivElement } {
    const container = document.createElement('div');
    const fill = document.createElement('div');

    Object.assign(container.style, {
      position: 'absolute',
      top: '10px',
      [anchor]: '10px',
      width: '200px',
      height: '24px',
      border: '2px solid #000',
      background: '#555',
      boxSizing: 'border-box'
    });

    Object.assign(fill.style, {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to right, #00ff00 0%, #ffff00 50%, #ff0000 100%)'
    });

    container.appendChild(fill);
    document.body.appendChild(container);
    return { container, fill };
  }

  const bar1 = createHealthBar('left');
  const bar2 = createHealthBar('right');

  function updateHealthBars() {
    bar1.fill.style.width = `${fighter1.health * 2}px`;
    bar2.fill.style.width = `${fighter2.health * 2}px`;
  }

  const speed = 2.5; // movement units per second
  const attackSpeed = 4; // lunge speed during attack
  const attackDuration = 0.3; // seconds

  // Lightning attack (boy special)
  let lightningCooldown = 0; // seconds until next available
  let xPressedPrev = false;

  // Fireball attack (girl special)
  let fireballCooldown = 0;
  let uPressedPrev = false;

  let gameOver = false;

  interface Projectile {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    owner: 'girl';
    lifetime: number;
  }
  const projectiles: Projectile[] = [];

  // Track previous shield key state
  let gPressedPrev = false;
  let zPressedPrev = false;

  function updateFighter(f: Fighter, opponent: Fighter, dt: number) {
    if (gameOver || f.health <= 0) return;
    // Face opponent
    f.facing = opponent.group.position.x > f.group.position.x ? 1 : -1;
    // rotate entire body to face opponent (rotate Y ±90°)
    f.group.rotation.y = f.facing === 1 ? Math.PI / 2 : -Math.PI / 2;

    // Movement
    if (keys[f.controls.left]) f.group.position.x -= speed * dt;
    if (keys[f.controls.right]) f.group.position.x += speed * dt;

    // ----- Blocking with grace period -----
    const BLOCK_GRACE = 0.25; // seconds of extra blocking after key release

    if (keys[f.controls.block]) {
      f.blockTimer = BLOCK_GRACE; // reset timer while key held
    } else if (f.blockTimer > 0) {
      f.blockTimer -= dt;
    }
    f.isBlocking = f.blockTimer > 0;

    // Disable attacking while blocking
    let requestedAttack: 'punch' | 'kick' | null = null;
    if (!f.isBlocking) {
      if (keys[f.controls.punch]) requestedAttack = 'punch';
      if (keys[f.controls.kick]) requestedAttack = 'kick';
    }

    if (!f.isAttacking && requestedAttack) {
      f.isAttacking = true;
      f.attackTimer = attackDuration;
      f.attackType = requestedAttack;
      // choose limb
      if (requestedAttack === 'punch') {
        f.attackLimb = f.group.getObjectByName('rightArm') ?? null;
      } else {
        f.attackLimb = f.group.getObjectByName('rightLeg') ?? null;
      }
    }

    // Update attack state
    if (f.isAttacking) {
      // No forward lunge; attack executed in place.
      f.attackTimer -= dt;
      if (f.attackTimer <= 0) {
        f.isAttacking = false;
        f.attackType = null;
      }

      // Animate limb
      if (f.attackLimb) {
        const progress = 1 - f.attackTimer / attackDuration; // 0 -> 1
        const angle = Math.sin(progress * Math.PI) * (Math.PI / 2);
        if (f.attackType === 'punch') {
          // rotate arm around X for punch
          (f.attackLimb as THREE.Mesh).rotation.x = -angle;
        } else if (f.attackType === 'kick') {
          // rotate leg for kick
          (f.attackLimb as THREE.Mesh).rotation.x = -angle;
        }
      }

      // Collision detection
      const fBox = new THREE.Box3().setFromObject(f.group);
      const oBox = new THREE.Box3().setFromObject(opponent.group);
      if (fBox.intersectsBox(oBox) && !opponent.isBlocking && opponent.forceActiveTimer<=0) {
        opponent.health = Math.max(0, opponent.health - 10);
        updateHealthBars();
        f.isAttacking = false; // stop combo on hit
      }
    } else {
      // reset limb rotation when not attacking
      if (f.attackLimb) (f.attackLimb as THREE.Mesh).rotation.x = 0;
    }

    // Blocking arm animation (cross arms)
    const leftArm = f.group.getObjectByName('leftArm') as THREE.Mesh | null;
    const rightArm = f.group.getObjectByName('rightArm') as THREE.Mesh | null;
    if (f.isBlocking) {
      if (leftArm) {
        leftArm.rotation.z = Math.PI / 4;
        leftArm.rotation.x = 0;
      }
      if (rightArm) {
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.rotation.x = 0;
      }
    } else {
      if (leftArm) leftArm.rotation.z = 0;
      if (rightArm) rightArm.rotation.z = 0;
    }
  }

  // ================= Start Button =================
  let gameStarted = false;
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start';
  Object.assign(startBtn.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '12px 24px',
    fontSize: '24px',
    cursor: 'pointer',
    zIndex: '10'
  });
  document.body.appendChild(startBtn);

  startBtn.addEventListener('click', () => {
    // Bow both fighters before enabling controls
    bowFighters(() => {
      gameStarted = true;
    });
    startBtn.remove();
  });

  function bowFighters(callback: () => void) {
    const torso1 = boy.getObjectByName('torso');
    const torso2 = girl.getObjectByName('torso');
    const head1 = boy.getObjectByName('head');
    const head2 = girl.getObjectByName('head');
    let t = 0;
    const bowTime = 0.6;
    const upTime = 0.6;
    function bowAnim() {
      requestAnimationFrame(bowAnim);
      const dt = 1 / 60;
      if (t < bowTime) {
        const angle = (t / bowTime) * (Math.PI / 4);
        if (torso1) (torso1 as THREE.Mesh).rotation.x = angle;
        if (torso2) (torso2 as THREE.Mesh).rotation.x = angle;
        if (head1) (head1 as THREE.Mesh).rotation.x = angle;
        if (head2) (head2 as THREE.Mesh).rotation.x = angle;
      } else if (t < bowTime + upTime) {
        const progress = (t - bowTime) / upTime;
        const angle = (1 - progress) * (Math.PI / 4);
        if (torso1) (torso1 as THREE.Mesh).rotation.x = angle;
        if (torso2) (torso2 as THREE.Mesh).rotation.x = angle;
        if (head1) (head1 as THREE.Mesh).rotation.x = angle;
        if (head2) (head2 as THREE.Mesh).rotation.x = angle;
      } else {
        if (torso1) (torso1 as THREE.Mesh).rotation.x = 0;
        if (torso2) (torso2 as THREE.Mesh).rotation.x = 0;
        if (head1) (head1 as THREE.Mesh).rotation.x = 0;
        if (head2) (head2 as THREE.Mesh).rotation.x = 0;

        // Ensure they face each other
        const dir1 = girl.position.x > boy.position.x ? 1 : -1;
        const dir2 = boy.position.x > girl.position.x ? 1 : -1;
        boy.rotation.y = dir1 === 1 ? Math.PI/2 : -Math.PI/2;
        girl.rotation.y = dir2 === 1 ? Math.PI/2 : -Math.PI/2;
        callback();
        return;
      }
      t += dt;
    }
    bowAnim();
  }

  let prevTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);
    const current = performance.now();
    const dt = (current - prevTime) / 1000; // seconds
    prevTime = current;

    if (gameStarted) {
      if (!gameOver) {
        updateFighter(fighter1, fighter2, dt);
        updateFighter(fighter2, fighter1, dt);
      }

      // Handle lightning key (boy only)
      if (lightningCooldown > 0) lightningCooldown -= dt;

      // Handle fireball key (girl only)
      if (fireballCooldown > 0) fireballCooldown -= dt;

      if (!gameOver && fighter1.health>0) {
        const xPressed = keys['KeyX'];
        if (xPressed && !xPressedPrev && lightningCooldown <= 0) {
          shootLightning();
          lightningCooldown = 1; // 1 second cooldown
        }
        xPressedPrev = xPressed;
      }

      if (!gameOver && fighter2.health>0) {
        const uPressed = keys['KeyU'];
        if (uPressed && !uPressedPrev && fireballCooldown <= 0) {
          shootFireball();
          fireballCooldown = 1;
        }
        uPressedPrev = uPressed;
      }

      // Handle force fields
      handleForceField(fighter1, 'KeyG', gPressedPrev, dt);
      gPressedPrev = keys['KeyG'];

      handleForceField(fighter2, 'KeyZ', zPressedPrev, dt);
      zPressedPrev = keys['KeyZ'];

      // Update projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lifetime -= dt;
        if (p.lifetime <= 0) {
          scene.remove(p.mesh);
          projectiles.splice(i, 1);
          continue;
        }
        // Collision with boy
        const pBox = new THREE.Box3().setFromObject(p.mesh);
        const boyBox = new THREE.Box3().setFromObject(boy);
        if (p.owner === 'girl' && pBox.intersectsBox(boyBox)) {
          if (!fighter1.isBlocking && fighter1.forceActiveTimer<=0) {
            fighter1.health = Math.max(0, fighter1.health - 10);
          }
          updateHealthBars();
          if (fighter1.health === 0 && !gameOver) endGame('Girl wins!');
          scene.remove(p.mesh);
          projectiles.splice(i, 1);
        }
      }
    }

    renderer.render(scene, camera);
  }

  function shootLightning() {
    // Create a cyan line from boy to girl
    const start = new THREE.Vector3().copy(boy.position);
    start.y = 2;
    const end = new THREE.Vector3().copy(girl.position);
    end.y = 2;

    const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const line = new THREE.Line(geom, mat);
    scene.add(line);

    setTimeout(() => {
      scene.remove(line);
      geom.dispose();
      mat.dispose();
    }, 200);

    // Damage girl
    if (!fighter2.isBlocking && fighter2.forceActiveTimer<=0) {
      fighter2.health = Math.max(0, fighter2.health - 10);
    }
    updateHealthBars();
    if (fighter2.health === 0 && !gameOver) endGame('Boy wins!');
  }

  function shootFireball() {
    const startPos = new THREE.Vector3().copy(girl.position);
    startPos.y = 2;
    const endPos = new THREE.Vector3().copy(boy.position);
    endPos.y = 2;
    const dir = endPos.clone().sub(startPos).normalize();

    const geom = new THREE.SphereGeometry(0.2, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const sphere = new THREE.Mesh(geom, mat);
    sphere.position.copy(startPos);
    scene.add(sphere);

    projectiles.push({ mesh: sphere, velocity: dir.multiplyScalar(8), owner: 'girl', lifetime: 1.5 });
  }

  function endGame(message: string) {
    gameOver = true;
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute',
      top: '0', left: '0', right: '0', bottom: '0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '32px',
      flexDirection: 'column', gap: '20px'
    });
    overlay.textContent = message;
    const restart = document.createElement('button');
    restart.textContent = 'Restart';
    restart.style.padding = '10px 20px';
    restart.style.fontSize = '24px';
    overlay.appendChild(restart);
    document.body.appendChild(overlay);
    restart.addEventListener('click', () => location.reload());
  }

  updateHealthBars();
  animate();

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onWindowResize);

  // ========= On‑screen controls guide =========
  const guideBoy = document.createElement('div');
  guideBoy.innerHTML = `
    <strong>Boy&nbsp;Controls</strong><br/>
    A / D – move<br/>
    F – punch&nbsp;&nbsp;H – kick<br/>
    R – block&nbsp;&nbsp;X – lightning<br/>
    G – force‑field&nbsp;<small>(4 s&nbsp;· 60 s CD)</small>
  `;
  Object.assign(guideBoy.style, {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    padding: '8px 12px',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    lineHeight: '18px',
    borderRadius: '4px',
    textAlign: 'left',
    zIndex: '9'
  });

  const guideGirl = document.createElement('div');
  guideGirl.innerHTML = `
    <strong>Girl&nbsp;Controls</strong><br/>
    ← / → – move<br/>
    / – punch&nbsp;&nbsp;L – kick<br/>
    P – block&nbsp;&nbsp;U – fireball<br/>
    Z – force‑field&nbsp;<small>(4 s&nbsp;· 60 s CD)</small>
  `;
  Object.assign(guideGirl.style, {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    padding: '8px 12px',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    lineHeight: '18px',
    borderRadius: '4px',
    textAlign: 'right',
    zIndex: '9'
  });

  document.body.appendChild(guideBoy);
  document.body.appendChild(guideGirl);

  // ===== Force field helper =====
  function handleForceField(f: Fighter, key: string, prevPressed: boolean, dt: number) {
    const pressed = keys[key];
    const FIELD_DURATION = 4; // seconds
    const COOLDOWN = 60; // seconds (1 minute)

    if (pressed && !prevPressed && f.forceCooldown<=0 && f.forceActiveTimer<=0) {
      // activate field
      f.forceActiveTimer = FIELD_DURATION;
      f.forceCooldown = COOLDOWN;

      // === Fancy shield multi‑layer effect ===
      const shieldGroup = new THREE.Group();

      // Choose base color per fighter (cyan for boy, magenta for girl)
      const baseColor = f === fighter1 ? 0x00ffff : 0xff00ff;

      // Inner glowing sphere
      const innerGeom = new THREE.SphereGeometry(1.6, 32, 32);
      const innerMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        opacity: 0.25,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const innerSphere = new THREE.Mesh(innerGeom, innerMat);
      shieldGroup.add(innerSphere);

      // Outer wireframe sphere
      const wireGeom = new THREE.SphereGeometry(1.7, 32, 32);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.4,
        wireframe: true,
        transparent: true,
        depthWrite: false,
      });
      const wireSphere = new THREE.Mesh(wireGeom, wireMat);
      shieldGroup.add(wireSphere);

      // Rotating torus ring
      const ringGeom = new THREE.TorusGeometry(1.6, 0.06, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        opacity: 0.5,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      shieldGroup.add(ring);

      shieldGroup.position.set(0, 1.75, 0);
      f.forceMesh = shieldGroup;
      f.group.add(shieldGroup);
    }

    // timers
    if (f.forceCooldown>0) f.forceCooldown -= dt;
    if (f.forceActiveTimer>0) {
      // Animate children rotations for extra flair
      const elapsed = FIELD_DURATION - f.forceActiveTimer;
      const pulse = 1 + 0.15 * Math.sin(elapsed * Math.PI * 4); // 2 pulses/sec
      f.forceMesh?.scale.set(pulse, pulse, pulse);

      if (f.forceMesh) {
        f.forceMesh.rotation.y += dt * 1.5;
        const wire = f.forceMesh.children[1];
        wire.rotation.y -= dt * 2.5;
        const ring = f.forceMesh.children[2];
        ring.rotation.z += dt * 3;
      }

      // Optional flicker of inner sphere opacity
      const innerMatDynamic = (f.forceMesh?.children[0] as THREE.Mesh)?.material as THREE.MeshBasicMaterial | undefined;
      if (innerMatDynamic) innerMatDynamic.opacity = 0.18 + 0.07 * (Math.sin(elapsed * Math.PI * 6) + 1) / 2;

      f.forceActiveTimer -= dt;
      if (f.forceActiveTimer<=0 && f.forceMesh) {
        // cleanup
        f.group.remove(f.forceMesh);
        f.forceMesh.traverse((obj)=>{
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh;
            (m.geometry as THREE.BufferGeometry).dispose();
            ((m.material) as THREE.Material).dispose();
          }
        });
        f.forceMesh = null;
      }
    }
  }
} 