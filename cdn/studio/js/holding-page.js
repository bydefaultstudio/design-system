/**
 * Script Purpose: Holding Page with Interactive Stacking Shapes
 * Author: Erlen Masson
 * Created: October 18, 2025
 * Version: 2.1.3
 * Last Updated: December 9, 2024
 */

console.log("Script - Holding Page v2.1.3");
// Global variables - use window object to prevent conflicts
window.stackingShapes = window.stackingShapes || {};
window.stackingShapes.engine = null;
window.stackingShapes.render = null;
window.stackingShapes.runner = null;
window.stackingShapes.shapes = null;
window.stackingShapes.walls = null;
window.stackingShapes.mouse = null;
window.stackingShapes.mouseConstraint = null;
window.stackingShapes.initialStates = new WeakMap();
window.stackingShapes.lastSound = new WeakMap();
window.stackingShapes.isDragging = false;
window.stackingShapes.currentScale = 1;
window.stackingShapes.audioCtx = null;
// Audio controlled by main audio system
window.stackingShapes.soundEnabled = false;
window.stackingShapes.isInitialized = false;

// ------- Audio System Integration ------- //
function syncWithMainAudioSystem() {
  if (window.bdAudio && window.bdAudio.settings) {
    window.stackingShapes.soundEnabled = window.bdAudio.settings.enabled;
  } else {
    window.stackingShapes.soundEnabled = false;
  }
}
function setupAudioSystemListener() {
  syncWithMainAudioSystem();
  
  document.addEventListener('audioSystemChanged', () => {
    syncWithMainAudioSystem();
  });
  
  // Optimized: Use requestAnimationFrame instead of setInterval for initial check
  let audioCheckCount = 0;
  const maxAudioChecks = 50; // Stop checking after 50 frames (~1 second at 60fps)
  
  function checkForMainAudio() {
    if (window.bdAudio) {
      syncWithMainAudioSystem();
      return; // Stop checking once found
    }
    
    audioCheckCount++;
    if (audioCheckCount < maxAudioChecks) {
      requestAnimationFrame(checkForMainAudio);
    }
  }
  
  requestAnimationFrame(checkForMainAudio);
  
  // Optimized: Reduce polling frequency and use more efficient check
  setInterval(() => {
    if (window.bdAudio && window.bdAudio.settings) {
      const mainAudioEnabled = window.bdAudio.settings.enabled;
      if (window.stackingShapes.soundEnabled !== mainAudioEnabled) {
        syncWithMainAudioSystem();
      }
    }
  }, 2000); // Reduced from 1000ms to 2000ms
}

// ------- Initialization ------- //
function initStackingShapes() {
  if (window.stackingShapes.isInitialized) {
    return;
  }

  const container = document.getElementById("ss-canvas");
  if (!container) {
    return;
  }


  if (window.stackingShapes.engine) {
    try {
      Matter.Runner.stop(window.stackingShapes.runner);
      Matter.Render.stop(window.stackingShapes.render);
      Matter.Engine.clear(window.stackingShapes.engine);
    } catch (e) {
      // Cleanup completed
    }
  }

  const {
    Engine,
    Render,
    Runner,
    Bodies,
    Composite,
    Mouse,
    MouseConstraint,
    Svg,
  } = Matter;

  window.stackingShapes.engine = Engine.create();
  window.stackingShapes.render = Render.create({
    element: container,
    engine: window.stackingShapes.engine,
    options: {
      width: innerWidth,
      height: innerHeight,
      wireframes: false,
      background: "transparent",
    },
  });
  Render.run(window.stackingShapes.render);
  // Fixed-step runner for controlled physics
  window.stackingShapes.runner = Runner.create({ 
    isFixed: true, 
    delta: 1000/60  // 60 FPS fixed timestep
  });
  Runner.run(window.stackingShapes.runner, window.stackingShapes.engine);

  // Get initial scale before creating shapes
  const initialScale = getResponsiveScale();
  
  // Initialize shapes with responsive positioning and scaling
  window.stackingShapes.shapes = [
    bodyFromPath("shape1", innerWidth * 0.25, innerHeight * 0.25, "#094C45", "", "#news", initialScale),
    bodyFromPath("shape2", innerWidth * 0.5, innerHeight * 0.3, "#F7A3BC", "", "#founders", initialScale),
    bodyFromPath("shape3", innerWidth * 0.75, innerHeight * 0.3, "#FFB533", "", "#work", initialScale),
    bodyFromPath("shape4", innerWidth * 0.15, innerHeight * 0.15, "#88D3CD", "", "#about", initialScale),
  ];
  Composite.add(window.stackingShapes.engine.world, window.stackingShapes.shapes);

  window.stackingShapes.shapes.forEach(captureInitialState);

  window.stackingShapes.walls = createWalls();
  Composite.add(window.stackingShapes.engine.world, window.stackingShapes.walls);

  // ------- Mouse Interaction Configuration ------- //
  window.stackingShapes.mouse = Mouse.create(window.stackingShapes.render.canvas);
  window.stackingShapes.mouseConstraint = MouseConstraint.create(
    window.stackingShapes.engine,
    {
      mouse: window.stackingShapes.mouse,
      constraint: {
        stiffness: 0.15,        // Mouse constraint stiffness
        angularStiffness: 0.15, // Angular constraint stiffness
        damping: 0.7,           // Higher damping for controlled drag-drop
        render: { visible: false },
      },
    }
  );
  Composite.add(window.stackingShapes.engine.world, window.stackingShapes.mouseConstraint);
  window.stackingShapes.render.mouse = window.stackingShapes.mouse;

  setupStackingShapesEventListeners();
  addLogoSprite();
  setupResponsiveHandling();
  initSoundSystem();
  startLabelDrawing();
  setupAudioSystemListener();
  setupThemeObserver();
  setupButtonReset();


  window.stackingShapes.isInitialized = true;
}

// ------- Logo URL Helper ------- //
function getLogoUrl() {
  const isDarkMode = document.documentElement.classList.contains('u-theme-dark');
  return isDarkMode 
    ? "https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/68fa57b2adbc6aa8ed84850d_logo_bydefault_primary-centered_off-white.svg"
    : "https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/68eec956451541e7cfc33ab9_logo_bydefault_primary.svg";
}

// ------- Logo Update Function ------- //
function updateLogo() {
  const newUrl = getLogoUrl();
  if (window.stackingShapes.logoImage && window.stackingShapes.logoImage.src !== newUrl) {
    // Preload the new image before switching to prevent flash
    const newImage = new Image();
    newImage.onload = function() {
      // Only switch when the new image is fully loaded
      window.stackingShapes.logoImage.src = newUrl;
    };
    newImage.src = newUrl;
  }
}

// ------- Theme Change Observer ------- //
function setupThemeObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updateLogo();
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Store observer for cleanup
  window.stackingShapes.themeObserver = observer;
}

// ------- Button Reset Function ------- //
function setupButtonReset() {
  // Find the email button
  const emailButton = document.getElementById('button-on-canvas');
  if (emailButton) {
    emailButton.addEventListener('click', (e) => {
      // Prevent the default email action temporarily
      e.preventDefault();
      
      console.log('🔄 Email button clicked - Resetting shapes first');
      
      // Reset shapes immediately
      resetShapes();
      
      // Wait for shapes to settle, then trigger email action
      setTimeout(() => {
        console.log('📧 Opening email client after reset');
        
        // Re-trigger the original email action
        if (emailButton.href) {
          window.open(emailButton.href, '_blank');
        } else if (emailButton.onclick) {
          emailButton.onclick();
        }
      }, 500); // 500ms delay to let shapes reset
    });
    
    console.log('✅ Button reset listener added to #button-on-canvas');
  } else {
    console.warn('⚠️ Button #button-on-canvas not found - reset functionality disabled');
  }
}

// ------- Reset Shapes Function ------- //
function resetShapes() {
  // Release any active mouse drag
  if (window.stackingShapes.mouseConstraint) {
    try {
      if ("body" in window.stackingShapes.mouseConstraint)
        window.stackingShapes.mouseConstraint.body = null;
      if (window.stackingShapes.mouseConstraint.mouse)
        window.stackingShapes.mouseConstraint.mouse.button = -1;
    } catch (e) {}
    window.stackingShapes.isDragging = false;
  }

  // Reset all shapes to their initial positions
  for (const body of window.stackingShapes.engine.world.bodies) {
    // Skip the ground and walls
    if (body.isStatic) continue;
    
    // Reset position to a random safe position
    const safeX = Math.min(Math.max(Math.random() * innerWidth, 80), innerWidth - 80);
    const safeY = 140;
    
    Matter.Body.setPosition(body, { x: safeX, y: safeY });
    Matter.Body.setAngle(body, 0);
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
    body.force = { x: 0, y: 0 };
    body.torque = 0;
    
    // Wake up the body if it's sleeping
    if (body.isSleeping) Matter.Sleeping.set(body, false);
  }
  
  // Reapply responsive scaling
  applyResponsiveScale();
  
  console.log('✅ Shapes reset to initial positions');
}


// ------- Logo Sprite ------- //
function addLogoSprite() {
  if (typeof decomp !== 'undefined') {
    Matter.Common.setDecomp(decomp);
  }
  
  const logoPath = document.getElementById('logo-shape');
  if (!logoPath) {
    console.error('Logo SVG path not found');
    return;
  }
  
  // Get the current scale (same as other shapes)
  const currentScale = getResponsiveScale();
  
  let logoVertices;
  try {
    logoVertices = Matter.Svg.pathToVertices(logoPath, 3);
    
    // Center vertices around (0,0) using viewBox center
    const viewBoxCenterX = 420 / 2; // 210
    const viewBoxCenterY = 202 / 2; // 101
    
    logoVertices = logoVertices.map(vertex => ({
      x: vertex.x - viewBoxCenterX,
      y: vertex.y - viewBoxCenterY
    }));

  } catch (error) {
    console.error('Failed to convert SVG path to vertices:', error);
    logoVertices = [
      { x: -50, y: -25 }, { x: 50, y: -25 },
      { x: 50, y: 25 }, { x: -50, y: 25 }
    ];
  }
  
  // Apply scale to logo vertices (same approach as other shapes)
  const scaledLogoVertices = logoVertices.map(vertex => ({
    x: vertex.x * currentScale,
    y: vertex.y * currentScale
  }));
  
  const logo = Matter.Bodies.fromVertices(
    innerWidth * 0.5,   // x position (responsive - center of canvas)
    innerHeight * 0.15, // y position (responsive - adjust this value to shift up/down)
    scaledLogoVertices,
    {
      restitution: 0.6,        // Bounce on collision
      frictionAir: 0.02,       // Air resistance
      render: { 
        fillStyle: "transparent",
        strokeStyle: "transparent"
      },
      label: "logo"
    },
    true // Enable poly-decomp decomposition
  );
  
  
  window.stackingShapes.logoBody = logo;
  
  const logoImage = new Image();
  logoImage.onload = function() {
    window.stackingShapes.logoImage = logoImage;
  };
  logoImage.src = getLogoUrl();
  
  window.stackingShapes.shapes.push(logo);
  Matter.Composite.add(window.stackingShapes.engine.world, logo);
  captureInitialState(logo);
}

// ------- Cleanup ------- //
function cleanupStackingShapes() {
  if (window.stackingShapes.engine) {
    try {
      Matter.Runner.stop(window.stackingShapes.runner);
      Matter.Render.stop(window.stackingShapes.render);
      Matter.Engine.clear(window.stackingShapes.engine);
      window.stackingShapes.engine = null;
      window.stackingShapes.render = null;
      window.stackingShapes.runner = null;
      window.stackingShapes.shapes = null;
      window.stackingShapes.walls = null;
      window.stackingShapes.mouse = null;
      window.stackingShapes.mouseConstraint = null;
      window.stackingShapes.isInitialized = false;
      
      // Cleanup theme observer
      if (window.stackingShapes.themeObserver) {
        window.stackingShapes.themeObserver.disconnect();
        window.stackingShapes.themeObserver = null;
      }
    } catch (e) {
      // Cleanup completed with errors
    }
  }
}

// ------- Sound System ------- //
function stackingShapesEnsureAudio() {
  if (!window.stackingShapes.soundEnabled) {
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC && !window.stackingShapes.audioCtx) {
    window.stackingShapes.audioCtx = new AC();
  }
  if (
    window.stackingShapes.audioCtx &&
    window.stackingShapes.audioCtx.state === "suspended"
  ) {
    window.stackingShapes.audioCtx.resume();
  }
}
function stackingShapesPlayPop(impact = 1) {
  if (!window.stackingShapes.soundEnabled || !window.stackingShapes.audioCtx) {
    return;
  }
  const t = window.stackingShapes.audioCtx.currentTime,
    osc = window.stackingShapes.audioCtx.createOscillator(),
    gain = window.stackingShapes.audioCtx.createGain();
  const speed = Math.min(Math.max(impact, 0), 10),
    peak = 0.01 + 0.01 * (speed / 10),  // Reduced from 0.12 to 0.03
    pitch = 150 + 30 * speed;  // Lower, softer frequency range
  osc.type = "sine";  // Softer waveform than triangle
  osc.frequency.setValueAtTime(pitch, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(gain).connect(window.stackingShapes.audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.18);
}
function initSoundSystem() {
  window.addEventListener(
    "pointerdown",
    () => {
      if (window.stackingShapes.soundEnabled) stackingShapesEnsureAudio();
    },
    { once: true }
  );
}

// ------- Helper Functions ------- //
function hexToRgb(hex) {
  const m = hex.replace("#", "");
  const n =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const num = parseInt(n, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function cssToHex(c) {
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)) return c;
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = c;
  return ctx.fillStyle;
}
function getContrastText(color) {
  const { r, g, b } = hexToRgb(cssToHex(color));
  const toLin = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
  return L > 0.45 ? "#111" : "#fff";
}

function bodyFromPath(pathId, x, y, fill, label, link, scale = 1) {
  const path = document.getElementById(pathId);
  if (!path) {
    console.error(`SVG path not found: ${pathId}`);
    // Fallback to simple rectangle
    return Matter.Bodies.rectangle(x, y, 100 * scale, 50 * scale, {
      restitution: 0.6,
      frictionAir: 0.02,
      render: { fillStyle: fill, strokeStyle: "transparent" },
      label,
      link,
    });
  }
  
  const verts = Matter.Svg.pathToVertices(path, 25);
  
  // Apply scale to vertices before creating body
  const scaledVerts = verts.map(vertex => ({
    x: vertex.x * scale,
    y: vertex.y * scale
  }));
  
  const b = Matter.Bodies.fromVertices(
    x,
    y,
    scaledVerts,
    {
      restitution: 0.6,        // Bounce on collision
      frictionAir: 0.02,       // Air resistance
      render: { fillStyle: fill, strokeStyle: "transparent" },
      label,
      link,
    },
    true
  );
  b.textColor = getContrastText(fill);
  
  
  return b;
}

function captureInitialState(body) {
  window.stackingShapes.initialStates.set(body, {
    position: { x: body.position.x, y: body.position.y },
    angle: 0,
  });
}

function createWalls() {
  const w = innerWidth,
    h = innerHeight,
    t = 200;
  return [
    Matter.Bodies.rectangle(w / 2, h + t / 2, w, t, { isStatic: true }),
    Matter.Bodies.rectangle(w / 2, -t / 2, w, t, { isStatic: true }),
    Matter.Bodies.rectangle(-t / 2, h / 2, t, h, { isStatic: true }),
    Matter.Bodies.rectangle(w + t / 2, h / 2, t, h, { isStatic: true }),
  ];
}

// ------- Mouse & Collisions ------- //
function setupStackingShapesEventListeners() {
  let mouseDownPos = null;

  Matter.Events.on(window.stackingShapes.mouseConstraint, "mousedown", (e) => {
    if (window.stackingShapes.soundEnabled) stackingShapesEnsureAudio();
    mouseDownPos = { ...e.mouse.position };
  });
  Matter.Events.on(window.stackingShapes.mouseConstraint, "mouseup", (e) => {
    const dx = e.mouse.position.x - mouseDownPos.x,
      dy = e.mouse.position.y - mouseDownPos.y;
    if (Math.hypot(dx, dy) < 5) {
      const hit = Matter.Query.point(
        Matter.Composite.allBodies(window.stackingShapes.engine.world),
        e.mouse.position
      )[0];
      if (!hit) return;
    }
  });

  Matter.Events.on(window.stackingShapes.mouseConstraint, "startdrag", () => {
    window.stackingShapes.isDragging = true;
    
    // Disable pointer events on button during drag
    const button = document.getElementById('button-on-canvas');
    if (button) {
      button.style.pointerEvents = 'none';
    }
  });
  Matter.Events.on(window.stackingShapes.mouseConstraint, "enddrag", () => {
    window.stackingShapes.isDragging = false;
    
    // Re-enable pointer events on button after drag
    const button = document.getElementById('button-on-canvas');
    if (button) {
      button.style.pointerEvents = 'auto';
    }
  });

  const passthrough = (e) => {
    if (!window.stackingShapes.isDragging) e.stopPropagation();
  };
  window.stackingShapes.render.canvas.addEventListener("wheel", passthrough, {
    passive: true,
    capture: true,
  });
  window.stackingShapes.render.canvas.addEventListener("touchmove", passthrough, {
    passive: true,
    capture: true,
  });

  Matter.Events.on(window.stackingShapes.engine, "afterUpdate", () => {
    const W = window.stackingShapes.render.canvas.width,
      H = window.stackingShapes.render.canvas.height,
      PAD = 220;
    for (const b of window.stackingShapes.shapes) {
      const bb = b.bounds,
        out =
          bb.max.x < -PAD ||
          bb.min.x > W + PAD ||
          bb.max.y < -PAD ||
          bb.min.y > H + PAD;
      if (out) {
        const x = Math.min(Math.max(b.position.x, 80), W - 80);
        Matter.Body.setPosition(b, { x, y: -60 });
        Matter.Body.setVelocity(b, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(b, 0.6);
      }
    }
  });

  setupCollisionEvents();
}

// ------- Label Drawing ------- //
function startLabelDrawing() {
  const render = window.stackingShapes.render;
  if (!render || window.stackingShapes._labelsHooked) return;
  window.stackingShapes._labelsHooked = true;
  Matter.Events.on(render, "afterRender", () => {
    const ctx = render.context;
    if (!ctx || !Array.isArray(window.stackingShapes.shapes)) return;

    ctx.save();
    ctx.font =
      "600 20px system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    window.stackingShapes.shapes.forEach((b) => {
      if (!b || !b.position) return;
      ctx.fillStyle = b.textColor || "#222";
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(b.angle || 0);
      if (b.label) {
        if (b.label === "logo") {
          ctx.fillStyle = "transparent";
        }
        ctx.fillText(b.label, 0, 0);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform for next body
    });

      // Draw logo overlay
      if (window.stackingShapes.logoBody && window.stackingShapes.logoImage && window.stackingShapes.logoBody.label === "logo") {
        const logo = window.stackingShapes.logoBody;
        const img = window.stackingShapes.logoImage;
        
        ctx.save();
        ctx.translate(logo.position.x, logo.position.y);
        ctx.rotate(logo.angle);
        
        // Use exact logo dimensions from SVG analysis
        // Original logo: 420px × 202px (aspect ratio ~2:1)
        // Scale factor is already applied to the physics body, so we need to match it
        const currentScale = getResponsiveScale();
        
        // Calculate exact logo dimensions maintaining 2:1 aspect ratio
        const logoWidth = 420 * currentScale;   // 420px scaled
        const logoHeight = 202 * currentScale;  // 202px scaled
        
        // Draw logo centered on physics body with exact dimensions
        // Add responsive offset for positioning (adjust these values)
        const offsetX = -4;  // Horizontal offset (positive = right, negative = left)
        const offsetY = -25 * currentScale; // Vertical offset (positive = down, negative = up)
        
        ctx.drawImage(
          img, 
          -logoWidth/2 + offsetX,    // Center horizontally + offset
          -logoHeight/2 + offsetY,   // Center vertically + offset
          logoWidth,                 // Exact width
          logoHeight                 // Exact height
        );
        ctx.restore();
      }

    ctx.restore();
  });
}

// ------- Responsive Scaling ------- //
const BASE_W = 1728,
  BASE_H = 1117;
function getResponsiveScale() {
  const s = Math.min(innerWidth / BASE_W, innerHeight / BASE_H);
  const scale = Math.max(0.45, Math.min(1.2, s));
  return scale;
}
function applyResponsiveScale() {
  const s = getResponsiveScale();
  const ratio = s / window.stackingShapes.currentScale;
  
  if (Math.abs(ratio - 1) > 0.001) {
    window.stackingShapes.shapes.forEach((b) => {
      Matter.Body.scale(b, ratio, ratio);
      const x = Math.min(Math.max(b.position.x, 80), innerWidth - 80);
      const y = Math.min(Math.max(b.position.y, 80), innerHeight - 80);
      Matter.Body.setPosition(b, { x, y });
    });
    window.stackingShapes.currentScale = s;
  }
}
function setupResponsiveHandling() {
  window.stackingShapes.currentScale = getResponsiveScale();
  
  // Debounced resize handler for better performance
  let resizeTimeout;
  addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      window.stackingShapes.render.canvas.width = innerWidth;
      window.stackingShapes.render.canvas.height = innerHeight;
      window.stackingShapes.render.options.width = innerWidth;
      window.stackingShapes.render.options.height = innerHeight;
      Matter.Composite.remove(
        window.stackingShapes.engine.world,
        window.stackingShapes.walls
      );
      window.stackingShapes.walls = createWalls();
      Matter.Composite.add(window.stackingShapes.engine.world, window.stackingShapes.walls);
      applyResponsiveScale();
    }, 100); // 100ms debounce delay
  });
}


// ------- Collision Events ------- //
function setupCollisionEvents() {
  const SOUND_COOLDOWN_MS = 120;
  const MIN_SPEED_FOR_SOUND = 1.2;
  Matter.Events.on(window.stackingShapes.engine, "collisionStart", (evt) => {
    if (!window.stackingShapes.soundEnabled) {
      return;
    }
    const now = performance.now();
    evt.pairs.forEach((pair) => {
      const a = pair.bodyA,
        b = pair.bodyB;
      if (
        !window.stackingShapes.shapes.includes(a) &&
        !window.stackingShapes.shapes.includes(b)
      )
        return;
      const speed = Math.hypot(
        a.velocity.x - b.velocity.x,
        a.velocity.y - b.velocity.y
      );
      if (speed < MIN_SPEED_FOR_SOUND) return;
      const okA =
          now - (window.stackingShapes.lastSound.get(a) || 0) > SOUND_COOLDOWN_MS,
        okB = now - (window.stackingShapes.lastSound.get(b) || 0) > SOUND_COOLDOWN_MS;
      if (!okA && !okB) return;
      stackingShapesPlayPop(speed);
      window.stackingShapes.lastSound.set(a, now);
      window.stackingShapes.lastSound.set(b, now);
    });
  });
}



// ------- Bootstrap ------- //
(function () {
  function safeInit() {
    if (
      document.getElementById("ss-canvas") &&
      !window.stackingShapes?.isInitialized
    ) {
      try {
        initStackingShapes();
      } catch (e) {
        console.error("Stacking Shapes Physics init failed:", e);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit, { once: true });
  } else {
    safeInit();
  }
  document.addEventListener("visibilitychange", () => {
    const HP = window.stackingShapes;
    if (!HP || !HP.engine) return;

    try {
      if (document.hidden) {
        if (HP.runner) Matter.Runner.stop(HP.runner);
        if (HP.render) Matter.Render.stop(HP.render);
        HP._paused = true;
      } else {
        if (HP.render) Matter.Render.run(HP.render);
        if (HP.runner && HP.engine) Matter.Runner.run(HP.runner, HP.engine);

        if (Array.isArray(HP.shapes)) {
          HP.shapes.forEach((b) => {
            try {
              Matter.Sleeping.set(b, false);
            } catch (e) {}
          });
        }

        if (HP.lastSound instanceof WeakMap) HP.lastSound = new WeakMap();

        if (HP.soundEnabled) stackingShapesEnsureAudio();

        HP._paused = false;
      }
    } catch (e) {
      console.warn("Visibility resume/pause error:", e);
    }
  });

  window.addEventListener("beforeunload", () => {
    try {
      cleanupStackingShapes();
    } catch (e) {}
  });
})();



