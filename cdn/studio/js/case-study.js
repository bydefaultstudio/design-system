/**
 * Case Study Template Scripts
 * Author: Erlen Masson
 * Created: 4th July 2025
 * Version: 2.1.3
 * Last Updated: December 9, 2024
 * Purpose: Handles all case study template functionality
 */

console.log("Script Case Study v2.1.3");

let caseStudyToggleHandler = null;

function toggleCaseStudyContent() {
  const primaryButton = document.getElementById('btn-project-info');
  const fixedButton = document.getElementById('btn-project-info-fixed');
  const triggerButtons = [primaryButton, fixedButton].filter(Boolean);
  const caseStudyContent = document.querySelector('.case-study-content');

  if (!primaryButton || !caseStudyContent) {
    return;
  }

  const buttonIconSets = triggerButtons.map((button) => {
    const icnInfo = button.querySelector('.icn-info');
    const icnClose = button.querySelector('.icn-close');
    const svgInfo = icnInfo?.querySelector('.svg-icon');
    const svgClose = icnClose?.querySelector('.svg-icon');

    return { button, icnInfo, icnClose, svgInfo, svgClose };
  });

  const setAllButtonCursors = (state) => {
    triggerButtons.forEach((button) => {
      button.setAttribute('data-cursor', state);
    });
  };

  const updateButtonIcons = (mode) => {
    buttonIconSets.forEach(({ icnInfo, icnClose, svgInfo, svgClose }) => {
      if (!icnInfo || !icnClose) {
        return;
      }

      const isInfoMode = mode === 'info';

      icnInfo.style.display = isInfoMode ? '' : 'none';
      icnClose.style.display = isInfoMode ? 'none' : '';

      if (svgInfo) {
        gsap.set(svgInfo, { opacity: isInfoMode ? 1 : 0 });
      }
      if (svgClose) {
        gsap.set(svgClose, { opacity: isInfoMode ? 0 : 1 });
      }
    });
  };

  updateButtonIcons('info');

  setAllButtonCursors('info');

  const handleToggle = () => {
    const isCurrentlyOpen = caseStudyContent.classList.contains('is-open');

    if (isCurrentlyOpen) {
      caseStudyContent.classList.remove('is-open');
      setAllButtonCursors('info');

      updateButtonIcons('info');
    } else {
      caseStudyContent.classList.add('is-open');
      setAllButtonCursors('close');

      updateButtonIcons('close');
    }

    setTimeout(() => {
      ScrollTrigger.refresh();

      const smoother = ScrollSmoother ? ScrollSmoother.get() : null;
      if (smoother) {
        smoother.effects();
      }

      if (pinCaseStudyContent) {
        pinCaseStudyContent.refresh();
      }
    }, 500); // Refresh delay - allows CSS transitions to complete
  };

  primaryButton.addEventListener('click', handleToggle);

  if (fixedButton) {
    fixedButton.addEventListener('click', handleToggle);
  }

  caseStudyToggleHandler = handleToggle;
}

function csButtonFixed() {
  const btn = document.querySelector('.fixed-project-button');
  const trigger = document.querySelector('.cs-content');

  if (!btn || !trigger) {
    console.warn('csButtonFixed: Required elements not found');
    return;
  }

  ScrollTrigger.create({
    trigger: trigger,
    start: "top top",
    end: "bottom bottom",
    onEnter: () => btn.classList.remove('is-hidden'),
    onEnterBack: () => btn.classList.remove('is-hidden'),
    onLeave: () => btn.classList.add('is-hidden'),
    onLeaveBack: () => btn.classList.add('is-hidden'),
    // markers: { startColor: "green", endColor: "green" }
  });
}

// ------- Case Study Content Pinning (Desktop Only) ------- //
class PinCaseStudyContent {
  constructor() {
    this.isDesktop = false;
    this.isTouchDevice = false;
    this.contentBlocks = [];
    this.resizeObserver = null;
    this.measurements = new Map();
    
    this.init();
  }

  init() {
    // Check if we're on desktop and not a touch device
    this.checkDeviceCapabilities();
    
    if (!this.isDesktop || this.isTouchDevice) {
      console.log('Case study pinning skipped - not desktop or touch device detected');
      return;
    }

    // Initialize pinning after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.setupPinning();
    }, 100);
  }

  checkDeviceCapabilities() {
    this.isDesktop = window.matchMedia("(min-width: 992px)").matches;
    
    this.isTouchDevice = (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );

    console.log('Device capabilities:', {
      isDesktop: this.isDesktop,
      isTouchDevice: this.isTouchDevice
    });
  }

  setupPinning() {
    this.waitForCMSContent().then(() => {
      this.initializePinning();
    });
  }

  waitForCMSContent() {
    return new Promise((resolve) => {
      const hasWebflowCMS = document.querySelector('.w-dyn-list, .w-dyn-item, [data-wf-cms]');
      
      if (!hasWebflowCMS) {
        resolve();
        return;
      }

      const images = document.querySelectorAll('.case-study-content img');
      let loadedImages = 0;
      const totalImages = images.length;

      if (totalImages === 0) {
        setTimeout(resolve, 500);
        return;
      }

      const checkComplete = () => {
        loadedImages++;
        if (loadedImages >= totalImages) {
          setTimeout(resolve, 200); // Layout delay after images load
        }
      };

      images.forEach(img => {
        if (img.complete) {
          checkComplete();
        } else {
          img.addEventListener('load', checkComplete);
          img.addEventListener('error', checkComplete);
        }
      });
    });
  }

  // ------- Content Block Setup ------- //
  initializePinning() {
    this.contentBlocks = document.querySelectorAll('.case-study_content-block');
    
    if (this.contentBlocks.length === 0) {
      console.log('No case study content blocks found');
      return;
    }

    console.log(`Found ${this.contentBlocks.length} case study content blocks`);

    this.contentBlocks.forEach((block, index) => {
      this.setupContentBlock(block, index);
    });

    this.setupResizeObserver();
  }

  setupContentBlock(contentBlock, index) {
    const container = contentBlock.closest('.case-study-content');
    
    if (!container) {
      console.warn(`No .case-study-content container found for block ${index}`);
      return;
    }

    const measurements = {
      contentBlock: contentBlock,
      container: container,
      index: index,
      scrollTrigger: null
    };

    this.measurements.set(contentBlock, measurements);

    this.measureAndPin(contentBlock);
  }

  measureAndPin(contentBlock) {
    const measurements = this.measurements.get(contentBlock);
    if (!measurements) return;

    if (measurements.scrollTrigger) {
      measurements.scrollTrigger.kill();
      measurements.scrollTrigger = null;
    }

    requestAnimationFrame(() => {
      this.performMeasurement(contentBlock);
    });
  }

  performMeasurement(contentBlock) {
    const measurements = this.measurements.get(contentBlock);
    if (!measurements) return;

    const { container } = measurements;

    // ------- Pinning Configuration ------- //
    // Edit these values to customize pinning behavior
    const contentBlockHeight = contentBlock.offsetHeight;
    const viewportHeight = window.innerHeight;
    const basePinOffset = 120; // Base offset from top when pinned (pixels)
    const breathingSpace = 64; // Additional space for long content (pixels)

    if (contentBlockHeight <= viewportHeight) {
      this.pinContentBlock(contentBlock, container, basePinOffset);
    } else {
      const longModeOffset = viewportHeight - contentBlockHeight - breathingSpace;
      this.pinContentBlock(contentBlock, container, longModeOffset);
    }
  }

  pinContentBlock(contentBlock, container, pinOffset) {
    const measurements = this.measurements.get(contentBlock);
    if (!measurements) return;

    const contentBlockHeight = contentBlock.offsetHeight;
    const containerHeight = container.offsetHeight;
    const scrollDistance = containerHeight - contentBlockHeight;

    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: `top ${pinOffset}px`,
      end: `+=${scrollDistance}`,
      pin: contentBlock,
      pinSpacing: false
    });

    measurements.scrollTrigger = scrollTrigger;
  }


  // ------- Resize Observer ------- //
  setupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.reMeasureAll();
      }, 200); // Resize debounce delay (milliseconds)
    });

    this.contentBlocks.forEach((contentBlock) => {
      const measurements = this.measurements.get(contentBlock);
      if (measurements) {
        this.resizeObserver.observe(contentBlock);
        this.resizeObserver.observe(measurements.container);
      }
    });

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.checkDeviceCapabilities();
        if (this.isDesktop && !this.isTouchDevice) {
          this.reMeasureAll();
        }
      }, 200); // Window resize debounce delay (milliseconds)
    });
  }

  reMeasureAll() {
    this.contentBlocks.forEach((contentBlock) => {
      this.measureAndPin(contentBlock);
    });

    ScrollTrigger.refresh();
    
    const smoother = ScrollSmoother ? ScrollSmoother.get() : null;
    if (smoother) {
      smoother.effects();
    }
  }

  refresh() {
    if (this.isDesktop && !this.isTouchDevice) {
      this.reMeasureAll();
    }
  }

  destroy() {
    this.measurements.forEach((measurements) => {
      if (measurements.scrollTrigger) {
        measurements.scrollTrigger.kill();
      }
    });

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.measurements.clear();
  }
}

let pinCaseStudyContent = null;

// ------- Case Study Video Viewport Handler ------- //
function caseStudyVideo() {
  const videos = document.querySelectorAll('video');
  const vimeoEmbeds = document.querySelectorAll('iframe[src*="vimeo.com"]');
  
  if (videos.length === 0 && vimeoEmbeds.length === 0) {
    return;
  }

  // Handle native video elements
  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.pause();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
  });

  // Handle Vimeo embeds
  if (vimeoEmbeds.length > 0 && typeof Vimeo !== 'undefined') {
    vimeoEmbeds.forEach((iframe) => {
      const player = new Vimeo.Player(iframe);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              player.play().catch(() => {});
            } else {
              player.pause().catch(() => {});
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(iframe);
    });
  }
}

// ------- Case Study Template Initialization ------- //
function initCaseStudyTemplate() {
  toggleCaseStudyContent();
  csButtonFixed();
  caseStudyVideo();
  pinCaseStudyContent = new PinCaseStudyContent();
}

document.addEventListener("DOMContentLoaded", () => {
  initCaseStudyTemplate();
});

window.PinCaseStudyContent = PinCaseStudyContent;
