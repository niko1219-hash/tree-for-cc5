import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTreePosition, getSpherePosition, SCATTER_RADIUS } from '../utils/math';

interface OrnamentProps {
  type: 'sphere' | 'box';
  count: number;
  color: string;
  isTreeForm: boolean;
  scaleBase: number;
  floatSpeed?: number; 
  floatRange?: number;
}

export const Ornaments: React.FC<OrnamentProps> = ({ 
  type, 
  count, 
  color, 
  isTreeForm, 
  scaleBase,
  floatSpeed = 1,
  floatRange = 1
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = new THREE.Object3D();
  
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      // Tree Position
      const h = Math.random();
      const angle = Math.random() * Math.PI * 2;
      
      // Placement logic:
      // Boxes: Hang closer to the core or middle of branch
      // Spheres: Hang near tips
      // Lights: Scattered everywhere
      let rOffset = 1.0;
      if (type === 'box') rOffset = 0.5 + Math.random() * 0.4; // Deeper on branch
      else if (scaleBase < 0.2) rOffset = 0.8 + Math.random() * 0.5; // Lights
      else rOffset = 0.95 + Math.random() * 0.25; // Ornaments near tips (some dangling)
      
      // Get position on the new tiered tree shape
      const treePos = getTreePosition(h, angle, rOffset);
      
      // Scatter Position
      const scatterPos = getSpherePosition(SCATTER_RADIUS * 1.1);

      const rotSpeed = (Math.random() - 0.5) * 0.02;
      const rotAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      const scale = scaleBase * (0.8 + Math.random() * 0.4);
      const phase = Math.random() * Math.PI * 2;

      return { treePos, scatterPos, rotSpeed, rotAxis, scale, phase };
    });
  }, [count, scaleBase, type]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const t = isTreeForm ? 1 : 0;
    
    // Smooth transition
    let currentProgress = meshRef.current.userData.progress || 0;
    currentProgress = THREE.MathUtils.lerp(currentProgress, t, 0.015); 
    meshRef.current.userData.progress = currentProgress;
    
    // Easing
    const easedProgress = currentProgress < 0.5 
      ? 4 * currentProgress * currentProgress * currentProgress 
      : 1 - Math.pow(-2 * currentProgress + 2, 3) / 2;

    data.forEach((obj, i) => {
      // Position
      const pos = new THREE.Vector3().lerpVectors(obj.scatterPos, obj.treePos, easedProgress);
      
      // Float
      const activeFloatRange = (1 - easedProgress) * floatRange;
      
      // Add a subtle "breeze" movement even when in tree form for liveliness
      const breeze = isTreeForm ? 0.05 : 1.0;

      if (activeFloatRange > 0.01 || isTreeForm) {
        const floatY = Math.sin(time * floatSpeed + obj.phase);
        pos.y += floatY * (activeFloatRange + (isTreeForm ? 0.05 : 0));
        pos.x += Math.cos(time * (floatSpeed * 0.5) + obj.phase) * ((activeFloatRange * 0.5) + (isTreeForm ? 0.02 : 0));
        pos.z += Math.sin(time * (floatSpeed * 0.3) + obj.phase) * ((activeFloatRange * 0.5) + (isTreeForm ? 0.02 : 0));
      }

      // Rotation
      tempObject.position.copy(pos);
      tempObject.scale.setScalar(obj.scale);
      
      // When in tree form, orient boxes to gravity slightly, but keeping random spin
      tempObject.rotation.set(0, 0, 0); 
      tempObject.rotateOnAxis(obj.rotAxis, obj.rotSpeed * (1 + (1-easedProgress)*5) + time * 0.1); 
      
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Calculate emissive color based on input color
  // If it's gold or light, make it glow. If it's dark green box, low glow.
  const isLight = scaleBase < 0.2 || color.includes('FDD017') || color.includes('FFD700');
  const emissiveColor = isLight ? color : '#000000';
  const emissiveIntensity = isLight ? (scaleBase < 0.2 ? 5.0 : 0.5) : 0;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      {type === 'sphere' ? (
        <sphereGeometry args={[1, 32, 32]} />
      ) : (
        // Beveled Box for more luxury reflection
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        metalness={1.0}
        roughness={0.05} // Very polished
        envMapIntensity={3.0} // High reflection
      />
    </instancedMesh>
  );
};