import { useEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 24;
const BX = 11;
const BY = 7;

function buildWing(side) {
  const shape = new THREE.Shape();
  const s = side === "left" ? -1 : 1;
  shape.moveTo(0, 0);
  shape.bezierCurveTo(s * 0.2, 0.6, s * 1.4, 1.0, s * 1.5, 0.4);
  shape.bezierCurveTo(s * 1.6, -0.1, s * 1.1, -0.5, s * 0.8, -0.3);
  shape.bezierCurveTo(s * 0.9, -0.6, s * 1.2, -1.1, s * 0.9, -1.2);
  shape.bezierCurveTo(s * 0.5, -1.3, s * 0.2, -0.9, 0, -0.5);
  shape.closePath();
  return shape;
}

function createButterfly() {
  const group = new THREE.Group();
  const opacity = 0.6 + Math.random() * 0.4;

  const wingMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity,
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
  });
  const veinMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
  });

  const rightGeom = new THREE.ShapeGeometry(buildWing("right"));
  const leftGeom = new THREE.ShapeGeometry(buildWing("left"));

  const rPivot = new THREE.Group();
  rPivot.add(new THREE.Mesh(rightGeom, wingMat.clone()));
  rPivot.add(new THREE.LineLoop(rightGeom, edgeMat.clone()));

  const lPivot = new THREE.Group();
  lPivot.add(new THREE.Mesh(leftGeom, wingMat.clone()));
  lPivot.add(new THREE.LineLoop(leftGeom, edgeMat.clone()));

  const veins = [
    [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.9, 0.3, 0)],
    [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.6, -0.8, 0)],
    [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.1, 0.0, 0)],
  ];
  veins.forEach((pts) => {
    rPivot.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        veinMat.clone(),
      ),
    );
    const m = pts.map((p) => new THREE.Vector3(-p.x, p.y, p.z));
    lPivot.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(m),
        veinMat.clone(),
      ),
    );
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.03, 1.4, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity,
    }),
  );

  group.add(rPivot, lPivot, body);

  const scale = 0.1 + Math.random() * 0.16;
  group.scale.setScalar(scale);
  group.position.set(
    (Math.random() - 0.5) * BX * 2,
    (Math.random() - 0.5) * BY * 2,
    (Math.random() - 0.5) * 3,
  );

  return {
    group,
    rPivot,
    lPivot,
    flapSpeed: 2.5 + Math.random() * 2.5,
    flapOffset: Math.random() * Math.PI * 2,
    bobSpeed: 0.4 + Math.random() * 0.6,
    bobOffset: Math.random() * Math.PI * 2,
    driftSpeed: 0.2 + Math.random() * 0.3,
    driftOffset: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 0.007,
    vy: (Math.random() - 0.5) * 0.004,
  };
}

export default function ButterflyBackground() {
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
    renderer.setClearColor(0x000000, 0); // transparent — bg color set via CSS
    mount.appendChild(renderer.domElement);

    const butterflies = [];
    for (let i = 0; i < COUNT; i++) {
      const b = createButterfly();
      scene.add(b.group);
      butterflies.push(b);
    }

    let frame;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      butterflies.forEach((b) => {
        const flap = Math.sin(t * b.flapSpeed + b.flapOffset) * 0.6;
        b.rPivot.rotation.y = -flap;
        b.lPivot.rotation.y = flap;

        b.group.position.x +=
          b.vx + Math.sin(t * b.driftSpeed + b.driftOffset) * 0.004;
        b.group.position.y +=
          b.vy + Math.sin(t * b.bobSpeed + b.bobOffset) * 0.003;
        b.group.rotation.z = Math.sin(t * b.bobSpeed + b.bobOffset) * 0.1;

        if (b.group.position.x > BX) b.group.position.x = -BX;
        if (b.group.position.x < -BX) b.group.position.x = BX;
        if (b.group.position.y > BY) b.group.position.y = -BY;
        if (b.group.position.y < -BY) b.group.position.y = BY;
      });

      renderer.render(scene, camera);
    };
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
      mount.removeChild(renderer.domElement);
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
