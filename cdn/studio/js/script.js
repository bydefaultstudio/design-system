/**
 * Script Purpose: By Default Custom Scripts
 * Author: Erlen Masson
 * Created: 29th June 2025
 * Version: 2.1.3
 * Last Updated: December 9, 2024
 */

console.log("Script - All v2.1.3");

// Check if the device is a touch device
function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

// Initialize ScrollSmoother only on non-touch devices
function setupScrollSmoother() {
  if (!isTouchDevice()) {
    ScrollSmoother.create({
      smooth: 1, // Adjust smoothness
      effects: true,
      smoothTouch: 0, // This value is for non-touch devices
    });
    // Comment out normalizeScroll to test the behavior
    // ScrollTrigger.normalizeScroll(true);
  }
}

// ------- Dark Mode Toggle ------- //
function siteTheme() {
  const root = document.documentElement; // <html>
  const storageKey = 'theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Load saved or system preference
  const savedTheme = localStorage.getItem(storageKey);
  const active = savedTheme || (prefersDark ? 'dark' : 'light');
  
  // Apply Webflow theme class
  root.className = root.className.replace(/u-theme-\w+/g, '');
  root.classList.add(`u-theme-${active}`);

  // Update toggle button on initialization
  siteThemeToggle();

  // Toggle logic
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#bd-theme') || e.target.closest('[data-theme-toggle]');
    if (!toggle) return;
    
    console.log('🎨 Theme toggle button clicked');
    
    // Determine next theme
    const isDark = root.classList.contains('u-theme-dark');
    const next = isDark ? 'light' : 'dark';
    
    // Remove existing theme classes and add new one
    root.className = root.className.replace(/u-theme-\w+/g, '');
    root.classList.add(`u-theme-${next}`);
    
    // Update button state
    siteThemeToggle();
    
    localStorage.setItem(storageKey, next);
    console.log(`🎨 Theme switched to: ${next}`);
  });
}

// ------- Dark Mode Toggle Button ------- //
function siteThemeToggle() {
  const toggleBtn = document.getElementById('bd-theme');
  if (!toggleBtn) return;
  
  const isDark = document.documentElement.classList.contains('u-theme-dark');
  const lightIcon = toggleBtn.querySelector('.light-icon');
  const darkIcon = toggleBtn.querySelector('.dark-icon');
  
  // Update button attributes
  toggleBtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  toggleBtn.setAttribute('aria-pressed', (!isDark).toString()); // pressed when light mode
  
  // Check if this is initial setup (no styles set yet)
  const isInitialSetup = !lightIcon.style.display && !darkIcon.style.display;
  
  if (isInitialSetup) {
    // Initial setup - show correct icon without animation
    if (isDark) {
      darkIcon.style.display = 'block';
      lightIcon.style.display = 'none';
      darkIcon.style.opacity = '1';
      lightIcon.style.opacity = '0';
    } else {
      lightIcon.style.display = 'block';
      darkIcon.style.display = 'none';
      lightIcon.style.opacity = '1';
      darkIcon.style.opacity = '0';
    }
  } else {
    // Animate icon transition
    if (isDark) {
      // Switching to dark mode - show dark icon
      if (lightIcon && darkIcon) {
        gsap.to(lightIcon, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
            gsap.fromTo(darkIcon, { opacity: 0 }, {
              opacity: 1,
              duration: 0.2,
              ease: "power2.out"
            });
          }
        });
      }
    } else {
      // Switching to light mode - show light icon
      if (darkIcon && lightIcon) {
        gsap.to(darkIcon, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            darkIcon.style.display = 'none';
            lightIcon.style.display = 'block';
            gsap.fromTo(lightIcon, { opacity: 0 }, {
              opacity: 1,
              duration: 0.2,
              ease: "power2.out"
            });
          }
        });
      }
    }
  }
}

// ------- Pin Elements (Desktop Only) ------- //
function pinElements() {
  const pinnedEls = document.querySelectorAll("[data-pin]");

  // Only apply on desktop (992px and up)
  if (!window.matchMedia("(min-width: 992px)").matches) {
    return;
  }

  pinnedEls.forEach((el) => {
    // Read value directly as pixels
    const pxOffset = parseFloat(el.getAttribute("data-pin")) || 0;

    // The parent acts as the sticky boundary
    const trigger = el.parentElement;

    // Dynamic getter so ScrollTrigger can recalc on refresh
    const getScrollDistance = () => trigger.offsetHeight - el.offsetHeight;

    const scrollDistance = getScrollDistance();

    if (scrollDistance <= 0) {
      return;
    }

    ScrollTrigger.create({
      trigger: trigger,
      start: `top ${pxOffset}px`,
      end: () => `+=${getScrollDistance()}`,
      pin: el,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
  });
}

// ------- GSAP Refresh Observer ------- //
function refreshObserve(attribute = "data-refresh") {
  const targets = document.querySelectorAll(`[${attribute}]`);
  if (!targets.length) return;

  const smoother = ScrollSmoother ? ScrollSmoother.get() : null;
  let timeout;

  const triggerRefresh = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (smoother) smoother.effects();
      ScrollTrigger.refresh();
    }, 200);
  };

  const observer = new ResizeObserver(triggerRefresh);

  targets.forEach((el) => {
    observer.observe(el);
    el.addEventListener("click", triggerRefresh);
  });
}

// ------- Scroll to Hash Anchor ------- //
function scrollToHash() {
  // Check if there is a hash in the URL
  const hash = window.location.hash;
  if (hash) {
    // Find the target element
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      const offset = 100; // 100px offset from top
      
      // Check if ScrollSmoother is active
      const smoother = ScrollSmoother?.get();
      
      if (smoother) {
        // Calculate target position with offset
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        smoother.scrollTo(targetPosition, true);
      } else {
        // Fallback to native scroll with offset
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: "auto"
        });
      }
    }
  }
}

// ------- Blog Post Slider ------- //
function blogPostSlider() {
  // Check if Splide is available before initializing
  if (typeof Splide === 'undefined') {
    console.warn('Splide not loaded, retrying blog slider initialization...');
    setTimeout(blogPostSlider, 100);
    return;
  }

  let blogSliders = document.querySelectorAll(".blog-slider");

  for (let splide of blogSliders) {
    const slider = new Splide(splide, {
      type: "loop",
      perPage: 2, // Show 2 full posts on desktop
      perMove: 1,
      gap: "2rem", // Adjust spacing between cards
      arrows: true,
      pagination: false, // Hide pagination
      speed: 800, // Slide animation speed
      easing: "ease-out",
      arrowPath:
        "M24.1125 24.5117C25.1624 23.4617 24.4188 21.6665 22.934 21.6665H6.66602V18.3332H22.934C24.4188 18.3332 25.1624 16.5379 24.1125 15.488L17.6243 8.99984L19.9993 6.6665L33.3327 19.9998L19.9993 33.3332L17.6243 30.9998L24.1125 24.5117Z",
      classes: {
        arrow: "button is-icon-only is-faded is-outline is-pill custom-arrows",
      },
      padding: {
        right: "18%", // Peek at the next slide
      },
      trimSpace: false,

      breakpoints: {
        991: {
          perPage: 2,
          perMove: 1,
          padding: {
            right: "12%",
          },
        },
        600: {
          perPage: 1,
          perMove: 1,
          padding: {
            right: 0,
          },
        },
      },
    });

    const applyArrowAttributes = () => {
      const prevArrow = slider.root.querySelector('.splide__arrow--prev');
      const nextArrow = slider.root.querySelector('.splide__arrow--next');

      if (prevArrow) {
        prevArrow.setAttribute('data-cursor', 'arrow-left');
        prevArrow.setAttribute('aria-label', 'Previous');
      }

      if (nextArrow) {
        nextArrow.setAttribute('data-cursor', 'arrow-right');
        nextArrow.setAttribute('aria-label', 'Next');
      }
    };

    slider.on('mounted', applyArrowAttributes);
    slider.on('updated', applyArrowAttributes);

    slider.mount();
  }
}

// ------- Escape Key to Close Form ------- //
function escForm() {
  document.addEventListener('keydown', (e) => {
    // Check if Esc key is pressed
    if (e.key === 'Escape' || e.keyCode === 27) {
      const closeFormButton = document.getElementById('close-form');
      if (closeFormButton) {
        closeFormButton.click();
      }
    }
  });
}

// ------- Modal Form Focus Management ------- //
function modalFormFocus() {
  const openFormButton = document.getElementById('open-form');
  const modalInputName = document.getElementById('modal-input-name');
  
  if (!openFormButton || !modalInputName) return;
  
  openFormButton.addEventListener('click', () => {
    // Use requestAnimationFrame to wait for modal to be visible
    requestAnimationFrame(() => {
      // Double RAF to ensure modal is fully rendered
      requestAnimationFrame(() => {
        // Check if input is visible and focusable
        if (modalInputName && !modalInputName.disabled && !modalInputName.hasAttribute('readonly')) {
          modalInputName.focus();
        }
      });
    });
  });
}

// Setup once the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  siteTheme();
  setupScrollSmoother();
  pinElements();
  refreshObserve();
  escForm();
  modalFormFocus();
    setTimeout(() => {
    scrollToHash(); // Scroll to anchor if present in URL
  }, 1000);

});
