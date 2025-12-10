import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping } from '@react-three/postprocessing';
import { FoliageParticles } from './FoliageParticles';
import { Ornaments } from './Ornaments';
import * as THREE from 'three';
import { TREE_HEIGHT } from '../utils/math';

interface ExperienceProps {
  isTreeForm: boolean;
}

export const Experience: React.FC<ExperienceProps> = ({ isTreeForm }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ReinhardToneMapping, 
        toneMappingExposure: 2.5, // Much brighter exposure
        stencil: false
      }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 5, 45]} fov={50} />
      
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={20} 
        maxDistance={70} 
        autoRotate={true}
        autoRotateSpeed={isTreeForm ? 0.8 : 0.2} 
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 2, 0]}
      />

      {/* --- Cinematic & Bright Lighting Setup --- */}
      
      {/* 1. Key Light: Blinding Gold (From top right) */}
      <spotLight 
        position={[30, 40, 30]} 
        angle={0.3} 
        penumbra={0.5} 
        intensity={80} // Very High Intensity
        color="#ffecd1" 
        castShadow 
        shadow-bias={-0.0001}
      />
      
      {/* 2. Fill Light: Warmth from bottom */}
      <pointLight position={[0, -10, 20]} intensity={20} color="#ffaa33" distance={50} />
      
      {/* 3. Rim Light: Sharp Emerald/Cyan to cut the silhouette */}
      <spotLight 
        position={[-30, 20, -30]} 
        angle={0.6} 
        penumbra={1} 
        intensity={60} 
        color="#00ffcc" 
      />

      {/* Environment for Reflections - High intensity for metallic glint */}
      <Environment preset="sunset" background={false} blur={0.5} environmentIntensity={2.0} />
      
      {/* Ambient particles for magical atmosphere */}
      <Sparkles 
        count={800} 
        scale={40} 
        size={6} 
        speed={0.6} 
        opacity={0.8} 
        color="#fffbac" 
      />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

      {/* Scene Group */}
      <group position={[0, -4, 0]}>
        
        <FoliageParticles isTreeForm={isTreeForm} />
        
        {/* Ornaments: Strict Emerald & Gold Palette */}

        {/* Heavy Boxes: Deepest Lacquered Green */}
        <Ornaments 
          type="box" 
          count={60} 
          color="#004d25" 
          scaleBase={1.2} 
          isTreeForm={isTreeForm} 
          floatSpeed={0.3}
          floatRange={0.8}
        />
        
        {/* Main Jewel: Polished Gold Spheres - Brighter Gold */}
        <Ornaments 
          type="sphere" 
          count={120} 
          color="#FFD700" 
          scaleBase={0.8} 
          isTreeForm={isTreeForm} 
          floatSpeed={0.8}
          floatRange={1.5}
        />
         
        {/* Fairy Lights: Emissive Champagne */}
        <Ornaments 
          type="sphere" 
          count={300} 
          color="#fffbd6" 
          scaleBase={0.18} 
          isTreeForm={isTreeForm}
          floatSpeed={1.5} 
          floatRange={3.0}
        />

        {/* The Star Topper */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2} floatingRange={[0, 0.2]}>
            {/* Height needs to account for droop approx, adjusted manually */}
            <group position={[0, TREE_HEIGHT * 0.5 - 1.0, 0]} visible={isTreeForm} scale={isTreeForm ? 1 : 0}> 
                {/* Core Star */}
                <mesh>
                   <octahedronGeometry args={[1.5, 0]} />
                   <meshStandardMaterial 
                     color="#FFD700" 
                     emissive="#FFD700" 
                     emissiveIntensity={4} 
                     metalness={1} 
                     roughness={0} 
                   />
                </mesh>
                {/* Outer halo */}
                <mesh scale={1.5}>
                   <octahedronGeometry args={[1.5, 0]} />
                   <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} wireframe />
                </mesh>
                <pointLight distance={15} intensity={10} color="#ffaa00" />
            </group>
        </Float>
      </group>

      {/* High-End Post Processing */}
      <EffectComposer disableNormalPass>
        {/* Bloom: Lower threshold so more things glow, higher intensity */}
        <Bloom 
            luminanceThreshold={0.65} 
            mipmapBlur 
            intensity={2.0} 
            radius={0.6} 
            levels={9}
        />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
};