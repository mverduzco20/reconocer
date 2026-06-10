// Initial viewport, embed mode, and map framing
function isEmbedMode() {
    return document.documentElement.classList.contains('map-embed')
        || window.self !== window.top;
}

function extractHitosBoundsFromCsv(text) {
    const rows = parseCsvRows(String(text || '').trim());
    if (rows.length < 2) return null;

    const header = rows[0].map(function (col) { return String(col || '').trim().toLowerCase(); });
    const latIndex = header.findIndex(function (h) { return h.includes('lat'); });
    const lngIndex = header.findIndex(function (h) { return h.includes('long'); });
    if (latIndex < 0 || lngIndex < 0) return null;

    const bounds = new mapboxgl.LngLatBounds();
    rows.slice(1).forEach(function (row) {
        const lat = parseFloat(row[latIndex]);
        const lng = parseFloat(row[lngIndex]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            bounds.extend([lng, lat]);
        }
    });

    return bounds.isEmpty() ? null : bounds;
}

function markersToBounds(markers) {
    const bounds = new mapboxgl.LngLatBounds();
    markers.forEach(function (m) {
        const ll = m.getLngLat();
        bounds.extend([ll.lng, ll.lat]);
    });
    return bounds;
}

function revealMapViewport() {
    const container = document.getElementById('mapa');
    if (container) container.classList.remove('map-view-pending');
}

function applyCartographyFallbackMapView(map) {
    if (!map) return;
    map.setPadding(CARTOGRAPHY_MAP_PADDING);
    map.resize();
    map.jumpTo({
        center: CARTOGRAPHY_MAP_CENTER,
        zoom: CARTOGRAPHY_MAP_ZOOM,
        bearing: 0,
        pitch: 0
    });
}

function jumpMapToAllMarkersInitialView(map, bounds) {
    if (!map || !bounds || bounds.isEmpty()) return;

    const camera = map.cameraForBounds(bounds, {
        padding: INITIAL_MAP_ALL_MARKERS_PADDING,
        maxZoom: CARTOGRAPHY_MAP_ZOOM
    });
    if (!camera) return;

    let center = camera.center;
    let zoom = camera.zoom;

    if (zoom < CARTOGRAPHY_MAP_ZOOM - 0.25) {
        const boundsCenter = bounds.getCenter();
        center = [boundsCenter.lng + 0.0028, boundsCenter.lat + 0.0008];
        zoom = CARTOGRAPHY_MAP_ZOOM;
    }

    map.jumpTo({
        center: center,
        zoom: zoom,
        bearing: 0,
        pitch: 0
    });
}

function fitMapToAllMarkersInitialView(map, markers, options) {
    if (!map || !markers.length) return;

    const bounds = markersToBounds(markers);
    const instant = options && options.instant;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (instant || reducedMotion) {
        jumpMapToAllMarkersInitialView(map, bounds);
        return;
    }

    map.fitBounds(bounds, {
        padding: INITIAL_MAP_ALL_MARKERS_PADDING,
        maxZoom: CARTOGRAPHY_MAP_ZOOM,
        duration: MAP_FIT_DURATION_MS,
        essential: true
    });

    if (map.getZoom() < CARTOGRAPHY_MAP_ZOOM - 0.25) {
        const center = bounds.getCenter();
        map.jumpTo({
            center: [center.lng + 0.0028, center.lat + 0.0008],
            zoom: CARTOGRAPHY_MAP_ZOOM,
            bearing: 0,
            pitch: 0
        });
    }
}

function applyInitialMapView(map, options) {
    if (!map) return;
    const opts = options || {};
    const instantCartography = !isEmbedMode() && (opts.instant !== false);

    if (isEmbedMode()) {
        map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
        map.resize();
        map.jumpTo({
            center: MAP_CENTER,
            zoom: MAP_ZOOM,
            bearing: 0,
            pitch: 0
        });
        return;
    }

    if (instantCartography && cartographyInitialViewApplied && !opts.force) {
        return;
    }

    map.setPadding(CARTOGRAPHY_MAP_PADDING);
    map.resize();

    const bounds = hitosMarkers.length > 0
        ? markersToBounds(hitosMarkers)
        : prefetchedHitosBounds;

    if (bounds && !bounds.isEmpty()) {
        if (instantCartography) {
            jumpMapToAllMarkersInitialView(map, bounds);
            cartographyInitialViewApplied = true;
            revealMapViewport();
            return;
        }
        if (hitosMarkers.length > 0) {
            fitMapToAllMarkersInitialView(map, hitosMarkers, { instant: false });
            return;
        }
    }

    applyCartographyFallbackMapView(map);
    if (instantCartography) {
        cartographyInitialViewApplied = true;
        revealMapViewport();
    }
}

function scheduleInitialMapView(map, withRetries) {
    if (!map) return;
    const run = function () {
        applyInitialMapView(map);
    };
    window.requestAnimationFrame(function () {
        window.requestAnimationFrame(run);
    });
    if (withRetries) {
        [120, 400, 900].forEach(function (ms) {
            window.setTimeout(run, ms);
        });
    }
}

function initMapViewport(map) {
    if (!map) return;

    if (isEmbedMode()) {
        scheduleInitialMapView(map, true);

        if ('IntersectionObserver' in window) {
            const container = document.getElementById('mapa');
            if (container) {
                new IntersectionObserver(function (entries) {
                    if (entries.some(function (entry) { return entry.isIntersecting; })) {
                        scheduleInitialMapView(map, false);
                    }
                }, { threshold: 0.08 }).observe(container);
            }
        }
    }

    window.addEventListener('resize', function () {
        if (initialMapViewResizeTimer) clearTimeout(initialMapViewResizeTimer);
        initialMapViewResizeTimer = window.setTimeout(function () {
            applyInitialMapView(map, { force: true, instant: !isEmbedMode() });
        }, 120);
    });

    window.reconocerApplyInitialMapView = function () {
        applyInitialMapView(map, { instant: true });
    };
}

function initEmbedMessageBridge() {
    window.addEventListener('message', function (event) {
        if (!event.data || event.data.type !== 'reconocer-ws') return;
        handleRemotePayload(event.data.payload);
    });
}

