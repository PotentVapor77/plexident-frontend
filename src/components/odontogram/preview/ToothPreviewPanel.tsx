// src/components/preview/ToothPreviewPanel.tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useSpring, a } from "@react-spring/three";
import { ToothStatusDisplay, type DatosDiente } from "./ToothStatusDisplay";
type PanelPreviewDienteProps = {
    dienteSeleccionado: string | null;
    datosDiente: DatosDiente | null;
};

// Se recomienda cargar el GLTF una sola vez a nivel superior si es posible
// Pero dentro del componente funcional está bien si se gestiona el caché (que useGLTF hace).

const ModeloDiente = ({ dienteSeleccionado }: { dienteSeleccionado: string }) => {
    const { scene } = useGLTF("/models/odontograma_preview.glb") as any;
    // La búsqueda del objeto dentro de la escena
    const target = scene.getObjectByName(dienteSeleccionado) as THREE.Object3D; 
    
    const groupRef = useRef<THREE.Group>(null);
    const [posicion, setPosicion] = useState<[number, number, number]>([0, 0, 0]);

    const springs = useSpring({
        position: posicion,
        config: { tension: 120, friction: 14 },
    });

    useEffect(() => {
        if (groupRef.current && target) {
            const clonedTarget = target.clone() as THREE.Object3D;
            const box = new THREE.Box3().setFromObject(clonedTarget);
            const center = new THREE.Vector3();
            box.getCenter(center);
            const nuevaPos: [number, number, number] = [-center.x, -center.y, -center.z];

            setPosicion(nuevaPos);

            groupRef.current.clear();
            groupRef.current.add(clonedTarget);

            // Aplicar material base con color, metalness y roughness
            clonedTarget.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.material = (mesh.material as THREE.Material).clone();
                    if ("color" in mesh.material) {
                        (mesh.material as THREE.MeshStandardMaterial).color.set("#E8E8E8"); // Color blanco grisáceo
                    }
                    (mesh.material as THREE.MeshStandardMaterial).metalness = 0.2;
                    (mesh.material as THREE.MeshStandardMaterial).roughness = 0.4;
                    (mesh.material as THREE.MeshStandardMaterial).transparent = true;
                    (mesh.material as THREE.MeshStandardMaterial).opacity = 1;
                }
            });
        }
    }, [dienteSeleccionado, target]);

    if (!target) return null;

    return <a.group ref={groupRef} position={springs.position} />;
};

export const PanelPreviewDiente = ({ dienteSeleccionado, datosDiente }: PanelPreviewDienteProps) => {
    const refControlesOrbit = useRef<any>(null);

    useEffect(() => {
        // Al cambiar de diente, reiniciar la posición de la cámara
        if (refControlesOrbit.current) {
            refControlesOrbit.current.reset();
        }
    }, [dienteSeleccionado]);

    if (!dienteSeleccionado) return null;

    const isToothUpper = dienteSeleccionado.includes('upper');

    // Estilo adaptado con Tailwind y soporte para Dark Mode
    return (
        <div
            className="absolute top-6 right-6 bg-white/90 dark:bg-gray-900/90 shadow-theme-xl rounded-2xl p-3 
                       border border-gray-200 dark:border-gray-800 backdrop-blur-sm transition-colors duration-200"
            style={{ width: "180px", height: "220px", pointerEvents: "auto" }}
        >
            {/* Overlay de Estado (se superpone al canvas) */}
            <ToothStatusDisplay 
                datosDiente={datosDiente ?? { diagnósticos: [] }} 
                nombreDiente={dienteSeleccionado} 
                isToothUpper={isToothUpper} 
            />

            {/* Escena 3D */}
            <div className="w-full h-full rounded-xl overflow-hidden">
                {/* El background debe ser claro para que el diente blanco resalte */}
                <Canvas
                    className="canvas"
                    style={{ background: "#f0f0f0", borderRadius: "0.75rem" }} // gray-100 equivalent
                    camera={{ position: [0, 0, 5], fov: 5 }}
                >
                    {/* Luces */}
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1.5} />
                    <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#f0f0f0" />
                    
                    {/* Controles */}
                    <OrbitControls
                        ref={refControlesOrbit}
                        enablePan={false}
                        enableZoom={true}
                        minDistance={2}
                        maxDistance={12}
                    />
                    
                    {/* Modelo */}
                    <ModeloDiente dienteSeleccionado={dienteSeleccionado} />
                </Canvas>
            </div>
        </div>
    );
};