import { useRef, type JSX } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

// ---------- Shader Material ----------
const GradientMaterial = shaderMaterial(
  { centerColor: new THREE.Color('#e0f7fa'), edgeColor: new THREE.Color('#00796b') },
  `varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  `uniform vec3 centerColor;
   uniform vec3 edgeColor;
   varying vec2 vUv;
   void main() {
     float d = distance(vUv, vec2(0.5, 0.5));
     vec3 color = mix(centerColor, edgeColor, d * 1.5);
     gl_FragColor = vec4(color, 1.0);
   }`
);

extend({ GradientMaterial });

// 🔑 Tipado correcto en versiones nuevas
declare module '@react-three/fiber' {
  interface ThreeElements {
    gradientMaterial: JSX.IntrinsicElements['meshStandardMaterial'];
  }
}

// ---------- Componente de fondo ----------
export function DentalBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(camera.position);
    meshRef.current.quaternion.copy(camera.quaternion);
    meshRef.current.translateZ(-10);
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[20, 20]} />
      <gradientMaterial />
    </mesh>
  );
}