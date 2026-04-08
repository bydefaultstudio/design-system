
/**
 * Script Purpose: Lightweight Audio System for ByDefault Studio
 * Author: Erlen Masson
 * Created: July 2024
 * Version: 2.1.3
 * Last Updated: December 9, 2024
 */

console.log("Script - Audio v2.1.3");

//
//------- Audio System Class -------//
//

class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.audioCache = new Map();
    this.lastHoverTime = 0;
    this.hoverDebounceDelay = 100; // ms
    this.settings = {
      volume: 0.3,
      enabled: false, // Start disabled, enable on first click
      respectUserPreferences: true
    };

    this.defaultSounds = {
      click: 'https://cdn.jsdelivr.net/gh/bydefaultstudio/website@main/assets/audio/click.mp3',
      hover: 'https://cdn.jsdelivr.net/gh/bydefaultstudio/website@main/assets/audio/hover.mp3',
      success: 'https://cdn.jsdelivr.net/gh/bydefaultstudio/website@main/assets/audio/success.mp3',
      error: 'https://cdn.jsdelivr.net/gh/bydefaultstudio/website@main/assets/audio/error.mp3',
      bump: 'https://cdn.jsdelivr.net/gh/bydefaultstudio/website@main/assets/audio/bump.mp3'
    };

    // Individual volume settings for each sound (0.0 to 1.0)
    this.soundVolumes = {
      click: 0.3,
      hover: 0.3,
      success: 0.2,
      error: 0.2,
      bump: 0.2
    };

    this.init();
  }

  //
  //------- Initialization Methods -------//
  //

  // Initialize the audio system
  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.updateToggleButton();
  }

  //
  //------- Settings Methods -------//
  //

  // Load user settings from localStorage
  loadSettings() {
    try {
      const saved = localStorage.getItem('bd-audio-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
  }

  // Save user settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem('bd-audio-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }

  //
  //------- Event Handling Methods -------//
  //

  // Setup event listeners for data-bd-audio attribute
  setupEventListeners() {
    // Click events - enable audio on any click
    document.addEventListener('click', (e) => {
      // Ensure target is an element node
      if (!e.target || e.target.nodeType !== Node.ELEMENT_NODE) return;

      // Handle sound toggle button (check target and closest parent)
      const toggleBtn = e.target.closest('#bd-sound');
      if (toggleBtn) {
        this.toggleSound();
        e.preventDefault();
        return;
      }

      // Enable audio on first click anywhere (only if no settings saved yet)
      const hasAudioSettings = localStorage.getItem('bd-audio-settings') !== null;
      if (!hasAudioSettings && !this.settings.enabled) {
        this.settings.enabled = true;
        this.saveSettings();
        this.updateToggleButton();
        console.log(' Audio - Enabled on first visit click');
      }

      // Find the closest element with data-bd-audio attribute
      // Ensure target is an element node
      if (!e.target || e.target.nodeType !== Node.ELEMENT_NODE) return;
      const audioElement = e.target.closest('[data-bd-audio]');
      if (audioElement) {
        const audioAttr = audioElement.getAttribute('data-bd-audio');
        if (audioAttr && audioAttr.includes('click') && this.shouldPlayAudio()) {
          this.playSound('click');
        }
      }
    });

    // Hover events (mouseenter)
    document.addEventListener('mouseenter', (e) => {
      // Ensure target is an element node
      if (!e.target || e.target.nodeType !== Node.ELEMENT_NODE) return;

      // Find the closest element with data-bd-audio attribute
      const audioElement = e.target.closest('[data-bd-audio]');
      if (!audioElement) return;

      const audioAttr = audioElement.getAttribute('data-bd-audio');
      if (audioAttr && audioAttr.includes('hover') && this.shouldPlayAudio()) {
        // Only play sound if we're entering the actual audio element, not a child
        if (e.target === audioElement) {
          this.playSound('hover');
        }
      }
    }, true);
  }

  //
  //------- Audio Playback Methods -------//
  //

  // Check if audio should play based on user preferences
  shouldPlayAudio() {
    if (!this.settings.enabled) return false;

    // Respect user's motion preferences
    if (this.settings.respectUserPreferences) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return false;
    }

    return true;
  }

  // Play a sound by name
  async playSound(sound) {
    // Initialize audio context on first play
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
        return;
      }
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const audioSrc = this.defaultSounds[sound];
      if (!audioSrc) return;

      const audio = await this.getAudio(audioSrc);
      if (audio) {
        audio.currentTime = 0;
        // Use individual sound volume if available, otherwise use default volume
        const soundVolume = this.soundVolumes[sound] || this.settings.volume;
        audio.volume = soundVolume;
        await audio.play();
      }
    } catch (error) {
      console.warn('Failed to play audio:', error);
    }
  }

  // Get or create audio element with caching
  async getAudio(src) {
    if (this.audioCache.has(src)) {
      return this.audioCache.get(src);
    }

    try {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';

      // Cache the audio element
      this.audioCache.set(src, audio);

      // Preload the audio
      await audio.load();

      return audio;
    } catch (error) {
      console.warn('Failed to load audio:', src, error);
      return null;
    }
  }

  //
  //------- Toggle Methods -------//
  //

  // Toggle audio on/off
  toggleSound() {
    console.log('Sound button clicked');

    this.settings.enabled = !this.settings.enabled;
    this.saveSettings();
    this.updateToggleButton();

    // Dispatch event for other components to listen to
    document.dispatchEvent(new CustomEvent('audioSystemChanged', {
      detail: { enabled: this.settings.enabled }
    }));

    // Play feedback sound if audio is being enabled
    if (this.settings.enabled && this.shouldPlayAudio()) {
      this.playSound('click');
    }

    console.log(`Audio - ${this.settings.enabled ? 'enabled' : 'disabled'}`);
  }

  // Update the visual state of the toggle button with GSAP animations
  updateToggleButton() {
    const toggleBtn = document.getElementById('bd-sound');
    if (!toggleBtn) return;

    const isEnabled = this.settings.enabled;
    const icnSoundOn = toggleBtn.querySelector('.icn-sound-on');
    const icnSoundOff = toggleBtn.querySelector('.icn-sound-off');

    // Update button title/tooltip
    toggleBtn.title = isEnabled ? 'Turn sound off' : 'Turn sound on';

    // Add/remove classes for styling
    toggleBtn.classList.toggle('bd-sound-on', isEnabled);
    toggleBtn.classList.toggle('bd-sound-off', !isEnabled);

    // Set aria-label for accessibility
    toggleBtn.setAttribute('aria-label', isEnabled ? 'Turn sound off' : 'Turn sound on');
    toggleBtn.setAttribute('aria-pressed', isEnabled.toString());

    // Check if this is the initial setup (no animation needed)
    const isInitialSetup = !icnSoundOn.style.display && !icnSoundOff.style.display;

    if (isInitialSetup) {
      // Initial setup - set icons without animation
      if (isEnabled) {
        icnSoundOn.style.display = 'block';
        icnSoundOff.style.display = 'none';
        icnSoundOn.style.opacity = '1';
        icnSoundOff.style.opacity = '0';
      } else {
        icnSoundOff.style.display = 'block';
        icnSoundOn.style.display = 'none';
        icnSoundOff.style.opacity = '1';
        icnSoundOn.style.opacity = '0';
      }
    } else {
      // Regular toggle - animate icon visibility with GSAP
      if (isEnabled) {
        // Sound is ON - show sound-on icon, hide sound-off icon
        if (icnSoundOff && icnSoundOn) {
          gsap.to(icnSoundOff, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
              icnSoundOff.style.display = 'none';
              icnSoundOn.style.display = 'block';
              gsap.fromTo(icnSoundOn, { opacity: 0 }, {
                opacity: 1,
                duration: 0.2,
                ease: "power2.out"
              });
            }
          });
        }
      } else {
        // Sound is OFF - show sound-off icon, hide sound-on icon
        if (icnSoundOn && icnSoundOff) {
          gsap.to(icnSoundOn, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
              icnSoundOn.style.display = 'none';
              icnSoundOff.style.display = 'block';
              gsap.fromTo(icnSoundOff, { opacity: 0 }, {
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

  //
  //------- Public API Methods -------//
  //

  // Enable/disable audio
  setEnabled(enabled) {
    this.settings.enabled = enabled;
    this.saveSettings();
    this.updateToggleButton();

    // Dispatch event for other components to listen to
    document.dispatchEvent(new CustomEvent('audioSystemChanged', {
      detail: { enabled: this.settings.enabled }
    }));
  }

  // Get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Set volume for a specific sound (0.0 to 1.0)
  setSoundVolume(sound, volume) {
    if (this.soundVolumes.hasOwnProperty(sound)) {
      this.soundVolumes[sound] = Math.max(0, Math.min(1, volume));
      console.log(`${sound} volume set to ${this.soundVolumes[sound]}`);
    } else {
      console.warn(`Unknown sound: ${sound}`);
    }
  }

  // Get volume for a specific sound
  getSoundVolume(sound) {
    return this.soundVolumes[sound] || this.settings.volume;
  }

  // Get all sound volumes
  getAllSoundVolumes() {
    return { ...this.soundVolumes };
  }
}

//
//------- Initialize -------//
//

// Initialize audio system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.bdAudio = new AudioSystem();
  });
} else {
  window.bdAudio = new AudioSystem();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioSystem;
}
