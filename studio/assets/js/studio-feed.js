/**
 * Script Purpose: Homepage feed — rendering, FLIP filters, read badges
 * Author: By Default
 * Created: 2026-04-23
 * Version: 0.1.0
 * Last Updated: 2026-04-23
 */

console.log("Studio Feed v0.1.0");

//
//------- Feed Filters -------//
//

// Filter the content feed by type. Uses event delegation on [data-feed-filters]
// so it works after Barba navigations back to home without re-binding.
//
// Transition style is set via data-feed-transition on the feed container:
//   fade (default)    — simple opacity
//   scale             — opacity + scale to 0
//   stagger           — opacity with staggered reveal
//   scale-stagger     — opacity + scale with staggered reveal
//
// FLIP animation: posts that stay visible smoothly glide to their new
// positions after the masonry grid reflows, instead of snapping.
function initFeedFilters() {
  function readDuration(name) {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue(name), 10) || 0;
  }

  function readEasing() {
    return getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";
  }

  // FLIP: capture position of every visible post
  function capturePositions(items) {
    var positions = new Map();
    items.forEach(function capture(item) {
      if (!item.hidden) {
        var rect = item.getBoundingClientRect();
        positions.set(item, { x: rect.left, y: rect.top });
      }
    });
    return positions;
  }

  // FLIP: animate items from old position to new position
  function flipAnimate(items, firstPositions, duration, easing) {
    items.forEach(function animate(item) {
      if (item.hidden) return;
      var first = firstPositions.get(item);
      if (!first) return;

      var last = item.getBoundingClientRect();
      var dx = first.x - last.left;
      var dy = first.y - last.top;

      // Only animate if the item actually moved
      if (dx === 0 && dy === 0) return;

      item.animate(
        [
          { transform: "translate(" + dx + "px, " + dy + "px)" },
          { transform: "translate(0, 0)" }
        ],
        { duration: duration, easing: easing, fill: "none" }
      );
    });
  }

  document.addEventListener("click", function handleFilterClick(e) {
    var btn = e.target.closest("[data-filter]");
    if (!btn) return;

    var filterValue = btn.getAttribute("data-filter");
    var feed = document.querySelector("[data-feed]");
    if (!feed) return;

    // Already active — just scroll to feed top
    if (btn.classList.contains("is-active")) {
      var stickyOffset = readCssVarPx("--studio-bar-height") + readCssVarPx("--studio-gap");
      var feedTop = feed.getBoundingClientRect().top + window.scrollY - stickyOffset;
      window.scrollTo({ top: Math.max(0, feedTop), behavior: "smooth" });
      return;
    }

    // Read transition config
    var transition = feed.getAttribute("data-feed-transition") || "fade";
    var useStagger = transition === "stagger" || transition === "scale-stagger";
    var hideDuration = readDuration("--duration-2xs") || 100;
    var flipDuration = readDuration("--duration-s") || 400;
    var staggerDelay = readDuration("--duration-stagger") || 30;
    var easing = readEasing();

    // Sync active state on filter buttons
    var allButtons = document.querySelectorAll("[data-filter]");
    allButtons.forEach(function updateActive(b) {
      b.classList.toggle("is-active", b === btn);
    });

    var items = feed.querySelectorAll(".post-item");
    var toHide = [];
    var toShow = [];

    items.forEach(function categorise(item) {
      var type = item.getAttribute("data-feed-type");
      var matches = filterValue === "all" || type === filterValue;
      if (matches && item.hidden) {
        toShow.push(item);
      } else if (!matches && !item.hidden) {
        toHide.push(item);
      }
    });

    // FLIP step 1 — First: capture current positions of all visible items
    var firstPositions = capturePositions(items);

    // Phase 1: fade/scale out non-matching items
    toHide.forEach(function fadeOut(item) {
      item.classList.add("is-hiding");
    });

    // Phase 2: after hide completes, reflow + reveal + FLIP
    setTimeout(function hideAndShow() {
      // Remove hidden items from flow
      toHide.forEach(function hide(item) {
        item.hidden = true;
        item.classList.remove("is-hiding");
      });

      // Prepare showing items in their start state (invisible)
      toShow.forEach(function prepare(item) {
        item.classList.add("is-showing");
        item.hidden = false;
      });

      // Force reflow — browser calculates new layout positions
      void feed.offsetWidth;

      // FLIP step 2–4 — Last, Invert, Play: animate surviving items to new positions
      flipAnimate(items, firstPositions, flipDuration, easing);

      // Phase 3: reveal new items (staggered or all at once)
      if (useStagger) {
        toShow.forEach(function reveal(item, i) {
          setTimeout(function staggerReveal() {
            item.classList.remove("is-showing");
          }, i * staggerDelay);
        });
      } else {
        toShow.forEach(function reveal(item) {
          item.classList.remove("is-showing");
        });
      }

      // Scroll after DOM has updated
      var stickyOffset = readCssVarPx("--studio-bar-height") + readCssVarPx("--studio-gap");
      var feedTop = feed.getBoundingClientRect().top + window.scrollY - stickyOffset;
      window.scrollTo({ top: Math.max(0, feedTop), behavior: "smooth" });
    }, hideDuration);
  });
}

//
//------- Read Badges -------//
//

// Scan feed posts and mark any that link to pages the user has already visited.
// Injects a badge with check icon into the top-right of the .post card.
function markReadPosts() {
  var viewed = JSON.parse(localStorage.getItem("pagesViewed") || "[]");
  if (!viewed.length) return;

  var posts = document.querySelectorAll(".post-item");
  posts.forEach(function checkPost(item) {
    var link = item.querySelector("a.post");
    if (!link) return;
    var href = link.getAttribute("href");
    if (!href) return;
    var resolved;
    try { resolved = new URL(href, location.href).pathname; } catch (e) { return; }
    var normalized = resolved.replace(/\.html$/, "");
    var isRead = viewed.some(function (v) { return v.replace(/\.html$/, "") === normalized; });
    item.classList.toggle("is-read", isRead);
  });
}

//
//------- Feed Rendering -------//
//
// Renders [data-feed] from the manifest. Silently no-ops when no [data-feed]
// is present (i.e. on any page that isn't home).
//
// Ratio rules: featured variants put data-ratio on .post (CSS drives card
// shape); other variants put data-ratio on .post-thumbnail. Media: when an
// entry has thumbnailVideo it renders <video class="vdo-thumb"> for the
// thumb-hover.js hover-to-play behaviour; otherwise <img class="img-thumb">.

function buildThumbnailBlock(entry) {
  if (entry.feedVariant === "text") return { html: "", postRatioAttr: "" };

  var hasVideo = !!entry.thumbnailVideo;
  var src = hasVideo ? entry.thumbnailVideo : (entry.thumbnail || entry.hero);
  // Fallback: auto-generate a 4:5 placeholder with the title burned in
  // (bydefault.design/image already serves author avatars). Writers can
  // override by setting `thumbnail` + `thumbnail-ratio` in frontmatter.
  var usedPlaceholder = false;
  if (!src) {
    src = "https://bydefault.design/image/400x500?text=" + encodeURIComponent(entry.title || "");
    usedPlaceholder = true;
  }

  var alt = attrEscape(entry.thumbnailAlt || entry.title || "");
  var ratio = entry.thumbnailRatio || (usedPlaceholder ? "4:5" : "");
  var isFeatured = Boolean(entry.featured) || entry.feedVariant === "featured";
  var mediaStyle = entry.thumbnailFocus
    ? ' style="object-position: ' + attrEscape(entry.thumbnailFocus) + ';"'
    : "";
  var thumbRatioAttr = !isFeatured && ratio ? ' data-ratio="' + attrEscape(ratio) + '"' : "";
  var postRatioAttr = isFeatured && ratio ? ' data-ratio="' + attrEscape(ratio) + '"' : "";

  var mediaHtml;
  if (hasVideo) {
    var poster = entry.thumbnailVideoPoster || entry.thumbnail || entry.hero || "";
    var posterAttr = poster ? ' poster="' + attrEscape(poster) + '"' : "";
    mediaHtml =
      '<video class="vdo-thumb" src="' + attrEscape(src) + '"' + posterAttr +
      ' muted playsinline preload="metadata" aria-hidden="true"' + mediaStyle + "></video>";
  } else {
    mediaHtml =
      '<img class="img-thumb" src="' + attrEscape(src) + '" alt="' + alt + '" loading="lazy"' + mediaStyle + ">";
  }

  return {
    html: '<div class="post-thumbnail"' + thumbRatioAttr + ">" + mediaHtml + "</div>",
    postRatioAttr: postRatioAttr
  };
}

function renderFeedItem(entry) {
  var isArticle = entry.type === "article";
  var label = isArticle ? "Article" : "Case study";
  var postType = entry.featured ? "featured" : (entry.feedVariant || "standard");
  var excerpt = entry.synopsis ? '<p class="post-excerpt">' + entry.synopsis + '</p>' : "";

  var metaParts = ['<span class="post-meta-item post-date label">' + formatStudioDate(entry.date) + '</span>'];
  if (isArticle && entry.readTime) metaParts.push('<span class="post-meta-item post-read-time label">' + entry.readTime + '</span>');
  if (!isArticle && entry.client) metaParts.push('<span class="post-meta-item post-client label">' + entry.client + '</span>');

  var thumb = buildThumbnailBlock(entry);

  var wrap = document.createElement("div");
  wrap.className = "post-item";
  wrap.setAttribute("data-feed-type", entry.type);
  wrap.setAttribute("data-feed-date", entry.date);
  wrap.innerHTML =
    '<a href="' + getStudioPrefix() + entry.url + '" class="post" data-post-type="' + postType + '"' + thumb.postRatioAttr + ">" +
      '<div class="post-header">' +
        '<span class="post-label label">' + label + '</span>' +
        '<div class="post-read-status badge label"><div class="svg-icn">' + ICON_CHECK + '</div>Read</div>' +
      '</div>' +
      '<div class="post-body">' +
        '<h3 class="post-title">' + entry.title + '</h3>' +
        excerpt +
        '<div class="post-meta bottom-meta">' + metaParts.join("") + '</div>' +
      '</div>' +
      thumb.html +
    '</a>';
  return wrap;
}

function initFeed() {
  var feed = document.querySelector("[data-feed]");
  if (!feed) return;
  loadStudioContent().then(function (data) {
    var all = [].concat(data.articles || [], data.caseStudies || []);
    all.sort(function (a, b) { return b.date.localeCompare(a.date); });
    feed.innerHTML = "";
    all.forEach(function (entry) { feed.appendChild(renderFeedItem(entry)); });
    if (typeof markReadPosts === "function") markReadPosts();
    if (typeof window.initThumbHover === "function") window.initThumbHover(feed);
  });
}

//
//------- Expose on window -------//
//

window.initFeed = initFeed;
window.markReadPosts = markReadPosts;
