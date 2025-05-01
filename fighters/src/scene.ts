import * as THREE from 'three';
import { 
  SECURITY_CONFIG, 
  SecurityConfig, 
  SecurityState, 
  HealthHistory,
  validateHealth,
  validateSpeed,
  validatePosition,
  validateCharacterType,
  fighter1Security,
  fighter2Security
} from './security';

// ================= Security & Detection System =================
interface DetectionEvent {
    type: 'speed' | 'position' | 'health' | 'attack' | 'teleport' | 'input';
    severity: 1 | 2 | 3; // 1: warning, 2: serious, 3: critical
    playerId: string;
    timestamp: number;
    details: string;
}

class DetectionSystem {
    private static instance: DetectionSystem;
    private events: DetectionEvent[] = [];
    private warnings: Map<string, number> = new Map();
    private lastCheck: number = Date.now();
    private anomalyThresholds = {
        speed: 15,
        healthChange: 30,
        positionJump: 8,
        attackRate: 8
    };

    private constructor() {
        this.startMonitoring();
    }

    static getInstance(): DetectionSystem {
        if (!DetectionSystem.instance) {
            DetectionSystem.instance = new DetectionSystem();
        }
        return DetectionSystem.instance;
    }

    private startMonitoring() {
        setInterval(() => this.checkForAnomalies(), SECURITY_CONFIG.DETECTION_INTERVAL);
    }

    addEvent(event: DetectionEvent) {
        this.events.push(event);
        this.updateWarnings(event);
        this.logEvent(event);
        
        if (event.severity === 3) {
            this.handleCriticalViolation(event);
        }
    }

    private updateWarnings(event: DetectionEvent) {
        const current = this.warnings.get(event.playerId) || 0;
        this.warnings.set(event.playerId, current + event.severity);

        if (current + event.severity >= SECURITY_CONFIG.VIOLATION_THRESHOLD) {
            this.punishPlayer(event.playerId);
        }
    }

    private punishPlayer(playerId: string) {
        const security = playerId === 'fighter1' ? fighter1Security : fighter2Security;
        if (security) {
            // Apply punishment
            security.securityViolations++;
            if (security.securityViolations >= SECURITY_CONFIG.VIOLATION_THRESHOLD) {
                // Reset violations but apply stricter monitoring
                security.securityViolations = 0;
                security.suspiciousHealthChanges++;
            }
        }
    }

    private checkForAnomalies() {
        // Check both fighters' security states
        [fighter1Security, fighter2Security].forEach((security, idx) => {
            const playerId = `fighter${idx + 1}`;
            
            // Speed check
            const currentPos = idx === 0 ? fighter1Security.lastPosition : fighter2Security.lastPosition;
            const speed = currentPos.distanceTo(security.lastPosition) / (SECURITY_CONFIG.DETECTION_INTERVAL / 1000);
            
            if (speed > this.anomalyThresholds.speed) {
                this.addEvent({
                    type: 'speed',
                    severity: 2,
                    playerId,
                    timestamp: Date.now(),
                    details: `Excessive speed detected: ${speed.toFixed(2)} units/s`
                });
            }
        });
    }

    private handleCriticalViolation(event: DetectionEvent) {
        // Force reset potentially compromised state
        const security = event.playerId === 'fighter1' ? fighter1Security : fighter2Security;
        if (security) {
            security.securityViolations++;
            security.suspiciousHealthChanges++;
            // Additional monitoring
            security.lastHealthUpdate = Date.now();
        }
    }

    private showWarningMessage(message: string) {
        const warning = document.createElement('div');
        Object.assign(warning.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 0, 0, 0.9)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            zIndex: '1000',
            boxShadow: '0 0 20px red'
        });
        warning.textContent = message;
        document.body.appendChild(warning);
        setTimeout(() => warning.remove(), 3000);
    }

    private logEvent(event: DetectionEvent) {
        console.warn(
            `[Detection System] ${event.timestamp}: ${event.type} violation by ${event.playerId} (Severity: ${event.severity})\n`,
            `Details: ${event.details}`
        );
    }

    getEventHistory(): DetectionEvent[] {
        return [...this.events];
    }

    clearHistory() {
        this.events = [];
        this.warnings.clear();
    }
}

// Initialize the detection system
const detectionSystem = DetectionSystem.getInstance();

// ================= Security State =================

// Update the local security config to use the imported one
const localSecurityConfig = {
    MAX_POSITION_CHANGE: SECURITY_CONFIG.MAX_POSITION_CHANGE,
    MAX_ATTACKS_PER_SECOND: SECURITY_CONFIG.MAX_ATTACKS_PER_SECOND,
    MAX_TELEPORTS_PER_SECOND: SECURITY_CONFIG.MAX_TELEPORTS_PER_SECOND,
    POSITION_CHECK_INTERVAL: SECURITY_CONFIG.POSITION_CHECK_INTERVAL,
    ATTACK_COOLDOWN: SECURITY_CONFIG.ATTACK_COOLDOWN,
    MAX_HEALTH_CHANGE_RATE: 50, // Keep local setting
    VIOLATION_THRESHOLD: SECURITY_CONFIG.VIOLATION_THRESHOLD,
    ANTI_CHEAT_ENABLED: SECURITY_CONFIG.ANTI_CHEAT_ENABLED,
    BREACH_COOLDOWN: SECURITY_CONFIG.BREACH_COOLDOWN,
    BREACH_THRESHOLD: SECURITY_CONFIG.BREACH_THRESHOLD
};

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

  // Add new character options
  function createRobotCharacter(): THREE.Group {
    const group = new THREE.Group();

    // Materials
    const metal = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
    const accent = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Glowing parts
    const glass = new THREE.MeshStandardMaterial({ color: 0x00ffff, opacity: 0.7, transparent: true });

    // Head - more angular/mechanical
    const headGeo = new THREE.BoxGeometry(1, 0.8, 1);
    const head = new THREE.Mesh(headGeo, metal);
    head.position.y = 3.5;
    head.name = 'head';

    // Visor
    const visorGeo = new THREE.BoxGeometry(0.8, 0.3, 0.1);
    const visor = new THREE.Mesh(visorGeo, glass);
    visor.position.set(0, 0.1, 0.5);
    head.add(visor);

    // Antenna
    const antennaGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
    const antenna = new THREE.Mesh(antennaGeo, metal);
    antenna.position.set(0, 0.6, 0);
    head.add(antenna);

    // Antenna tip light
    const tipGeo = new THREE.SphereGeometry(0.08);
    const tip = new THREE.Mesh(tipGeo, accent);
    tip.position.y = 0.25;
    antenna.add(tip);

    group.add(head);

    // Torso - more mechanical with glowing core
    const torsoGeo = new THREE.BoxGeometry(1.5, 1.5, 0.8);
    const torso = new THREE.Mesh(torsoGeo, metal);
    torso.position.y = 2.25;
    torso.name = 'torso';

    // Glowing core
    const coreGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
    const core = new THREE.Mesh(coreGeo, accent);
    core.rotation.x = Math.PI / 2;
    core.position.z = 0.3;
    torso.add(core);

    group.add(torso);

    // Arms - segmented
    const upperArmGeo = new THREE.BoxGeometry(0.4, 0.8, 0.4);
    const lowerArmGeo = new THREE.BoxGeometry(0.35, 0.7, 0.35);

    function createRobotArm(isRight: boolean) {
      const arm = new THREE.Group();
      const upper = new THREE.Mesh(upperArmGeo, metal);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.2), metal);
      const lower = new THREE.Mesh(lowerArmGeo, metal);

      upper.position.y = 0.4;
      joint.position.y = 0;
      lower.position.y = -0.35;

      arm.add(upper, joint, lower);
      arm.position.set(isRight ? 0.95 : -0.95, 2.25, 0);
      if (isRight) arm.name = 'rightArm';
      return arm;
    }

    group.add(createRobotArm(false), createRobotArm(true));

    // Legs - mechanical with glowing joints
    const upperLegGeo = new THREE.BoxGeometry(0.5, 0.8, 0.5);
    const lowerLegGeo = new THREE.BoxGeometry(0.45, 0.7, 0.45);

    function createRobotLeg(isRight: boolean) {
      const leg = new THREE.Group();
      const upper = new THREE.Mesh(upperLegGeo, metal);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.15), accent);
      const lower = new THREE.Mesh(lowerLegGeo, metal);

      upper.position.y = 0.4;
      joint.position.y = 0;
      lower.position.y = -0.35;

      leg.add(upper, joint, lower);
      leg.position.set(isRight ? 0.3 : -0.3, 0.75, 0);
      if (isRight) leg.name = 'rightLeg';
      return leg;
    }

    group.add(createRobotLeg(false), createRobotLeg(true));

    return group;
  }

  function createNinjaCharacter(): THREE.Group {
    const group = new THREE.Group();

    // Materials
    const fabric = new THREE.MeshStandardMaterial({ color: 0x2c3e50 }); // Dark ninja garb
    const skin = new THREE.MeshStandardMaterial({ color: 0xffe0bd });
    const accent = new THREE.MeshStandardMaterial({ color: 0xe74c3c }); // Red accent

    // Head with mask
    const headGeo = new THREE.BoxGeometry(1, 1, 1);
    const head = new THREE.Mesh(headGeo, fabric);
    head.position.y = 3.5;
    head.name = 'head';

    // Eyes - narrow slits
    const eyeGeo = new THREE.BoxGeometry(0.3, 0.08, 0.01);
    const leftEye = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    leftEye.position.set(-0.2, 0.1, 0.51);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.2;
    head.add(leftEye, rightEye);

    // Headband
    const bandGeo = new THREE.BoxGeometry(1.1, 0.2, 1.1);
    const band = new THREE.Mesh(bandGeo, accent);
    band.position.y = 0.2;
    head.add(band);

    // Flowing headband ends
    const bandEndGeo = new THREE.BoxGeometry(0.2, 0.6, 0.1);
    const bandEnd = new THREE.Mesh(bandEndGeo, accent);
    bandEnd.position.set(-0.6, 0, 0);
    bandEnd.rotation.z = Math.PI / 6;
    band.add(bandEnd);

    group.add(head);

    // Torso - slim fit ninja garb
    const torsoGeo = new THREE.BoxGeometry(1.3, 1.5, 0.7);
    const torso = new THREE.Mesh(torsoGeo, fabric);
    torso.position.y = 2.25;
    torso.name = 'torso';

    // Chest straps
    const strapGeo = new THREE.BoxGeometry(1.4, 0.15, 0.75);
    const strap = new THREE.Mesh(strapGeo, accent);
    strap.rotation.z = Math.PI / 6;
    torso.add(strap);
    const strap2 = strap.clone();
    strap2.rotation.z = -Math.PI / 6;
    torso.add(strap2);

    group.add(torso);

    // Arms - wrapped in fabric
    const armGeo = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const leftArm = new THREE.Mesh(armGeo, fabric);
    leftArm.position.set(-0.85, 2.25, 0);
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.85;
    rightArm.name = 'rightArm';

    // Arm wraps
    const wrapGeo = new THREE.BoxGeometry(0.45, 0.1, 0.45);
    for (let i = 0; i < 3; i++) {
      const wrap = new THREE.Mesh(wrapGeo, accent);
      wrap.position.y = 0.3 - i * 0.4;
      leftArm.add(wrap.clone());
      rightArm.add(wrap.clone());
    }

    group.add(leftArm, rightArm);

    // Legs - loose pants
    const legGeo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
    const leftLeg = new THREE.Mesh(legGeo, fabric);
    leftLeg.position.set(-0.3, 0.75, 0);
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.3;
    rightLeg.name = 'rightLeg';

    // Leg wraps
    const legWrapGeo = new THREE.BoxGeometry(0.55, 0.1, 0.55);
    for (let i = 0; i < 2; i++) {
      const wrap = new THREE.Mesh(legWrapGeo, accent);
      wrap.position.y = -0.4 + i * 0.3;
      leftLeg.add(wrap.clone());
      rightLeg.add(wrap.clone());
    }

    group.add(leftLeg, rightLeg);

    return group;
  }

  // Character selection state
  let currentBoyCharacter = 'roblox';
  let currentGirlCharacter = 'roblox';

  function switchCharacter(fighter: Fighter, type: 'boy' | 'girl', character: 'roblox' | 'robot' | 'ninja' | 'bunny') {
    // Store old position and rotation
    const oldPos = fighter.group.position.clone();
    const oldRot = fighter.group.rotation.clone();
    
    // Remove old character
    scene.remove(fighter.group);
    
    // Create new character
    let newCharacter: THREE.Group;
    switch(character) {
      case 'roblox':
        newCharacter = type === 'boy' ? createRobloxCharacter() : createGirlCharacter();
        break;
      case 'robot':
        newCharacter = createRobotCharacter();
        break;
      case 'ninja':
        newCharacter = createNinjaCharacter();
        break;
      case 'bunny':
        newCharacter = createBunnyCharacter();
        break;
    }
    
    // Restore position and rotation
    newCharacter.position.copy(oldPos);
    newCharacter.rotation.copy(oldRot);
    
    // Update fighter reference
    fighter.group = newCharacter;
    fighter.attackLimb = newCharacter.getObjectByName(type === 'boy' ? 'rightArm' : 'rightLeg') ?? null;
    
    // Add to scene
    scene.add(newCharacter);
    
    // Update character state
    if (type === 'boy') {
      currentBoyCharacter = character;
    } else {
      currentGirlCharacter = character;
    }
    
    // Update character type
    fighter.characterType = character;
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
  // Add type safety for character types
  type CharacterType = 'roblox' | 'robot' | 'ninja' | 'bunny';

  // Fix the Fighter interface to use the type
  interface Fighter {
    group: THREE.Group;
    facing: number;
    health: number;
    isAttacking: boolean;
    attackTimer: number;
    attackLimb: THREE.Object3D | null;
    attackType: 'punch' | 'kick' | 'laser' | 'shuriken' | null;
    isBlocking: boolean;
    blockTimer: number;
    forceActiveTimer: number;
    forceCooldown: number;
    forceMesh: THREE.Group | null;
    shieldKey: string;
    characterType: CharacterType;
    controls: {
      left: string;
      right: string;
      punch: string;
      kick: string;
      block: string;
    };
    // Add OP form properties
    isOPForm: boolean;
    opFormTimer: number;
    opFormCooldown: number;
    opMesh: THREE.Group | null;
    bunnyArmy: BunnyMinion[];
    bunnyArmyCooldown: number;
  }

  const fighter1: Fighter = {
    group: boy,
    facing: -1,
    health: 100,
    isAttacking: false,
    attackTimer: 0,
    attackLimb: null,
    attackType: null,
    isBlocking: false,
    blockTimer: 0,
    forceActiveTimer: 0,
    forceCooldown: 0,
    forceMesh: null,
    shieldKey: 'KeyS',
    characterType: 'roblox',
    controls: {
      left: 'KeyA',
      right: 'KeyD',
      punch: 'KeyF',
      kick: 'KeyG',
      block: 'KeyS'
    },
    isOPForm: false,
    opFormTimer: 0,
    opFormCooldown: 0,
    opMesh: null,
    bunnyArmy: [],
    bunnyArmyCooldown: 0
  };

  const fighter2: Fighter = {
    group: girl,
    facing: 1,
    health: 100,
    isAttacking: false,
    attackTimer: 0,
    attackLimb: null,
    attackType: null,
    isBlocking: false,
    blockTimer: 0,
    forceActiveTimer: 0,
    forceCooldown: 0,
    forceMesh: null,
    shieldKey: 'KeyK',
    characterType: 'roblox',
    controls: {
      left: 'KeyJ',
      right: 'KeyL',
      punch: 'KeyI',
      kick: 'KeyO',
      block: 'KeyK'
    },
    isOPForm: false,
    opFormTimer: 0,
    opFormCooldown: 0,
    opMesh: null,
    bunnyArmy: [],
    bunnyArmyCooldown: 0
  };

  // Flip girl to face left
  fighter2.group.scale.x = -1;

  // Input tracking
  const keys: Record<string, boolean> = {};
  window.addEventListener('keydown', (e) => (keys[e.code] = true));
  window.addEventListener('keyup', (e) => (keys[e.code] = false));

  // Visual health bar (container with gradient fill)
  function createHealthBar(anchor: 'left' | 'right'): { container: HTMLDivElement; fill: HTMLDivElement; label: HTMLDivElement } {
    const container = document.createElement('div');
    const fill = document.createElement('div');
    const label = document.createElement('div');

    Object.assign(container.style, {
      position: 'absolute',
      top: '10px',
      [anchor]: '10px',
      width: '200px',
      height: '24px',
      border: '2px solid #000',
      background: '#555',
      boxSizing: 'border-box',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#fff',
      textShadow: '0 0 3px #000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    Object.assign(fill.style, {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to right, #00ff00 0%, #ffff00 50%, #ff0000 100%)'
    });

    Object.assign(label.style, {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      pointerEvents: 'none',
      fontSize: '14px',
      lineHeight: '24px'
    });
    label.textContent = '100';

    container.appendChild(fill);
    container.appendChild(label);
    document.body.appendChild(container);
    return { container, fill, label };
  }

  const bar1 = createHealthBar('left');
  const bar2 = createHealthBar('right');

  // Add health validation constants
  const HEALTH_UPDATE_INTERVAL = 16; // ms
  const MAX_HEALTH_CHANGE_RATE = 50; // max health change per second
  const HEALTH_HISTORY_SIZE = 10;

  // Enhanced health bar update function
  function updateHealthBars() {
      try {
          // Validate and update fighter1's health with security checks
          fighter1.health = validateHealth(fighter1.health);
          fighter2.health = validateHealth(fighter2.health);
          
          // Ensure health bars exist and recreate if missing
          if (!bar1?.container?.parentElement) {
              const newBar1 = createHealthBar('left');
              Object.assign(bar1, newBar1);
          }
          if (!bar2?.container?.parentElement) {
              const newBar2 = createHealthBar('right');
              Object.assign(bar2, newBar2);
          }
          
          // Update display with validated values using requestAnimationFrame for smooth updates
          if (bar1?.fill && bar1?.label) {
              requestAnimationFrame(() => {
                  if (bar1?.fill && bar1?.label) {
                      bar1.fill.style.width = `${fighter1.health * 2}px`;
                      bar1.label.textContent = `${Math.round(fighter1.health)}`;
                  }
              });
          }
          
          if (bar2?.fill && bar2?.label) {
              requestAnimationFrame(() => {
                  if (bar2?.fill && bar2?.label) {
                      bar2.fill.style.width = `${fighter2.health * 2}px`;
                      bar2.label.textContent = `${Math.round(fighter2.health)}`;
                  }
              });
          }
          
          // Persist health values to prevent manipulation
          localStorage.setItem('fighter1Health', fighter1.health.toString());
          localStorage.setItem('fighter2Health', fighter2.health.toString());
          
      } catch (error) {
          console.warn('Error updating health bars:', error);
          // Attempt to recover health values from storage
          const stored1 = localStorage.getItem('fighter1Health');
          const stored2 = localStorage.getItem('fighter2Health');
          
          if (stored1) fighter1.health = Number(stored1);
          if (stored2) fighter2.health = Number(stored2);
          
          // Recreate health bars if needed
          if (!bar1?.container?.parentElement) {
              const newBar1 = createHealthBar('left');
              Object.assign(bar1, newBar1);
          }
          if (!bar2?.container?.parentElement) {
              const newBar2 = createHealthBar('right');
              Object.assign(bar2, newBar2);
          }
      }
  }

  // Update the speed constant for extreme speed
  const speed = 2.5; // base movement units per second
  const NINJA_SPEED_MULTIPLIER = 100; // Extremely fast ninja speed
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

  // Add security-related constants and types
  const MAX_HEALTH = 100;
  const MIN_HEALTH = 0;
  const MAX_ATTACKS_PER_SECOND = 10;
  const MAX_MOVEMENT_SPEED = 1000;
  const VALID_CHARACTER_TYPES = ['roblox', 'robot', 'ninja', 'bunny'] as const;

  // Security tracking
  interface SecurityState {
    lastAttackTime: number;
    attackCount: number;
    lastResetTime: number;
    invalidInputAttempts: number;
    lastPosition: THREE.Vector3;
    teleportAttempts: number;
    lastTeleportTime: number;
    securityViolations: number;
    healthHistory: HealthHistory[];
    lastHealthUpdate: number;
    suspiciousHealthChanges: number;
  }

  // Initialize security state for each fighter
  const fighter1Security: SecurityState = {
    lastAttackTime: Date.now(),
    attackCount: 0,
    lastResetTime: Date.now(),
    invalidInputAttempts: 0,
    lastPosition: new THREE.Vector3(),
    teleportAttempts: 0,
    lastTeleportTime: Date.now(),
    securityViolations: 0,
    healthHistory: [],
    lastHealthUpdate: Date.now(),
    suspiciousHealthChanges: 0
  };

  const fighter2Security: SecurityState = {
    lastAttackTime: Date.now(),
    attackCount: 0,
    lastResetTime: Date.now(),
    invalidInputAttempts: 0,
    lastPosition: new THREE.Vector3(),
    teleportAttempts: 0,
    lastTeleportTime: Date.now(),
    securityViolations: 0,
    healthHistory: [],
    lastHealthUpdate: Date.now(),
    suspiciousHealthChanges: 0
  };

  // Add security validation functions
  function validateHealth(health: number): number {
    return Math.max(MIN_HEALTH, Math.min(MAX_HEALTH, health));
  }

  function validatePosition(pos: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
      Math.max(-10, Math.min(10, pos.x)),
      Math.max(0, Math.min(5, pos.y)),
      Math.max(-10, Math.min(10, pos.z))
    );
  }

  function validateSpeed(speed: number): number {
    return Math.max(0, Math.min(MAX_MOVEMENT_SPEED, speed));
  }

  function validateCharacterType(type: string): boolean {
    return VALID_CHARACTER_TYPES.includes(type as any);
  }

  function checkSecurityViolation(security: SecurityState, type: string, fighter: string) {
    const now = Date.now();
    
    if (now - security.lastResetTime >= SECURITY_CONFIG.VIOLATION_THRESHOLD) {
        security.securityViolations = 0;
        security.lastResetTime = now;
    }

    security.securityViolations++;
    
    if (security.securityViolations >= SECURITY_CONFIG.VIOLATION_THRESHOLD) {
        console.warn(`Security violation detected for ${fighter}: ${type}`);
        security.securityViolations = 0;
        return true;
    }
    
    return false;
  }

  // Add enhanced security measures
  const SECURITY_CONFIG = {
      MAX_POSITION_CHANGE: 5, // units per frame
      MAX_ATTACKS_PER_SECOND: 5,
      MAX_TELEPORTS_PER_SECOND: 2,
      POSITION_CHECK_INTERVAL: 16, // ms
      ATTACK_COOLDOWN: 200, // ms
      MAX_HEALTH_CHANGE_RATE: 50, // per second
      VIOLATION_THRESHOLD: 3,
      ANTI_CHEAT_ENABLED: true
  };

  // Add anti-cheat system
  const antiCheatSystem = {
      enabled: SECURITY_CONFIG.ANTI_CHEAT_ENABLED,
      violations: new Map<string, number>(),
      lastChecks: new Map<string, number>(),
      
      checkViolation(id: string, type: string, severity: number = 1) {
          if (!this.enabled) return false;
          
          const now = Date.now();
          const violations = this.violations.get(id) || 0;
          this.violations.set(id, violations + severity);
          
          if (violations + severity >= SECURITY_CONFIG.VIOLATION_THRESHOLD) {
              console.error(`Security violation threshold reached for ${id}`);
              this.punishViolation(id);
              return true;
          }
          return false;
      },
      
      punishViolation(id: string) {
          // Reset player state and apply temporary debuff
          const fighter = id === 'fighter1' ? fighter1 : fighter2;
          fighter.health = Math.max(20, fighter.health - 30); // Health penalty
          fighter.attackTimer = 2; // Attack cooldown
          fighter.isBlocking = false;
          fighter.isOPForm = false;
          
          // Visual feedback
          const warningText = document.createElement('div');
          Object.assign(warningText.style, {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#ff0000',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '0 0 10px #ff0000',
              zIndex: '1000'
          });
          warningText.textContent = '⚠️ CHEATING DETECTED ⚠️';
          document.body.appendChild(warningText);
          
          setTimeout(() => warningText.remove(), 2000);
          
          // Reset violation count after punishment
          this.violations.set(id, 0);
      },
      
      validatePosition(fighter: Fighter, security: SecurityState) {
          const now = Date.now();
          const lastCheck = this.lastChecks.get(fighter === fighter1 ? 'pos1' : 'pos2') || 0;
          
          if (now - lastCheck < SECURITY_CONFIG.POSITION_CHECK_INTERVAL) return;
          
          const pos = fighter.group.position;
          const lastPos = security.lastPosition;
          const distance = pos.distanceTo(lastPos);
          
          if (distance > SECURITY_CONFIG.MAX_POSITION_CHANGE) {
              const id = fighter === fighter1 ? 'fighter1' : 'fighter2';
              if (this.checkViolation(id, 'position', 2)) {
                  // Teleport back to last valid position
                  fighter.group.position.copy(lastPos);
              }
          }
          
          security.lastPosition.copy(pos);
          this.lastChecks.set(fighter === fighter1 ? 'pos1' : 'pos2', now);
      },
      
      validateAttack(fighter: Fighter, security: SecurityState): boolean {
          const now = Date.now();
          
          if (now - security.lastAttackTime < SECURITY_CONFIG.ATTACK_COOLDOWN) {
              const id = fighter === fighter1 ? 'fighter1' : 'fighter2';
              this.checkViolation(id, 'attack');
              return false;
          }
          
          security.lastAttackTime = now;
          return true;
      }
  };

  // Update the updateFighter function to use enhanced security
  function updateFighter(f: Fighter, opponent: Fighter, dt: number) {
    if (gameOver || f.health <= 0) return;

    const security = f === fighter1 ? fighter1Security : fighter2Security;
    const now = Date.now();

    // 1. Health validation
    f.health = validateHealth(f.health);
    
    // 2. Position validation
    const newPos = f.group.position.clone();
    const distance = newPos.distanceTo(security.lastPosition);
    const timeDiff = now - security.lastTeleportTime;
    
    if (distance > 5 && timeDiff < 100) {
        security.teleportAttempts++;
        if (security.teleportAttempts > 3) {
            checkSecurityViolation(security, 'Illegal teleport detected', f === fighter1 ? 'Fighter 1' : 'Fighter 2');
            f.group.position.copy(security.lastPosition);
        }
    } else {
        security.teleportAttempts = Math.max(0, security.teleportAttempts - 1);
    }
    
    security.lastPosition.copy(f.group.position);
    security.lastTeleportTime = now;

    // 3. Attack rate limiting
    if (now - security.lastResetTime > 1000) {
        security.attackCount = 0;
        security.lastResetTime = now;
    }

    // 4. Character type validation
    if (!validateCharacterType(f.characterType)) {
        checkSecurityViolation(security, 'Invalid character type', f === fighter1 ? 'Fighter 1' : 'Fighter 2');
        f.characterType = 'roblox'; // Reset to default
    }

    // 5. Movement and speed validation
    const speed = 5;
    const currentSpeed = f.characterType === 'ninja' ? 
        validateSpeed(speed * NINJA_SPEED_MULTIPLIER) : 
        validateSpeed(speed * (f.isOPForm ? 2 : 1));

    // Handle movement with validated speed
    if (keys[f.controls.left]) {
        f.group.position.x -= currentSpeed * dt;
        f.facing = -1;
    }
    if (keys[f.controls.right]) {
        f.group.position.x += currentSpeed * dt;
        f.facing = 1;
    }

    // Validate final position
    f.group.position.copy(validatePosition(f.group.position));
    
    // Update facing direction
    f.group.rotation.y = f.facing === 1 ? Math.PI / 2 : -Math.PI / 2;

    // Handle attacks with rate limiting
    if ((keys[f.controls.punch] || keys[f.controls.kick]) && !f.isAttacking && !f.isBlocking) {
        if (security.attackCount < SECURITY_CONFIG.MAX_ATTACKS_PER_SECOND) {
            const attackType = keys[f.controls.punch] ? 'punch' : 'kick';
            f.isAttacking = true;
            f.attackTimer = 0.3;
            f.attackType = attackType;
            security.attackCount++;
            security.lastAttackTime = now;
        }
    }

    // Update firewall breach detection
    if (Math.abs(f.group.position.x) > 7.5) {
        if (now - firewallSystem.lastBreachAttempt > SECURITY_CONFIG.VIOLATION_THRESHOLD) {
            firewallSystem.breachCount = 0;
        }
        
        firewallSystem.breachCount++;
        firewallSystem.lastBreachAttempt = now;
        firewallSystem.warningLevel = 3;
        
        if (firewallSystem.breachCount >= SECURITY_CONFIG.VIOLATION_THRESHOLD) {
            checkSecurityViolation(security, 'Firewall breach attempt', f === fighter1 ? 'Fighter 1' : 'Fighter 2');
            f.group.position.x = f === fighter1 ? -7 : 7;
        }
    }

    // Update timers
    if (f.attackTimer > 0) {
        f.attackTimer -= dt;
        if (f.attackTimer <= 0) {
            f.isAttacking = false;
            f.attackType = null;
        }
    }

    if (f.blockTimer > 0) {
        f.blockTimer -= dt;
        if (f.blockTimer <= 0) {
            f.isBlocking = false;
        }
    }

    // Handle bunny army ability
    if (f.characterType === 'bunny') {
      const specialKey = f === fighter1 ? 'KeyB' : 'KeyN';
      if (keys[specialKey] && f.bunnyArmyCooldown <= 0) {
        summonBunnyArmy(f, opponent);
      }
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
    bowFighters(() => {
      gameStarted = true;
      const menu = createSimpleAbilitiesMenu();
      setTimeout(() => {
        menu.remove();
      }, 30000); // 30 seconds
    });
    startBtn.remove();
    playStartSong();
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
        handleBunnyTransform(fighter1); // Add bunny transform check
        updateFighter(fighter1, fighter2, dt);
        updateFighter(fighter2, fighter1, dt);
        updateFirewall(dt); // Add firewall update

        // Update bunny army cooldowns
        if (fighter1.bunnyArmyCooldown > 0) fighter1.bunnyArmyCooldown -= dt;
        if (fighter2.bunnyArmyCooldown > 0) fighter2.bunnyArmyCooldown -= dt;

        // Update bunny army
        [fighter1, fighter2].forEach(f => {
          // Update each bunny in the army
          f.bunnyArmy = f.bunnyArmy.filter(bunny => {
            bunny.lifetime -= dt;
            
            // Remove expired bunnies
            if (bunny.lifetime <= 0) {
              scene.remove(bunny.mesh);
              return false;
            }

            // Move bunny towards target
            bunny.mesh.position.add(bunny.velocity.clone().multiplyScalar(dt));

            // Check for hits on opponent
            const opponent = f === fighter1 ? fighter2 : fighter1;
            const hitDistance = 1.2; // Slightly larger hit detection range
            if (bunny.mesh.position.distanceTo(opponent.group.position) < hitDistance) {
              // Deal damage
              if (!opponent.isBlocking) {
                opponent.health = Math.max(0, opponent.health - 20); // Increased damage to 20
                playHitSound(opponent === fighter1);
                
                // Create hit effect
                const hitEffect = new THREE.Mesh(
                  new THREE.SphereGeometry(0.4, 8, 8), // Larger hit effect
                  new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.7
                  })
                );
                hitEffect.position.copy(bunny.mesh.position);
                scene.add(hitEffect);
                
                // Animate and remove hit effect
                let scale = 1;
                function animateHit() {
                  scale *= 1.2;
                  hitEffect.scale.set(scale, scale, scale);
                  (hitEffect.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - (scale * 0.1));
                  
                  if (scale < 3) {
                    requestAnimationFrame(animateHit);
                  } else {
                    scene.remove(hitEffect);
                    hitEffect.geometry.dispose();
                    (hitEffect.material as THREE.MeshBasicMaterial).dispose();
                  }
                }
                animateHit();
              }
              
              // Remove bunny after hit
              scene.remove(bunny.mesh);
              return false;
            }

            return true;
          });
        });
      }

      // Handle lightning key (boy only)
      if (lightningCooldown > 0) lightningCooldown -= dt;

      // Handle fireball key (girl only)
      if (fireballCooldown > 0) fireballCooldown -= dt;

      if (!gameOver && fighter1.health > 0) {
        const xPressed = keys['KeyX'];
        if (xPressed && !xPressedPrev && lightningCooldown <= 0) {
          switch(fighter1.characterType) {
            case 'roblox':
              performRobloxSpecial(fighter1, fighter2);
              break;
            case 'robot':
              performRobotSpecial(fighter1, fighter2);
              break;
            case 'ninja':
              performNinjaSpecial(fighter1, fighter2);
              break;
            case 'bunny':
              performBunnySpecial(fighter1, fighter2);
              break;
          }
          lightningCooldown = 1;
        }
        xPressedPrev = xPressed;
      }

      if (!gameOver && fighter2.health > 0) {
        const uPressed = keys['KeyU'];
        if (uPressed && !uPressedPrev && fireballCooldown <= 0) {
          switch(fighter2.characterType) {
            case 'roblox':
              performRobloxSpecial(fighter2, fighter1);
              break;
            case 'robot':
              performRobotSpecial(fighter2, fighter1);
              break;
            case 'ninja':
              performNinjaSpecial(fighter2, fighter1);
              break;
            case 'bunny':
              performBunnySpecial(fighter2, fighter1);
              break;
          }
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
          playHitSound(true);
        }
      }
    }

    renderer.render(scene, camera);
  }

  function performRobloxSpecial(attacker: Fighter, defender: Fighter) {
    // Lightning attack with reduced damage
    const start = new THREE.Vector3().copy(attacker.group.position);
    start.y = 2;
    const end = new THREE.Vector3().copy(defender.group.position);
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

    if (!defender.isBlocking && defender.forceActiveTimer <= 0) {
      defender.health = Math.max(0, defender.health - 7); // reduced from 10
      updateHealthBars();
      if (defender.health === 0) endGame(attacker === fighter1 ? 'Boy wins!' : 'Girl wins!');
      playHitSound(defender === fighter1);
    }
  }

  function performRobotSpecial(attacker: Fighter, defender: Fighter) {
    // Energy blast wave with reduced damage
    const waves = 5;
    const waveSpacing = 0.5;
    const waveDuration = 0.4;
    
    for (let i = 0; i < waves; i++) {
      setTimeout(() => {
        const ringGeom = new THREE.TorusGeometry(i * waveSpacing + 0.5, 0.1, 16, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
          color: 0x00ff00,
          transparent: true,
          opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.copy(attacker.group.position);
        ring.position.y = 2;
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);

        let scale = 1;
        function animateRing() {
          if (!ring.parent) return;
          scale *= 1.1;
          ring.scale.set(scale, scale, 1);
          ring.material.opacity = Math.max(0, 0.7 - (scale * 0.1));
          
          const ringBox = new THREE.Box3().setFromObject(ring);
          const oppBox = new THREE.Box3().setFromObject(defender.group);
          
          if (ringBox.intersectsBox(oppBox) && !defender.isBlocking && defender.forceActiveTimer <= 0) {
            defender.health = Math.max(0, defender.health - 2); // reduced from 3
            updateHealthBars();
            if (defender.health === 0) endGame(attacker === fighter1 ? 'Boy wins!' : 'Girl wins!');
            playHitSound(defender === fighter1);
          }

          if (scale < 5) {
            requestAnimationFrame(animateRing);
          } else {
            scene.remove(ring);
            ringGeom.dispose();
            ringMat.dispose();
          }
        }
        animateRing();
      }, i * 100);
    }
  }

  function performNinjaSpecial(attacker: Fighter, defender: Fighter) {
    const security = attacker === fighter1 ? fighter1Security : fighter2Security;
    const now = Date.now();

    // Validate cooldown and prevent spam
    if (now - security.lastTeleportTime < 1000) {
        checkSecurityViolation(security, 'Special attack cooldown violation', attacker === fighter1 ? 'Fighter 1' : 'Fighter 2');
        return;
    }
    security.lastTeleportTime = now;

    // Store original position for validation
    const originalPos = attacker.group.position.clone();
    const targetPos = defender.group.position.clone();
    targetPos.x += (attacker.facing * -2);

    // Validate target position
    targetPos.copy(validatePosition(targetPos));

    // Rest of the existing performNinjaSpecial code...
  }

  // Show credits when game ends
  function endGame(message: string) {
    gameOver = true;
    showCredits();
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'absolute',
        top: '0', left: '0', right: '0', bottom: '0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '32px',
        flexDirection: 'column', gap: '20px'
    });

    // Show winner message
    overlay.textContent = message;

    // Add countdown text
    const countdown = document.createElement('div');
    countdown.style.fontSize = '24px';
    countdown.style.marginTop = '10px';
    overlay.appendChild(countdown);

    document.body.appendChild(overlay);

    // Play victory song
    playVictorySong();

    // Countdown and restart
    let secondsLeft = 5;
    function updateCountdown() {
        countdown.textContent = `Game restarts in ${secondsLeft} seconds...`;
        if (secondsLeft > 0) {
            secondsLeft--;
            setTimeout(updateCountdown, 1000);
        } else {
            // Reset game state
            fighter1.health = 100;
            fighter2.health = 100;
            updateHealthBars();
            
            // Reset positions
            fighter1.group.position.x = -3;
            fighter2.group.position.x = 3;
            
            // Reset all timers and states
            fighter1.isAttacking = false;
            fighter2.isAttacking = false;
            fighter1.attackTimer = 0;
            fighter2.attackTimer = 0;
            fighter1.isBlocking = false;
            fighter2.isBlocking = false;
            fighter1.blockTimer = 0;
            fighter2.blockTimer = 0;
            fighter1.forceActiveTimer = 0;
            fighter2.forceActiveTimer = 0;
            fighter1.forceCooldown = 0;
            fighter2.forceCooldown = 0;
            fighter1.isOPForm = false;
            fighter2.isOPForm = false;
            fighter1.opFormTimer = 0;
            fighter2.opFormTimer = 0;
            fighter1.opFormCooldown = 0;
            fighter2.opFormCooldown = 0;
            
            // Reset special attack cooldowns
            lightningCooldown = 0;
            fireballCooldown = 0;
            
            // Remove any remaining effects
            if (fighter1.forceMesh) {
                fighter1.group.remove(fighter1.forceMesh);
                fighter1.forceMesh = null;
            }
            if (fighter2.forceMesh) {
                fighter2.group.remove(fighter2.forceMesh);
                fighter2.forceMesh = null;
            }
            if (fighter1.opMesh) {
                fighter1.group.remove(fighter1.opMesh);
                fighter1.opMesh = null;
            }
            if (fighter2.opMesh) {
                fighter2.group.remove(fighter2.opMesh);
                fighter2.opMesh = null;
            }
            
            // Reset character appearances
            const head1 = fighter1.group.getObjectByName('head') as THREE.Mesh;
            const torso1 = fighter1.group.getObjectByName('torso') as THREE.Mesh;
            const leftArm1 = fighter1.group.getObjectByName('leftArm') as THREE.Mesh;
            const rightArm1 = fighter1.group.getObjectByName('rightArm') as THREE.Mesh;
            const leftLeg1 = fighter1.group.getObjectByName('leftLeg') as THREE.Mesh;
            const rightLeg1 = fighter1.group.getObjectByName('rightLeg') as THREE.Mesh;

            [head1, leftArm1, rightArm1].forEach(part => {
                if (part && part.material) {
                    (part.material as THREE.MeshStandardMaterial).color.setHex(0xffe0bd);
                }
                if (part) part.scale.set(1, 1, 1);
            });
            if (torso1 && torso1.material) {
                (torso1.material as THREE.MeshStandardMaterial).color.setHex(0x337ab7);
                torso1.scale.set(1, 1, 1);
            }
            [leftLeg1, rightLeg1].forEach(part => {
                if (part && part.material) {
                    (part.material as THREE.MeshStandardMaterial).color.setHex(0x2e7d32);
                }
                if (part) part.scale.set(1, 1, 1);
            });

            // Remove overlay
            overlay.remove();
            
            // Reset game state
            gameOver = false;
            
            // Show abilities menu again
            const menu = createSimpleAbilitiesMenu();
            setTimeout(() => {
                menu.remove();
            }, 30000);
            
            // Play start song
            playStartSong();
        }
    }
    updateCountdown();
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
  // Fix the type error in getSpecialAttackName
  function getSpecialAttackName(characterType: CharacterType): string {
    switch(characterType) {
      case 'roblox': return 'lightning';
      case 'robot': return 'energy wave';
      case 'ninja': return 'shadow strike';
      case 'bunny': return 'carrot barrage';
    }
  }

  // Update the control guides without menu reference
  const guideBoy = document.createElement('div');
  guideBoy.innerHTML = `
    <strong>BOY FIGHTER</strong><br/>
    A - Left<br/>
    D - Right<br/>
    F - Punch/Shoot Laser/Throw Stars<br/>
    H - Kick/Hack Firewall<br/>
    R - Block<br/>
    X - Special Attack<br/>
    B - Summon Bunny Army (when Bunny)<br/>
    G - Shield (20s)<br/>
    1 - Switch Fighter
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
    <strong>GIRL FIGHTER</strong><br/>
    ← Left<br/>
    → Right<br/>
    / - Punch/Shoot Laser/Throw Stars<br/>
    L - Kick/Hack Firewall<br/>
    P - Block<br/>
    U - Special Attack<br/>
    B - Summon Bunny Army (when Bunny)<br/>
    Z - Shield (20s)<br/>
    2 - Switch Fighter
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
    const FIELD_DURATION = 20; // seconds (changed from 4)
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

  // ================= Credits Button =================
  // (Credits button removed; animation will play on start)

  function showCredits() {
    // Prevent multiple overlays
    if (document.getElementById('credits-overlay')) return;

    const ascii = [
      '    ____  ______  ______  ___ _____      _________    __  ______________',
      '   / __ \/ __ \ \\ \/ / __ \/   /__  /     / ____/   |  /  |/  / ____/ ___/',
      '  / /_/ / / / /\  / /_/ / /| | / /     / / __/ /| | / /|_/ / __/  \\__ \\ ',
      ' / ____/ /_/ / / / _, _/ ___ |/ /__   / /_/ / ___ |/ /  / / /___ ___/ / ',
      '/_/    \____/ /_/_/ |_/_/  |_/____/   \____/_/  |_/_/  /_/_____//____/'
    ];

    const overlay = document.createElement('div');
    overlay.id = 'credits-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: '40px',
      zIndex: '20',
      overflow: 'hidden',
      fontFamily: 'monospace',
      whiteSpace: 'pre',
      color: '#ffffff',
    });

    const artContainer = document.createElement('div');
    overlay.appendChild(artContainer);

    // Build spans with falling animation
    ascii.forEach((line, rowIdx) => {
      const lineDiv = document.createElement('div');
      artContainer.appendChild(lineDiv);
      [...line].forEach((ch, colIdx) => {
        const span = document.createElement('span');
        span.innerHTML = ch === ' ' ? '&nbsp;' : ch;
        span.style.display = 'inline-block';
        span.style.transform = 'translateY(-120vh)';
        span.style.opacity = '0';
        const delay = Math.random() * 1000 + (rowIdx * 80);
        span.style.transition = `transform 0.9s ease-out ${delay}ms, opacity 0.9s ease-out ${delay}ms`;
        lineDiv.appendChild(span);

        // trigger fall after frame
        requestAnimationFrame(() => {
          span.style.transform = 'translateY(0)';
          span.style.opacity = '1';
        });
      });
    });

    // Close on click
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }

  // ===== Simple audio helper =====
  function playChime(duration = 3) {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 880; // A5
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
      osc.onended = () => ctx.close();
    } catch (e) {
      console.warn('AudioContext error', e);
    }
  }

  function playHitSound(isBoy: boolean) {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = isBoy ? 620 : 480; // different pitch per character
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.stop(ctx.currentTime + 0.25);
      osc.onended = () => ctx.close();
    } catch {}
  }

  // ===== Start‑game melody =====
  function playStartSong() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Eine Kleine Nachtmusik opening (approx.)
      const notes: number[] = [
        659.25, 783.99, 987.77, 1046.5, // E5 G5 B5 C6
        987.77, 783.99, 659.25, 523.25, // B5 G5 E5 C5
        659.25, 523.25, 659.25, 783.99, // E5 C5 E5 G5
        659.25, 523.25, 659.25, 783.99, // E5 C5 E5 G5 (repeat motif)
      ];
      const beat = 0.3; // 0.3 * 20 ≈ 6s including fade
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.value = 0.4;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        const t = ctx.currentTime + i * beat;
        osc.start(t);
        osc.stop(t + beat * 0.9);
      });

      const total = notes.length * beat;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + total);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + total + 0.5);
      setTimeout(() => ctx.close(), (total + 1) * 1000);
    } catch {}
  }

  // ===== Victory melody (Turkish March snippet) =====
  function playVictorySong() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      gain.connect(ctx.destination);

      // Extended phrase (~4s)
      const notes: number[] = [
        659.25, 622.25, 659.25, 622.25, 659.25, // E6 D#6 E6 D#6 E6
        493.88, 587.33, 523.25,                 // B5 D6 C6
        440, 0,                                 // A5 (rest)
        261.63, 329.63, 440, 493.88,            // C5 E5 A5 B5
        329.63, 392, 523.25                     // E5 G5 C6
      ];
      const beat = 0.22;

      notes.forEach((freq, i) => {
        if (freq === 0) return; // rest
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        osc.connect(gain);
        const t = ctx.currentTime + i * beat;
        osc.start(t);
        osc.stop(t + beat * 0.9);
      });

      const total = notes.length * beat;
      gain.gain.setValueAtTime(0.5, ctx.currentTime + total);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + total + 0.6);
      setTimeout(()=>ctx.close(), (total + 1) * 1000);
    } catch {}
  }

  // Add character switching controls
  window.addEventListener('keydown', (e) => {
    if (!gameStarted || gameOver) return;
    
    if (e.key === '1') {
      // Cycle boy character: roblox -> robot -> ninja -> roblox
      const nextChar = {
        'roblox': 'robot',
        'robot': 'ninja',
        'ninja': 'roblox'
      }[currentBoyCharacter] as 'roblox' | 'robot' | 'ninja';
      
      switchCharacter(fighter1, 'boy', nextChar);
    }
    
    if (e.key === '2') {
      // Cycle girl character: roblox -> robot -> ninja -> roblox
      const nextChar = {
        'roblox': 'robot',
        'robot': 'ninja',
        'ninja': 'roblox'
      }[currentGirlCharacter] as 'roblox' | 'robot' | 'ninja';
      
      switchCharacter(fighter2, 'girl', nextChar);
    }
  });

  // Add simple abilities menu that shows for 30 seconds
  function createSimpleAbilitiesMenu() {
    const menu = document.createElement('div');
    Object.assign(menu.style, {
        position: 'absolute',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
        fontSize: '12px',
        textAlign: 'left',
        zIndex: '100',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)'
    });

    menu.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px; color: #00ff00; font-size: 14px">
            <strong>ABILITIES</strong>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 15px">
            <div>
                <strong style="color: #3498db; font-size: 13px">BOY FIGHTER</strong><br>
                <div style="margin-left: 8px; margin-top: 3px">
                    <span style="color: #aaa">Attack:</span><br>
                    [F] Roblox: Punch (5 dmg)<br>
                    [F] Robot: Laser (3 dmg)<br>
                    [F] Ninja: Stars (4 dmg)<br>
                    [F] Bunny: Hop Attack (6 dmg)<br>
                    <br>
                    <span style="color: #aaa">Kick:</span><br>
                    [H] Roblox: Kick (5 dmg)<br>
                    [H] Robot: Power (6 dmg)<br>
                    [H] Ninja: Swift (4 dmg)<br>
                    [H] Bunny: Double Kick (7 dmg)<br>
                    <br>
                    <span style="color: #aaa">Special:</span><br>
                    [X] Roblox: Lightning (7 dmg)<br>
                    [X] Robot: Energy Wave (2x5 dmg)<br>
                    [X] Ninja: Shadow Strike (12 dmg)<br>
                    [X] Bunny: Carrot Barrage (5x3 dmg)<br>
                    <br>
                    <span style="color: #aaa">Transform:</span><br>
                    [A] Transform into Bunny<br>
                    <br>
                    <span style="color: #aaa">Defense:</span><br>
                    [G] Shield (20s)<br>
                    [1] Switch Fighter<br>
                    [A,D] Move Left/Right<br>
                    <br>
                    <div style="color: #ffd700; font-weight: bold; padding: 3px; border: 1px solid #ffd700; border-radius: 4px; margin-top: 5px">
                        🐆 LEOPARD FORM [R] 🐆<br>
                        • 5x Damage<br>
                        • 2x Speed<br>
                        • 10s Duration<br>
                        • 30s Cooldown<br>
                        • [D] King's Wrath (40 dmg)
                    </div>
                </div>
            </div>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px">
                <strong style="color: #e74c3c; font-size: 13px">GIRL FIGHTER</strong><br>
                <div style="margin-left: 8px; margin-top: 3px">
                    <span style="color: #aaa">Attack:</span><br>
                    [/] Roblox: Punch (5 dmg)<br>
                    [/] Robot: Laser (3 dmg)<br>
                    [/] Ninja: Stars (4 dmg)<br>
                    [L] Bunny: Hop Attack (6 dmg)<br>
                    <br>
                    <span style="color: #aaa">Kick:</span><br>
                    [L] Roblox: Kick (5 dmg)<br>
                    [L] Robot: Power (6 dmg)<br>
                    [L] Ninja: Swift (4 dmg)<br>
                    [L] Bunny: Double Kick (7 dmg)<br>
                    <br>
                    <span style="color: #aaa">Special:</span><br>
                    [U] Roblox: Lightning (7 dmg)<br>
                    [U] Robot: Energy Wave (2x5 dmg)<br>
                    [U] Ninja: Shadow Strike (12 dmg)<br>
                    [U] Bunny: Carrot Barrage (5x3 dmg)<br>
                    <br>
                    <span style="color: #aaa">Transform:</span><br>
                    [A] Transform into Bunny<br>
                    <br>
                    <span style="color: #aaa">Defense:</span><br>
                    [Z] Shield (20s)<br>
                    [2] Switch Fighter<br>
                    [←,→] Move Left/Right
                </div>
            </div>
        </div>
    `;

    // Add a minimize/maximize button
    const toggleBtn = document.createElement('button');
    Object.assign(toggleBtn.style, {
        position: 'absolute',
        top: '5px',
        right: '5px',
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '5px',
        outline: 'none'
    });
    toggleBtn.textContent = '−';
    
    let isMinimized = false;
    const content = menu.querySelector('div');
    
    toggleBtn.addEventListener('click', () => {
        if (isMinimized) {
            content!.style.display = 'block';
            toggleBtn.textContent = '−';
            menu.style.width = 'auto';
        } else {
            content!.style.display = 'none';
            toggleBtn.textContent = '+';
            menu.style.width = '30px';
        }
        isMinimized = !isMinimized;
    });
    
    menu.appendChild(toggleBtn);
    document.body.appendChild(menu);
    return menu;
  }

  // Add OP form handling
  function handleOPForm(f: Fighter, dt: number) {
    const OP_DURATION = 10; // 10 seconds of leopard power
    const OP_COOLDOWN = 30; // 30 seconds cooldown

    // Check for activation - ONLY allow fighter1 (boy) to use Leopard form
    if (keys['KeyR'] && !f.isOPForm && f.opFormCooldown <= 0 && f === fighter1) {
        f.isOPForm = true;
        f.opFormTimer = OP_DURATION;
        f.opFormCooldown = OP_COOLDOWN;

        // Transform character model to leopard form
        const head = f.group.getObjectByName('head') as THREE.Mesh;
        const torso = f.group.getObjectByName('torso') as THREE.Mesh;
        const leftArm = f.group.getObjectByName('leftArm') as THREE.Mesh;
        const rightArm = f.group.getObjectByName('rightArm') as THREE.Mesh;
        const leftLeg = f.group.getObjectByName('leftLeg') as THREE.Mesh;
        const rightLeg = f.group.getObjectByName('rightLeg') as THREE.Mesh;

        // Make character golden and larger
        const leopardColor = new THREE.Color(0xD4AF37);
        [head, torso, leftArm, rightArm, leftLeg, rightLeg].forEach(part => {
            if (part && part.material) {
                (part.material as THREE.MeshStandardMaterial).color.copy(leopardColor);
                part.scale.set(1.3, 1.3, 1.3);
            }
        });

        // Add spots and claws
        const spotMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });

        // Add spots all over the body
        [torso, leftArm, rightArm, leftLeg, rightLeg].forEach(part => {
            if (!part) return;
            for (let i = 0; i < 15; i++) {
                const spotGeo = new THREE.CircleGeometry(0.08, 8);
                const spot = new THREE.Mesh(spotGeo, spotMat);
                spot.position.set(
                    (Math.random() - 0.5) * 0.8,
                    (Math.random() - 0.5) * 0.8,
                    0.41
                );
                spot.lookAt(new THREE.Vector3(0, 0, 1));
                part.add(spot);
            }
        });

        // Add glowing eyes
        if (head) {
            const eyeGeo = new THREE.CircleGeometry(0.1, 16);
            const eyeMat = new THREE.MeshBasicMaterial({
                color: 0xff6600,
                transparent: true,
                opacity: 0.8
            });
            const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
            const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
            leftEye.position.set(-0.2, 0.1, 0.51);
            rightEye.position.set(0.2, 0.1, 0.51);
            head.add(leftEye, rightEye);
        }

        // Play transformation sound
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
            
            gain.gain.setValueAtTime(0.7, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.warn('Audio error:', e);
        }

        // Restore original appearance when form ends
        setTimeout(() => {
            if (!f.group) return;

            // Restore original colors and scales
            [head, torso, leftArm, rightArm, leftLeg, rightLeg].forEach(part => {
                if (!part) return;
                if (part.material) {
                    const color = part === head || part === leftArm || part === rightArm 
                        ? 0xffe0bd  // skin color
                        : part === torso 
                            ? 0x337ab7  // shirt color
                            : 0x2e7d32;  // pants color
                    (part.material as THREE.MeshStandardMaterial).color.setHex(color);
                }
                part.scale.set(1, 1, 1);
                // Remove all spots and effects
                part.children = part.children.filter(child => !(child instanceof THREE.Mesh));
            });

            f.isOPForm = false;
        }, OP_DURATION * 1000);
    }

    // Update timers
    if (f.opFormCooldown > 0) {
        f.opFormCooldown -= dt;
    }
    if (f.isOPForm) {
        f.opFormTimer -= dt;
    }
  }

  // Add secure game state reset function
  function resetGameState() {
    fighter1.health = MAX_HEALTH;
    fighter2.health = MAX_HEALTH;
    fighter1.group.position.set(-3, 0, 0);
    fighter2.group.position.set(3, 0, 0);
    fighter1.characterType = 'roblox';
    fighter2.characterType = 'roblox';
    
    // Reset security states
    fighter1Security.securityViolations = 0;
    fighter2Security.securityViolations = 0;
    fighter1Security.attackCount = 0;
    fighter2Security.attackCount = 0;
    fighter1Security.teleportAttempts = 0;
    fighter2Security.teleportAttempts = 0;
    
    updateHealthBars();
  }

  // Add firewall system constants and interfaces
  interface FirewallSystem {
    active: boolean;
    barriers: THREE.Group[];
    lastBreachAttempt: number;
    breachCount: number;
    warningLevel: number;
  }

  const firewallSystem: FirewallSystem = {
    active: true,
    barriers: [],
    lastBreachAttempt: 0,
    breachCount: 0,
    warningLevel: 0
  };

  // Add firewall functions before the init function
  function createFireBarrier(xPosition: number): THREE.Group {
    const barrier = new THREE.Group();
    const particleCount = 50;
    
    // Create fire particles
    for (let i = 0; i < particleCount; i++) {
      const particleGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const particleMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xff4400),
        transparent: true,
        opacity: 0.7
      });
      
      const particle = new THREE.Mesh(particleGeom, particleMat);
      particle.position.set(
        xPosition + (Math.random() - 0.5) * 0.5,
        Math.random() * 5,
        (Math.random() - 0.5) * 10
      );
      
      // Add animation data to particle
      (particle as any).velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.1
      );
      
      barrier.add(particle);
    }

    // Add glow effect
    const glowGeom = new THREE.BoxGeometry(0.5, 5, 10);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.set(xPosition, 2.5, 0);
    barrier.add(glow);

    return barrier;
  }

  function createFirewallWarning() {
    const warning = document.createElement('div');
    warning.id = 'firewall-warning';
    Object.assign(warning.style, {
      position: 'absolute',
      top: '50px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontSize: '16px',
      fontWeight: 'bold',
      textShadow: '0 0 5px #ff0000',
      opacity: '0',
      transition: 'opacity 0.3s',
      zIndex: '100',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ff0000'
    });
    document.body.appendChild(warning);
  }

  function updateFirewall(dt: number) {
    if (!firewallSystem.active) return;

    // Update fire particles
    firewallSystem.barriers.forEach(barrier => {
      barrier.children.forEach(child => {
        if (child instanceof THREE.Mesh && (child as any).velocity) {
          // Update particle position
          child.position.add((child as any).velocity);
          
          // Reset particle if it goes too high or low
          if (child.position.y > 5) {
            child.position.y = 0;
          }
          
          // Flicker effect
          (child.material as THREE.MeshBasicMaterial).opacity = 
            0.4 + Math.random() * 0.3;
        }
      });

      // Rotate the barrier slightly for effect
      barrier.rotation.y += dt * 0.1;
    });

    // Check for breaches
    const warningElement = document.getElementById('firewall-warning');
    if (warningElement) {
      if (firewallSystem.warningLevel > 0) {
        warningElement.style.opacity = '1';
        warningElement.textContent = `⚠️ FIREWALL BREACH ATTEMPT DETECTED (Level ${firewallSystem.warningLevel}) ⚠️`;
        firewallSystem.warningLevel = Math.max(0, firewallSystem.warningLevel - dt);
      } else {
        warningElement.style.opacity = '0';
      }
    }
  }

  // Add hacking system interface near the top with other interfaces
  interface HackingSystem {
    active: boolean;
    progress: number;
    targetCode: string;
    currentInput: string;
    hackAttempts: number;
    cooldown: number;
    successCallback?: () => void;
  }

  const hackingSystem: HackingSystem = {
    active: false,
    progress: 0,
    targetCode: '',
    currentInput: '',
    hackAttempts: 0,
    cooldown: 0
  };

  // Add hacking functions before the init function
  function createHackingInterface(scene: THREE.Scene) {
    const hackContainer = document.createElement('div');
    hackContainer.id = 'hacking-interface';
    Object.assign(hackContainer.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #0f0',
      padding: '20px',
      borderRadius: '10px',
      color: '#0f0',
      fontFamily: 'monospace',
      display: 'none',
      zIndex: '1000'
    });

    const title = document.createElement('div');
    title.textContent = 'FIREWALL BREACH ATTEMPT';
    Object.assign(title.style, {
      fontSize: '20px',
      marginBottom: '15px',
      textAlign: 'center'
    });

    const codeDisplay = document.createElement('div');
    codeDisplay.id = 'hack-code';
    Object.assign(codeDisplay.style, {
      fontSize: '24px',
      marginBottom: '15px',
      letterSpacing: '5px',
      textAlign: 'center'
    });

    const hackInput = document.createElement('input');
    hackInput.id = 'hack-input';
    Object.assign(hackInput.style, {
      background: 'rgba(0, 255, 0, 0.1)',
      border: '1px solid #0f0',
      color: '#0f0',
      padding: '5px',
      width: '100%',
      fontSize: '18px',
      textAlign: 'center',
      outline: 'none'
    });

    const progressBar = document.createElement('div');
    progressBar.id = 'hack-progress';
    Object.assign(progressBar.style, {
      width: '100%',
      height: '10px',
      background: '#333',
      marginTop: '15px',
      borderRadius: '5px',
      overflow: 'hidden'
    });

    const progressFill = document.createElement('div');
    progressFill.id = 'hack-progress-fill';
    Object.assign(progressFill.style, {
      width: '0%',
      height: '100%',
      background: '#0f0',
      transition: 'width 0.3s'
    });

    progressBar.appendChild(progressFill);
    hackContainer.appendChild(title);
    hackContainer.appendChild(codeDisplay);
    hackContainer.appendChild(hackInput);
    hackContainer.appendChild(progressBar);
    document.body.appendChild(hackContainer);

    hackInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      hackingSystem.currentInput = target.value.toUpperCase();
      checkHackingProgress(scene);
    });
  }

  function generateHackingCode(): string {
    const chars = '0123456789ABCDEF';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function checkHackingProgress(scene: THREE.Scene) {
    if (!hackingSystem.active) return;
    
    const progressFill = document.getElementById('hack-progress-fill');
    if (!progressFill) return;
    
    let matches = 0;
    const input = hackingSystem.currentInput;
    const target = hackingSystem.targetCode;
    
    for (let i = 0; i < Math.min(input.length, target.length); i++) {
      if (input[i] === target[i]) matches++;
    }
    
    hackingSystem.progress = (matches / target.length) * 100;
    progressFill.style.width = `${hackingSystem.progress}%`;
    
    if (input === target) {
      hackSuccess(scene);
    } else if (input.length >= target.length) {
      hackFail();
    }
  }

  function hackSuccess(scene: THREE.Scene) {
    hackingSystem.active = false;
    hackingSystem.cooldown = 10;
    hackingSystem.hackAttempts = 0;
    
    const hackContainer = document.getElementById('hacking-interface');
    if (hackContainer) {
      hackContainer.style.display = 'none';
    }
    
    const successFlash = document.createElement('div');
    Object.assign(successFlash.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 255, 0, 0.2)',
      zIndex: '999',
      pointerEvents: 'none'
    });
    document.body.appendChild(successFlash);
    setTimeout(() => successFlash.remove(), 500);
    
    if (hackingSystem.successCallback) {
      hackingSystem.successCallback();
    }
  }

  function hackFail() {
    hackingSystem.hackAttempts++;
    
    if (hackingSystem.hackAttempts >= 3) {
      hackingSystem.active = false;
      hackingSystem.cooldown = 20;
      
      const hackContainer = document.getElementById('hacking-interface');
      if (hackContainer) {
        hackContainer.style.display = 'none';
      }
      
      const failFlash = document.createElement('div');
      Object.assign(failFlash.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(255, 0, 0, 0.2)',
        zIndex: '999',
        pointerEvents: 'none'
      });
      document.body.appendChild(failFlash);
      setTimeout(() => failFlash.remove(), 500);
    } else {
      hackingSystem.targetCode = generateHackingCode();
      hackingSystem.currentInput = '';
      const codeDisplay = document.getElementById('hack-code');
      const hackInput = document.getElementById('hack-input') as HTMLInputElement;
      if (codeDisplay && hackInput) {
        codeDisplay.textContent = hackingSystem.targetCode;
        hackInput.value = '';
        hackInput.focus();
      }
    }
  }

  function startHacking(fighter: Fighter, scene: THREE.Scene, callback?: () => void) {
    if (hackingSystem.cooldown > 0) return;
    
    hackingSystem.active = true;
    hackingSystem.progress = 0;
    hackingSystem.targetCode = generateHackingCode();
    hackingSystem.currentInput = '';
    hackingSystem.successCallback = callback;
    
    const hackContainer = document.getElementById('hacking-interface');
    const codeDisplay = document.getElementById('hack-code');
    const hackInput = document.getElementById('hack-input') as HTMLInputElement;
    
    if (hackContainer && codeDisplay && hackInput) {
      hackContainer.style.display = 'block';
      codeDisplay.textContent = hackingSystem.targetCode;
      hackInput.value = '';
      hackInput.focus();
    }
  }

  // Add bunny character creation function
  function createBunnyCharacter(): THREE.Group {
    const group = new THREE.Group();

    // Materials
    const furMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }); // White fur
    const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 }); // Pink for ears inside
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black for eyes

    // Head
    const headGeo = new THREE.BoxGeometry(1, 1, 1);
    const head = new THREE.Mesh(headGeo, furMaterial);
    head.position.y = 3.5;
    head.name = 'head';

    // Bunny ears
    const earGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const leftEar = new THREE.Mesh(earGeo, furMaterial);
    leftEar.position.set(-0.3, 0.8, 0);
    const rightEar = leftEar.clone();
    rightEar.position.x = 0.3;
    head.add(leftEar, rightEar);

    // Pink inner ears
    const innerEarGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, pinkMaterial);
    leftInnerEar.position.set(0, 0.1, 0);
    const rightInnerEar = leftInnerEar.clone();
    leftEar.add(leftInnerEar);
    rightEar.add(rightInnerEar);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
    const leftEye = new THREE.Mesh(eyeGeo, blackMaterial);
    leftEye.position.set(-0.2, 0.1, 0.51);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.2;
    head.add(leftEye, rightEye);

    // Nose
    const noseGeo = new THREE.BoxGeometry(0.15, 0.15, 0.1);
    const nose = new THREE.Mesh(noseGeo, pinkMaterial);
    nose.position.set(0, -0.1, 0.51);
    head.add(nose);

    group.add(head);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.3, 1.5, 0.8);
    const torso = new THREE.Mesh(torsoGeo, furMaterial);
    torso.position.y = 2.25;
    torso.name = 'torso';
    group.add(torso);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const leftArm = new THREE.Mesh(armGeo, furMaterial);
    leftArm.position.set(-0.85, 2.25, 0);
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.85;
    rightArm.name = 'rightArm';
    group.add(leftArm, rightArm);

    // Legs - make them a bit thicker for bunny legs
    const legGeo = new THREE.BoxGeometry(0.6, 1.5, 0.6);
    const leftLeg = new THREE.Mesh(legGeo, furMaterial);
    leftLeg.position.set(-0.3, 0.75, 0);
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.3;
    rightLeg.name = 'rightLeg';
    group.add(leftLeg, rightLeg);

    // Add fluffy tail
    const tailGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const tail = new THREE.Mesh(tailGeo, furMaterial);
    tail.position.set(0, 2, -0.5);
    group.add(tail);

    return group;
  }

  // Add bunny special attack function
  function performBunnySpecial(attacker: Fighter, defender: Fighter) {
    // Carrot barrage attack
    const carrotCount = 5;
    const carrotDelay = 100; // ms between carrots

    for (let i = 0; i < carrotCount; i++) {
      setTimeout(() => {
        const carrotGeo = new THREE.ConeGeometry(0.1, 0.4, 8);
        const carrotMat = new THREE.MeshStandardMaterial({ color: 0xff6b00 });
        const carrot = new THREE.Mesh(carrotGeo, carrotMat);
        
        carrot.position.copy(attacker.group.position);
        carrot.position.y += 2;
        
        const direction = new THREE.Vector3();
        direction.subVectors(defender.group.position, carrot.position);
        direction.normalize();
        
        const velocity = direction.multiplyScalar(15);
        
        scene.add(carrot);
        projectiles.push({
          mesh: carrot,
          velocity: velocity,
          owner: 'girl',
          lifetime: 2
        });
      }, i * carrotDelay);
    }
  }

  // Add bunny transformation handling
  function handleBunnyTransform(f: Fighter) {
    if (keys['KeyA'] && f.characterType !== 'bunny' && f === fighter1) {
        switchCharacter(f, 'boy', 'bunny');
        
        const sparkles = new THREE.Group();
        const sparkMeshes: THREE.Mesh[] = [];
        
        for (let i = 0; i < 20; i++) {
            const sparkGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const sparkMat = new THREE.MeshBasicMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            const spark = new THREE.Mesh(sparkGeo, sparkMat);
            
            spark.position.set(
                (Math.random() - 0.5) * 2,
                Math.random() * 4,
                (Math.random() - 0.5) * 2
            );
            
            sparkles.add(spark);
            sparkMeshes.push(spark);
        }
        
        f.group.add(sparkles);
        
        let t = 0;
        function animateSparkles() {
            if (!sparkles.parent) return;
            
            sparkMeshes.forEach((spark, i) => {
                spark.position.y += Math.sin(t + i) * 0.1;
                spark.rotation.z += 0.1;
                (spark.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 - t/30);
            });
            
            t++;
            if (t < 30) {
                requestAnimationFrame(animateSparkles);
            } else {
                f.group.remove(sparkles);
                sparkMeshes.forEach(spark => {
                    spark.geometry.dispose();
                    if (spark.material instanceof THREE.Material) {
                        spark.material.dispose();
                    } else if (Array.isArray(spark.material)) {
                        spark.material.forEach(mat => mat.dispose());
                    }
                });
            }
        }
        animateSparkles();
    }
  }

  // Add bunny army interface
  interface BunnyMinion {
    mesh: THREE.Group;
    velocity: THREE.Vector3;
    lifetime: number;
    target: THREE.Vector3;
  }

  // Add bunny army summoning function
  function summonBunnyArmy(f: Fighter, opponent: Fighter) {
    if (f.bunnyArmyCooldown > 0 || f.characterType !== 'bunny') return;

    const BUNNY_COUNT = 4;  // Keep at 4 for balance
    const BUNNY_LIFETIME = 6; // Slightly longer lifetime
    const BUNNY_COOLDOWN = 8; // Slightly faster cooldown
    
    f.bunnyArmyCooldown = BUNNY_COOLDOWN;

    // Better summoning effect
    const summonEffect = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 2.5, 4, 16), // Wider effect
      new THREE.MeshBasicMaterial({
        color: 0xff69b4,
        transparent: true,
        opacity: 0.7
      })
    );
    summonEffect.position.copy(f.group.position);
    scene.add(summonEffect);

    // Improved animation
    let scale = 1;
    function animateSummon() {
      scale *= 1.2;
      summonEffect.scale.set(scale, 1, scale);
      (summonEffect.material as THREE.MeshBasicMaterial).opacity = 
        Math.max(0, 0.7 - (scale * 0.1));
      
      if (scale < 3) {
        requestAnimationFrame(animateSummon);
      } else {
        scene.remove(summonEffect);
        summonEffect.geometry.dispose();
        (summonEffect.material as THREE.MeshBasicMaterial).dispose();
      }
    }
    animateSummon();

    // Create mini bunnies with better movement
    for (let i = 0; i < BUNNY_COUNT; i++) {
      const miniBunny = createBunnyCharacter();
      miniBunny.scale.set(0.5, 0.5, 0.5); // Slightly larger bunnies
      
      // Better positioning with wider spread
      const angle = (i / BUNNY_COUNT) * Math.PI * 2;
      const radius = 3; // Increased radius for wider formation
      miniBunny.position.set(
        f.group.position.x + Math.cos(angle) * radius,
        0.5,
        Math.sin(angle) * radius
      );

      // Improved hop animation
      const hopHeight = 0.5; // Higher hops
      const hopSpeed = 2.5 + Math.random();
      let hopTime = Math.random() * Math.PI * 2;

      function animateHop() {
        hopTime += 0.12;
        miniBunny.position.y = 0.5 + Math.abs(Math.sin(hopTime * hopSpeed)) * hopHeight;
        requestAnimationFrame(animateHop);
      }
      animateHop();

      // Smarter targeting with wider spread
      const targetPos = new THREE.Vector3(
        opponent.group.position.x + (Math.random() - 0.5) * 4, // Wider target area
        0.5,
        (Math.random() - 0.5) * 4 // Wider target area
      );

      // Better movement speed
      const velocity = new THREE.Vector3();
      velocity.subVectors(targetPos, miniBunny.position);
      velocity.normalize();
      velocity.multiplyScalar(6.5); // Slightly faster

      scene.add(miniBunny);
      f.bunnyArmy.push({
        mesh: miniBunny,
        velocity: velocity,
        lifetime: BUNNY_LIFETIME,
        target: targetPos
      });
    }

    // Improved sound effect
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }
} 