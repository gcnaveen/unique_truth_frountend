import { useEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 80;
const BX = 11;
const BY = 7;

function createFirefly() {
  const group = new THREE.Group();

  // Core glow — bright center point
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xeeffaa,
    transparent: true,
    opacity: 1,
  });
  const coreGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner halo
  const halo1Mat = new THREE.MeshBasicMaterial({
    color: 0xccff66,
    transparent: true,
    opacity: 0.35,
  });
  const halo1 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), halo1Mat);
  group.add(halo1);

  // Outer soft halo
  const halo2Mat = new THREE.MeshBasicMaterial({
    color: 0x88dd44,
    transparent: true,
    opacity: 0.12,
  });
  const halo2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), halo2Mat);
  group.add(halo2);

  // Trailing shimmer — tiny line tail
  const tailPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      -(0.1 + Math.random() * 0.25),
      0
    ),
  ];
  const tailGeo = new THREE.BufferGeometry().setFromPoints(tailPoints);
  const tailMat = new THREE.LineBasicMaterial({
    color: 0xaaddaa,
    transparent: true,
    opacity: 0.18,
  });
  const tail = new THREE.Line(tailGeo, tailMat);
  group.add(tail);

  const scale = 0.35 + Math.random() * 0.55;
  group.scale.setScalar(scale);

  group.position.set(
    (Math.random() - 0.5) * BX * 2,
    (Math.random() - 0.5) * BY * 2,
    (Math.random() - 0.5) * 4
  );

  return {
    group,
    core,
    halo1,
    halo2,
    tail,
    // Pulse rhythm — each firefly has its own on/off cycle
    pulseSpeed: 0.6 + Math.random() * 1.2,
    pulseOffset: Math.random() * Math.PI * 2,
    pulseThreshold: 0.55 + Math.random() * 0.3, // how long it stays "off"
    // Drift
    driftSpeed: 0.08 + Math.random() * 0.18,
    driftOffsetX: Math.random() * Math.PI * 2,
    driftOffsetY: Math.random() * Math.PI * 2,
    driftRadius: 0.4 + Math.random() * 1.2,
    // Wander velocity
    vx: (Math.random() - 0.5) * 0.004,
    vy: (Math.random() - 0.5) * 0.003,
    // Color variation — some are warmer yellow, some cooler green
    hue: Math.random() > 0.4 ? "yellow" : "green",
  };
}

export default function FirefliesBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const fireflies = [];
    for (let i = 0; i < COUNT; i++) {
      const f = createFirefly();
      scene.add(f.group);
      fireflies.push(f);
    }

    let frame;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      fireflies.forEach((f) => {
        // --- Pulse logic ---
        // Raw sine wave mapped to [0,1]
        const raw = (Math.sin(t * f.pulseSpeed + f.pulseOffset) + 1) / 2;
        // Hard threshold: below threshold = off, above = on (creates realistic blink)
        const brightness = raw < f.pulseThreshold ? 0 : (raw - f.pulseThreshold) / (1 - f.pulseThreshold);
        const eased = brightness * brightness; // ease-in for snappy blink

        // Core
        f.core.material.opacity = 0.5 + eased * 0.5;
        f.core.material.color.setHex(
          f.hue === "yellow" ? 0xffffaa : 0xccffaa
        );

        // Inner halo
        f.halo1.material.opacity = eased * 0.45;

        // Outer halo
        f.halo2.material.opacity = eased * 0.18;

        // Tail fades with pulse
        f.tail.material.opacity = eased * 0.22;

        // Scale breathe with pulse
        const breathe = 0.9 + eased * 0.2;
        f.group.scale.setScalar(f.group.scale.x > 0 ? f.group.userData._baseScale * breathe : 1);

        // --- Drift: organic figure-8 / Lissajous wander ---
        f.group.position.x +=
          f.vx +
          Math.sin(t * f.driftSpeed + f.driftOffsetX) * 0.0035;
        f.group.position.y +=
          f.vy +
          Math.cos(t * f.driftSpeed * 0.7 + f.driftOffsetY) * 0.0025;

        // Slow random veer
        f.vx += (Math.random() - 0.5) * 0.0003;
        f.vy += (Math.random() - 0.5) * 0.0002;
        // Dampen so they don't fly off too fast
        f.vx *= 0.995;
        f.vy *= 0.995;

        // Wrap edges
        if (f.group.position.x > BX)  f.group.position.x = -BX;
        if (f.group.position.x < -BX) f.group.position.x = BX;
        if (f.group.position.y > BY)  f.group.position.y = -BY;
        if (f.group.position.y < -BY) f.group.position.y = BY;
      });

      renderer.render(scene, camera);
    };

    // Store base scales after creation
    fireflies.forEach((f) => {
      f.group.userData._baseScale = f.group.scale.x;
    });

    animate();

    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}