import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type WeatherMood = 'sunny' | 'rainy' | 'cloudy' | 'night';
export type VisualMode = 'origin' | 'craft' | 'systems' | 'ai' | 'contact';

interface ThreeMeshProps {
  weatherMood: WeatherMood;
  visualMode: VisualMode;
  accentColor: string;
}

type NetworkData = {
  basePositions: Float32Array;
  pointPositions: Float32Array;
  linePositions: Float32Array;
  lineColors: Float32Array;
  edges: Array<[number, number]>;
  seeds: Float32Array;
};

const nodeCount = 210;
const neighborCount = 3;

const moodColors: Record<WeatherMood, string> = {
  sunny: '#fb923c',
  rainy: '#60a5fa',
  cloudy: '#a7b0be',
  night: '#818cf8',
};

const modeValues: Record<VisualMode, number> = {
  origin: 0,
  craft: 1,
  systems: 2,
  ai: 3,
  contact: 4,
};

function createNetworkData(): NetworkData {
  const basePositions = new Float32Array(nodeCount * 3);
  const pointPositions = new Float32Array(nodeCount * 3);
  const seeds = new Float32Array(nodeCount);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < nodeCount; index += 1) {
    const y = 1 - (index / (nodeCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;
    const shell = 0.82 + ((index * 37) % 100) / 100 * 0.24;
    const x = Math.cos(theta) * radius * shell;
    const z = Math.sin(theta) * radius * shell;

    basePositions[index * 3] = x;
    basePositions[index * 3 + 1] = y * shell;
    basePositions[index * 3 + 2] = z;
    pointPositions[index * 3] = x;
    pointPositions[index * 3 + 1] = y * shell;
    pointPositions[index * 3 + 2] = z;
    seeds[index] = ((index * 97) % 100) / 100;
  }

  const edges: Array<[number, number]> = [];
  const edgeKeys = new Set<string>();

  for (let i = 0; i < nodeCount; i += 1) {
    const neighbors: Array<{ index: number; distance: number }> = [];
    const ix = basePositions[i * 3];
    const iy = basePositions[i * 3 + 1];
    const iz = basePositions[i * 3 + 2];

    for (let j = 0; j < nodeCount; j += 1) {
      if (i === j) continue;

      const dx = ix - basePositions[j * 3];
      const dy = iy - basePositions[j * 3 + 1];
      const dz = iz - basePositions[j * 3 + 2];
      neighbors.push({ index: j, distance: dx * dx + dy * dy + dz * dz });
    }

    neighbors
      .sort((a, b) => a.distance - b.distance)
      .slice(0, neighborCount)
      .forEach((neighbor) => {
        const a = Math.min(i, neighbor.index);
        const b = Math.max(i, neighbor.index);
        const key = `${a}-${b}`;

        if (!edgeKeys.has(key)) {
          edgeKeys.add(key);
          edges.push([a, b]);
        }
      });
  }

  const linePositions = new Float32Array(edges.length * 2 * 3);
  const lineColors = new Float32Array(edges.length * 2 * 3);

  return { basePositions, pointPositions, linePositions, lineColors, edges, seeds };
}

function NetworkSphere({ weatherMood, visualMode, accentColor }: ThreeMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointGeometryRef = useRef<THREE.BufferGeometry>(null);
  const lineGeometryRef = useRef<THREE.BufferGeometry>(null);
  const cursorVelocityRef = useRef(0);
  const scrollAccelRef = useRef(0);
  const pointerRef = useRef(new THREE.Vector2(0, 0));
  const modeRef = useRef(modeValues[visualMode]);
  const activeColorRef = useRef(new THREE.Color(accentColor));
  const targetColorRef = useRef(new THREE.Color(accentColor));
  const targetMoodColorRef = useRef(new THREE.Color(moodColors[weatherMood]));
  const colorScratchARef = useRef(new THREE.Color());
  const colorScratchBRef = useRef(new THREE.Color());
  const lastMouseRef = useRef({ x: 0, y: 0, time: performance.now() });
  const network = useMemo(() => createNetworkData(), []);

  const pointGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(network.pointPositions, 3));
    return geometry;
  }, [network]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(network.linePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(network.lineColors, 3));
    return geometry;
  }, [network]);

  useEffect(() => {
    targetColorRef.current.set(accentColor);
    modeRef.current = modeValues[visualMode];
  }, [accentColor, visualMode]);

  useEffect(() => {
    targetMoodColorRef.current.set(moodColors[weatherMood]);
  }, [weatherMood]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now();
      const previous = lastMouseRef.current;
      const elapsed = Math.max(now - previous.time, 16);
      const distance = Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);

      cursorVelocityRef.current = Math.min(distance / elapsed / 1.15, 1);
      pointerRef.current.lerp(new THREE.Vector2(x, y), 0.25);
      lastMouseRef.current = { x: event.clientX, y: event.clientY, time: now };
    };

    const handleScrollVelocity = (event: Event) => {
      const detail = (event as CustomEvent<{ velocity: number }>).detail;
      scrollAccelRef.current = Math.min(Math.abs(detail?.velocity ?? 0) / 44, 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('portfolio-scroll-velocity', handleScrollVelocity as EventListener);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('portfolio-scroll-velocity', handleScrollVelocity as EventListener);
    };
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const positions = network.pointPositions;
    const linePositions = network.linePositions;
    const lineColors = network.lineColors;
    const mode = modeRef.current;
    const cursorEnergy = cursorVelocityRef.current;
    const scrollEnergy = scrollAccelRef.current;
    const pulse = 0.045 + cursorEnergy * 0.1 + scrollEnergy * 0.08;
    const moodBlend = targetMoodColorRef.current;

    cursorVelocityRef.current *= 0.88;
    scrollAccelRef.current *= 0.9;
    activeColorRef.current.lerp(targetColorRef.current, 0.05);

    for (let index = 0; index < nodeCount; index += 1) {
      const i3 = index * 3;
      const seed = network.seeds[index];
      const bx = network.basePositions[i3];
      const by = network.basePositions[i3 + 1];
      const bz = network.basePositions[i3 + 2];
      const wave = Math.sin(time * (0.62 + mode * 0.05) + seed * 9.2 + by * 2.6);
      const crossWave = Math.cos(time * 0.38 + seed * 7.1 + bx * 2.2 + mode);
      const pointerPull = 0.13 + cursorEnergy * 0.12;
      const shell = 1 + wave * pulse + crossWave * 0.018;

      positions[i3] = bx * shell + pointerRef.current.x * pointerPull * (0.18 + seed * 0.22);
      positions[i3 + 1] = by * shell + pointerRef.current.y * pointerPull * (0.18 + (1 - seed) * 0.22);
      positions[i3 + 2] = bz * (1 + wave * pulse * 0.72) + Math.sin(time + seed * 6.28) * 0.025;
    }

    network.edges.forEach(([a, b], edgeIndex) => {
      const lineIndex = edgeIndex * 6;
      const a3 = a * 3;
      const b3 = b * 3;
      const colorA = colorScratchARef.current.copy(activeColorRef.current).lerp(moodBlend, (network.seeds[a] + mode * 0.11) % 1);
      const colorB = colorScratchBRef.current.copy(activeColorRef.current).lerp(moodBlend, (network.seeds[b] + mode * 0.11) % 1);

      linePositions[lineIndex] = positions[a3];
      linePositions[lineIndex + 1] = positions[a3 + 1];
      linePositions[lineIndex + 2] = positions[a3 + 2];
      linePositions[lineIndex + 3] = positions[b3];
      linePositions[lineIndex + 4] = positions[b3 + 1];
      linePositions[lineIndex + 5] = positions[b3 + 2];

      lineColors[lineIndex] = colorA.r;
      lineColors[lineIndex + 1] = colorA.g;
      lineColors[lineIndex + 2] = colorA.b;
      lineColors[lineIndex + 3] = colorB.r;
      lineColors[lineIndex + 4] = colorB.g;
      lineColors[lineIndex + 5] = colorB.b;
    });

    pointGeometryRef.current?.attributes.position && (pointGeometryRef.current.attributes.position.needsUpdate = true);
    lineGeometryRef.current?.attributes.position && (lineGeometryRef.current.attributes.position.needsUpdate = true);
    lineGeometryRef.current?.attributes.color && (lineGeometryRef.current.attributes.color.needsUpdate = true);

    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(time * 0.14) * 0.18 + pointerRef.current.y * 0.08;
      groupRef.current.rotation.y += 0.0026 + cursorEnergy * 0.01 + scrollEnergy * 0.008;
      groupRef.current.rotation.z = Math.cos(time * 0.12) * 0.08 + pointerRef.current.x * 0.06;
      groupRef.current.scale.setScalar(1.42 + scrollEnergy * 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[0.55, -0.04, 0]}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.58} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points geometry={pointGeometry}>
        <pointsMaterial
          color="#ff1f1f"
          size={0.038}
          sizeAttenuation
          transparent
          opacity={0.96}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function ThreeMesh({ weatherMood, visualMode, accentColor }: ThreeMeshProps) {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-90">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.45], fov: 44 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <NetworkSphere weatherMood={weatherMood} visualMode={visualMode} accentColor={accentColor} />
      </Canvas>
    </div>
  );
}
