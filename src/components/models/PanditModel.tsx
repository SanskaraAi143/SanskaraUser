
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import { Group } from 'three';

const PanditModel = () => {
  const modelRef = useRef<Group>(null);
  
  useFrame((state, delta) => {
    if (modelRef.current) {
      // Gentle rotation animation
      modelRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={modelRef} position={[0, -1.5, 0]}>
      {/* Body */}
      <Cylinder args={[1, 1.5, 3, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#D62F32" />
      </Cylinder>
      
      {/* Head */}
      <Sphere args={[1, 16, 16]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#E8C49B" />
      </Sphere>
      
      {/* Eyes */}
      <Sphere args={[0.15, 16, 16]} position={[-0.3, 2.2, 0.8]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.3, 2.2, 0.8]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Nose */}
      <Sphere args={[0.2, 16, 16]} position={[0, 2, 1]}>
        <meshStandardMaterial color="#E8C49B" />
      </Sphere>
      
      {/* Mouth */}
      <Box args={[0.5, 0.1, 0.1]} position={[0, 1.7, 0.9]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Turban */}
      <Cylinder args={[1.2, 1.2, 0.5, 16]} position={[0, 2.6, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#F29A2E" />
      </Cylinder>
      
      {/* Arms */}
      <Cylinder args={[0.25, 0.25, 2, 16]} position={[-1.2, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#D62F32" />
      </Cylinder>
      <Cylinder args={[0.25, 0.25, 2, 16]} position={[1.2, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#D62F32" />
      </Cylinder>
      
      {/* Hands */}
      <Sphere args={[0.3, 16, 16]} position={[-2.2, 0.5, 0]}>
        <meshStandardMaterial color="#E8C49B" />
      </Sphere>
      <Sphere args={[0.3, 16, 16]} position={[2.2, 0.5, 0]}>
        <meshStandardMaterial color="#E8C49B" />
      </Sphere>
    </group>
  );
};

export default PanditModel;
