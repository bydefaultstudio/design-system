/**
 * Script Purpose: Blog feed functionality with overlapping pinned sections
 * Author: Erlen Masson
 * Created: [Date]
 * Version: 2.1.3
 * Last Updated: December 9, 2024
 */

console.log("Script - Blog Feed v2.1.3");

//
//------- Main Functions -------//
//

// Section overlap
function sectionOverlap() {
  // Get all sections with data-section-pin="overlap"
  const sections = document.querySelectorAll('[data-section-pin="overlap"]');
  
  if (!sections.length) {
    return;
  }

  sections.forEach((section, i) => {
    const isLastSection = i === sections.length - 1;
    
    // Skip ScrollTrigger for the last section
    if (isLastSection) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      pin: true,
      pinSpacing: false,
      markers: false,
    });
  });
  
  // Refresh ScrollTrigger to recalculate positions
  ScrollTrigger.refresh();
}

function sectionUnderlap() {
    if (window.innerWidth < 992) return;
    
    const sections = document.querySelectorAll('[data-section-pin="underlap"]');
    if (!sections.length) return;
  
    sections.forEach((section) => {
      const content = section.querySelector('[data-section-pin="content"]');
      if (!content) return;
      
      const viewportHeight = window.innerHeight;
      const sectionHeight = section.offsetHeight;
      const rawOffset = sectionHeight - viewportHeight;
      const maxOffset = Math.min(sectionHeight, viewportHeight * 0.5);
      const initialOffset = -Math.min(Math.abs(rawOffset), maxOffset);
      const setOffset = (self) => {
        self.initialOffset = initialOffset;
        updateTransform(self);
      };
      
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "top 50%",
        pin: content,
        pinSpacing: false,
        markers: false,
        onEnter: setOffset,
        onEnterBack: setOffset,
        onUpdate: (self) => {
          if (self.initialOffset !== undefined) updateTransform(self);
        },
        invalidateOnRefresh: true
      });
      
      if (st.isActive) setOffset(st);
      
      function updateTransform(self) {
        if (self.initialOffset === undefined) return;
        gsap.set(content, {
          y: self.initialOffset * (1 - self.progress),
          force3D: true
        });
      }
    });
    
    ScrollTrigger.refresh();
  }

//
//------- Initialize -------//
//

document.addEventListener("DOMContentLoaded", () => {
  sectionOverlap();
  sectionUnderlap();
});
