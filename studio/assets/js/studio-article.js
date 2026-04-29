/**
 * Script Purpose: Article page features — table of contents, share links, next read
 * Author: By Default
 * Created: 2026-04-23
 * Version: 0.1.0
 * Last Updated: 2026-04-23
 */

console.log("Studio Article v0.1.0");

//
//------- Table of Contents (auto-generated) -------//
//

var tocObserver = null;
var tocVisibilityObserver = null;

// Convert heading text to a URL-safe slug
function slugifyHeading(text) {
  return "toc-" + text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Build a <ul> of TOC links from an array of headings
function buildTocList(headings) {
  var ul = document.createElement("ul");
  ul.className = "toc-list";
  headings.forEach(function createLink(heading) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "toc-link";
    a.textContent = heading.textContent.trim();
    a.href = "#" + heading.id;
    li.appendChild(a);
    ul.appendChild(li);
  });
  return ul;
}

function initToc() {
  // Clean up previous observers (Barba navigation)
  if (tocVisibilityObserver) {
    tocVisibilityObserver.disconnect();
    tocVisibilityObserver = null;
  }
  if (tocObserver) {
    tocObserver.disconnect();
    tocObserver = null;
  }

  var articleBody = document.querySelector(".article-body");
  if (!articleBody) return;

  // 1. Scan headings and auto-generate IDs
  var headings = articleBody.querySelectorAll("h2");
  if (!headings.length) return;

  headings.forEach(function assignId(heading) {
    if (!heading.id) {
      heading.id = slugifyHeading(heading.textContent);
    }
  });

  // 2. Auto-populate TOC containers (sidebar + in-this-article)
  var tocContainers = document.querySelectorAll(".toc-block, .in-this-article");
  tocContainers.forEach(function populateToc(container) {
    // Remove any existing list (Barba re-navigation)
    var existing = container.querySelector(".toc-list");
    if (existing) existing.remove();
    container.appendChild(buildTocList(headings));
  });

  // 3. Show/hide sidebar TOC based on in-this-article visibility
  var inThisArticle = document.querySelector(".in-this-article");
  var tocBlock = document.querySelector(".toc-block");
  var shareBlock = document.querySelector(".share-block");
  if (inThisArticle && (tocBlock || shareBlock)) {
    tocVisibilityObserver = new IntersectionObserver(function handleTocVisibility(entries) {
      entries.forEach(function checkVisibility(entry) {
        var visible = !entry.isIntersecting;
        if (tocBlock) tocBlock.classList.toggle("is-visible", visible);
        if (shareBlock) shareBlock.classList.toggle("is-visible", visible);
      });
    }, { threshold: 0 });
    tocVisibilityObserver.observe(inThisArticle);
  }

  // 4. Scroll spy — highlight active TOC link
  var topBarHeight = getMobileBarHeight();
  var tocLinks = document.querySelectorAll(".toc-link");

  tocObserver = new IntersectionObserver(function handleIntersect(entries) {
    entries.forEach(function checkEntry(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute("id");
        tocLinks.forEach(function updateActive(link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      }
    });
  }, {
    rootMargin: "-" + (topBarHeight + 16) + "px 0px -60% 0px",
    threshold: 0
  });

  headings.forEach(function observe(h) {
    tocObserver.observe(h);
  });

  // 5. Smooth scroll on TOC link click with top bar offset
  document.addEventListener("click", function handleTocClick(e) {
    var link = e.target.closest(".toc-link");
    if (!link) return;
    e.preventDefault();

    var targetId = link.getAttribute("href").slice(1);
    var target = document.getElementById(targetId);
    if (!target) return;

    var offset = target.getBoundingClientRect().top + window.scrollY - topBarHeight - 16;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
}

//
//------- Share Links -------//
//

function initShareLinks() {
  // Copy link
  document.addEventListener("click", function handleShareCopy(e) {
    var btn = e.target.closest(".share-copy");
    if (!btn) return;

    var ICON_CHECK = '<div class="svg-icn"><svg data-icon="check" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><use href="/assets/images/svg-icons/_sprite.svg#check"/></svg></div>';
    var originalHTML = btn.innerHTML;

    navigator.clipboard.writeText(window.location.href).then(function onCopy() {
      btn.innerHTML = ICON_CHECK + "Copied";
      setTimeout(function revert() {
        btn.innerHTML = originalHTML;
      }, 2000);
    });
  });

  // LinkedIn share
  document.addEventListener("click", function handleShareLinkedIn(e) {
    var link = e.target.closest(".share-linkedin");
    if (!link) return;
    e.preventDefault();
    var url = encodeURIComponent(window.location.href);
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + url, "_blank", "width=600,height=500");
  });
}

//
//------- Next Read -------//
//

// Article list comes from the manifest at runtime — see loadStudioContent().

var ICON_CLOCK = '<div class="svg-icn"><svg data-icon="clock" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><use href="/assets/images/svg-icons/_sprite.svg#clock"/></svg></div>';

var ICON_CALENDAR = '<div class="svg-icn"><svg data-icon="calendar" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><use href="/assets/images/svg-icons/_sprite.svg#calendar"/></svg></div>';

function initNextRead() {
  var article = document.querySelector("article.article");
  if (!article) return;
  loadStudioContent().then(function (data) {
    var articles = (data.articles || []).slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
    if (!articles.length) return;

    // Remove any existing next-read (Barba re-navigation)
    var existingLabel = article.parentNode.querySelector(".next-read");
    if (existingLabel) existingLabel.remove();
    var existing = article.parentNode.querySelector(".article.is-next-read");
    if (existing) existing.remove();

    // Match the current page to a manifest entry by slug (filename without .html)
    var currentSlug = location.pathname.replace(/^.*\//, "").replace(/\.html$/, "");
    var currentIndex = -1;
    articles.forEach(function findCurrent(entry, i) {
      if (entry.slug === currentSlug) currentIndex = i;
    });
    if (currentIndex === -1) return;

    var next = articles[(currentIndex + 1) % articles.length];
    var author = next.author || {};

    // Mirror the article structure so the next-read reads as its own article
    // card, gapped from the current one via CSS (.article + .article).
    var wrapper = document.createElement("article");
    wrapper.className = "article is-next-read";
    wrapper.setAttribute("data-article", next.slug);
    wrapper.innerHTML =
      '<a class="next-read-link" href="' + getStudioPrefix() + next.url + '" aria-label="Read: ' + attrEscape(next.title) + '"></a>' +
      '<section class="article-lead is-next-read">' +
        '<div class="article-header" data-grid>' +
          '<div class="block" data-col-span="10" data-col-start="2">' +
            '<div class="article-meta">' +
              (next.readTime ? '<span class="article-meta-item label"><div class="svg-icn"><svg data-icon="clock" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><use href="/assets/images/svg-icons/_sprite.svg#clock"/></svg></div>' + attrEscape(next.readTime) + '</span>' : '') +
              '<span class="article-meta-item label">' + formatStudioDate(next.date) + '</span>' +
            '</div>' +
            '<h1 class="article-headline">' + next.title + '</h1>' +
            (author.name
              ? '<a class="article-author">' +
                  (author.avatar ? '<img src="' + attrEscape(author.avatar) + '" alt="" class="article-author-avatar" loading="lazy">' : '') +
                  '<span class="article-author-by">by</span> ' + author.name +
                '</a>'
              : '') +
          '</div>' +
        '</div>' +
      '</section>';

    // Insert "Next read" block as a sibling between the two articles
    var nextRead = document.createElement("div");
    nextRead.className = "next-read";
    nextRead.innerHTML = '<div class="next-read-label label">Next read</div>';
    article.parentNode.appendChild(nextRead);

    article.parentNode.appendChild(wrapper);
  });
}

//
//------- Expose on window -------//
//

window.initToc = initToc;
window.initShareLinks = initShareLinks;
window.initNextRead = initNextRead;
