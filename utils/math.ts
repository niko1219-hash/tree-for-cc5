import * as THREE from 'three';

// Constants
export const TREE_HEIGHT = 18;
export const TREE_RADIUS = 7.5; // Wider base for grandeur
export const SCATTER_RADIUS = 35;

/**
 * Returns a position on a "Tiered" Pine Tree Surface
 * 
 * Logic:
 * Real Christmas trees have layers (whorls) of branches.
 * We simulate this by modulating the radius based on height segments.
 */
export const getTreePosition = (
  normalizedHeight: number, // 0 (bottom) to 1 (top)
  angle: number,
  radiusOffset: number = 1 // 0 to 1 = inside volume, > 1 = branch tips
): THREE.Vector3 => {
  // 1. Base Cone Shape (Triangle)
  // At h=0, r=MAX. At h=1, r=0.
  // We use a slight power curve so the base is fuller
  const baseConeRadius = Math.pow((1.0 - normalizedHeight), 0.9) * TREE_RADIUS;

  // 2. Layering (The "Sawtooth" Profile)
  const tiers = 10; // Fewer, more distinct layers
  // This creates a sawtooth wave: /|/|/|
  const effectiveH = Math.pow(normalizedHeight, 0.95); 
  const tierPhase = (effectiveH * tiers) % 1; 
  
  // Shaping the branch: It goes out, then cuts back in for the next layer
  // A sharp drop-off at the top of the tier simulates the gap between branches
  const layerExpansion = 0.5 + 0.5 * tierPhase; 
  
  // 3. Radial Lobes (Star Shape)
  // Trees aren't perfect circles. They have main branches radiating out.
  const numMainBranches = 8 + Math.floor((1-normalizedHeight) * 3); // More branches at bottom
  // Use noise to make lobes uneven
  const branchLobe = Math.cos(angle * numMainBranches + normalizedHeight * 15.0);
  const lobeFactor = 0.85 + 0.3 * branchLobe;

  // Combine Radius
  let r = baseConeRadius * layerExpansion * lobeFactor;

  // Apply Volume Spread (randomness passed in)
  // We push randomness towards the outside to make the 'shell' defined
  r *= (0.2 + 0.8 * Math.sqrt(radiusOffset));

  // 4. Branch Droop (Gravity)
  // Branches are heavy. They start high and droop down as they go out.
  // We lower Y based on how far out R is.
  let y = (normalizedHeight - 0.5) * TREE_HEIGHT;
  
  // Calculate how far this point is from the "trunk" (0, y, 0) relative to max possible radius at this height
  const droopStrength = (r / TREE_RADIUS) * 2.5; 
  y -= droopStrength * 1.2; // Significant droop for realistic "Fir" look

  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);

  return new THREE.Vector3(x, y, z);
};

/**
 * Returns a random position inside a sphere (The Chaos)
 */
export const getSpherePosition = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

/**
 * Linear interpolation helper
 */
export const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};