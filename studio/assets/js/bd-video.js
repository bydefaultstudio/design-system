/**
 * Script Purpose: Configurable video player — play/pause, scrubber, mute, fullscreen, keyboard shortcuts
 * Author: By Default
 * Created: 2026-04-12
 * Version: 0.4.0
 * Last Updated: 2026-04-12
 *
 * Reusable video component for the By Default site. Targets every element with
 * .bd-video-player and initialises each independently with its own config.
 *
 * Scope: this is the FULL player with controls. For other video treatments see:
 *   - Decorative autoplay loops (article bodies, section backgrounds)
 *     → plain <video class="bg-video" autoplay muted loop playsinline>,
 *       emitted by the {{bg-video}} markdown shortcode. No JS.
 *
 * Configuration via data attributes on .bd-video container:
 *   data-bd-scrubber       — enable scrubber + time display
 *   data-bd-mute           — enable mute/unmute button
 *   data-bd-fullscreen     — enable fullscreen button
 *   data-bd-unmute-prompt  — show large unmute prompt (for autoplay muted)
 *
 * Always-on features:
 *   - Large centered play/pause button with tooltip
 *   - Tap/click video to toggle play/pause
 *   - Controls auto-hide after 3s idle, reappear on hover/tap
 *   - Center button stays visible while paused
 *   - Reduced motion: video does not autoplay, poster shows
 *   - Global keyboard shortcuts (Space/K, M, F, arrows)
 *   - ARIA labels update dynamically with state
 *
 * Sustainability roadmap (priority-ordered, NOT built yet):
 *   1. [CRITICAL] Captions / subtitles — <track kind="subtitles"> + data-bd-captions
 *                  CC toggle. WCAG 1.2.2 Level A.
 *   2. Loading state class (.is-loading on `waiting`, removed on `canplay`) —
 *                  avoids the "is it frozen?" problem on slow connections.
 *   3. Error state class (.is-error on `error`) — prevents silent broken state
 *                  when a source fails (e.g. expired URLs).
 *   4. Public custom events — bd-video:play / pause / ended / error bubbling
 *                  on the .bd-video root. Enables analytics + coordination.
 *   5. Visibility-based pause (data-bd-pause-offscreen) — IntersectionObserver.
 *                  Saves CPU/battery on long pages with multiple videos.
 *   6. Lazy preload upgrade — preload="none" default, upgrade to "metadata" on
 *                  near-viewport, "auto" on first play(). Bandwidth win.
 *   7. Volume slider (data-bd-volume) — finer control than just mute/unmute.
 *   8. Playback rate menu (data-bd-rate) — 0.5×/1×/1.5×/2× for long-form.
 *   9. Download prevention — controlsList="nodownload" + context-menu off.
 *                  Deters casual scraping of client work.
 *   10. Transcript toggle — sibling <details>, WCAG 1.2.3 alternative.
 *   11. Cross-video exclusivity (data-bd-exclusive) — pause others on play.
 *   12. <source> format fallback — already works, document AV1/WebM/MP4 chain.
 */

console.log("BD Video v0.4.0");

(function () {

//
//------- Icon SVGs -------//
//

var ICON_PLAY = '<div class="svg-icn" data-icon="play"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M19 11.1357V12.8643L7.50391 20L6 19V5L7.50391 4L19 11.1357Z" fill="currentColor"></path></svg></div>';

var ICON_PAUSE = '<div class="svg-icn" data-icon="pause"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M13 19V5H19V19H13ZM5 19V5H11V19H5ZM15 16C15 16.5523 15.4477 17 16 17C16.5523 17 17 16.5523 17 16V8C17 7.44772 16.5523 7 16 7C15.4477 7 15 7.44772 15 8V16ZM7 16C7 16.5523 7.44772 17 8 17C8.55228 17 9 16.5523 9 16V8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8V16Z" fill="currentColor"></path></svg></div>';

var ICON_SOUND_ON = '<div class="svg-icn" data-icon="sound-on"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M14 2.98535C17.7763 4.24145 20.5 7.80184 20.5 12C20.5 16.1981 17.7761 19.7575 14 21.0137V18.873C16.6483 17.7155 18.5 15.0751 18.5 12C18.5 8.92479 16.6485 6.28347 14 5.12598V2.98535Z" fill="currentColor"></path><path d="M14 7.39062C15.5048 8.37203 16.5 10.0694 16.5 12C16.5 13.9304 15.5046 15.627 14 16.6084V7.39062Z" fill="currentColor"></path><path d="M12 20L6.66699 16H3V8H6.66699L12 4V20ZM7.33301 10H6C5.44772 10 5 10.4477 5 11V13C5 13.5523 5.44772 14 6 14H7.33301L9.20002 15.4001C9.52965 15.6473 10 15.4121 10 15.0001V8.99924C10 8.58718 9.52954 8.352 9.19993 8.5993L7.33301 10Z" fill="currentColor"></path></svg></div>';

var ICON_SOUND_OFF = '<div class="svg-icn" data-icon="sound-off"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.7031 21.2969L20.293 22.707L16.9707 19.3848C16.0951 20.0931 15.0921 20.6504 14 21.0137V18.873C14.5538 18.631 15.0714 18.3222 15.5459 17.96L12 14.4141V20L6.66699 16H3V8H5.58594L1.29297 3.70703L2.70312 2.29688L21.7031 21.2969ZM6 10C5.44772 10 5 10.4477 5 11V13C5 13.5523 5.44772 14 6 14H7.33301L9.2002 15.4004C9.52981 15.6473 10 15.4119 10 15V12.4141L7.58594 10H6Z" fill="currentColor"></path><path d="M14 2.98535C17.7763 4.24145 20.5 7.80184 20.5 12C20.5 13.5314 20.1356 14.9766 19.4912 16.2568L17.9795 14.7451C18.315 13.8952 18.5 12.9695 18.5 12C18.5 8.92479 16.6485 6.28347 14 5.12598V2.98535Z" fill="currentColor"></path><path d="M14 7.39062C15.5048 8.37203 16.5 10.0694 16.5 12C16.5 12.3925 16.4564 12.7747 16.3779 13.1436L14 10.7656V7.39062Z" fill="currentColor"></path><path d="M12 8.76562L9.27637 6.04199L12 4V8.76562Z" fill="currentColor"></path></svg></div>';

var ICON_FS_ENTER = '<div class="svg-icn" data-icon="fullscreen-enter"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.70703 15.707L6.26762 19.1464C5.95263 19.4614 6.17572 20 6.62117 20H9V22H2V15H4V17.3788C4 17.8243 4.53857 18.0474 4.85355 17.7324L8.29297 14.293L9.70703 15.707ZM19.1464 17.7324C19.4614 18.0474 20 17.8243 20 17.3788V15H22V22H15V20H17.3788C17.8243 20 18.0474 19.4614 17.7324 19.1464L14.293 15.707L15.707 14.293L19.1464 17.7324ZM9 2V4H6.62117C6.17572 4 5.95263 4.53857 6.26762 4.85355L9.70703 8.29297L8.29297 9.70703L4.85355 6.26762C4.53857 5.95263 4 6.17572 4 6.62117V9H2V2H9ZM22 9H20V6.62117C20 6.17572 19.4614 5.95263 19.1464 6.26762L15.707 9.70703L14.293 8.29297L17.7324 4.85355C18.0474 4.53857 17.8243 4 17.3788 4H15V2H22V9Z" fill="currentColor"></path></svg></div>';

var ICON_FS_EXIT = '<div class="svg-icn" data-icon="fullscreen-exit"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M14.293 8.29297L17.7324 4.85355C18.0474 4.53857 17.8243 4 17.3788 4H15V2H22V9H20V6.62117C20 6.17572 19.4614 5.95263 19.1464 6.26762L15.707 9.70703L14.293 8.29297ZM4.85355 6.26762C4.53857 5.95263 4 6.17572 4 6.62117V9H2V2H9V4H6.62117C6.17572 4 5.95263 4.53857 6.26762 4.85355L9.70703 8.29297L8.29297 9.70703L4.85355 6.26762ZM8.29297 14.293L4.85355 17.7324C4.53857 18.0474 4 17.8243 4 17.3788V15H2V22H9V20H6.62117C6.17572 20 5.95263 19.4614 6.26762 19.1464L9.70703 15.707L8.29297 14.293ZM15.707 14.293L19.1464 17.7324C19.4614 18.0474 20 17.8243 20 17.3788V15H22V22H15V20H17.3788C17.8243 20 18.0474 19.4614 17.7324 19.1464L14.293 15.707L15.707 14.293Z" fill="currentColor"></path></svg></div>';

//
//------- Constants -------//
//

var HIDE_DELAY = 3000;
var SEEK_STEP = 5;
var SEEK_PAGE_PERCENT = 0.1;

//
//------- Utility Functions -------//
//

function formatTimeText(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = Math.floor(seconds % 60);
  if (mins === 0) return secs + " second" + (secs !== 1 ? "s" : "");
  return mins + " minute" + (mins !== 1 ? "s" : "") + " " + secs + " second" + (secs !== 1 ? "s" : "");
}

function formatTimeDisplay(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = Math.floor(seconds % 60);
  return mins + ":" + (secs < 10 ? "0" : "") + secs;
}

//
//------- Player Instance -------//
//

function initPlayerInstance(video) {
  var root = video.closest(".bd-video");
  if (!root) return;
  if (root.hasAttribute("data-bd-init")) return;
  root.setAttribute("data-bd-init", "");

  // Read config from data attributes
  var config = {
    scrubber: root.hasAttribute("data-bd-scrubber"),
    mute: root.hasAttribute("data-bd-mute"),
    fullscreen: root.hasAttribute("data-bd-fullscreen"),
    unmutePrompt: root.hasAttribute("data-bd-unmute-prompt")
  };

  // Per-instance state
  var hideTimer = null;
  var isScrubbing = false;
  var isPreview = video.muted && video.autoplay;

  // Element references (set conditionally below)
  var muteBtn = null;
  var fsBtn = null;
  var scrubber = null;
  var scrubberFill = null;
  var timeDisplay = null;
  var unmutePrompt = null;

  //
  // -- Controls auto-hide --
  //

  function showControls() {
    root.classList.remove("is-controls-hidden");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function autoHide() {
      if (!video.paused && !root.contains(document.activeElement)) {
        root.classList.add("is-controls-hidden");
      }
    }, HIDE_DELAY);
  }

  //
  // -- Center play/pause button (always on) --
  //

  var centerBtn = document.createElement("button");
  centerBtn.type = "button";
  centerBtn.className = "bd-video-center-play";
  root.appendChild(centerBtn);

  // In preview mode, show play icon (invitation to start); otherwise pause
  if (isPreview) {
    root.classList.add("is-preview");
    centerBtn.innerHTML = ICON_PLAY;
    centerBtn.setAttribute("aria-label", "Play");
    centerBtn.setAttribute("data-tooltip", "Play");
  } else {
    centerBtn.innerHTML = ICON_PAUSE;
    centerBtn.setAttribute("aria-label", "Pause");
    centerBtn.setAttribute("data-tooltip", "Pause");
  }

  // Remove any old inline play button from the controls bar
  var oldPlayBtn = root.querySelector("[data-hv-play]");
  if (oldPlayBtn) oldPlayBtn.remove();

  function syncPausedState() {
    root.classList.toggle("is-paused", video.paused);
  }

  // Exit preview mode — restart from 0, unmute, transition to active playback
  function exitPreview() {
    if (!isPreview) return;
    isPreview = false;
    root.classList.remove("is-preview");
    video.currentTime = 0;
    video.muted = false;
    root.classList.add("is-unmuted");
    video.play();
    centerBtn.innerHTML = ICON_PAUSE;
    centerBtn.setAttribute("aria-label", "Pause");
    centerBtn.setAttribute("data-tooltip", "Pause");
    if (muteBtn) {
      muteBtn.innerHTML = ICON_SOUND_ON;
      muteBtn.setAttribute("aria-label", "Mute");
      muteBtn.setAttribute("data-tooltip", "Mute");
    }
    syncPausedState();
    showControls();
  }

  function togglePlay() {
    // In preview mode, clicking play exits preview instead of toggling
    if (isPreview) {
      exitPreview();
      return;
    }
    if (video.paused) {
      video.play();
      centerBtn.innerHTML = ICON_PAUSE;
      centerBtn.setAttribute("aria-label", "Pause");
      centerBtn.setAttribute("data-tooltip", "Pause");
      showControls();
    } else {
      video.pause();
      centerBtn.innerHTML = ICON_PLAY;
      centerBtn.setAttribute("aria-label", "Play");
      centerBtn.setAttribute("data-tooltip", "Play");
      root.classList.remove("is-controls-hidden");
      clearTimeout(hideTimer);
    }
    syncPausedState();
  }

  centerBtn.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);

  //
  // -- Unmute prompt (config: unmutePrompt) --
  //

  function handleUnmute() {
    // In preview mode, unmuting exits preview (restarts + unmutes)
    if (isPreview) {
      exitPreview();
      return;
    }
    video.muted = false;
    root.classList.add("is-unmuted");
    if (muteBtn) {
      muteBtn.innerHTML = ICON_SOUND_ON;
      muteBtn.setAttribute("aria-label", "Mute");
      muteBtn.setAttribute("data-tooltip", "Mute");
    }
  }

  if (config.unmutePrompt && video.muted) {
    unmutePrompt = document.createElement("button");
    unmutePrompt.type = "button";
    unmutePrompt.className = "bd-video-unmute-prompt";
    unmutePrompt.setAttribute("aria-label", "Unmute");
    unmutePrompt.innerHTML = ICON_SOUND_OFF + "<span>Unmute</span>";
    root.appendChild(unmutePrompt);
    unmutePrompt.addEventListener("click", handleUnmute);
  }

  //
  // -- Mute button (config: mute) --
  //

  if (config.mute) {
    muteBtn = root.querySelector("[data-hv-mute]");
    if (muteBtn) {
      muteBtn.addEventListener("click", function handleMuteClick() {
        if (!video.muted) {
          video.muted = true;
          muteBtn.innerHTML = ICON_SOUND_OFF;
          muteBtn.setAttribute("aria-label", "Unmute");
          muteBtn.setAttribute("data-tooltip", "Unmute");
        } else {
          handleUnmute();
        }
      });
    }
  }

  //
  // -- Fullscreen button (config: fullscreen) --
  //

  if (config.fullscreen) {
    fsBtn = root.querySelector("[data-hv-fs]");
    if (fsBtn) {
      fsBtn.addEventListener("click", function handleFullscreen() {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });

      document.addEventListener("fullscreenchange", function handleFsChange() {
        if (!fsBtn) return;
        if (document.fullscreenElement === root) {
          fsBtn.innerHTML = ICON_FS_EXIT;
          fsBtn.setAttribute("aria-label", "Exit fullscreen");
          fsBtn.setAttribute("data-tooltip", "Exit fullscreen");
        } else {
          fsBtn.innerHTML = ICON_FS_ENTER;
          fsBtn.setAttribute("aria-label", "Fullscreen");
          fsBtn.setAttribute("data-tooltip", "Fullscreen");
        }
      });
    }
  }

  //
  // -- Scrubber + time display (config: scrubber) --
  //

  if (config.scrubber) {
    // Create scrubber
    scrubber = document.createElement("div");
    scrubber.className = "bd-video-scrubber";
    scrubber.setAttribute("role", "slider");
    scrubber.setAttribute("tabindex", "0");
    scrubber.setAttribute("aria-label", "Seek");
    scrubber.setAttribute("aria-valuemin", "0");
    scrubber.setAttribute("aria-valuemax", "0");
    scrubber.setAttribute("aria-valuenow", "0");
    scrubber.setAttribute("aria-valuetext", "0 seconds of 0 seconds");

    scrubberFill = document.createElement("div");
    scrubberFill.className = "bd-video-scrubber-fill";
    scrubber.appendChild(scrubberFill);
    root.appendChild(scrubber);

    // Create seek tooltip (sibling of scrubber, inside root to avoid overflow clip)
    var seekTooltip = document.createElement("div");
    seekTooltip.className = "bd-video-seek-tooltip";
    seekTooltip.setAttribute("aria-hidden", "true");
    seekTooltip.textContent = "0:00";
    root.appendChild(seekTooltip);

    // Create time display + group existing buttons into left/right layout
    var controlsBar = root.querySelector(".bd-video-controls");
    if (controlsBar) {
      // Wrap existing children (mute, fullscreen buttons) into a right group
      var rightGroup = document.createElement("div");
      rightGroup.className = "bd-video-controls-right";
      while (controlsBar.firstChild) {
        rightGroup.appendChild(controlsBar.firstChild);
      }
      controlsBar.appendChild(rightGroup);

      // Insert time display as the left element
      timeDisplay = document.createElement("span");
      timeDisplay.className = "bd-video-time";
      timeDisplay.setAttribute("aria-hidden", "true");
      timeDisplay.textContent = "0:00 / 0:00";
      controlsBar.insertBefore(timeDisplay, rightGroup);
    }

    // Set duration when metadata loads
    video.addEventListener("loadedmetadata", function setDuration() {
      scrubber.setAttribute("aria-valuemax", String(Math.round(video.duration)));
      if (timeDisplay) {
        timeDisplay.textContent = formatTimeDisplay(video.currentTime) + " / " + formatTimeDisplay(video.duration);
      }
    });

    // Update scrubber on playback
    video.addEventListener("timeupdate", function updateScrubber() {
      if (isScrubbing) return;
      var pct = video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0;
      scrubberFill.style.width = pct + "%";
      scrubber.setAttribute("aria-valuenow", String(Math.round(video.currentTime)));
      scrubber.setAttribute("aria-valuetext",
        formatTimeText(video.currentTime) + " of " + formatTimeText(video.duration)
      );
      if (timeDisplay) {
        timeDisplay.textContent = formatTimeDisplay(video.currentTime) + " / " + formatTimeDisplay(video.duration);
      }
    });

    // Click to seek
    function seekToPosition(clientX) {
      var rect = scrubber.getBoundingClientRect();
      var x = clientX - rect.left;
      var pct = Math.max(0, Math.min(1, x / rect.width));
      video.currentTime = pct * video.duration;
    }

    scrubber.addEventListener("click", function handleScrubberClick(e) {
      seekToPosition(e.clientX);
    });

    // Seek tooltip — follows cursor along the scrubber
    function updateSeekTooltip(clientX) {
      var rect = scrubber.getBoundingClientRect();
      var x = clientX - rect.left;
      var pct = Math.max(0, Math.min(1, x / rect.width));
      var time = pct * (video.duration || 0);
      seekTooltip.textContent = formatTimeDisplay(time);
      // Position relative to the scrubber's left edge within root
      var rootRect = root.getBoundingClientRect();
      var left = clientX - rootRect.left;
      // Clamp so tooltip doesn't overflow the container edges
      var tooltipWidth = seekTooltip.offsetWidth / 2;
      left = Math.max(tooltipWidth, Math.min(rootRect.width - tooltipWidth, left));
      seekTooltip.style.left = left + "px";
    }

    scrubber.addEventListener("mousemove", function handleScrubberHover(e) {
      if (!video.duration) return;
      seekTooltip.classList.add("is-visible");
      updateSeekTooltip(e.clientX);
    });

    scrubber.addEventListener("mouseleave", function handleScrubberLeave() {
      if (!isScrubbing) {
        seekTooltip.classList.remove("is-visible");
      }
    });

    // Mouse drag
    function startScrub(e) {
      isScrubbing = true;
      scrubber.classList.add("is-scrubbing");
      seekTooltip.classList.add("is-visible");
      seekToPosition(e.clientX);
      updateSeekTooltip(e.clientX);
      document.addEventListener("mousemove", doScrub);
      document.addEventListener("mouseup", stopScrub);
    }

    function doScrub(e) {
      if (!isScrubbing) return;
      showControls();
      var rect = scrubber.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var pct = Math.max(0, Math.min(1, x / rect.width));
      scrubberFill.style.width = (pct * 100) + "%";
      video.currentTime = pct * video.duration;
      updateSeekTooltip(e.clientX);
    }

    function stopScrub() {
      isScrubbing = false;
      scrubber.classList.remove("is-scrubbing");
      seekTooltip.classList.remove("is-visible");
      document.removeEventListener("mousemove", doScrub);
      document.removeEventListener("mouseup", stopScrub);
    }

    scrubber.addEventListener("mousedown", function handleMouseDown(e) {
      e.preventDefault();
      startScrub(e);
    });

    // Touch drag
    function startTouchScrub(e) {
      isScrubbing = true;
      scrubber.classList.add("is-scrubbing");
      doTouchScrub(e);
      document.addEventListener("touchmove", doTouchScrub, { passive: false });
      document.addEventListener("touchend", stopTouchScrub);
    }

    function doTouchScrub(e) {
      if (!isScrubbing) return;
      e.preventDefault();
      showControls();
      var touch = e.touches[0];
      var rect = scrubber.getBoundingClientRect();
      var x = touch.clientX - rect.left;
      var pct = Math.max(0, Math.min(1, x / rect.width));
      scrubberFill.style.width = (pct * 100) + "%";
      video.currentTime = pct * video.duration;
    }

    function stopTouchScrub() {
      isScrubbing = false;
      scrubber.classList.remove("is-scrubbing");
      document.removeEventListener("touchmove", doTouchScrub);
      document.removeEventListener("touchend", stopTouchScrub);
    }

    scrubber.addEventListener("touchstart", startTouchScrub, { passive: false });

    // Keyboard navigation on scrubber
    scrubber.addEventListener("keydown", function handleScrubberKeys(e) {
      var dur = video.duration || 0;
      if (!dur) return;

      var handled = true;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          video.currentTime = Math.min(dur, video.currentTime + SEEK_STEP);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          video.currentTime = Math.max(0, video.currentTime - SEEK_STEP);
          break;
        case "PageUp":
          video.currentTime = Math.min(dur, video.currentTime + dur * SEEK_PAGE_PERCENT);
          break;
        case "PageDown":
          video.currentTime = Math.max(0, video.currentTime - dur * SEEK_PAGE_PERCENT);
          break;
        case "Home":
          video.currentTime = 0;
          break;
        case "End":
          video.currentTime = dur;
          break;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        showControls();
      }
    });
  }

  //
  // -- Reduced motion --
  //

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
    centerBtn.innerHTML = ICON_PLAY;
    centerBtn.setAttribute("aria-label", "Play");
    centerBtn.setAttribute("data-tooltip", "Play");
  }

  syncPausedState();

  //
  // -- Global keyboard shortcuts --
  //

  root.addEventListener("keydown", function handlePlayerKeys(e) {
    // Don't capture if the scrubber has focus (it has its own handler)
    if (scrubber && e.target === scrubber) return;

    var handled = true;
    switch (e.key) {
      case " ":
      case "k":
        togglePlay();
        break;
      case "m":
        if (config.mute && muteBtn) muteBtn.click();
        break;
      case "f":
        if (config.fullscreen && fsBtn) fsBtn.click();
        break;
      case "ArrowLeft":
        video.currentTime = Math.max(0, video.currentTime - SEEK_STEP);
        break;
      case "ArrowRight":
        video.currentTime = Math.min(video.duration || 0, video.currentTime + SEEK_STEP);
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      showControls();
    }
  });

  //
  // -- Global sound state --
  //

  // Listen for the sidebar sound toggle
  document.addEventListener("studio:sound-changed", function handleGlobalSound(e) {
    video.muted = e.detail.muted;
    if (muteBtn) {
      if (e.detail.muted) {
        muteBtn.innerHTML = ICON_SOUND_OFF;
        muteBtn.setAttribute("aria-label", "Unmute");
        muteBtn.setAttribute("data-tooltip", "Unmute");
      } else {
        muteBtn.innerHTML = ICON_SOUND_ON;
        muteBtn.setAttribute("aria-label", "Mute");
        muteBtn.setAttribute("data-tooltip", "Mute");
      }
    }
  });

  //
  // -- Controls auto-hide — start on init --
  //

  root.addEventListener("mousemove", function handleMouseMove() { showControls(); });
  root.addEventListener("touchstart", function handleTouchStart() { showControls(); }, { passive: true });
  showControls();
}

//
//------- Init -------//
//

function initBdVideo(scope) {
  var root = scope || document;
  var players = root.querySelectorAll(".bd-video-player");
  players.forEach(initPlayerInstance);
  console.log("BD Video — init", players.length, "player(s)");
}

// Expose for studio-barba.js to call after each navigation
window.initBdVideo = initBdVideo;

// Wait for DOM before initializing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBdVideo);
} else {
  initBdVideo();
}

})();
