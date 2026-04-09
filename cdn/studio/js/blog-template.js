/**
 * Script Purpose: Blog page functionality and table of contents
 * Author: Erlen Masson
 * Created: 2025-10-12
 * Version: 2.1.3
 * Last Updated: December 9, 2024
 */

console.log("Script - Blog v2.1.3");

// ------- Utility Functions ------- //
function slugifyHeading(text) {
  return (
    "toc-" +
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
  );
}

// ------- Core Functions ------- //
function addAnchorIds(article) {
  // Table of contents selector: currently only h2
  // To include h3 and h4, change to: "h2, h3, h4"
  const headings = article.querySelectorAll("h2");
  
  headings.forEach((heading) => {
    const title = heading.textContent.trim();
    const anchorId = slugifyHeading(title);
    heading.id = anchorId;
  });
  
  // Return headings array for reuse
  return headings;
}

function initTableOfContents(articleSelector = "#single-article", tocContainerSelector = "#toc") {
  // Support both ID and class selectors
  const article = articleSelector.startsWith('#') 
    ? document.getElementById(articleSelector.slice(1))
    : document.querySelector(articleSelector);
    
  const tocContainer = tocContainerSelector.startsWith('#')
    ? document.getElementById(tocContainerSelector.slice(1))
    : document.querySelector(tocContainerSelector);

  if (!article || !tocContainer) {
    return;
  }

  // Remove all Webflow styling helper items (may be in different containers)
  const testItems = tocContainer.querySelectorAll('.test-toc-item');
  testItems.forEach(item => item.remove());

  // Add anchor IDs and get headings array (single query)
  const headings = addAnchorIds(article);
  
  if (!headings.length) {
    return;
  }

  const ul = document.createElement("ul");
  
  headings.forEach((heading) => {
    const title = heading.textContent.trim();
    const anchorId = heading.id;
    
    if (!anchorId) {
      return;
    }
    
    const li = document.createElement("li");
    const a = document.createElement("a");
    
    a.textContent = title;
    a.href = `#${anchorId}`;
    
    li.appendChild(a);
    ul.appendChild(li);
  });
  
  tocContainer.appendChild(ul);
}

// ------- TOC Block Fade In/Out ------- //
function sidebarTocFadeIn() {
  const article = document.getElementById("single-article");
  const tocBlock = document.querySelector(".toc-block");

  if (!article || !tocBlock) {
    return;
  }

  // Start with toc-block hidden
  gsap.set(tocBlock, { opacity: 0 });

  ScrollTrigger.create({
    trigger: article,
    start: "top 100px", // When top of #single-article hits top of viewport
    onEnter: () => {
      // Article reaches top → fade in .toc-block immediately
      gsap.to(tocBlock, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    },
    onLeaveBack: () => {
      // Scrolling back up, article leaves top → fade out .toc-block
      gsap.to(tocBlock, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  });
}

// ------- TOC Active State (scroll-sync) ------- //
function initTocActiveState() {
  const article = document.getElementById("single-article");
  if (!article) return;

  // Collect all TOC links across both containers
  const tocLinks = Array.from(document.querySelectorAll('#toc-1 a, #toc-2 a'));
  if (!tocLinks.length) return;

  // Helper to activate by id
  const setActiveLink = (id) => {
    const href = `#${id}`;
    tocLinks.forEach((a) => {
      if (a.getAttribute('href') === href) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  };

  // Create ScrollTriggers per heading
  // Table of contents selector: currently only h2
  // To include h3 and h4, change to: 'h2, h3, h4'
  const headings = Array.from(article.querySelectorAll('h2'))
    .filter((h) => h.id);

  headings.forEach((heading) => {
    ScrollTrigger.create({
      trigger: heading,
      start: 'top 10%',
      end: 'bottom 20%',
      onEnter: () => setActiveLink(heading.id),
      onEnterBack: () => setActiveLink(heading.id),
    });
  });

  // Also react to hash changes (direct navigation)
  window.addEventListener('hashchange', () => {
    const id = (window.location.hash || '').replace('#', '');
    if (id) setActiveLink(id);
  });
}


//
//------- Initialize -------//
//

document.addEventListener("DOMContentLoaded", () => {
  initTableOfContents("#single-article", "#toc-1");
  initTableOfContents("#single-article", "#toc-2");
  sidebarTocFadeIn();
  initTocActiveState();
  blogPostSlider();
  
  // Refresh ScrollTrigger after TOC is built to recalculate pin heights
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
});

