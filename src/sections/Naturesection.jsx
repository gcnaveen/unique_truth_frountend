import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import FlowerLabels from "../components/threejsanimations/Flowerlabels";
import NatureLifeModal from "../components/threejsanimations/NatureLifeModal";

/* ─────────────────────────────────────────
   SKY  (gradient + sun + clouds)
───────────────────────────────────────── */
function useSkyScene(mountRef) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Detect low-power / mobile to reduce geometry
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const circSeg = isMobile ? 16 : 32; // cloud circle segments
    const sunSeg = isMobile ? 32 : 64; // sun circle segments
    const skyDiv = isMobile ? 12 : 30; // sky gradient subdivisions
    const birdCount = isMobile ? 3 : 7;
    // Target ~30 fps on mobile, ~60 fps on desktop
    const minFrameMs = isMobile ? 34 : 16;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -w / 2,
      w / 2,
      h / 2,
      -h / 2,
      0.1,
      100,
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: false,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
    );
    renderer.setClearColor(0x87ceeb, 1);
    mount.appendChild(renderer.domElement);

    // Sky gradient
    const skyGeo = new THREE.PlaneGeometry(w, h, 1, skyDiv);
    const skyColors = [];
    const pos = skyGeo.attributes.position;
    const topC = new THREE.Color(0x4fa8d8);
    const midC = new THREE.Color(0x87ceeb);
    const botC = new THREE.Color(0xc8eaf8);
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = (y + h / 2) / h;
      let c;
      if (t > 0.5) c = midC.clone().lerp(topC, (t - 0.5) * 2);
      else c = botC.clone().lerp(midC, t * 2);
      skyColors.push(c.r, c.g, c.b);
    }
    skyGeo.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(skyColors, 3),
    );
    const sky = new THREE.Mesh(
      skyGeo,
      new THREE.MeshBasicMaterial({ vertexColors: true }),
    );
    sky.position.z = -8;
    scene.add(sky);

    // Sun
    const sunG = new THREE.Group();
    sunG.position.set(-w * 0.28, h * 0.3, -2);
    [
      [72, 0xfffde0, 0.95],
      [105, 0xfff3a0, 0.38],
      [148, 0xffe87a, 0.18],
    ].forEach(([r, col, op]) => {
      sunG.add(
        new THREE.Mesh(
          new THREE.CircleGeometry(r, sunSeg),
          new THREE.MeshBasicMaterial({
            color: col,
            transparent: true,
            opacity: op,
          }),
        ),
      );
    });
    // Rays
    const rayCount = isMobile ? 10 : 16;
    for (let i = 0; i < rayCount; i++) {
      const a = (i / rayCount) * Math.PI * 2;
      const len = 30 + Math.random() * 22;
      const pts = [
        new THREE.Vector3(Math.cos(a) * 78, Math.sin(a) * 78, 0),
        new THREE.Vector3(
          Math.cos(a) * (78 + len),
          Math.sin(a) * (78 + len),
          0,
        ),
      ];
      sunG.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({
            color: 0xffd740,
            transparent: true,
            opacity: 0.55,
          }),
        ),
      );
    }
    scene.add(sunG);

    // Cloud builder
    function makeCloud(cx, cy, s) {
      const g = new THREE.Group();
      const blobs = [
        [0, 0, 60],
        [-72, -12, 46],
        [72, -10, 48],
        [-34, 22, 40],
        [34, 24, 38],
        [-110, -20, 32],
        [110, -18, 30],
      ];
      blobs.forEach(([bx, by, br]) => {
        g.add(
          new THREE.Mesh(
            new THREE.CircleGeometry(br, circSeg),
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.94,
            }),
          ),
        );
        g.children[g.children.length - 1].position.set(bx, by, 0);
      });
      g.position.set(cx, cy, -1);
      g.scale.setScalar(s);
      return g;
    }

    const clouds = [
      makeCloud(-w * 0.25, h * 0.28, 1.05),
      makeCloud(w * 0.12, h * 0.32, 0.78),
      makeCloud(w * 0.38, h * 0.18, 0.62),
      makeCloud(-w * 0.05, h * 0.1, 0.88),
      makeCloud(w * 0.2, h * 0.08, 0.5),
    ];
    clouds.forEach((c) => scene.add(c));

    // Birds (simple V shapes)
    const birds = [];
    for (let i = 0; i < birdCount; i++) {
      const bg = new THREE.Group();
      const bmat = new THREE.LineBasicMaterial({
        color: 0x1a3a2a,
        transparent: true,
        opacity: 0.55,
      });
      const s = 4 + Math.random() * 5;
      [
        [-1, 0],
        [0, -s * 0.4],
        [1, 0],
      ].reduce((a, b, idx, arr) => {
        if (idx < arr.length - 1) {
          bg.add(
            new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(arr[idx][0] * s, arr[idx][1], 0),
                new THREE.Vector3(arr[idx + 1][0] * s, arr[idx + 1][1], 0),
              ]),
              bmat,
            ),
          );
        }
        return b;
      });
      bg.position.set(
        (Math.random() - 0.5) * w,
        h * (0.05 + Math.random() * 0.32),
        0,
      );
      bg.userData.vx = 0.15 + Math.random() * 0.3;
      scene.add(bg);
      birds.push(bg);
    }

    let frame = null;
    let lastFrameMs = 0;
    let isVisible = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) {
        frame = null;
        return;
      }
      frame = requestAnimationFrame(animate);

      // Frame-rate throttle
      const now = performance.now();
      if (now - lastFrameMs < minFrameMs) return;
      lastFrameMs = now;

      const t = clock.getElapsedTime();
      sunG.rotation.z = Math.sin(t * 0.15) * 0.1;
      sunG.scale.setScalar(1 + Math.sin(t * 0.5) * 0.015);

      clouds.forEach((c, i) => {
        c.position.x += 0.16 + i * 0.04;
        if (c.position.x > w * 0.65) c.position.x = -w * 0.65;
      });

      birds.forEach((b) => {
        b.position.x += b.userData.vx;
        if (b.position.x > w * 0.6) b.position.x = -w * 0.6;
      });

      renderer.render(scene, camera);
    };

    // Pause / resume when section leaves / enters viewport
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && frame === null) animate();
      },
      { threshold: 0 },
    );
    io.observe(mount);
    animate();

    const onResize = () => {
      const nw = mount.clientWidth,
        nh = mount.clientHeight;
      camera.left = -nw / 2;
      camera.right = nw / 2;
      camera.top = nh / 2;
      camera.bottom = -nh / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
    };
  }, []);
}

/* ─────────────────────────────────────────
   GROUND TERRAIN  (hill + grass strip)
───────────────────────────────────────── */
function useFlowerScene(mountRef) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    const aspect = h / w;
    const camera = new THREE.OrthographicCamera(
      -1,
      1,
      aspect,
      -aspect,
      0.1,
      50,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Ground hill
    const hillShape = new THREE.Shape();
    hillShape.moveTo(-1.05, -aspect);
    hillShape.bezierCurveTo(
      -0.8,
      -aspect + 0.16,
      -0.3,
      -aspect + 0.24,
      0,
      -aspect + 0.21,
    );
    hillShape.bezierCurveTo(
      0.3,
      -aspect + 0.24,
      0.8,
      -aspect + 0.16,
      1.05,
      -aspect,
    );
    hillShape.lineTo(1.05, -aspect - 0.2);
    hillShape.lineTo(-1.05, -aspect - 0.2);
    hillShape.closePath();
    scene.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(hillShape, 24),
        new THREE.MeshBasicMaterial({ color: 0x79be62 }),
      ),
    );

    // Soft landscape strip
    const groundStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x6caf57 }),
    );
    groundStrip.position.set(0, -aspect + 0.04, 0.05);
    scene.add(groundStrip);

    renderer.render(scene, camera);

    const onResize = () => {
      const nw = mount.clientWidth,
        nh = mount.clientHeight;
      const a = nh / nw;
      camera.top = a;
      camera.bottom = -a;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      renderer.render(scene, camera);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
    };
  }, []);
}

/* ─────────────────────────────────────────
   MAIN SECTION
───────────────────────────────────────── */
export default function NatureSection() {
  const skyRef = useRef(null);
  const flowerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState(null);

  useSkyScene(skyRef);
  useFlowerScene(flowerRef);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!selectedFlower) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedFlower(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedFlower]);

  return (
    <>
      <style>{`
        .nature-section { font-family: var(--font-dm-sans), sans-serif; }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(14px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shimmer {
          0%,100% { text-shadow: 0 2px 24px rgba(255,255,200,0.18); }
          50%      { text-shadow: 0 2px 40px rgba(255,255,180,0.38), 0 0 60px rgba(200,255,150,0.12); }
        }

        /* Tablet screens (769px to 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .ns-heading-wrap { gap: 8px !important; top: 5% !important; }
        }

        /* Mobile screens (up to 768px) */
        @media (max-width: 768px) {
          .ns-heading-wrap { gap: 8px !important; top: 8% !important; padding: 0 16px !important; }
          .ns-eyebrow      { letter-spacing: 0.16em !important; font-size: 11px !important; }
          .ns-subline      { font-size: 13px !important; }
        }

        /* Small phones (up to 520px) */
        @media (max-width: 520px) {
          .ns-heading-wrap { gap: 6px !important; top: 6% !important; padding: 0 12px !important; }
          .ns-eyebrow      { letter-spacing: 0.14em !important; font-size: 10px !important; }
          .ns-subline      { display: none; }
          .ns-decorative-rule { gap: 8px !important; }
          .ns-decorative-rule > div { width: 24px !important; }
          .ns-decorative-rule .ns-dot { width: 4px !important; height: 4px !important; }
        }

        /* Very small phones (up to 380px) */
        @media (max-width: 380px) {
          .ns-heading-wrap { gap: 4px !important; top: 8% !important; }
          .ns-eyebrow      { font-size: 9px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ns-heading-wrap * { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <section
        className="nature-section"
        style={{
          position: "relative",
          width: "100%",
          height:
            "100svh" /* svh = small viewport height – avoids mobile browser chrome gap */,
          minHeight: "clamp(520px, 100svh, 768px)",
          overflow: "hidden",
        }}
      >
        {/* Layer 1: Sky */}
        <div
          ref={skyRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Layer 2: Flowers + Grass */}
        <div
          ref={flowerRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Layer 3: Flower name labels */}
        <FlowerLabels onFlowerClick={setSelectedFlower} />

        {/* Layer 4: Heading text */}
        <div
          className="ns-heading-wrap"
          style={{
            position: "absolute",
            top: "6%",
            left: 0,
            right: 0,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          {/* Eyebrow */}
          <div
            className="ns-eyebrow"
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 300,
              fontSize: "clamp(10px, 1.4vw, 15px)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(20, 60, 30, 0.75)",
              animation: "fadeDown 0.8s ease forwards",
              animationDelay: "0.1s",
              opacity: 0,
            }}
          >
            Tailored for every aspect of your life
          </div>

          {/* Main heading */}
          <h2
            style={{
              fontFamily: "var(--font-cormorant-garamond), serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 5.5vw, 62px)",
              color: "#1a3a20",
              margin: 0,
              lineHeight: 1.1,
              textAlign: "center",
              animation:
                "fadeDown 0.9s ease forwards, shimmer 4s ease-in-out 1s infinite",
              animationDelay: "0.22s",
              opacity: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Personalised &amp;
            <br />
            <em style={{ fontStyle: "italic", color: "#2d6a1f" }}>
              Customized Services
            </em>
          </h2>

          {/* Decorative rule */}
          <div
            className="ns-decorative-rule"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              animation: "fadeDown 0.9s ease forwards",
              animationDelay: "0.4s",
              opacity: 0,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "rgba(45,106,31,0.4)",
              }}
            />
            <div
              className="ns-dot"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#34d399",
              }}
            />
            <div
              className="ns-dot"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ff9a3c",
              }}
            />
            <div
              className="ns-dot"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#a78bfa",
              }}
            />
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "rgba(45,106,31,0.4)",
              }}
            />
          </div>

          {/* Sub line */}
          <p
            className="ns-subline"
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 300,
              fontSize: "clamp(12px, 1.5vw, 16px)",
              color: "rgba(20,60,30,0.62)",
              margin: 0,
              letterSpacing: "0.02em",
              animation: "fadeDown 1s ease forwards",
              animationDelay: "0.55s",
              opacity: 0,
            }}
          >
            Nurturing every dimension of who you are
          </p>
        </div>

        <NatureLifeModal
          flower={selectedFlower}
          onClose={() => setSelectedFlower(null)}
        />
      </section>
    </>
  );
}
