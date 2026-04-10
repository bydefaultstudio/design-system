/**
 * Script Purpose: FIFA World Cup 26 Stadiums Interactive Map
 * Author: Erlen Masson
 * Created: 2025-01-27
 * Version: 2.1.1
 * Last Updated: November 23, 2025
 */

console.log("Script - Fifa World Cup 26 Stadiums v2.1.1");

//
//------- Configuration -------//
//

// Mapbox configuration
mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

// Default camera settings
var defaultZoomDesktop = 16.5;
var defaultBearingDesktop = 45;
var defaultPitchDesktop = 55;
var defaultDurationDesktop = 4000;

var defaultZoomMobile = 15;
var defaultBearingMobile = 45;
var defaultPitchMobile = 55;
var defaultDurationMobile = 4000;

// Camera constraints
var minZoom = 4;
var maxZoom = 20;
var minPitch = 0;
var maxPitch = 60;

// ScrollTrigger visibility thresholds
var sectionVisibilityThreshold = 30; // Lowered to catch sections during fast scrolling
var viewportCoverageThreshold = 30; // Lowered to catch sections during fast scrolling

// Marker size
var markerSize = 0.2; 

// Start location settings - centered on North America
var startLocationSettings = {
    center: [-95.7129, 39.8283], // Center of USA
    zoom: 3.5,
    bearing: 0,
    pitch: 0
};

//
//------- State Variables -------//
//

var map;
var locations;
var activeLocationName = 'start';
var isFlyingToLocation = false;
var isProgrammaticScroll = false; // Flag to prevent ScrollTrigger from firing during programmatic scrolls

//
//------- Utility Functions -------//
//

function isMobileDevice() {
    return window.innerWidth <= 768;
}

function defaultZoom() {
    return isMobileDevice() ? defaultZoomMobile : defaultZoomDesktop;
}

function defaultBearing() {
    return isMobileDevice() ? defaultBearingMobile : defaultBearingDesktop;
}

function defaultPitch() {
    return isMobileDevice() ? defaultPitchMobile : defaultPitchDesktop;
}

function defaultDuration() {
    return isMobileDevice() ? defaultDurationMobile : defaultDurationDesktop;
}


function calculatePitch(zoom) {
    if (zoom < minZoom) return minPitch;
    if (zoom > maxZoom) return maxPitch;
    
    var zoomRange = maxZoom - minZoom;
    var pitchRange = maxPitch - minPitch;
    var zoomProgress = (zoom - minZoom) / zoomRange;
    
    return minPitch + (zoomProgress * pitchRange);
}

// Setup GSAP ScrollTrigger for active state
function setupLocationScrollTriggers() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return false;
    }
    
    var sections = document.querySelectorAll('.map-section');
    if (sections.length === 0) {
        return false;
    }
    
    var viewportHeight = window.innerHeight;
    var sectionThreshold = sectionVisibilityThreshold / 100;
    var viewportThreshold = viewportCoverageThreshold / 100;
    
    sections.forEach(function(section) {
        var locationName = section.id;
        if (!locationName || !locations || !locations[locationName]) {
            return;
        }
        
        var hasBeenActivated = false;
        
        // Watch for images loading within this section and refresh ScrollTrigger
        var sectionImages = section.querySelectorAll('img');
        sectionImages.forEach(function(img) {
            if (!img.complete) {
                img.addEventListener('load', function() {
                    // Image loaded, refresh ScrollTrigger to recalculate section height
                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                    }
                });
                img.addEventListener('error', function() {
                    // Image failed to load, still refresh to recalculate
                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                    }
                });
            }
        });
        
        ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            end: 'bottom 20%',
            markers: false,
            invalidateOnRefresh: true,
            onEnter: function() {
                // Section entered the active zone - more reliable for fast scrolling
                if (!isProgrammaticScroll && activeLocationName !== locationName) {
                    setActiveLocation(locationName);
                    hasBeenActivated = true;
                }
            },
            onEnterBack: function() {
                // Section entered the active zone when scrolling back up
                if (!isProgrammaticScroll && activeLocationName !== locationName) {
                    setActiveLocation(locationName);
                    hasBeenActivated = true;
                }
            },
            onUpdate: function() {
                // Fallback: also check during update for sections that might be missed
                // Calculate section height dynamically to handle lazy-loaded images
                var sectionHeight = section.offsetHeight;
                var rect = section.getBoundingClientRect();
                
                // Calculate visible portion of section in viewport
                var viewportTop = 0;
                var viewportBottom = viewportHeight;
                
                // Calculate how much of the section is visible
                var sectionTopInViewport = Math.max(viewportTop, rect.top);
                var sectionBottomInViewport = Math.min(viewportBottom, rect.bottom);
                var visibleHeight = Math.max(0, sectionBottomInViewport - sectionTopInViewport);
                
                // Calculate section visibility percentage
                var sectionVisiblePercentage = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;
                
                // Calculate viewport coverage percentage
                var viewportCoveragePercentage = viewportHeight > 0 ? visibleHeight / viewportHeight : 0;
                
                // Trigger if EITHER condition is met:
                // 1. X% of the section is visible (works for shorter sections)
                // 2. X% of the viewport is covered (works for taller sections)
                var shouldBeActive = sectionVisiblePercentage >= sectionThreshold || 
                                    viewportCoveragePercentage >= viewportThreshold;
                
                // Don't trigger map zoom if we're programmatically scrolling (e.g., from marker click)
                if (shouldBeActive && !hasBeenActivated && !isProgrammaticScroll && activeLocationName !== locationName) {
                    hasBeenActivated = true;
                    setActiveLocation(locationName);
                } else if (!shouldBeActive && hasBeenActivated) {
                    hasBeenActivated = false;
                }
            },
            onLeave: function() {
                hasBeenActivated = false;
            },
            onLeaveBack: function() {
                hasBeenActivated = false;
            }
        });
    });
    
    return true;
}

//
//------- Map Functions -------//
//

function createLocations() {
    return {
        'start': {
            center: startLocationSettings.center,
            zoom: startLocationSettings.zoom,
            bearing: startLocationSettings.bearing,
            pitch: startLocationSettings.pitch,
            duration: defaultDuration()
        },
        // CANADA
        'location-1': {
            center: [-79.41860275981647, 43.633344479762606], // Toronto Stadium, Toronto, ON
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/69227944802d4b7085b6eee8_marker_toronto.png',
            markerName: 'Toronto Stadium'
        },
        'location-2': {
            center: [-123.11199325619512, 49.27679680085015], // BC Place Vancouver, Vancouver, BC
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/692279449915edf7485c30d9_marker_vancouver.png',
            markerName: 'BC Place Vancouver'
        },
        // UNITED STATES
        'location-3': {
            center: [-122.33162867317007, 47.595282003606506], // Seattle Stadium, Seattle, WA
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/69227944d3bf8f9f6c775397_marker_seattle.png',
            markerName: 'Seattle Stadium'
        },
        'location-4': {
            center: [-121.96982801344069, 37.40340169958504], // San Francisco Bay Area Stadium, Santa Clara, CA
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/6922794452d0b845b3297c25_marker_san-fransisco.png',
            markerName: 'San Francisco Bay Area Stadium'
        },
        'location-5': {
            center: [-118.33901277360808, 33.95366336188629], // Los Angeles Stadium, Inglewood, CA
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/69227944b52de853b98e06ef_marker_los-angeles.png',
            markerName: 'Los Angeles Stadium'
        },
        'location-6': {
            center: [-95.41070740255462, 29.684926932878952], // Houston Stadium, Houston, TX
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/692279449ff642a6c6059951_marker_houston.png',
            markerName: 'Houston Stadium'
        },
        'location-7': {
            center: [-97.09342723131195, 32.748168021277536], // Dallas Stadium, Arlington, TX
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/692279446cc72b0fe888e01c_marker_dallas.png',
            markerName: 'Dallas Stadium'
        },
        'location-8': {
            center: [-94.48397118695186, 39.04913964542153], // Kansas City Stadium, Kansas City, MO
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/692279446cc72b0fe888e021_marker_kansas-city.png',
            markerName: 'Kansas City Stadium'
        },
        'location-9': {
            center: [-84.40061196012041, 33.755519416171744], // Atlanta Stadium, Atlanta, GA
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/69227944ba775723538c66e6_marker_atlanta.png',
            markerName: 'Atlanta Stadium'
        },
        'location-10': {
            center: [-80.23894347380467, 25.95806555283134], // Miami Stadium, Miami Gardens, FL
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/6922794416d0518df6d37cac_marker_miami.png',
            markerName: 'Miami Stadium'
        },
        'location-11': {
            center: [-75.1674449943026, 39.90080186160432], // Philadelphia Stadium, Philadelphia, PA
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/69227944f024f9155c172c46_marker_philadelphia.png',
            markerName: 'Philadelphia Stadium'
        },
        'location-12': {
            center: [-74.07446353083712, 40.81358239877924], // New York New Jersey Stadium, East Rutherford, NJ
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/69227944e9fa2376c48ea0b6_marker_new-york.png',
            markerName: 'New York New Jersey Stadium'
        },
        'location-13': {
            center: [-71.26425600852964, 42.09089342301428], // Boston Stadium, Foxborough, MA
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/69227944227be2cec8165388_marker_boston.png',
            markerName: 'Boston Stadium'
        },
        // MEXICO
        'location-14': {
            center: [-100.24451201133449, 25.669166721945064], // Estadio Monterrey, Monterrey, NL
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/692279443b57eca561769d5f_marker_monterrey.png',
            markerName: 'Estadio Monterrey'
        },
        'location-15': {
            center: [-103.46264414791094, 20.681805963750712], // Estadio Guadalajara, Guadalajara, Jalisco
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/69227944142e131cf0b02872_marker_guadalajara.png',
            markerName: 'Estadio Guadalajara'
        },
        'location-16': {
            center: [-99.15050366281262, 19.302920410403893], // Mexico City Stadium, Mexico City
            zoom: defaultZoom(),
            bearing: defaultBearing(),
            pitch: defaultPitch(),
            duration: defaultDuration(),
            markerImage: 'https://cdn.prod.website-files.com/68e2be176459e98837a31ed9/692279444923fc23e2c6fc46_marker_mexico-city.png',
            markerName: 'Mexico City Stadium'
        }
    };
}

function updateLocationsForDevice() {
    locations = createLocations();
}

function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/anonivate/cmi8wxaiw002t01s6aeq5c4oj',
        center: startLocationSettings.center,
        zoom: startLocationSettings.zoom,
        bearing: startLocationSettings.bearing,
        pitch: startLocationSettings.pitch
    });

    // Add zoom and rotation controls to the map
    map.addControl(new mapboxgl.NavigationControl());

    map.on('style.load', function() {
        if (!map.getSource('mapbox-dem')) {
            map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
            });
        }
        
        try {
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        } catch (err) {
            setTimeout(function() {
                try {
                    if (map.getSource('mapbox-dem')) {
                        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
                    }
                } catch (e) {
                    // Terrain setup failed, silently continue
                }
            }, 100);
        }
    });
    
    map.on('load', function() {
        setupZoomListener();
        handleScroll();
        addLocationMarkers();
        
        // Refresh ScrollTrigger after map loads to ensure proper calculations
        if (typeof ScrollTrigger !== 'undefined') {
            setTimeout(function() {
                ScrollTrigger.refresh();
            }, 100);
        }
    });
}


function setupZoomListener() {
    map.on('zoom', function() {
        if (!isFlyingToLocation) {
            var currentZoom = map.getZoom();
            var newPitch = calculatePitch(currentZoom);
            map.setPitch(newPitch);
        }
    });
}

// Add custom markers for each location
function addLocationMarkers() {
    // Collect all unique marker images and build features array
    var markerImages = {};
    var features = [];
    var locationIds = [];
    
    // Build features array and collect unique marker images
    for (var locationName in locations) {
        if (locationName === 'start') continue; // Skip start location
        
        var location = locations[locationName];
        if (!location.markerImage) continue; // Skip if no marker image
        
        // Store marker image URL for this location
        markerImages[locationName] = location.markerImage;
        locationIds.push(locationName);
        
        // Create feature with location name and display name
        features.push({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': location.center
            },
            'properties': {
                'title': location.markerName || locationName,
                'locationId': locationName
            }
        });
    }
    
    if (locationIds.length === 0) {
        return; // No markers to add
    }
    
    // Load all marker images sequentially
    var loadedCount = 0;
    var totalImages = locationIds.length;
    
    function loadNextImage(index) {
        if (index >= totalImages) {
            // All images loaded, add source and layer
            map.addSource('location-markers', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': features
                }
            });
            
            // Add symbol layer with dynamic icon-image based on locationId
            map.addLayer({
                'id': 'location-markers',
                'type': 'symbol',
                'source': 'location-markers',
                'layout': {
                    'icon-image': ['concat', 'marker-', ['get', 'locationId']],
                    'icon-size': markerSize,
                    'text-field': ['get', 'title'],
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 3],
                    'text-anchor': 'top'
                }
            });
            
            // Add click handler for markers
            setupMarkerClickHandlers();
            return;
        }
        
        var locationId = locationIds[index];
        var imageUrl = markerImages[locationId];
        
        map.loadImage(imageUrl, function(error, image) {
            if (error) {
                console.error('Error loading marker image for', locationId + ':', error);
                loadedCount++;
                loadNextImage(index + 1);
            } else {
                // Add image with unique ID
                map.addImage('marker-' + locationId, image);
                loadedCount++;
                loadNextImage(index + 1);
            }
        });
    }
    
    // Start loading images
    loadNextImage(0);
}

// Setup click handlers for markers to scroll to content sections
function setupMarkerClickHandlers() {
    // Add custom cursor attribute when hovering over markers
    map.on('mouseenter', 'location-markers', function() {
        var canvas = map.getCanvasContainer();
        canvas.setAttribute('data-cursor', 'pointer');
        map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'location-markers', function() {
        var canvas = map.getCanvasContainer();
        canvas.removeAttribute('data-cursor');
        map.getCanvas().style.cursor = '';
    });
    
    // Handle marker clicks
    map.on('click', 'location-markers', function(e) {
        if (!e.features || e.features.length === 0) return;
        
        var locationId = e.features[0].properties.locationId;
        if (!locationId) {
            console.warn('Marker clicked but no locationId found in properties');
            return;
        }
        
        scrollToLocationSection(locationId);
    });
}

// Scroll to the corresponding content section for a location
function scrollToLocationSection(locationName) {
    var targetSection = document.getElementById(locationName);
    if (!targetSection) {
        console.warn('Could not find section with id:', locationName);
        return;
    }
    
    // Set flag to prevent ScrollTrigger from firing during programmatic scroll
    isProgrammaticScroll = true;
    
    // Check if ScrollSmoother is active
    var smoother = typeof ScrollSmoother !== 'undefined' ? ScrollSmoother.get() : null;
    
    if (smoother) {
        // Use ScrollSmoother for smooth scrolling
        var targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
        smoother.scrollTo(targetPosition, true);
        
        // Clear flag after scroll completes (ScrollSmoother duration is typically ~1 second)
        setTimeout(function() {
            isProgrammaticScroll = false;
            // Manually trigger the correct location after scroll completes
            setActiveLocation(locationName);
        }, 1200);
    } else {
        // Use native scroll with smooth behavior
        var targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Clear flag after scroll completes (native smooth scroll is typically ~500ms)
        setTimeout(function() {
            isProgrammaticScroll = false;
            // Manually trigger the correct location after scroll completes
            setActiveLocation(locationName);
        }, 800);
    }
}

//
//------- Scroll Functions -------//
//

// Fallback scroll handler if GSAP is not available
function handleScroll() {
    var sections = document.querySelectorAll('.map-section');
    var viewportCenter = window.innerHeight / 2;
    var i = sections.length;
    
    while (i--) {
        var section = sections[i];
        var locationName = section.id;
        if (!locationName) continue;
        
        var rect = section.getBoundingClientRect();
        var sectionTop = rect.top;
        var sectionBottom = rect.bottom;
        
        // Check if section center is near viewport center
        var sectionCenter = sectionTop + (rect.height / 2);
        var distanceFromViewportCenter = Math.abs(sectionCenter - viewportCenter);
        
        if (distanceFromViewportCenter < 100) {
            setActiveLocation(locationName);
            break;
        }
    }
}

function setupScrollListeners() {
    if (!setupLocationScrollTriggers()) {
        // Fallback to manual scroll listeners if GSAP is not available
        window.addEventListener('scroll', handleScroll);
    }
}

//
//------- Location Functions -------//
//

function setActiveLocation(locationName) {
    if (locationName === activeLocationName || !locations[locationName]) {
        return;
    }
    
    map.stop();
    isFlyingToLocation = true;
    
    var previousElement = document.getElementById(activeLocationName);
    var currentElement = document.getElementById(locationName);
    
    if (previousElement) {
        previousElement.classList.remove('active');
    }
    if (currentElement) {
        currentElement.classList.add('active');
    }
    
    activeLocationName = locationName;
    map.flyTo(locations[locationName]);
    
    map.once('moveend', function() {
        isFlyingToLocation = false;
    });
}

//
//------- Resize Handler -------//
//

function handleResize() {
    map.resize();
    updateLocationsForDevice();
    
    // Refresh ScrollTrigger if GSAP is available
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
}

//
//------- Initialize -------//
//

document.addEventListener('DOMContentLoaded', function() {
    locations = createLocations();
    initMap();
    
    // Wait for images to load and ScrollSmoother to initialize
    function initializeScrollTriggers() {
        setupScrollListeners();
        
        // Refresh ScrollTrigger after setup to ensure proper calculations
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }
    
    // Wait for ScrollSmoother to initialize if it exists
    setTimeout(function() {
        initializeScrollTriggers();
        
        // Also refresh when images load (handles lazy-loaded images)
        // Use IntersectionObserver to detect when images load as they enter viewport
        var images = document.querySelectorAll('#mapContent img');
        var imagesLoaded = 0;
        var totalImages = images.length;
        var hasRefreshed = false;
        
        function checkAndRefresh() {
            if (!hasRefreshed && typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
                hasRefreshed = true;
            }
        }
        
        if (totalImages > 0) {
            // Use IntersectionObserver for lazy-loaded images
            if ('IntersectionObserver' in window) {
                var imageObserver = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            var img = entry.target;
                            if (img.complete) {
                                imagesLoaded++;
                            } else {
                                img.addEventListener('load', function() {
                                    imagesLoaded++;
                                    if (imagesLoaded === totalImages) {
                                        checkAndRefresh();
                                    }
                                });
                                img.addEventListener('error', function() {
                                    imagesLoaded++;
                                    if (imagesLoaded === totalImages) {
                                        checkAndRefresh();
                                    }
                                });
                            }
                            imageObserver.unobserve(img);
                        }
                    });
                }, { rootMargin: '50px' });
                
                images.forEach(function(img) {
                    if (img.complete) {
                        imagesLoaded++;
                    } else {
                        imageObserver.observe(img);
                    }
                });
            } else {
                // Fallback for browsers without IntersectionObserver
                images.forEach(function(img) {
                    if (img.complete) {
                        imagesLoaded++;
                    } else {
                        img.addEventListener('load', function() {
                            imagesLoaded++;
                            if (imagesLoaded === totalImages) {
                                checkAndRefresh();
                            }
                        });
                        img.addEventListener('error', function() {
                            imagesLoaded++;
                            if (imagesLoaded === totalImages) {
                                checkAndRefresh();
                            }
                        });
                    }
                });
            }
            
            // If all images are already loaded
            if (imagesLoaded === totalImages) {
                checkAndRefresh();
            }
            
            // Also refresh after a delay to catch any images that load later
            setTimeout(function() {
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }, 2000);
        }
    }, 100);
    
    window.addEventListener('resize', handleResize);
});

