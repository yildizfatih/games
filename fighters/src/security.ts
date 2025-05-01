import * as THREE from 'three';

// Security Types
export interface HealthHistory {
    timestamp: number;
    value: number;
}

export interface SecurityConfig {
    MIN_HEALTH: number;
    MAX_HEALTH: number;
    MAX_SPEED: number;
    BREACH_COOLDOWN: number;
    BREACH_THRESHOLD: number;
    ATTACK_COOLDOWN: number;
    MAX_ATTACKS_PER_SECOND: number;
    MAX_POSITION_CHANGE: number;
    MAX_TELEPORTS_PER_SECOND: number;
    POSITION_CHECK_INTERVAL: number;
    VIOLATION_THRESHOLD: number;
    ANTI_CHEAT_ENABLED: boolean;
    DETECTION_INTERVAL: number;
    MAX_HEALTH_CHANGE_RATE: number;
}

export interface SecurityState {
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

// Player-friendly security configuration
export const SECURITY_CONFIG: SecurityConfig = {
    MIN_HEALTH: 0,
    MAX_HEALTH: 100,
    MAX_SPEED: 25, // Even more generous speed limit
    BREACH_COOLDOWN: 5000, // Much more forgiving cooldown (5 seconds)
    BREACH_THRESHOLD: 15, // Much higher threshold before any action
    ATTACK_COOLDOWN: 80, // Even faster attacks allowed
    MAX_ATTACKS_PER_SECOND: 15, // More attacks per second
    MAX_POSITION_CHANGE: 20, // Much larger position changes allowed
    MAX_TELEPORTS_PER_SECOND: 8, // More teleports allowed
    POSITION_CHECK_INTERVAL: 200, // Much less frequent position checks
    VIOLATION_THRESHOLD: 20, // Many more violations allowed before action
    ANTI_CHEAT_ENABLED: false, // Keep anti-cheat disabled
    DETECTION_INTERVAL: 1000, // Very infrequent detection checks
    MAX_HEALTH_CHANGE_RATE: 75 // Higher health change rate allowed
};

// Validation functions
export function validateHealth(health: number): number {
    return Math.max(SECURITY_CONFIG.MIN_HEALTH, Math.min(SECURITY_CONFIG.MAX_HEALTH, health));
}

export function validateSpeed(speed: number): number {
    return Math.min(speed * 2, SECURITY_CONFIG.MAX_SPEED); // Double speed multiplier
}

export function validatePosition(pos: THREE.Vector3): THREE.Vector3 {
    const maxX = 12; // Larger arena
    const maxY = 8;  // Higher jumps
    const maxZ = 8;  // More depth movement
    return new THREE.Vector3(
        Math.max(-maxX, Math.min(maxX, pos.x)),
        Math.max(0, Math.min(maxY, pos.y)),
        Math.max(-maxZ, Math.min(maxZ, pos.z))
    );
}

export function validateCharacterType(type: string): boolean {
    return ['roblox', 'robot', 'ninja', 'bunny'].includes(type);
}

// Initialize security states
export const fighter1Security: SecurityState = {
    lastAttackTime: Date.now(),
    attackCount: 0,
    lastResetTime: Date.now(),
    invalidInputAttempts: 0,
    lastPosition: new THREE.Vector3(-3, 0, 0),
    teleportAttempts: 0,
    lastTeleportTime: Date.now(),
    securityViolations: 0,
    healthHistory: [],
    lastHealthUpdate: Date.now(),
    suspiciousHealthChanges: 0
};

export const fighter2Security: SecurityState = {
    lastAttackTime: Date.now(),
    attackCount: 0,
    lastResetTime: Date.now(),
    invalidInputAttempts: 0,
    lastPosition: new THREE.Vector3(3, 0, 0),
    teleportAttempts: 0,
    lastTeleportTime: Date.now(),
    securityViolations: 0,
    healthHistory: [],
    lastHealthUpdate: Date.now(),
    suspiciousHealthChanges: 0
}; 