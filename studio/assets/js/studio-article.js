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

    var ICON_CHECK = '<div class="svg-icn"><svg data-icon="check" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"></path></svg></div>';
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

var ICON_CLOCK = '<div class="svg-icn"><svg data-icon="clock" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M15.3 16.7L16.7 15.3L13 11.6V7H11V12.4L15.3 16.7ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2167 20 16.1042 19.2208 17.6625 17.6625C19.2208 16.1042 20 14.2167 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 14.2167 4.77917 16.1042 6.3375 17.6625C7.89583 19.2208 9.78333 20 12 20Z" fill="currentColor"></path></svg></div>';

var ICON_CALENDAR = '<div class="svg-icn"><svg data-icon="calendar" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M11.0184 14V12H13.0184V14H11.0184ZM7.01843 14V12H9.01843V14H7.01843ZM15.0184 14V12H17.0184V14H15.0184ZM11.0184 18V16H13.0184V18H11.0184ZM7.01843 18V16H9.01843V18H7.01843ZM15.0184 18V16H17.0184V18H15.0184ZM3.01843 22V4H5.01843C5.57072 4 6.01843 3.55228 6.01843 3V2H8.01843V3C8.01843 3.55228 8.46615 4 9.01843 4H15.0184C15.5707 4 16.0184 3.55228 16.0184 3V2H18.0184V3C18.0184 3.55228 18.4661 4 19.0184 4H21.0184V22H3.01843ZM5.01843 19C5.01843 19.5523 5.46615 20 6.01843 20H18.0184C18.5707 20 19.0184 19.5523 19.0184 19V11C19.0184 10.4477 18.5707 10 18.0184 10H6.01843C5.46615 10 5.01843 10.4477 5.01843 11V19ZM5.01843 7C5.01843 7.55228 5.46615 8 6.01843 8H18.0184C18.5707 8 19.0184 7.55228 19.0184 7C19.0184 6.44772 18.5707 6 18.0184 6H6.01843C5.46615 6 5.01843 6.44772 5.01843 7Z" fill="currentColor"></path></svg></div>';

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
              (next.readTime ? '<span class="article-meta-item label"><div class="svg-icn"><svg data-icon="clock" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M15.3 16.7L16.7 15.3L13 11.6V7H11V12.4L15.3 16.7ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2167 20 16.1042 19.2208 17.6625 17.6625C19.2208 16.1042 20 14.2167 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 14.2167 4.77917 16.1042 6.3375 17.6625C7.89583 19.2208 9.78333 20 12 20Z" fill="currentColor"/></svg></div>' + attrEscape(next.readTime) + '</span>' : '') +
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
