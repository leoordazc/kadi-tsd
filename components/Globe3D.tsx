"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

// Colores neón/pastel
const colors = {
  neonGreen: "#4ade80",
  neonBlue: "#60a5fa",
  neonPink: "#f472b6",
  neonPurple: "#c084fc",
  pastelGreen: "#86efac",
  pastelBlue: "#93c5fd",
  white: "#ffffff",
};

// Componente del globo hecho de partículas
function ParticleGlobe() {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0003;
    }
  });

  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors_array = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 5;
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    const colorOptions = [
      colors.neonGreen,
      colors.neonBlue,
      colors.neonPink,
      colors.neonPurple,
      colors.pastelGreen,
      colors.pastelBlue,
      colors.white,
    ];
    
    const color = new THREE.Color(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
    
    colors_array[i * 3] = color.r;
    colors_array[i * 3 + 1] = color.g;
    colors_array[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3));

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial 
        size={0.06} 
        vertexColors={true} 
        transparent 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ✨ PARTÍCULA ORBITAL SUTIL
function OrbitalParticle() {
  const particleRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (particleRef.current) {
      const time = clock.getElapsedTime();
      const radius = 6.5;
      const speed = 0.15;
      
      particleRef.current.position.x = Math.cos(time * speed) * radius;
      particleRef.current.position.z = Math.sin(time * speed) * radius;
      particleRef.current.position.y = Math.sin(time * speed * 2) * 1.5;
      
      const scale = 1 + Math.sin(time * 5) * 0.1;
      particleRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={particleRef}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial 
        color={colors.neonGreen} 
        emissive={colors.neonGreen}
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Estela de la partícula
function ParticleTrail() {
  const trailRef = useRef<THREE.Points>(null);
  const positions = useRef<Float32Array>(new Float32Array(30 * 3));
  
  useFrame(() => {
    if (trailRef.current && trailRef.current.parent) {
      const trailPositions = trailRef.current.geometry.attributes.position.array;
      
      for (let i = trailPositions.length - 3; i >= 3; i -= 3) {
        trailPositions[i] = trailPositions[i - 3];
        trailPositions[i + 1] = trailPositions[i - 2];
        trailPositions[i + 2] = trailPositions[i - 1];
      }
      
      trailPositions[0] = trailRef.current.parent.position.x;
      trailPositions[1] = trailRef.current.parent.position.y;
      trailPositions[2] = trailRef.current.parent.position.z;
      
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const initialPositions = new Float32Array(30 * 3);
  for (let i = 0; i < 30; i++) {
    initialPositions[i * 3] = 0;
    initialPositions[i * 3 + 1] = 0;
    initialPositions[i * 3 + 2] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));

  return (
    <points ref={trailRef} geometry={geometry}>
      <pointsMaterial 
        color={colors.neonBlue} 
        size={0.03} 
        transparent 
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Anillos orbitales
function OrbitalRings() {
  const ring1Ref = useRef<THREE.LineSegments>(null);
  const ring2Ref = useRef<THREE.LineSegments>(null);
  
  useFrame(() => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.y += 0.0001;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= 0.00015;
    }
  });

  const createRing = (radius: number) => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  };

  return (
    <group>
      <lineSegments ref={ring1Ref} geometry={createRing(6)}>
        <lineBasicMaterial color={colors.neonGreen} opacity={0.08} transparent />
      </lineSegments>
      <lineSegments ref={ring2Ref} geometry={createRing(6.3)}>
        <lineBasicMaterial color={colors.neonBlue} opacity={0.05} transparent />
      </lineSegments>
    </group>
  );
}

// Componente principal con estados de carga
export default function Globe3D() {
  const [isLoading, setIsLoading] = useState(true);
  const [mensaje, setMensaje] = useState(0);
  
  const mensajes = [
    { principal: "ENVÍO INCLUIDO", secundario: "a todo México" },
    { principal: "COBERTURA NACIONAL", secundario: "32 estados conectados" },
    { principal: "ENTREGA 24H", secundario: "en ciudades principales" },
    { principal: "RASTREO EN VIVO", secundario: "desde tu móvil" },
    { principal: "SATISFACCIÓN", secundario: "98% de clientes" },
  ];

  useEffect(() => {
    // Simular carga del componente 3D
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    const interval = setInterval(() => {
      setMensaje((prev) => (prev + 1) % mensajes.length);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-black rounded-xl flex items-center justify-center border border-white/5">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
          <div className="text-white/30 text-sm">Cargando visualización 3D...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[600px] bg-transparent"
      role="img"
      aria-label="Mapa interactivo de la red de distribución de KADI en México con puntos en CDMX, Monterrey, Guadalajara y más"
    >
      <Canvas camera={{ position: [0, 2, 16], fov: 45 }}>
        {/* Luces mejoradas */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />
        
        {/* Globo de partículas */}
        <ParticleGlobe />
        
        {/* Elementos orbitales */}
        <OrbitalRings />
        <group>
          <OrbitalParticle />
          <ParticleTrail />
        </group>
        
        {/* Controles */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.2}
          autoRotate
          autoRotateSpeed={0.2}
        />
      </Canvas>

      {/* Mensaje principal */}
      <motion.div
        key={mensaje}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center"
      >
        <div className="text-4xl font-light tracking-wider text-white/90">
          {mensajes[mensaje].principal}
        </div>
        <div className="text-sm text-white/30 mt-2 tracking-widest">
          {mensajes[mensaje].secundario}
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-8 left-8 space-y-4"
      >
        <div className="border-l-2 border-[#4ade80] pl-4">
          <div className="text-2xl font-light text-white/90">32</div>
          <div className="text-xs text-white/30 tracking-wider">ESTADOS</div>
        </div>
        <div className="border-l-2 border-[#60a5fa] pl-4">
          <div className="text-2xl font-light text-white/90">24h</div>
          <div className="text-xs text-white/30 tracking-wider">ENTREGA</div>
        </div>
      </motion.div>

      {/* Beneficio */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute bottom-8 right-8 text-right"
      >
        <div className="text-xs text-white/30 tracking-widest mb-1">BENEFICIO</div>
        <div className="text-2xl font-light text-[#4ade80]">ENVÍO GRATIS</div>
        <div className="text-xs text-white/20 mt-1">en todas las compras</div>
      </motion.div>

      {/* Indicador */}
      <div className="absolute top-8 right-8 text-right opacity-30">
        <div className="text-[10px] text-white/20 tracking-widest">RED</div>
        <div className="text-xs text-white/30">2K PUNTOS</div>
      </div>
    </motion.div>
  );
}