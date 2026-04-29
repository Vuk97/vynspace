import { useEffect, useRef } from "react";
import * as THREE from "three";

const nodeSpecs = [
  { name: "Campus", color: 0x5bc0eb, position: [-4.2, 0, -0.8], height: 1.7 },
  { name: "APT", color: 0x00ffb2, position: [4.3, 0, -1.1], height: 1.45 },
  { name: "Jobs", color: 0xffcf5a, position: [-2.2, 0, -5.0], height: 1.25 },
  { name: "Finance", color: 0xff6b5f, position: [2.4, 0, -5.2], height: 1.58 },
];

export default function HeroScene({ compact = false }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03060d, 0.038);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 70);
    camera.position.set(0, compact ? 5.1 : 5.7, compact ? 11 : 13.2);
    camera.lookAt(0, 0.85, -2.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x03060d, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    host.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const ambient = new THREE.AmbientLight(0x7fb9ff, 0.72);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x5bc0eb, 3.2, 20);
    keyLight.position.set(-3, 6, 5);
    scene.add(keyLight);

    const warmLight = new THREE.PointLight(0xff6b5f, 2.1, 18);
    warmLight.position.set(5, 4, -3);
    scene.add(warmLight);

    const grid = new THREE.GridHelper(34, 42, 0x5bc0eb, 0x193244);
    grid.position.y = -0.04;
    grid.material.transparent = true;
    grid.material.opacity = compact ? 0.2 : 0.28;
    root.add(grid);

    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 18, 1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x07101b,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
      }),
    );
    horizon.rotation.x = -Math.PI / 2;
    horizon.position.set(0, -0.08, -4);
    root.add(horizon);

    const core = new THREE.Group();
    core.position.set(0, 1.55, -2.1);
    root.add(core);

    const globe = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.62, 5),
      new THREE.MeshBasicMaterial({
        color: 0x5bc0eb,
        wireframe: true,
        transparent: true,
        opacity: 0.58,
      }),
    );
    core.add(globe);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.08, 2),
      new THREE.MeshStandardMaterial({
        color: 0x0a0f1c,
        emissive: 0x0d5d76,
        emissiveIntensity: 0.42,
        roughness: 0.32,
        metalness: 0.68,
        transparent: true,
        opacity: 0.68,
      }),
    );
    core.add(inner);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffb2,
      transparent: true,
      opacity: 0.5,
    });
    const rings = [
      [0, 0, 0],
      [Math.PI / 2.5, 0, Math.PI / 5],
      [Math.PI / 2, Math.PI / 8, 0],
    ].map((rotation, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.08 + index * 0.18, 0.009, 8, 128), ringMaterial.clone());
      ring.rotation.set(...rotation);
      ring.material.opacity = 0.48 - index * 0.08;
      core.add(ring);
      return ring;
    });

    const nodeGroups = [];
    const packets = [];

    nodeSpecs.forEach((spec, index) => {
      const node = new THREE.Group();
      node.position.set(...spec.position);

      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x0d1423,
        emissive: spec.color,
        emissiveIntensity: 0.18,
        roughness: 0.28,
        metalness: 0.78,
      });
      const glowMat = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.55,
      });

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.68, 0.24, 6), baseMat);
      base.position.y = 0.12;
      node.add(base);

      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.74, spec.height, 0.74), baseMat.clone());
      tower.position.y = 0.24 + spec.height / 2;
      node.add(tower);

      const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), glowMat);
      crown.position.y = spec.height + 0.72;
      node.add(crown);

      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3.6, 8), glowMat.clone());
      beacon.position.y = spec.height + 2.2;
      beacon.material.opacity = 0.24;
      node.add(beacon);

      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.015, 8, 64), glowMat.clone());
      halo.position.y = 0.28;
      halo.rotation.x = Math.PI / 2;
      node.add(halo);

      const light = new THREE.PointLight(spec.color, 0.85, 5);
      light.position.y = spec.height + 0.9;
      node.add(light);

      root.add(node);
      nodeGroups.push({ node, crown, halo, baseY: node.position.y, index });

      const start = new THREE.Vector3(0, 1.45, -2.1);
      const end = new THREE.Vector3(spec.position[0], spec.height + 0.36, spec.position[2]);
      const mid = new THREE.Vector3(
        spec.position[0] * 0.42,
        2.45 + index * 0.16,
        (spec.position[2] - 2.1) * 0.48,
      );
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 72, 0.014, 8, false),
        new THREE.MeshBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: 0.38,
        }),
      );
      root.add(tube);

      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        new THREE.MeshBasicMaterial({ color: spec.color }),
      );
      root.add(packet);
      packets.push({ mesh: packet, curve, offset: index * 0.24, speed: 0.09 + index * 0.014 });
    });

    const particleCount = compact ? 180 : 340;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = Math.random() * 7.6 + 0.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 1.4;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        color: 0x9eeaff,
        size: compact ? 0.018 : 0.026,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      }),
    );
    root.add(particles);

    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(8.8, 0.08),
      new THREE.MeshBasicMaterial({
        color: 0x5bc0eb,
        transparent: true,
        opacity: 0.46,
        side: THREE.DoubleSide,
      }),
    );
    scan.position.set(0, 1.2, -2.2);
    scan.rotation.x = -0.08;
    root.add(scan);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      const bounds = host.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    host.addEventListener("pointermove", onPointerMove);

    let frameId = 0;
    const clock = new THREE.Clock();
    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      root.rotation.y += (pointer.x * 0.09 - root.rotation.y) * 0.035;
      root.rotation.x += (-pointer.y * 0.035 - root.rotation.x) * 0.035;
      globe.rotation.y = elapsed * 0.18;
      globe.rotation.x = Math.sin(elapsed * 0.24) * 0.08;
      inner.rotation.y = -elapsed * 0.11;
      particles.rotation.y = elapsed * 0.012;
      scan.position.y = 0.42 + ((elapsed * 0.42) % 2.8);
      scan.material.opacity = 0.18 + Math.sin(elapsed * 3.2) * 0.08;

      rings.forEach((ring, index) => {
        ring.rotation.z += 0.0028 + index * 0.0012;
        ring.rotation.x += 0.001;
      });

      nodeGroups.forEach(({ node, crown, halo, index }) => {
        node.position.y = Math.sin(elapsed * 1.3 + index) * 0.055;
        crown.rotation.y = elapsed * (0.52 + index * 0.08);
        crown.position.y += Math.sin(elapsed * 2.1 + index) * 0.0008;
        halo.rotation.z = elapsed * (0.55 + index * 0.05);
      });

      packets.forEach(({ mesh, curve, offset, speed }) => {
        const point = curve.getPoint((elapsed * speed + offset) % 1);
        mesh.position.copy(point);
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
  }, [compact]);

  return <div ref={hostRef} className="hero-scene" aria-hidden="true" />;
}
