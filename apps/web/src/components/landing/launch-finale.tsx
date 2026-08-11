import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const C = {
  crust: "#11111b",
  mantle: "#181825",
  sky: "#89dceb",
  flamingo: "#f2cdcd",
  peach: "#fab387",
  text: "#cdd6f4",
};

function LaunchScene() {
  const rocketRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Group>(null);
  const [launched, setLaunched] = useState(false);
  const launchTime = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    const t = setTimeout(() => setLaunched(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useFrame((state, delta) => {
    const rocket = rocketRef.current;
    if (!rocket) return;

    if (!launched) {
      // Pre-launch vibration — subtle rumble
      rocket.position.x = (Math.random() - 0.5) * 0.004;
      rocket.position.z = (Math.random() - 0.5) * 0.002;
      return;
    }

    launchTime.current += delta;
    const t = launchTime.current;

    // Quadratic acceleration liftoff
    const height = t < 0.6 ? t * t * 0.5 : 0.18 + (t - 0.6) * (t - 0.6) * 1.4;
    rocket.position.y = 0.8 + height;

    // Shake fades out as rocket climbs
    const shake = Math.max(0, 1 - t * 0.25);
    rocket.position.x = Math.sin(t * 18) * 0.006 * shake;
    rocket.rotation.z = Math.sin(t * 14) * 0.006 * shake;

    // Camera slowly tilts up to follow
    const lookY = THREE.MathUtils.lerp(0.8, Math.min(height * 0.35, 6), Math.min(t * 0.12, 1));
    camera.lookAt(0, lookY, 0);

    // Exhaust follows rocket
    if (exhaustRef.current) {
      exhaustRef.current.position.y = rocket.position.y - 1.15;
      const s = Math.min(t * 1.8, 3);
      exhaustRef.current.scale.set(1, s, 1);
    }
  });

  return (
    <>
      <color attach="background" args={[C.crust]} />
      <fog attach="fog" args={[C.crust, 6, 24]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[3, 8, 4]} intensity={0.65} color="#e6e9ef" />
      <pointLight position={[-3, 2, 3]} intensity={0.35} color={C.sky} />

      {/* ═══ Rocket ═══ */}
      <group ref={rocketRef} position={[0, 0.8, 0]}>
        {/* Body */}
        <mesh>
          <cylinderGeometry args={[0.13, 0.16, 1.4, 16]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Nose cone */}
        <mesh position={[0, 0.95, 0]}>
          <coneGeometry args={[0.13, 0.42, 16]} />
          <meshStandardMaterial
            color={C.flamingo}
            metalness={0.5}
            roughness={0.25}
            emissive={C.flamingo}
            emissiveIntensity={0.15}
          />
        </mesh>
        {/* Fins ×3 */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 2.094) * 0.19,
              -0.55,
              Math.cos(i * 2.094) * 0.19,
            ]}
            rotation={[0, i * 2.094, 0]}
          >
            <boxGeometry args={[0.018, 0.28, 0.2]} />
            <meshStandardMaterial
              color={C.sky}
              metalness={0.7}
              roughness={0.2}
              emissive={C.sky}
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
        {/* Engine nozzle */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.09, 0.055, 0.12, 12]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ═══ Exhaust ═══ */}
      {launched && (
        <group ref={exhaustRef} position={[0, -0.35, 0]}>
          {/* Outer flame */}
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.16, 1.1, 12]} />
            <meshBasicMaterial color={C.peach} transparent opacity={0.4} />
          </mesh>
          {/* Inner core */}
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.08, 0.7, 12]} />
            <meshBasicMaterial color="#fff" transparent opacity={0.28} />
          </mesh>
          <pointLight color={C.peach} intensity={5} distance={14} />
          <Sparkles
            count={55}
            scale={[0.7, 2.2, 0.7]}
            size={3}
            speed={3.5}
            color={C.peach}
            opacity={0.6}
          />
        </group>
      )}

      {/* ═══ Launch pad ═══ */}
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 1.5, 32]} />
        <meshStandardMaterial
          color={C.mantle}
          metalness={0.5}
          roughness={0.4}
          emissive={C.sky}
          emissiveIntensity={0.012}
        />
      </mesh>

      {/* Tower structure */}
      <group position={[0.65, 0, 0]}>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[0.045, 2.5, 0.045]} />
          <meshStandardMaterial color="#45475a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Arm brackets */}
        <mesh position={[-0.18, 0.85, 0]}>
          <boxGeometry args={[0.35, 0.03, 0.03]} />
          <meshStandardMaterial color="#45475a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.13, 1.35, 0]}>
          <boxGeometry args={[0.26, 0.03, 0.03]} />
          <meshStandardMaterial color="#45475a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Ground plane */}
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={C.crust} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Stars */}
      <Sparkles
        count={90}
        scale={[22, 12, 22]}
        size={1.4}
        speed={0.12}
        color={C.text}
        opacity={0.3}
      />
    </>
  );
}

/**
 * 3D mission launch finale — auto-plays when scrolled into view.
 */
export function LaunchFinale() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="h-full w-full">
      {visible && (
        <Canvas
          className="absolute inset-0"
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          camera={{
            position: [2.2, 1.8, 5],
            fov: 36,
            near: 0.1,
            far: 50,
          }}
        >
          <Suspense fallback={null}>
            <LaunchScene />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
