"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import {
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { buildWordGeometry } from "./buildWordGeometry";
import { FRAME_MARGIN, type BlockLettersConfig } from "./config";

type Props = {
  word: string;
  config: BlockLettersConfig;
  className?: string;
  /** Called once the first frame is on screen. */
  onReady?: () => void;
};

// Owns the WebGL renderer for the word. Everything is created in one
// effect and torn down in its cleanup, so React Strict Mode's double
// mount leaves nothing behind.
export default function BlockLettersCanvas({
  word,
  config,
  className,
  onReady,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Reads the latest onReady without making the effect re-run on change.
  const announceReady = useEffectEvent(() => onReady?.());

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);

    const { solid, edges, width } = buildWordGeometry(
      word,
      config.colors,
      config.depth,
    );
    const faces = new Mesh(solid, new MeshBasicMaterial({ vertexColors: true }));
    // WebGL's own lines are always one device pixel wide. The "fat line"
    // addon draws each edge as a thin quad, so the outline can have a
    // real width in CSS pixels. It needs the canvas size to do that.
    const edgePositions = edges.getAttribute("position").array as Float32Array;
    const outlineGeometry = new LineSegmentsGeometry().setPositions(edgePositions);
    const outlineMaterial = new LineMaterial({
      color: new Color(config.colors.outline).getHex(),
      linewidth: config.outlineWidth,
    });
    const outline = new LineSegments2(outlineGeometry, outlineMaterial);
    edges.dispose();
    const group = new Group();
    group.add(faces, outline);
    const scene = new Scene();
    scene.add(group);

    // Orthographic: no perspective, so the front view is perfectly flat.
    // The frustum is fitted to the word's width; height follows the
    // host's aspect ratio so nothing is stretched.
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 10;
    const halfW = width / 2 + FRAME_MARGIN;

    let announced = false;
    const fit = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      outlineMaterial.resolution.set(w, h);
      camera.left = -halfW;
      camera.right = halfW;
      const halfH = (halfW * h) / w;
      camera.top = halfH;
      camera.bottom = -halfH;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      if (!announced) {
        announced = true;
        announceReady();
      }
    };

    // Rock the word around its vertical axis. sin() starts at 0, so the
    // first frame is the flat front view.
    const amplitude = (config.amplitudeDegrees * Math.PI) / 180;
    const omega = (2 * Math.PI) / config.periodSeconds;
    let frame = 0;
    let onScreen = false;
    const start = performance.now();
    const tick = (now: number) => {
      group.rotation.y = amplitude * Math.sin(omega * ((now - start) / 1000));
      renderer.render(scene, camera);
      if (onScreen) frame = requestAnimationFrame(tick);
    };

    const resize = new ResizeObserver(fit);
    resize.observe(host);
    fit();

    // Only animate while the word is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (onScreen) frame = requestAnimationFrame(tick);
    });
    visibility.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resize.disconnect();
      solid.dispose();
      outlineGeometry.dispose();
      faces.material.dispose();
      outlineMaterial.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [word, config]);

  return <div ref={hostRef} className={className} aria-hidden />;
}
