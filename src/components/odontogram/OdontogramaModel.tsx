// src/components/OdontogramaModel.tsx
import { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useOdontogramaData } from "../../hooks/odontogram/useOdontogramaData";

// --- Colores base ---
const COLOR_BASE_DIENTE = new THREE.Color(0xffffff);
const COLOR_DIENTE_SELECCIONADO = new THREE.Color(0xffaf00);
const COLOR_DIENTE_AUSENTE = new THREE.Color(0x1f2937);

interface Props {
  selectedTooth: string | null;
  previewColorHex: string | null;
  setSelectedTooth: (tooth: string | null) => void;
  odontogramaDataHook: ReturnType<typeof useOdontogramaData>;
  //currentView: string;
  isJawOpen: boolean;
}

export const OdontogramaModel = ({
  selectedTooth,
  setSelectedTooth,
  previewColorHex,
  odontogramaDataHook,
  isJawOpen,
  //currentView,
}: Props) => {
  const { scene } = useGLTF("/models/odontograma.glb") as any;
  const { odontogramaData, getDominantColorForTooth, isToothBlocked } =
    odontogramaDataHook;

  // Estados para referencias
  const [maxilarSuperior, setMaxilarSuperior] = useState<THREE.Group | null>(
    null
  );
  const [pivotMandibular, setPivotMandibular] = useState<THREE.Group | null>(
    null
  );

  // --- Clic en dientes ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const clickedToothName = e.object.name;
    if (!clickedToothName || !e.object.isMesh) return;
    //if (isToothBlocked(clickedToothName)) return;

    setSelectedTooth(clickedToothName === selectedTooth ? null : clickedToothName);
  };

  // --- 1. Agrupación y pivote mandibular ---
  useEffect(() => {
    if (!scene || maxilarSuperior) return;

    const superiorGroup = new THREE.Group();
    superiorGroup.name = "MaxilarSuperior";

    const inferiorGroup = new THREE.Group();
    inferiorGroup.name = "MaxilarInferior";

    // 1. Quitar todas las mallas de la escena y clasificarlas
    const children = [...scene.children];
    children.forEach((child: any) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();

        // Lógica de clasificación limpia: busca 'upper' o 'lower'
        const isUpper = name.includes("upper");
        const isLower = name.includes("lower");

        // Quitar de la escena original
        child.parent?.remove(child);

        if (isUpper) {
          superiorGroup.add(child);
        } else if (isLower) {
          inferiorGroup.add(child);
        } else {
          // Otros elementos (encías, etc.)
          scene.add(child);
        }
      }
    });

    // 2. Manejo de error y cálculo del Bounding Box
    if (inferiorGroup.children.length === 0) {
      scene.add(superiorGroup);
      scene.add(inferiorGroup);
      return;
    }

    const bbox = new THREE.Box3().setFromObject(inferiorGroup);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // 3. Crear y posicionar el pivote (ATM)
    const pivot = new THREE.Group();
    pivot.name = "PivotMandibula";

    const size = new THREE.Vector3();
    bbox.getSize(size);

    // Clave: Ajuste para mover la mandíbula horizontalmente (Eje X)
    const horizontalAdjustment = 5.0;
    const verticalClosureAdjustment = -0.0;


    pivot.position.set(
      center.x + horizontalAdjustment,
      center.y + size.y * 0.5 + verticalClosureAdjustment,
      bbox.min.z - size.z * - 0.5
    );

    // 4. Reposicionar el grupo inferior relativo al pivote.
    inferiorGroup.position.sub(pivot.position);

    // 5. Establecer la jerarquía final
    pivot.add(inferiorGroup);
    scene.add(superiorGroup);
    scene.add(pivot);

    // Guardar referencias
    setMaxilarSuperior(superiorGroup);
    setPivotMandibular(pivot);

    const helper = new THREE.AxesHelper(0.2);
    pivot.add(helper);
  }, [scene, maxilarSuperior]);


  // --- 2. Animación de apertura mandibular (Persistencia en Modo Libre) ---
  useFrame(() => {
    if (!pivotMandibular) return;

    const targetRotationX = isJawOpen ? Math.PI : 0;
    const horizontalSeparationAdjustment = -0.6;
    const verticalSeparationAdjustment = 0; 

    const targetPosZ = isJawOpen ? horizontalSeparationAdjustment : 0;
    const targetPosY = isJawOpen ? verticalSeparationAdjustment : 0;

    // Rotación
    pivotMandibular.rotation.x = THREE.MathUtils.lerp(
      pivotMandibular.rotation.x,
      targetRotationX,
      0.08
    );

    // Posición (a 0)
    pivotMandibular.position.z = THREE.MathUtils.lerp(
      pivotMandibular.position.z,
      targetPosZ,
      0.08
    );
    pivotMandibular.position.y = THREE.MathUtils.lerp(
      pivotMandibular.position.y,
      targetPosY,
      0.08
    );
  });

  // --- 3. Lógica de color ---
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        const toothId = child.name;
        let finalColor = COLOR_BASE_DIENTE;

        const dominantColorHex = getDominantColorForTooth(toothId);
        const isBlocked = isToothBlocked(toothId);

        if (isBlocked) {
          finalColor = COLOR_DIENTE_AUSENTE;
        } else if (dominantColorHex) {
          finalColor = new THREE.Color(dominantColorHex);
        } else if (toothId === selectedTooth && previewColorHex) {
          finalColor = new THREE.Color(previewColorHex);
        } else if (toothId === selectedTooth) {
          finalColor = COLOR_DIENTE_SELECCIONADO;
        }

        child.material = new THREE.MeshStandardMaterial({
          color: finalColor,
          roughness: 0.3,
          metalness: 0.1,
        });
      }
    });
  }, [
    selectedTooth,
    scene,
    odontogramaData,
    previewColorHex,
    getDominantColorForTooth,
    isToothBlocked,
  ]);

  return <primitive object={scene} onPointerDown={handlePointerDown} />;
};