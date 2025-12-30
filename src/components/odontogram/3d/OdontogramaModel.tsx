// src/components/OdontogramaModel.tsx
import { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { useOdontogramaData } from "../../../hooks/odontogram/useOdontogramaData";
import { meshNameToFdi } from "../../../core/utils/meshToFdiMapper";


// --- Colores base ---
const COLOR_BASE_DIENTE = new THREE.Color(0xffffff);
const COLOR_DIENTE_SELECCIONADO = new THREE.Color(0xffaf00);
const COLOR_DIENTE_AUSENTE = new THREE.Color(0x1f2937);
const COLOR_DIENTE_HOVER = new THREE.Color(0x00d9ff);


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
  const { getDominantColorForTooth, isToothBlocked } =
    odontogramaDataHook;


  // Estados para referencias
  const [maxilarSuperior, setMaxilarSuperior] = useState<THREE.Group | null>(
    null
  );
  const [pivotMandibular, setPivotMandibular] = useState<THREE.Group | null>(
    null
  );
  // --- Nuevo estado para el diente en hover ---
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);


  // --- Clic en dientes ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const meshName = e.object.name;
    if (!meshName || !e.object.isMesh) return;


    const fdiId = meshNameToFdi(meshName);
    //console.log("[MODEL] Click mesh:", meshName, "→ FDI:", fdiId);


    if (!fdiId) return;


    setSelectedTooth(fdiId === selectedTooth ? null : fdiId);
  };


  // --- Manejadores de Hover ---
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    const meshName = e.object.name;
    if (!meshName || !e.object.isMesh) return;

    const toothId = meshNameToFdi(meshName);
    if (toothId && !isToothBlocked(toothId)) {
      setHoveredTooth(toothId);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    const meshName = e.object.name;
    const toothId = meshNameToFdi(meshName);

    if (toothId === hoveredTooth) {
      setHoveredTooth(null);
    }
  };

  const handlePointerLeave = () => {
    // Resetear hover cuando el mouse sale del modelo completo
    setHoveredTooth(null);
  };
  // --- Función para suavizar colores del backend ---
  const suavizarColor = (hexColor: string): THREE.Color => {
    const color = new THREE.Color(hexColor);

    // Convertir a HSL para manipular saturación y luminosidad
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);

    // OPCIÓN 1: Desaturar 40% (reduce vibración)
    const saturationReduction = 1.0; // 1.0 = sin cambio, 0.0 = gris completo
    hsl.s = hsl.s * saturationReduction;

    // OPCIÓN 2: Aclarar 20% (hace colores más pastel)
    const lightnessBoost = 0.0; // Cuánto más claro (0.0 - 0.5)
    hsl.l = Math.min(1.0, hsl.l + lightnessBoost);

    // Aplicar HSL ajustado
    color.setHSL(hsl.h, hsl.s, hsl.l);

    // OPCIÓN 3: Mezclar con blanco para mayor suavidad 
    const mezclaBlancoFactor = 0.15; // 0.0 = sin mezcla, 1.0 = todo blanco
    color.lerp(COLOR_BASE_DIENTE, mezclaBlancoFactor);

    return color;
  };

  // --- 1. Agrupación y pivote mandibular (Sin cambios) ---
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
      console.log("[Model] Re-panting teeth due to data change");
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



  // --- 2. Animación de apertura mandibular (Persistencia en Modo Libre) (Sin cambios) ---
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


  // --- 3. Lógica de color CON EMISSIVE para selección ---
  useEffect(() => {
    scene.traverse((child: any) => {
      if (!child.isMesh) return;

      const meshName = child.name;
      const toothId = meshNameToFdi(meshName);

      let finalColor = COLOR_BASE_DIENTE;
      let emissiveColor = new THREE.Color(0x000000);
      let emissiveIntensity = 0;

      if (!toothId) {
        child.material = new THREE.MeshStandardMaterial({
          color: finalColor,
          roughness: 0.3,
          metalness: 0.1,
        });
        return;
      }

      const dominantColorHex = getDominantColorForTooth(toothId);
      const isBlocked = isToothBlocked(toothId);
      const isSelected = toothId === selectedTooth;
      const isHovered = toothId === hoveredTooth;

      // Determinar color base
      if (isBlocked) {
        finalColor = COLOR_DIENTE_AUSENTE;
      } else if (dominantColorHex) {
        finalColor = suavizarColor(dominantColorHex);
      } else if (isSelected && previewColorHex) {
        finalColor = suavizarColor(previewColorHex);
      }

      // Determinar color emissive (para selección/hover)
      if (isSelected) {
        emissiveColor = COLOR_DIENTE_SELECCIONADO;
        emissiveIntensity = dominantColorHex ? 0.5 : 0.6;
      } else if (isHovered && !isBlocked) {
        emissiveColor = COLOR_DIENTE_HOVER;
        emissiveIntensity = 0.3;
      }

      child.material = new THREE.MeshStandardMaterial({
        color: finalColor,
        emissive: emissiveColor,
        emissiveIntensity: emissiveIntensity,
        roughness: 0.3,
        metalness: 0.1,
      });
    });
  }, [
    selectedTooth,
    hoveredTooth,
    scene,
    odontogramaDataHook.odontogramaData,
    previewColorHex,
    getDominantColorForTooth,
    isToothBlocked,
  ]);


  return (
    <primitive
      object={scene}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerLeave={handlePointerLeave}
    />
  );
};
