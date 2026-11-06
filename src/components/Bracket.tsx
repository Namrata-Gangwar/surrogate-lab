"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { colorForStress, Design, stressAt } from "@/lib/design";

function Part({ design, wireframe = false }: { design: Design; wireframe?: boolean }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.8, -0.5); shape.lineTo(2.8, -0.5); shape.lineTo(2.8, 0.5); shape.lineTo(-2.8, 0.5); shape.closePath();
    const hole = new THREE.Path(); hole.absellipse((design.hole - 0.5) * 4.8, 0, 0.15 + design.radius / 70, 0.15 + design.radius / 70, 0, Math.PI * 2, true); shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.45, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.06, bevelThickness: 0.05, curveSegments: 36 });
    geo.center();
    const p = geo.attributes.position; const colors = new Float32Array(p.count * 3); const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const v = stressAt(p.getX(i) / 5.6 + 0.5, p.getY(i) / 1.1, p.getZ(i) / 0.55, design);
      c.set(colorForStress(v)); colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3)); return geo;
  }, [design]);
  return <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
    <meshPhysicalMaterial vertexColors metalness={0.58} roughness={0.3} clearcoat={0.35} wireframe={wireframe} side={THREE.DoubleSide} />
  </mesh>;
}

export default function Bracket({ design, wireframe = false, autoRotate = true }: { design: Design; wireframe?: boolean; autoRotate?: boolean }) {
  return <Canvas camera={{ position: [5.2, 4.3, 6.1], fov: 37 }} dpr={[1, 1.7]} shadows gl={{ antialias: true, alpha: true }}>
    <color attach="background" args={["#111418"]} />
    <ambientLight intensity={0.75} /><directionalLight position={[3, 5, 4]} intensity={2.3} castShadow />
    <pointLight position={[-4, 2, -2]} color="#4a9dff" intensity={38} />
    <Part design={design} wireframe={wireframe} />
    <ContactShadows position={[0, -0.72, 0]} opacity={0.45} blur={2.5} scale={10} />
    <Environment preset="city" />
    <OrbitControls makeDefault autoRotate={autoRotate} autoRotateSpeed={0.65} enableDamping minDistance={5} maxDistance={12} />
  </Canvas>;
}
