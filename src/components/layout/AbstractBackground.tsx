import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ClothShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.5} position={[0, -1, 0]}>
        <cylinderGeometry args={[0.4, 1.2, 3, 64, 64, true]} />
        <MeshDistortMaterial 
          color="#D4AF8C"
          speed={2}
          distort={0.4}
          radius={1}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

export function AbstractBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-50 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <ClothShape />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
