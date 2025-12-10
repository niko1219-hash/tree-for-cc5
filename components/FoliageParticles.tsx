import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTreePosition, getSpherePosition, SCATTER_RADIUS } from '../utils/math';

const PARTICLE_COUNT = 25000;

// -- Shaders --

const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0 = Scattered, 1 = Tree
  uniform float uPixelRatio;

  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;
  varying vec3 vColor;

  // Cubic Bezier Ease In Out
  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = easeInOutCubic(uProgress);
    
    // Organic noise movement
    vec3 noise = vec3(
      sin(uTime * 1.5 + aRandom * 15.0),
      cos(uTime * 1.0 + aRandom * 25.0),
      sin(uTime * 0.8 + aRandom * 35.0)
    ) * (1.0 - t) * 0.8; // More float when scattered

    // Spiral wind effect during transition
    float spiral = sin(t * 3.14) * 2.0;
    vec3 mixedPos = mix(aScatterPos, aTreePos, t);
    
    // Apply slight spiral twist based on height (y) for dynamic assembly
    float angle = spiral * 0.5 * (mixedPos.y * 0.1);
    float cz = cos(angle);
    float sz = sin(angle);
    // mat3 rot = mat3(cz, 0, sz, 0, 1, 0, -sz, 0, cz);
    // mixedPos = rot * mixedPos; // Optional twist
    
    vec3 pos = mixedPos + noise;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = (aSize * uPixelRatio) * (30.0 / -mvPosition.z);

    // Color mixing: Deep Luxury Emerald to Champagne Gold
    float sparkle = sin(uTime * 3.0 + aRandom * 100.0);
    
    // Richer, darker emerald for the deep branches
    vec3 emerald = vec3(0.0, 0.20, 0.05); 
    // Brighter, warmer gold for tips
    vec3 gold = vec3(1.0, 0.85, 0.4);
    
    // Mix based on randomness and sparkle
    // We use aRandom to determine if this particle is a "tip" particle or "inner" particle
    float isTip = smoothstep(0.8, 1.0, aRandom); // Only top 20% are potential gold tips
    float goldMix = isTip * (pow(aRandom, 10.0) + (sparkle * 0.3)); 
    
    vColor = mix(emerald, gold, clamp(goldMix, 0.0, 1.0));
    vAlpha = 0.6 + sparkle * 0.4; // Twinkle alpha
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Soft circular particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r = length(coord) * 2.0;
    
    if (r > 1.0) discard;

    // Enhanced glow gradient
    float glow = 1.0 - pow(r, 1.5); // Softer edge
    glow *= 1.5; // Boost intensity for bloom

    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  isTreeForm: boolean;
}

export const FoliageParticles: React.FC<FoliageProps> = ({ isTreeForm }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate Data once
  const { positions, scatterPositions, treePositions, randoms, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const scatterPositions = new Float32Array(PARTICLE_COUNT * 3);
    const treePositions = new Float32Array(PARTICLE_COUNT * 3);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Tree Form
      const h = Math.random(); 
      const angle = (Math.random() * Math.PI * 2);
      
      // Volume Filling Logic:
      // We want most particles near the "surface" of the branches, but some deep inside.
      // biased random towards 1.0
      const rRandom = 1.0 - Math.pow(Math.random(), 2.0) * 0.8; 
      
      const treePos = getTreePosition(h, angle, rRandom);
      treePositions[i * 3] = treePos.x;
      treePositions[i * 3 + 1] = treePos.y;
      treePositions[i * 3 + 2] = treePos.z;

      // Scatter Form
      const scatterPos = getSpherePosition(SCATTER_RADIUS);
      scatterPositions[i * 3] = scatterPos.x;
      scatterPositions[i * 3 + 1] = scatterPos.y;
      scatterPositions[i * 3 + 2] = scatterPos.z;

      randoms[i] = Math.random();
      sizes[i] = 0.5 + Math.random() * 2.5;
    }

    return { positions, scatterPositions, treePositions, randoms, sizes };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      const target = isTreeForm ? 1.0 : 0.0;
      // Slower, heavier transition for luxury feel
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgress.value,
        target,
        0.015 
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPixelRatio: { value: window.devicePixelRatio },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
