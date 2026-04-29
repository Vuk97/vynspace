import { useEffect, useRef } from "react";
import * as THREE from "three";

const sceneStyles = {
  spaces: { color: 0x5bc0eb, alt: 0x00ffb2, geometry: "knot", count: 18 },
  apt: { color: 0x00ffb2, alt: 0x5bc0eb, geometry: "towers", count: 14 },
  finance: { color: 0xff6b5f, alt: 0x5bc0eb, geometry: "rings", count: 16 },
  jobs: { color: 0xffcf5a, alt: 0x00ffb2, geometry: "network", count: 18 },
  campus: { color: 0x5bc0eb, alt: 0x00ffb2, geometry: "city", count: 22 },
  registration: { color: 0x00ffb2, alt: 0x8d79ff, geometry: "shield", count: 13 },
  about: { color: 0x8d79ff, alt: 0x5bc0eb, geometry: "globe", count: 15 },
  blog: { color: 0xffcf5a, alt: 0xff6b5f, geometry: "pages", count: 12 },
  appointments: { color: 0xff6b5f, alt: 0x5bc0eb, geometry: "rings", count: 12 },
  faq: { color: 0x5bc0eb, alt: 0xffcf5a, geometry: "network", count: 12 },
  donation: { color: 0x00ffb2, alt: 0xffcf5a, geometry: "knot", count: 14 },
  metaverse: { color: 0x8d79ff, alt: 0xff6b5f, geometry: "globe", count: 24 },
};

export default function PageScene({ variant = "spaces" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const style = sceneStyles[variant] || sceneStyles.spaces;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020308, 0.044);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.set(0, 3.8, 10.5);
    camera.lookAt(0, 0.4, -1.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x020308, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.55));
    host.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.position.set(2.7, -0.38, -2.05);
    root.scale.setScalar(1.26);
    scene.add(root);

    const ambient = new THREE.AmbientLight(0xb8d8ff, 0.72);
    scene.add(ambient);
    const key = new THREE.PointLight(style.color, 3.7, 18);
    key.position.set(-3.5, 4.2, 4);
    scene.add(key);
    const rim = new THREE.PointLight(style.alt, 2.9, 18);
    rim.position.set(5, 3.1, -4);
    scene.add(rim);

    const grid = new THREE.GridHelper(24, 32, style.color, 0x263547);
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    grid.position.y = -0.8;
    root.add(grid);

    const mainMat = new THREE.MeshStandardMaterial({
      color: 0x09101c,
      emissive: style.color,
      emissiveIntensity: 0.3,
      roughness: 0.24,
      metalness: 0.76,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: style.color,
      wireframe: true,
      transparent: true,
      opacity: 0.72,
    });
    const glowMat = new THREE.MeshBasicMaterial({
      color: style.alt,
      transparent: true,
      opacity: 0.68,
    });

    const core = makeCoreGeometry(style.geometry);
    const coreMesh = new THREE.Mesh(core, mainMat);
    coreMesh.position.y = 1.2;
    root.add(coreMesh);

    const wire = new THREE.Mesh(core.clone(), wireMat);
    wire.position.copy(coreMesh.position);
    wire.scale.multiplyScalar(1.07);
    root.add(wire);

    const orbital = new THREE.Group();
    orbital.position.copy(coreMesh.position);
    root.add(orbital);

    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.012, 8, 128), glowMat.clone());
    ringA.rotation.x = Math.PI / 2.5;
    orbital.add(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.01, 8, 128), glowMat.clone());
    ringB.rotation.set(Math.PI / 2, 0.2, 0.4);
    ringB.material.opacity = 0.32;
    orbital.add(ringB);

    const satellites = [];
    for (let i = 0; i < style.count; i += 1) {
      const angle = (i / style.count) * Math.PI * 2;
      const radius = 2.6 + Math.sin(i * 1.72) * 0.42;
      const sat = new THREE.Mesh(
        makeSatelliteGeometry(style.geometry, i),
        new THREE.MeshStandardMaterial({
          color: 0x0b1220,
          emissive: i % 2 ? style.alt : style.color,
          emissiveIntensity: 0.38,
          roughness: 0.3,
          metalness: 0.72,
        }),
      );
      sat.position.set(Math.cos(angle) * radius, 1.15 + Math.sin(i) * 0.75, Math.sin(angle) * radius);
      sat.rotation.set(i * 0.4, i * 0.2, i * 0.13);
      sat.scale.setScalar(0.32 + (i % 4) * 0.035);
      root.add(sat);
      satellites.push({ mesh: sat, angle, radius, lift: Math.sin(i) * 0.75 });

      if (i % 3 === 0) {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 1.2, 0),
          new THREE.Vector3(Math.cos(angle) * radius * 0.5, 2.6, Math.sin(angle) * radius * 0.5),
          sat.position.clone(),
        );
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 32, 0.008, 6, false),
          new THREE.MeshBasicMaterial({
            color: i % 2 ? style.alt : style.color,
            transparent: true,
            opacity: 0.22,
          }),
        );
        root.add(tube);
      }
    }

    const particles = createParticles(style.color, style.alt);
    root.add(particles);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      const bounds = host.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    host.addEventListener("pointermove", onPointerMove);

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const scroll = window.scrollY || 0;
      const scrollShift = Math.min(scroll / 900, 1.8);

      root.rotation.y += (pointer.x * 0.14 + scrollShift * 0.32 - root.rotation.y) * 0.04;
      root.rotation.x += (-pointer.y * 0.05 - root.rotation.x) * 0.04;
      coreMesh.rotation.y = elapsed * 0.18;
      coreMesh.rotation.x = Math.sin(elapsed * 0.3) * 0.08;
      wire.rotation.y = -elapsed * 0.13;
      wire.rotation.z = elapsed * 0.05;
      orbital.rotation.y = elapsed * 0.16;
      orbital.rotation.x = Math.sin(elapsed * 0.22) * 0.08;
      particles.rotation.y = elapsed * 0.018;
      particles.position.y = Math.sin(elapsed * 0.3) * 0.08;

      satellites.forEach(({ mesh, angle, radius, lift }, index) => {
        const orbit = angle + elapsed * (0.12 + (index % 3) * 0.018);
        mesh.position.x = Math.cos(orbit) * radius;
        mesh.position.z = Math.sin(orbit) * radius;
        mesh.position.y = 1.15 + lift + Math.sin(elapsed * 1.4 + index) * 0.12;
        mesh.rotation.x += 0.006 + index * 0.0003;
        mesh.rotation.y += 0.009;
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [variant]);

  return <div ref={hostRef} className={`page-scene page-scene-${variant}`} aria-hidden="true" />;
}

function makeCoreGeometry(type) {
  if (type === "rings") return new THREE.TorusKnotGeometry(0.92, 0.22, 130, 18);
  if (type === "towers") return new THREE.BoxGeometry(1.55, 1.55, 1.55, 5, 5, 5);
  if (type === "network") return new THREE.OctahedronGeometry(1.28, 2);
  if (type === "city") return new THREE.CylinderGeometry(0.72, 1.1, 1.7, 6, 3);
  if (type === "shield") return new THREE.DodecahedronGeometry(1.22, 1);
  if (type === "pages") return new THREE.BoxGeometry(1.7, 1.12, 0.28, 4, 4, 1);
  if (type === "globe") return new THREE.IcosahedronGeometry(1.32, 4);
  return new THREE.TorusKnotGeometry(0.92, 0.2, 120, 16);
}

function makeSatelliteGeometry(type, index) {
  if (type === "towers") return new THREE.BoxGeometry(0.34, 0.72 + (index % 4) * 0.12, 0.34);
  if (type === "rings") return new THREE.TorusGeometry(0.38, 0.045, 8, 40);
  if (type === "network") return new THREE.OctahedronGeometry(0.34, 0);
  if (type === "pages") return new THREE.BoxGeometry(0.46, 0.3, 0.055);
  if (type === "city") return new THREE.CylinderGeometry(0.18, 0.24, 0.62, 5);
  return index % 2 ? new THREE.IcosahedronGeometry(0.32, 1) : new THREE.BoxGeometry(0.38, 0.38, 0.38);
}

function createParticles(color, alt) {
  const count = 220;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorA = new THREE.Color(color);
  const colorB = new THREE.Color(alt);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = Math.random() * 6.8 - 0.4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    const mixed = colorA.clone().lerp(colorB, Math.random());
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.026,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
  );
}
