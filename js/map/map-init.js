// Map bootstrap and Mapbox instance
window.RECONOCER_MAP_MODULAR = true;

document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    wireMapNavigationLinks();

    const mapContainer = document.getElementById('mapa');
    if (mapContainer && !isEmbedMode()) {
        mapContainer.classList.add('map-view-pending');
    }

    const csvPrefetch = fetch(CSV_URL, { cache: 'no-store' })
        .then(function (res) {
            if (!res.ok) throw new Error('No se pudo precargar el CSV: ' + res.status);
            return res.text();
        })
        .then(function (text) {
            prefetchedHitosCsvText = text;
            prefetchedHitosBounds = extractHitosBoundsFromCsv(text);
            return text;
        })
        .catch(function (err) {
            console.warn('[reconocer] Precarga CSV para vista inicial:', err);
            return null;
        });

    mapboxgl.accessToken = window.MAPBOX_TOKEN;

    const prefetchedCenter = prefetchedHitosBounds && prefetchedHitosBounds.getCenter();
    mapInstance = new mapboxgl.Map({
        container: 'mapa',
        style: MAP_STYLE,
        center: isEmbedMode()
            ? MAP_CENTER
            : (prefetchedCenter ? [prefetchedCenter.lng, prefetchedCenter.lat] : CARTOGRAPHY_MAP_CENTER),
        zoom: isEmbedMode() ? MAP_ZOOM : CARTOGRAPHY_MAP_ZOOM,
        antialias: true
    });
    const map = mapInstance;

    // Marcadores creados a partir del CSV
    const markers = [];
    // Categorías activas
    const activeCategories = new Set();

    initMapBackgroundUI(map);

    map.on('load', () => {
        mapBgModeIndex = 0;
        applyMapBackgroundByMode(map, MAP_BG_MODES[mapBgModeIndex]);
        updateFilterButtonAppearance();
        console.log('[reconocer] build:', RECONOCER_MAP_BUILD);
        console.log('[reconocer] marker transparency:', MARKER_TRANSPARENCY, 'alpha:', MARKER_THUMB_ALPHA);
        console.log('[reconocer] Map loaded con estilo:', MAP_STYLE);
        const style = map.getStyle();
        console.log('[reconocer] Style name:', style.name);
        console.log('[reconocer] Style version:', style.version);
        console.log('[reconocer] Style sprite:', style.sprite);
        console.log('[reconocer] Style glyphs:', style.glyphs);
        initMapViewport(map);
        if (!isEmbedMode() && prefetchedHitosBounds) {
            applyInitialMapView(map, { instant: true });
        }
        loadHitosMarkers(map, markers, csvPrefetch);
    });

    csvPrefetch.then(function () {
        if (!mapInstance || isEmbedMode() || !prefetchedHitosBounds) return;
        if (mapInstance.loaded()) {
            applyInitialMapView(mapInstance, { instant: true });
        }
    });

    map.on('error', (event) => {
        console.error('[reconocer] Mapbox error:', event.error || event);
        if (event && event.error && event.error.message) {
            console.error('[reconocer] Detalle:', event.error.message);
        }
    });

    map.on('styledata', () => {
        scheduleMapBackgroundReapply(map);
    });

    map.on('click', function (e) {
        const target = e.originalEvent && e.originalEvent.target;
        if (target && target.closest('.mapboxgl-marker, .map-marker-hit, .marker, .mapboxgl-popup, .category-popup')) {
            return;
        }
        closeAllOpenPopups();
    });

    // Controles de navegación (zoom + rotación)
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

});

