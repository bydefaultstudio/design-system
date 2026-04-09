/**
 * Script Purpose: Key Visual Collection Spawner
 * Author: Erlen Masson
 * Version: 2.1.3
 * Last Updated: December 9, 2024
 */

console.log("Script - Key Visuals v2.1.3");

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

class KeyVisualCollection {
  constructor(containerSelector = '#key-visual-container') {
    this.container = null;
    this.activeKeyVisuals = [];
    this.maxKeyVisuals = 20;
    this.collection = [];
    this.isInitialized = false;
    this.spawnCooldown = 100;
    this.lastSpawnTime = 0;
    this.containerSelector = containerSelector;
    this.currentImageIndex = 0;
    this.counterElement = null;
    
    this.config = this.getResponsiveConfig();
  }

  // Initialize the spawner
  init() {
    this.container = document.querySelector(this.containerSelector);
    if (!this.container) {
      console.warn(`Container ${this.containerSelector} not found`);
      return;
    }

    this.createOverlay();
    this.loadCollection();
    this.createCounter();
    this.setupEventListeners();
    this.setupResponsiveListener();
    this.isInitialized = true;
    
  }

  // Create the overlay for key visuals within the hero section
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'key-visual-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    `;
    // Append to the hero container instead of body
    this.container.appendChild(overlay);
    this.overlay = overlay;
  }

  // Create the counter element to track visual progression
  createCounter() {
    if (!this.container) {
      return;
    }

    const existingCounter = this.container.querySelector('#key-visual-counter');
    if (existingCounter) {
      this.counterElement = existingCounter;
      this.updateCounterText(0);
      return;
    }

    const counter = document.createElement('div');
    counter.id = 'key-visual-counter';
    counter.textContent = this.getCounterLabel(0);
    this.container.appendChild(counter);
    this.counterElement = counter;
  }

  // Generate counter label
  getCounterLabel(displayIndex) {
    const total = this.collection.length || 0;
    const current = total === 0 ? 0 : displayIndex;
    return `${current} of ${total}`;
  }

  // Update the counter text
  updateCounterText(displayIndex) {
    if (!this.counterElement) {
      return;
    }
    this.counterElement.textContent = this.getCounterLabel(displayIndex);
  }

  // Check if device is mobile
  isMobile() {
    const isMobile = window.innerWidth <= 768;
    return isMobile;
  }

  // ANIMATION CONFIGURATION - Edit these values to customize animations
  getResponsiveConfig() {
    if (this.isMobile()) {
      return {
        enterDuration: 0.4,        // How fast visuals appear (seconds)
        dwellDuration: 0,          // How long visuals stay visible (seconds)
        exitDuration: 6.0,         // How long exit animation takes (seconds)
        scaleRange: [0.9, 1.05],  // Size variation range [min, max]
        rotationRange: [-3, 3],    // Rotation range in degrees [min, max]
        driftDistance: 100,        // How far visuals move when exiting (pixels)
        driftXMultiplier: 0.05,    // Horizontal movement multiplier
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      };
    } else {
      return {
        enterDuration: 0.4,        // How fast visuals appear (seconds)
        dwellDuration: 0,          // How long visuals stay visible (seconds)
        exitDuration: 6.0,         // How long exit animation takes (seconds)
        scaleRange: [0.9, 1.1],    // Size variation range [min, max]
        rotationRange: [-5, 5],    // Rotation range in degrees [min, max]
        driftDistance: 100,        // How far visuals move when exiting (pixels)
        driftXMultiplier: 0.1,     // Horizontal movement multiplier
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      };
    }
  }

  getResponsiveDisplayWidths() {
    if (this.isMobile()) {
      // Mobile widths
      return {
        '16:9': '80vw',
        '4:5': '60vw',
        '1:1': '54vw',  
        '2:1': '80vw',   
        '9:16': '60vw'   
      };
    } else {
      // Desktop widths
      const widths = {
        '16:9': '50vw', 
        '4:5': '30vw',   
        '1:1': '50vw',   
        '2:1': '60vw',   
        '9:16': '30vw'   
      };
      return widths;
    }
  }

  // Load key visuals from Webflow CMS inline JSON feed
  loadCollection() {
    // Get responsive display widths
    this.ratioDisplayWidths = this.getResponsiveDisplayWidths();

    // Try to load from Webflow CMS JSON feed first
    const cmsData = this.parseWebflowCMSFeed();
    
    if (cmsData && cmsData.length > 0) {
      this.collection = cmsData;
      
      // Pre-warm the first asset for better performance
      this.preWarmFirstAsset();
    } else {
      // Fallback to default collection if no CMS data
      this.collection = this.getDefaultCollection();
    }
  }

  // Extract Vimeo video ID from URL (handles multiple Vimeo URL formats)
  // Optimized with single regex pattern for better performance
  extractVimeoId(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Combined regex pattern to match all Vimeo URL formats at once
    const match = url.match(/(?:\/playback\/|player\.vimeo\.com\/video\/|vimeo\.com\/|vimeocdn\.com\/.*\/)(\d+)/);
    return match ? match[1] : null;
  }

  // Decode URL - optimized to avoid creating DOM elements repeatedly
  decodeUrl(url) {
    if (!url || typeof url !== 'string') return url;
    
    let decoded = url;
    
    // First decode URL encoding
    try {
      decoded = decodeURIComponent(decoded);
    } catch (e) {
      // URL decode failed, continue with original
    }
    
    // Decode HTML entities using string replacement (faster than DOM manipulation)
    decoded = decoded
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'");
    
    return decoded;
  }


  // Fallback to poster image when video fails
  fallbackToPoster(visual, keyVisual) {
    const videoElement = keyVisual.querySelector('video');
    if (videoElement && visual.poster) {
      const imgElement = document.createElement('img');
      imgElement.src = visual.poster;
      imgElement.alt = visual.alt || 'Key visual';
      imgElement.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      videoElement.parentNode.replaceChild(imgElement, videoElement);
    } else if (!visual.poster) {
      if (videoElement) {
        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center; color: #fff;';
        placeholder.textContent = 'Video unavailable';
        videoElement.parentNode.replaceChild(placeholder, videoElement);
      }
    }
  }

  // Parse Webflow CMS inline JSON feed
  parseWebflowCMSFeed() {
    const feedContainer = document.querySelector('#kv-json-feed');
    
    if (!feedContainer) {
      return null;
    }

    const jsonBlocks = feedContainer.querySelectorAll('.kv-json');

    const parsedItems = [];

    jsonBlocks.forEach((block, index) => {
      try {
        let jsonText = block.textContent.trim();
        
        // Fix common JSON issues: empty values (e.g., "maxWidth": )
        // Replace empty values with null
        jsonText = jsonText.replace(/:\s*([,}])/g, ': null$1');
        
        const item = JSON.parse(jsonText);
        
        // Validate required fields
        if (!item.src) {
          console.warn(`⚠️ Skipping item ${index} - no src`);
          return;
        }

        // Normalize to internal format (Webflow JSON structure)
        const normalizedItem = {
          type: item.type || 'image',
          src: item.src,
          poster: item.poster || null,
          alt: item.alt || 'Key visual',
          ratio: item.ratio || '16:9',
          weight: item.weight || 1,
          drop: item.drop || null,
          order: item.order || index,
          // Store original Vimeo video ID if it's a progressive redirect URL
          vimeoId: item.vimeoId || this.extractVimeoId(item.src),
          // Optional max-width in pixels to prevent upscaling
          maxWidth: item.maxWidth || null
        };

        parsedItems.push(normalizedItem);
      } catch (error) {
        console.error(`❌ Failed to parse JSON block ${index}:`, error);
        console.error(`❌ Raw content:`, block.textContent);
      }
    });

    // Sort by order
    parsedItems.sort((a, b) => a.order - b.order);

    // Remove the feed from DOM to free memory
    feedContainer.remove();

    return parsedItems;
  }

  // Pre-warm the first asset for better performance
  preWarmFirstAsset() {
    if (!this.collection || this.collection.length === 0) return;

    const firstVisual = this.collection[0];
    
    if (firstVisual.type === 'video') {
      // Pre-warm video metadata
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'video';
      preloadLink.href = firstVisual.src;
      document.head.appendChild(preloadLink);
      
      if (firstVisual.poster) {
        // Pre-warm poster image
        const posterLink = document.createElement('link');
        posterLink.rel = 'preload';
        posterLink.as = 'image';
        posterLink.href = firstVisual.poster;
        document.head.appendChild(posterLink);
      }
    } else {
      // Pre-warm image
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = firstVisual.src;
      document.head.appendChild(preloadLink);
    }
    
  }

  // Default fallback collection
  getDefaultCollection() {
    return [
      { 
        type: 'image', 
        src: 'https://placehold.co/1920x1080/094C45/B6D6A5?text=PNG', 
        ratio: '16:9',
        weight: 1,
        order: 1
      },
      { 
        type: 'gif', 
        src: 'https://placehold.co/1200x1500/F7A3BC/2B2B2B?text=GIF', 
        ratio: '4:5',
        weight: 1,
        order: 2
      },
      { 
        type: 'video', 
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 
        ratio: '16:9',
        weight: 1,
        order: 3
      },
      { 
        type: 'image', 
        src: 'https://placehold.co/1080x1080/FFB533/2B2B2B?text=PNG', 
        ratio: '1:1',
        weight: 1,
        order: 4
      },
      { 
        type: 'video', 
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 
        ratio: '16:9',
        weight: 1,
        order: 5
      },
      { 
        type: 'image', 
        src: 'https://placehold.co/900x1600/094C45/B6D6A5?text=PNG', 
        ratio: '9:16',
        weight: 1,
        order: 6
      }
    ];
  }

  // Setup event listeners
  setupEventListeners() {
    const debouncedSpawn = debounce((e) => this.spawnKeyVisual(e), this.spawnCooldown);
    
    // Mouse events
    this.container.addEventListener('click', (e) => {
      debouncedSpawn(e);
    });
    
    // Touch events for mobile - distinguish between tap and scroll
    let touchStartTime = 0;
    let touchStartY = 0;
    let touchMoved = false;
    
    this.container.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    }, { passive: true });
    
    this.container.addEventListener('touchmove', (e) => {
      if (Math.abs(e.touches[0].clientY - touchStartY) > 10) {
        touchMoved = true;
      }
    }, { passive: true });
    
    this.container.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      // Only spawn if it was a quick tap (not a scroll)
      if (touchDuration < 300 && !touchMoved) {
        debouncedSpawn(e.changedTouches[0]);
      }
    }, { passive: true });
    
  }

  // Setup responsive listener for screen size changes
  setupResponsiveListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Update responsive settings when screen size changes
        this.config = this.getResponsiveConfig();
        this.ratioDisplayWidths = this.getResponsiveDisplayWidths();
      }, 150); // Debounce resize events
    });
  }

  // Spawn a key visual at the click position
  spawnKeyVisual(event) {
    
    if (!this.isInitialized) {
      return;
    }
    
    if (this.activeKeyVisuals.length >= this.maxKeyVisuals) {
      return;
    }
    
    const now = Date.now();
    if (now - this.lastSpawnTime < this.spawnCooldown) {
      return;
    }
    this.lastSpawnTime = now;

    // Cache container dimensions to avoid repeated getBoundingClientRect calls
    const rect = this.container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Don't spawn too close to edges
    if (x < 50 || x > containerWidth - 50 || y < 50 || y > containerHeight - 50) {
      return;
    }

    const keyVisual = this.createKeyVisual(x, y);
    this.animateKeyVisual(keyVisual);
    this.activeKeyVisuals.push(keyVisual);

    const displayIndex = this.collection.length === 0
      ? 0
      : (this.currentImageIndex === 0 ? this.collection.length : this.currentImageIndex);
    this.updateCounterText(displayIndex);
  }

  // Create a key visual element
  createKeyVisual(x, y) {
    const keyVisual = document.createElement('div');
    keyVisual.className = 'key-visual';
    
    // Select next key visual from collection consecutively
    const visual = this.selectNextKeyVisual();
    
    // Get display width based on ratio
    const displayWidth = this.ratioDisplayWidths[visual.ratio] || '40vw';
    const rotation = random(this.config.rotationRange[0], this.config.rotationRange[1]);
    
    // Create media element based on type
    let mediaElement;
    
    if (visual.type === 'video') {
      const isVimeoUrl = visual.src.includes('vimeo.com');
      const decodedSrc = isVimeoUrl ? this.decodeUrl(visual.src) : visual.src;
      
      // Create video element with common properties
      mediaElement = document.createElement('video');
      mediaElement.src = decodedSrc;
      mediaElement.muted = true;
      mediaElement.autoplay = true;
      mediaElement.loop = true;
      mediaElement.playsInline = true;
      mediaElement.controls = false;
      mediaElement.preload = isVimeoUrl ? 'auto' : 'metadata';
      mediaElement.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      
      // Set poster image if provided
      if (visual.poster) {
        mediaElement.poster = visual.poster;
      }
      
      // Optimized play handler - only one event listener needed
      const handleVideoReady = () => {
        if (mediaElement.readyState >= 2) {
          mediaElement.play().catch(() => {
            // Play failed silently
          });
        }
      };
      
      // Single event listener for video ready state
      const onCanPlay = () => {
        handleVideoReady();
        // Remove other listener to avoid duplicate calls
        mediaElement.removeEventListener('loadeddata', onLoadedData);
      };
      
      const onLoadedData = () => {
        handleVideoReady();
        mediaElement.removeEventListener('canplay', onCanPlay);
      };
      
      mediaElement.addEventListener('canplay', onCanPlay, { once: true });
      mediaElement.addEventListener('loadeddata', onLoadedData, { once: true });
      
      // Handle Vimeo format errors by switching to iframe
      if (isVimeoUrl) {
        mediaElement.addEventListener('error', (e) => {
          if (mediaElement.error?.code === 4) {
            const vimeoId = this.extractVimeoId(decodedSrc);
            if (vimeoId) {
              const iframe = document.createElement('iframe');
              iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&controls=0&title=0&byline=0&portrait=0`;
              iframe.allow = 'autoplay; fullscreen; picture-in-picture';
              iframe.allowFullscreen = true;
              iframe.frameBorder = '0';
              iframe.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border: none;';
              iframe.setAttribute('data-vimeo-id', vimeoId);
              
              if (mediaElement.parentNode) {
                mediaElement.parentNode.replaceChild(iframe, mediaElement);
              }
            } else {
              this.fallbackToPoster(visual, keyVisual);
            }
          }
        }, { once: true });
      }
      
      // Start loading
      mediaElement.load();
      
      // Try immediate play if already ready (optimization)
      if (mediaElement.readyState >= 2) {
        handleVideoReady();
      }
      
    } else if (visual.type === 'gif') {
      // GIF: treat as image for optimal performance
      mediaElement = document.createElement('img');
      mediaElement.src = visual.src;
      mediaElement.alt = visual.alt || 'Key visual GIF';
      mediaElement.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      
    } else {
      // Default: PNG/JPEG images
      mediaElement = document.createElement('img');
      mediaElement.src = visual.src;
      mediaElement.alt = visual.alt || 'Key visual';
      mediaElement.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
    }
    
    keyVisual.appendChild(mediaElement);
    
    // Batch DOM operations for better performance
    const aspectRatio = visual.ratio.replace(':', ' / ');
    
    // Build style string with optional max-width
    let styleString = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${displayWidth};
      aspect-ratio: ${visual.ratio};
      pointer-events: none;
      --aspect-ratio: ${aspectRatio};
    `;
    
    // Add max-width if provided in CMS to prevent upscaling
    if (visual.maxWidth && typeof visual.maxWidth === 'number') {
      styleString += `max-width: ${visual.maxWidth}px;`;
    }
    
    keyVisual.style.cssText = styleString;
    
    // Batch attribute setting
    keyVisual.setAttribute('data-type', visual.type || 'image');
    keyVisual.setAttribute('data-ratio', visual.ratio || 'unknown');
    keyVisual.setAttribute('data-display-width', displayWidth);
    keyVisual.setAttribute('data-source-url', visual.src || '');
    if (visual.maxWidth) {
      keyVisual.setAttribute('data-max-width', visual.maxWidth);
    }

    // Set GSAP transform origin to center
    gsap.set(keyVisual, {
      transformOrigin: "50% 50%",
      xPercent: -50,
      yPercent: -50
    });

    this.overlay.appendChild(keyVisual);
    return keyVisual;
  }

  // Select key visual consecutively
  selectNextKeyVisual() {
    if (!this.collection || this.collection.length === 0) {
      return null;
    }

    // Simple consecutive selection
    const visual = this.collection[this.currentImageIndex];
    this.currentImageIndex = (this.currentImageIndex + 1) % this.collection.length;
    
    return visual;
  }

  // Animate key visual lifecycle
  animateKeyVisual(keyVisual) {
    if (this.config.reducedMotion) {
      // Simple fade for reduced motion
      gsap.set(keyVisual, { opacity: 1 });
      gsap.to(keyVisual, { 
        opacity: 0, 
        duration: 0.3, 
        delay: 1,
        onComplete: () => this.removeKeyVisual(keyVisual)
      });
      return;
    }

    // Set initial state
    gsap.set(keyVisual, { 
      scale: 0, 
      opacity: 0,
      rotation: 0
    });

    // Enter animation with GSAP
    gsap.to(keyVisual, {
      scale: 1,
      opacity: 1,
      rotation: random(-5, 5),
      duration: this.config.enterDuration,
      ease: "power2.out",
      onComplete: () => {
        setTimeout(() => {
          this.animateExit(keyVisual);
        }, this.config.dwellDuration);
      }
    });
  }

  // Animate key visual exit
  animateExit(keyVisual) {
    const driftX = random(-this.config.driftDistance * this.config.driftXMultiplier, this.config.driftDistance * this.config.driftXMultiplier);
    const driftY = random(100, this.config.driftDistance * 2);
    const rotation = random(-10, 10);

    // Start movement immediately
    gsap.to(keyVisual, {
      x: driftX,
      y: driftY,
      scale: 0.95,
      rotation: rotation,
      duration: this.config.exitDuration,
      ease: "power1.out"
    });

    // Fade out timing: starts after 40% of movement, takes 60% of total duration
    gsap.to(keyVisual, {
      opacity: 0,
      duration: this.config.exitDuration * 0.6, // Fade duration
      delay: this.config.exitDuration * 0.4,    // Fade delay
      ease: "power1.out",
      onComplete: () => {
        this.removeKeyVisual(keyVisual);
      }
    });
  }

  // Remove key visual from DOM and active list
  removeKeyVisual(keyVisual) {
    const index = this.activeKeyVisuals.indexOf(keyVisual);
    if (index > -1) {
      this.activeKeyVisuals.splice(index, 1);
    }
    
    if (keyVisual.parentNode) {
      keyVisual.parentNode.removeChild(keyVisual);
    }
  }

  // Get key visual collection info
  getCollectionInfo() {
    return this.collection.map((visual, index) => ({
      index,
      type: visual.type,
      src: visual.src,
      poster: visual.poster,
      alt: visual.alt,
      ratio: visual.ratio,
      weight: visual.weight,
      drop: visual.drop,
      order: visual.order,
      displayWidth: this.ratioDisplayWidths[visual.ratio] || '40vw'
    }));
  }

  // Cleanup all key visuals
  cleanup() {
    this.activeKeyVisuals.forEach(keyVisual => this.removeKeyVisual(keyVisual));
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    if (this.counterElement && this.counterElement.parentNode) {
      this.counterElement.parentNode.removeChild(this.counterElement);
    }
  }
}

//
//

// Initialize key visual collection
function initKeyVisualCollection(containerSelector = '#key-visual-container') {
  window.keyVisualCollection = new KeyVisualCollection(containerSelector);
  window.keyVisualCollection.init();
  return window.keyVisualCollection;
}

//
//

// Auto-initialize if container exists
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector('#key-visual-container') || document.querySelector('#pebble-container') || document.querySelector('#hero-container');
  if (container) {
    initKeyVisualCollection(container.id ? `#${container.id}` : '#key-visual-container');
  }
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (window.keyVisualCollection) {
    window.keyVisualCollection.cleanup();
  }
});