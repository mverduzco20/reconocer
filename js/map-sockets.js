// ─────────────────────────────────────────────
// CONFIGURACIÓN DE MAPBOX
// Reemplaza con tu token en: https://account.mapbox.com
// ─────────────────────────────────────────────

const CSV_URL = './csv/hitos.csv';
const MAP_CENTER = [-99.1950, 19.3445]; // lng, lat — centro aproximado de los puntos
const MAP_ZOOM = 15.5;
const CARTOGRAPHY_MAP_CENTER = [-99.2010, 19.3445];
const CARTOGRAPHY_MAP_ZOOM = 15.5;
const CARTOGRAPHY_MAP_PADDING = { top: 20, bottom: 60, left: 180, right: 65 };
const INITIAL_MAP_ALL_MARKERS_PADDING = { top: 55, bottom: 65, left: 210, right: 75 };
const POPUP_UNLOCK_TEXT_COLOR = '#ffffff';
const RECONOCER_MAP_BUILD = '20260611-reward-v12';
const MAP_FIT_PADDING = { top: 100, bottom: 110, left: 70, right: 70 };
const MAP_FIT_DURATION_MS = 1100;
const REWARD_POPUP_SCALE_MIN = 1;
const REWARD_POPUP_SCALE_MAX = 2.6;
const REWARD_POPUP_SCALE_STEP = 0.09;
const REWARD_POPUP_UNLOCK_SCALE = 1.62;
const REWARD_VIEWPORT_PADDING = { top: 16, right: 118, bottom: 92, left: 14 };
const MAP_FIT_MAX_ZOOM = 17;
const MAP_FIT_SINGLE_ZOOM = 16.5;
const MAP_STYLE = 'mapbox://styles/valentina-nacif/cmpdcwwba00fc01scddw0cd2w';
const POPUP_SCALE = 0.7;
const POPUP_IMG_SIZE = Math.round(252 * POPUP_SCALE);
const POPUP_WIDTH = Math.round(504 * POPUP_SCALE);
const POPUP_UNLOCK_HEIGHT = 22;
const POPUP_HEIGHT = POPUP_IMG_SIZE + POPUP_UNLOCK_HEIGHT;
const POPUP_VIDEO_HEIGHT = Math.round(200 * POPUP_SCALE);
const POPUP_TEXT_WIDTH = POPUP_WIDTH - POPUP_IMG_SIZE;
const POPUP_TEXT_HEIGHT = Math.round(POPUP_IMG_SIZE * 0.74);
const POPUP_FONT_SIZE = Math.round(15 * POPUP_SCALE);
const POPUP_PADDING = Math.round(11 * POPUP_SCALE);
const POPUP_MAX_WIDTH = Math.round(476 * POPUP_SCALE);
const POPUP_OFFSET = Math.round(14 * POPUP_SCALE) + POPUP_UNLOCK_HEIGHT;
const MAX_OPEN_POPUPS = 3;
const MARKER_TRANSPARENCY = 0.4; // 40% transparente — mejor legibilidad en miniaturas
const MARKER_THUMB_ALPHA = 1 - MARKER_TRANSPARENCY;
const openPopupEntries = [];

const MAP_PURE_WHITE = '#ffffff';
const MAP_STREET_LINE = '#f5f5f5';
const MAP_STREET_FILL = '#fafafa';
const MAP_LABEL_LIGHT = '#ececec';

const MAP_DARK_BG = '#000000';
const MAP_DARK_STREET_FILL = '#030303';
const MAP_DARK_STREET_LINE = '#1a1a1a';
const MAP_DARK_LABEL = '#2a2a2a';

const MAP_BLUE = '#0000ff';
const MAP_BLUE_BG = '#d8deff';
const MAP_BLUE_STREET_FILL = '#6678ff';
const MAP_BLUE_STREET_LINE = '#0000ff';
const MAP_BLUE_LABEL = '#0000ff';

/* Oficio: capas neutras; el azul lo pone solo el filtro CSS (evita rosa) */
const MAP_OFICIO_MONO_BG = '#e8e8e8';
const MAP_OFICIO_MONO_AREA = '#dedede';
const MAP_OFICIO_MONO_STREET = '#d0d0d0';
const MAP_OFICIO_MONO_LINE = '#c4c4c4';
const MAP_OFICIO_MONO_LABEL = '#b8b8b8';

const MAP_PINK = '#ec00ea';
const MAP_PINK_BG = '#ffe8fb';
const MAP_PINK_STREET_FILL = '#ec00ea';

const MAP_GREEN = '#92f47b';
const MAP_GREEN_BG = '#e4ffdb';
const MAP_GREEN_STREET_FILL = '#7ef56a';
const MAP_GREEN_STREET_LINE = '#92f47b';
const MAP_GREEN_LABEL = '#4bc933';

const MAP_GOLD = '#e9c47e';
const MAP_GOLD_BG = '#fdf0d4';
const MAP_GOLD_STREET_FILL = '#e9c47e';
const MAP_GOLD_STREET_LINE = '#d4ad68';
const MAP_GOLD_LABEL = '#a67c3a';

const MAP_BG_MODES = ['white', 'dark', 'blue'];
const MAP_BG_LABELS = ['Mapa blanco', 'Mapa negro', 'Mapa azul'];

let mapBgModeIndex = 0;
const MAP_BLUE_DEFAULT_VARIANT = 'base';

const MAP_CANVAS_FILTERS = {
    base: 'brightness(0.98) contrast(1.04)',
    encuentro: 'grayscale(1) sepia(0.85) hue-rotate(292deg) saturate(4.8) brightness(0.97) contrast(1.02)',
    green: 'grayscale(1) sepia(0.85) hue-rotate(68deg) saturate(3.4) brightness(0.99) contrast(1.02)',
    oficio: 'grayscale(1) sepia(0.85) hue-rotate(196deg) saturate(5.2) brightness(0.93) contrast(1.04)',
    memoria: 'grayscale(1) sepia(0.85) hue-rotate(18deg) saturate(3.6) brightness(1.03) contrast(1.02)'
};

const MAP_BLUE_PREVIEW_VARIANTS = ['memoria', 'oficio', 'green', 'encuentro'];
const MAP_BLUE_PREVIEW_INTERVAL_MS = 2600;
const MAP_BLUE_FILTER_TRANSITION_LOOP_MS = 1800;
const MAP_BLUE_FILTER_TRANSITION_BUTTON_MS = 650;

let mapBlueFilterTransitionMs = MAP_BLUE_FILTER_TRANSITION_LOOP_MS;

let mapBlueVariant = MAP_BLUE_DEFAULT_VARIANT; // 'base' | 'encuentro' | 'green' | 'oficio' | 'memoria'
let mapBackgroundReapplyTimer = null;
let mapBluePreviewLoopTimer = null;
let mapBluePreviewLoopIndex = 0;
let mapBluePreviewActive = false;
let hitosMarkers = [];
let mapInstance = null;
let prefetchedHitosCsvText = null;
let prefetchedHitosBounds = null;
let cartographyInitialViewApplied = false;
let rewardVideoZoomActive = false;
let rewardVideoPopupScale = 1;
let rewardVideoPopupScaleTarget = 1;
let rewardPopupScaleAnimRaf = null;
let rewardPopupWheelHandler = null;
let rewardPopupResizeHandler = null;
let rewardPopupZoomPopupEl = null;
let rewardVideoPopupTranslateX = 0;
let rewardVideoPopupTranslateY = 0;
let rewardMapLockedForZoom = false;
let rewardHitoZoomHintTimer = null;
let rewardMapFadePulseTimer = null;
let suppressWsSend = false;
let lastWsSent = '';
let lastWsSentAt = 0;
let filterCColorLoopTimer = null;
let filterCColorLoopIndex = 0;

const FILTER_C_CATEGORY_COLORS = ['#e9c47e', '#0000ff', '#92f47b', '#ec00ea'];

const CATEGORY_COLOR_MAP = {
    m: '#e9c47e', // memoria — dorado
    o: '#0000ff', // oficio — azul
    r: '#0f3d18', // refugio — UI mapa/footer; popups usan REFUGIO_PANEL_*
    e: '#ec00ea'  // encuentro — rosa
};

const REFUGIO_PANEL_COLOR = '#8a9f82';
const REFUGIO_PANEL_ALPHA = 0.75;

function isRefugioCategory(categoria) {
    return String(categoria || '').toLowerCase() === 'r';
}

function getCategoryColor(categoria) {
    return CATEGORY_COLOR_MAP[String(categoria || '').toLowerCase()] || MAP_BLUE;
}

function getCategoryBackgroundAlpha(categoria) {
    return isRefugioCategory(categoria) ? REFUGIO_PANEL_ALPHA : 0.7;
}

function getCategoryTextPanelBackground(categoria) {
    if (isRefugioCategory(categoria)) {
        return hexToRgba(REFUGIO_PANEL_COLOR, REFUGIO_PANEL_ALPHA);
    }
    return hexToRgba(getCategoryColor(categoria), getCategoryBackgroundAlpha(categoria));
}

function getCategoryUnlockTextColor(categoria) {
    const cat = String(categoria || '').toLowerCase();
    if (cat === 'o' || cat === 'e') return '#ffffff';
    return '#000000';
}

function isRoadLayer(id) {
    return /road|street|highway|bridge|tunnel|path|motorway|trunk|primary|secondary|tertiary|residential|service|transport|rail|avenue|calle/i.test(id);
}

function applyMapCanvasFilter(mode, blueVariant) {
    const canvas = document.querySelector('#map-container .mapboxgl-canvas');
    if (!canvas) return;

    if (mode !== 'blue') {
        canvas.style.removeProperty('filter');
        return;
    }

    const filter = MAP_CANVAS_FILTERS[blueVariant] || MAP_CANVAS_FILTERS.base;
    canvas.style.setProperty('transition', 'filter ' + (mapBlueFilterTransitionMs / 1000) + 's ease-in-out', 'important');
    canvas.style.setProperty('filter', filter, 'important');
}

function setMapContainerMode(color, mode, blueVariant) {
    const container = document.getElementById('map-container');
    const mapa = document.getElementById('mapa');
    if (container) {
        container.style.backgroundColor = color;
        container.classList.remove(
            'map-bg-dark',
            'map-bg-blue',
            'map-bg-blue-base',
            'map-bg-blue-encuentro',
            'map-bg-blue-green',
            'map-bg-blue-oficio',
            'map-bg-blue-memoria'
        );
        if (mode === 'dark') container.classList.add('map-bg-dark');
        if (mode === 'blue') {
            container.classList.add('map-bg-blue');
            if (blueVariant === 'base') container.classList.add('map-bg-blue-base');
            if (blueVariant === 'encuentro') container.classList.add('map-bg-blue-encuentro');
            if (blueVariant === 'green') container.classList.add('map-bg-blue-green');
            if (blueVariant === 'oficio') container.classList.add('map-bg-blue-oficio');
            if (blueVariant === 'memoria') container.classList.add('map-bg-blue-memoria');
        }
    }
    if (mapa) mapa.style.backgroundColor = color;
    applyMapCanvasFilter(mode, blueVariant);
}

function applyMapWhiteningEffect(map) {
    const style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;

    setMapContainerMode(MAP_PURE_WHITE, 'white');

    for (const layer of style.layers) {
        const { id, type } = layer;
        const road = isRoadLayer(id);
        try {
            if (type === 'background') {
                map.setPaintProperty(id, 'background-color', MAP_PURE_WHITE);
            } else if (type === 'fill') {
                map.setPaintProperty(id, 'fill-color', road ? MAP_STREET_FILL : MAP_PURE_WHITE);
                map.setPaintProperty(id, 'fill-opacity', road ? 0.45 : 1);
            } else if (type === 'fill-extrusion') {
                map.setPaintProperty(id, 'fill-extrusion-color', MAP_PURE_WHITE);
                map.setPaintProperty(id, 'fill-extrusion-opacity', 0.08);
            } else if (type === 'line') {
                map.setPaintProperty(id, 'line-color', MAP_STREET_LINE);
                map.setPaintProperty(id, 'line-opacity', road ? 0.14 : 0.08);
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', MAP_LABEL_LIGHT);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', MAP_STREET_LINE);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', -1);
                map.setPaintProperty(id, 'raster-brightness-min', 0.94);
                map.setPaintProperty(id, 'raster-brightness-max', 1.04);
                map.setPaintProperty(id, 'raster-contrast', 0.04);
            }
        } catch (_) {
            /* algunas capas no admiten ciertas propiedades */
        }
    }
}

function applyMapDarkEffect(map) {
    const style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;

    setMapContainerMode(MAP_DARK_BG, 'dark');

    for (const layer of style.layers) {
        const { id, type } = layer;
        const road = isRoadLayer(id);
        try {
            if (type === 'background') {
                map.setPaintProperty(id, 'background-color', MAP_DARK_BG);
            } else if (type === 'fill') {
                map.setPaintProperty(id, 'fill-color', road ? MAP_DARK_STREET_FILL : MAP_DARK_BG);
                map.setPaintProperty(id, 'fill-opacity', road ? 0.9 : 1);
            } else if (type === 'fill-extrusion') {
                map.setPaintProperty(id, 'fill-extrusion-color', road ? MAP_DARK_STREET_FILL : MAP_DARK_BG);
                map.setPaintProperty(id, 'fill-extrusion-opacity', 0.35);
            } else if (type === 'line') {
                map.setPaintProperty(id, 'line-color', MAP_DARK_STREET_LINE);
                map.setPaintProperty(id, 'line-opacity', road ? 0.62 : 0.2);
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', MAP_DARK_LABEL);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', MAP_DARK_STREET_LINE);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', -1);
                map.setPaintProperty(id, 'raster-brightness-min', 0.01);
                map.setPaintProperty(id, 'raster-brightness-max', 0.1);
                map.setPaintProperty(id, 'raster-contrast', 0.3);
            }
        } catch (_) {
            /* algunas capas no admiten ciertas propiedades */
        }
    }
}

function getCurrentMapBgMode() {
    return MAP_BG_MODES[mapBgModeIndex];
}

function applyMapBlueEffect(map) {
    const style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;

    let bgColor;
    let areaFill;
    let streetFill;
    let lineColor;
    let labelColor;
    let rasterSat;

    let areaOpacity = 0.98;
    let roadOpacity = 0.88;

    if (mapBlueVariant === 'memoria') {
        bgColor = MAP_GOLD_BG;
        areaFill = MAP_GOLD_BG;
        streetFill = MAP_GOLD_STREET_FILL;
        lineColor = MAP_GOLD_STREET_LINE;
        labelColor = MAP_GOLD_LABEL;
        rasterSat = -0.15;
        areaOpacity = 0.84;
        roadOpacity = 0.72;
    } else if (mapBlueVariant === 'green') {
        bgColor = MAP_GREEN_BG;
        areaFill = MAP_GREEN_BG;
        streetFill = MAP_GREEN_STREET_FILL;
        lineColor = MAP_GREEN_STREET_LINE;
        labelColor = MAP_GREEN_LABEL;
        rasterSat = -0.2;
        areaOpacity = 0.82;
        roadOpacity = 0.7;
    } else if (mapBlueVariant === 'oficio') {
        bgColor = MAP_OFICIO_MONO_BG;
        areaFill = MAP_OFICIO_MONO_AREA;
        streetFill = MAP_OFICIO_MONO_STREET;
        lineColor = MAP_OFICIO_MONO_LINE;
        labelColor = MAP_OFICIO_MONO_LABEL;
        rasterSat = -1;
        areaOpacity = 0.88;
        roadOpacity = 0.8;
    } else if (mapBlueVariant === 'encuentro') {
        bgColor = MAP_PINK_BG;
        areaFill = MAP_PINK_BG;
        streetFill = MAP_PINK_STREET_FILL;
        lineColor = MAP_PINK;
        labelColor = MAP_PINK;
        rasterSat = 0.15;
        areaOpacity = 0.84;
        roadOpacity = 0.72;
    } else if (mapBlueVariant === 'base') {
        bgColor = MAP_PINK_BG;
        areaFill = MAP_PINK_BG;
        streetFill = MAP_PINK_STREET_FILL;
        lineColor = MAP_BLUE_STREET_LINE;
        labelColor = MAP_PINK;
        rasterSat = 0.15;
    } else {
        bgColor = MAP_BLUE_BG;
        areaFill = MAP_BLUE_BG;
        streetFill = MAP_BLUE_STREET_FILL;
        lineColor = MAP_BLUE_STREET_LINE;
        labelColor = MAP_BLUE_LABEL;
        rasterSat = -0.25;
    }

    const containerVariant = mapBlueVariant;
    setMapContainerMode(bgColor, 'blue', containerVariant);

    for (const layer of style.layers) {
        const { id, type } = layer;
        const road = isRoadLayer(id);
        try {
            if (type === 'background') {
                map.setPaintProperty(id, 'background-color', bgColor);
            } else if (type === 'fill') {
                map.setPaintProperty(id, 'fill-color', road ? streetFill : areaFill);
                map.setPaintProperty(id, 'fill-opacity', road ? roadOpacity : areaOpacity);
            } else if (type === 'fill-extrusion') {
                map.setPaintProperty(id, 'fill-extrusion-color', streetFill);
                map.setPaintProperty(id, 'fill-extrusion-opacity', 0.55);
            } else if (type === 'line') {
                map.setPaintProperty(id, 'line-color', lineColor);
                map.setPaintProperty(id, 'line-opacity', road ? 0.95 : 0.35);
            } else if (type === 'circle') {
                map.setPaintProperty(id, 'circle-color', streetFill);
                map.setPaintProperty(id, 'circle-opacity', 0.75);
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', labelColor);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', labelColor);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', rasterSat);
                map.setPaintProperty(id, 'raster-brightness-min', 0.88);
                map.setPaintProperty(id, 'raster-brightness-max', 1.04);
                map.setPaintProperty(id, 'raster-contrast', 0.1);
            }
        } catch (_) {
            /* algunas capas no admiten ciertas propiedades */
        }
    }
}

const MAP_BLUE_VARIANT_BY_CATEGORY = {
    m: 'memoria',
    o: 'oficio',
    r: 'green',
    e: 'encuentro'
};

function stopMapBluePreviewLoop() {
    mapBluePreviewActive = false;
    if (mapBluePreviewLoopTimer) {
        clearInterval(mapBluePreviewLoopTimer);
        mapBluePreviewLoopTimer = null;
    }
}

function clearCategoryButtonStates() {
    document.querySelectorAll('#categories-nav .category-button').forEach(function (btn) {
        btn.classList.remove('active');
    });
}

function showAllHitosMarkers(map) {
    if (map && hitosMarkers.length) updateMarkersFilter(map, hitosMarkers, new Set());
}

function getActiveCategorySet(catButtons) {
    const act = new Set();
    catButtons.forEach(function (b) {
        if (b.classList.contains('active')) act.add((b.dataset.category || '').toLowerCase());
    });
    return act;
}

function resolveBlueVariantFromCategoryClick(catButtons, clickedCategory, isClickedActive) {
    if (isClickedActive && MAP_BLUE_VARIANT_BY_CATEGORY[clickedCategory]) {
        return MAP_BLUE_VARIANT_BY_CATEGORY[clickedCategory];
    }
    for (const btn of catButtons) {
        if (!btn.classList.contains('active')) continue;
        const cat = (btn.dataset.category || '').toLowerCase();
        if (MAP_BLUE_VARIANT_BY_CATEGORY[cat]) return MAP_BLUE_VARIANT_BY_CATEGORY[cat];
    }
    return null;
}

function startMapBluePreviewLoop(map, options) {
    stopMapBluePreviewLoop();
    if (getCurrentMapBgMode() !== 'blue' || !map) return;

    clearCategoryButtonStates();
    showAllHitosMarkers(map);

    if (options && options.fitOverview) {
        scheduleMapFitToFilteredMarkers(map, hitosMarkers, new Set());
    }

    mapBluePreviewActive = true;
    mapBluePreviewLoopIndex = 0;

    function showPreviewVariant() {
        if (!mapBluePreviewActive || getCurrentMapBgMode() !== 'blue') return;
        mapBlueFilterTransitionMs = MAP_BLUE_FILTER_TRANSITION_LOOP_MS;
        mapBlueVariant = MAP_BLUE_PREVIEW_VARIANTS[mapBluePreviewLoopIndex];
        applyMapBlueEffect(map);
    }

    showPreviewVariant();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    mapBluePreviewLoopTimer = window.setInterval(function () {
        mapBluePreviewLoopIndex = (mapBluePreviewLoopIndex + 1) % MAP_BLUE_PREVIEW_VARIANTS.length;
        showPreviewVariant();
    }, MAP_BLUE_PREVIEW_INTERVAL_MS);
}

function scheduleBlueMapVariantApply(map, useFastTransition) {
    mapBlueFilterTransitionMs = useFastTransition
        ? MAP_BLUE_FILTER_TRANSITION_BUTTON_MS
        : MAP_BLUE_FILTER_TRANSITION_LOOP_MS;
    applyMapBlueEffect(map);
    window.requestAnimationFrame(function () {
        applyMapBlueEffect(map);
        mapBlueFilterTransitionMs = MAP_BLUE_FILTER_TRANSITION_LOOP_MS;
    });
}

function applyMapBackgroundByMode(map, mode) {
    if (mode !== 'blue') {
        stopMapBluePreviewLoop();
        mapBlueVariant = MAP_BLUE_DEFAULT_VARIANT;
    }
    if (mode === 'dark') applyMapDarkEffect(map);
    else if (mode === 'blue') applyMapBlueEffect(map);
    else applyMapWhiteningEffect(map);
}

function scheduleMapBackgroundReapply(map) {
    if (!map) return;
    clearTimeout(mapBackgroundReapplyTimer);
    mapBackgroundReapplyTimer = window.setTimeout(function () {
        if (!map.isStyleLoaded()) return;
        applyMapBackgroundByMode(map, getCurrentMapBgMode());
    }, 60);
}

function stopFilterCColorLoop() {
    if (filterCColorLoopTimer) {
        clearInterval(filterCColorLoopTimer);
        filterCColorLoopTimer = null;
    }
}

function startFilterCColorLoop(filterC) {
    stopFilterCColorLoop();
    if (!filterC) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
        filterC.style.color = MAP_BLUE;
        return;
    }

    filterCColorLoopIndex = 0;
    filterC.style.color = FILTER_C_CATEGORY_COLORS[0];
    filterCColorLoopTimer = window.setInterval(function () {
        filterCColorLoopIndex = (filterCColorLoopIndex + 1) % FILTER_C_CATEGORY_COLORS.length;
        filterC.style.color = FILTER_C_CATEGORY_COLORS[filterCColorLoopIndex];
    }, 1000);
}

function updateFilterButtonAppearance() {
    const filterButton = document.getElementById('footer-cat-companion');
    const filterC = filterButton && filterButton.querySelector('.footer-map-filter-c');
    if (!filterButton || !filterC) return;

    const mode = getCurrentMapBgMode();
    filterButton.classList.remove('footer-cat-companion--dark', 'footer-cat-companion--blue');
    stopFilterCColorLoop();

    if (mode === 'dark') {
        filterButton.classList.add('footer-cat-companion--dark');
        filterC.style.color = '';
    } else if (mode === 'blue') {
        filterButton.classList.add('footer-cat-companion--blue');
        startFilterCColorLoop(filterC);
    } else {
        filterC.style.color = '#ffffff';
    }

    filterButton.classList.toggle('active', mode !== 'white');
}

function cycleMapBackground(map) {
    const wasBlue = getCurrentMapBgMode() === 'blue';
    mapBgModeIndex = (mapBgModeIndex + 1) % MAP_BG_MODES.length;
    const nextMode = MAP_BG_MODES[mapBgModeIndex];

    if (nextMode === 'blue' && !wasBlue) {
        mapBlueVariant = MAP_BLUE_PREVIEW_VARIANTS[0];
    }

    applyMapBackgroundByMode(map, nextMode);

    if (nextMode === 'blue' && !wasBlue) {
        startMapBluePreviewLoop(map);
    }

    updateFilterButtonAppearance();
}

function initMapBackgroundUI(map) {
    const filterButton = document.getElementById('footer-cat-companion');
    if (!filterButton || filterButton.dataset.bgBound === '1') return;

    filterButton.dataset.bgBound = '1';
    filterButton.setAttribute('aria-label', MAP_BG_LABELS[mapBgModeIndex]);
    updateFilterButtonAppearance();
    filterButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!map || !map.isStyleLoaded()) return;
        cycleMapBackground(map);
        filterButton.setAttribute('aria-label', MAP_BG_LABELS[mapBgModeIndex]);
    });
}

// ─────────────────────────────────────────────
// WEBSOCKETS (TOUCHDESIGNER CONTROL)
// Panel remoto: RECONOCER_WS.remoteControlUrl (js/ws-config.js)
// ─────────────────────────────────────────────
const wsUrl = (window.RECONOCER_WS && window.RECONOCER_WS.url) || "wss://td-tests-b8ab469bdcc6.herokuapp.com";
let ws;

const MAPA_VIEW_TO_CATEGORY = {
    Completo: null,
    Memoria: 'm',
    Oficio: 'o',
    Encuentro: 'e',
    Refugio: 'r'
};

function isWsEcho(rawMessage) {
    return Date.now() - lastWsSentAt < 150 && rawMessage === lastWsSent;
}

function isEmbedMode() {
    return document.documentElement.classList.contains('map-embed')
        || window.self !== window.top;
}

let initialMapViewResizeTimer = null;

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

    const splash = document.getElementById('map-splash');
    if (splash && isEmbedMode()) {
        splash.style.display = 'none';
    }

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

function connectWebSocket() {
    if (isEmbedMode()) {
        initEmbedMessageBridge();
        return;
    }

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log("[reconocer] WebSocket conectado");
        sendWsPayload({ Pagina: "Mapa", ID: "Completo" });
    };

    ws.onclose = () => {
        console.log("[reconocer] WebSocket desconectado, reconectando...");
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error("[reconocer] WebSocket error:", error);
        ws.close();
    };

    ws.onmessage = (event) => {
        if (isWsEcho(event.data)) return;
        let payload;
        try {
            payload = JSON.parse(event.data);
        } catch (e) {
            return;
        }
        handleRemotePayload(payload);
    };
}

function sendWsPayload(payload) {
    if (suppressWsSend) return;
    if (ws && ws.readyState === WebSocket.OPEN) {
        const body = JSON.stringify(payload);
        lastWsSent = body;
        lastWsSentAt = Date.now();
        console.log("[reconocer] Enviando payload:", payload);
        ws.send(body);
    }
}

function consumePendingRemoteCommand() {
    let raw = '';
    try {
        raw = sessionStorage.getItem('reconocerWsPending') || '';
        if (raw) sessionStorage.removeItem('reconocerWsPending');
    } catch (e) { /* ignore */ }
    if (!raw) return;
    try {
        handleRemotePayload(JSON.parse(raw));
    } catch (e) { /* ignore */ }
}

function handleRemotePayload(payload) {
    if (!payload || !payload.Pagina) return;
    const pagina = payload.Pagina;

    if (pagina === 'Home') {
        if (!isEmbedMode()) {
            window.location.href = './index.html';
        }
        return;
    }

    if (pagina === 'Documentación') {
        if (!isEmbedMode()) {
            window.location.href = './docs/index.html';
        }
        return;
    }

    if (pagina === 'Hito') {
        openRemoteMarker(payload.ID, false);
        return;
    }

    if (pagina === 'Recompensa') {
        openRemoteMarker(payload.ID, true);
        return;
    }

    if (pagina === 'Mapa') {
        applyRemoteMapaView(payload.ID || 'Completo');
    }
}

function openRemoteMarker(id, wantsRecompensa) {
    if (!mapInstance || !hitosMarkers.length) return;
    const targetId = Number(id);
    if (!targetId) return;

    const marker = hitosMarkers.find(function (m) {
        return m._hitoId === targetId && Boolean(m._tienePremio) === Boolean(wantsRecompensa);
    }) || hitosMarkers.find(function (m) {
        return m._hitoId === targetId;
    });

    if (!marker || !marker._popup) return;

    suppressWsSend = true;
    handleMarkerPopupClick(mapInstance, marker, marker._popup);
    suppressWsSend = false;
}

function wireMapNavigationLinks() {
    if (isEmbedMode()) return;
    document.querySelectorAll('.footer-link[href], .corner-logo[href]').forEach(function (link) {
        link.addEventListener('click', function () {
            const href = (link.getAttribute('href') || '').toLowerCase();
            if (href.includes('docs')) {
                sendWsPayload({ Pagina: 'Documentación' });
            } else if (href.includes('index.html')) {
                sendWsPayload({ Pagina: 'Home' });
            } else if (href.includes('map.html')) {
                sendWsPayload({ Pagina: 'Mapa', ID: 'Completo' });
            }
        });
    });
}

function applyRemoteMapaView(mapaId) {
    if (!mapInstance) return;
    const categoriesNav = document.getElementById('categories-nav');
    if (!categoriesNav) return;

    const catButtons = categoriesNav.querySelectorAll('.category-button');
    const targetCat = Object.prototype.hasOwnProperty.call(MAPA_VIEW_TO_CATEGORY, mapaId)
        ? MAPA_VIEW_TO_CATEGORY[mapaId]
        : null;

    catButtons.forEach(function (btn) {
        const cat = (btn.dataset.category || '').toLowerCase();
        if (targetCat === null) {
            btn.classList.remove('active');
        } else {
            btn.classList.toggle('active', cat === targetCat);
        }
    });

    const act = getActiveCategorySet(catButtons);

    if (getCurrentMapBgMode() === 'blue') {
        if (act.size === 0) {
            startMapBluePreviewLoop(mapInstance, { fitOverview: true });
            return;
        }

        stopMapBluePreviewLoop();
        const activeCat = act.values().next().value;
        const variant = MAP_BLUE_VARIANT_BY_CATEGORY[activeCat];
        if (variant) {
            mapBlueVariant = variant;
            scheduleBlueMapVariantApply(mapInstance, true);
        }
    }

    updateMarkersFilter(mapInstance, hitosMarkers, act);
    if (act.size > 0) {
        scheduleMapFitToFilteredMarkers(mapInstance, hitosMarkers, act);
    }
}

// ─────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────
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

function processHitosCsvText(map, markers, text) {
    const rows = parseCsvRows(String(text || '').trim());
    if (rows.length < 2) return;

    const header = rows[0].map(col => String(col || '').trim().toLowerCase());
    const indices = {
        archivo: header.findIndex(h => h.includes('archivo') || h.includes('nombre')),
        lat: header.findIndex(h => h.includes('lat')),
        lng: header.findIndex(h => h.includes('long')),
        categoria: header.findIndex(h => h.includes('categoria')),
        relato: header.findIndex(h => h.includes('relato')),
        id: header.findIndex(h => h === 'id' || h === 'identificador'),
        premio: header.findIndex(h => h.includes('premio') || h.includes('recompensa'))
    };

    rows.slice(1).forEach(row => agregarMarcador(map, row, markers, indices));
    hitosMarkers = markers;
    prefetchedHitosBounds = markersToBounds(markers);
    initCategoryUI(map, markers);
    if (isEmbedMode()) {
        scheduleInitialMapView(map, true);
    } else {
        applyInitialMapView(map, { instant: true });
    }
    consumePendingRemoteCommand();
}

function loadHitosMarkers(map, markers, csvPrefetch) {
    const handleText = function (text) {
        if (!text) return;
        processHitosCsvText(map, markers, text);
    };

    if (prefetchedHitosCsvText) {
        handleText(prefetchedHitosCsvText);
        return;
    }

    const source = csvPrefetch || fetch(CSV_URL, { cache: 'no-store' })
        .then(res => {
            if (!res.ok) throw new Error(`No se pudo cargar el CSV: ${res.status}`);
            return res.text();
        });

    Promise.resolve(source)
        .then(function (text) {
            if (text) {
                prefetchedHitosCsvText = text;
                prefetchedHitosBounds = extractHitosBoundsFromCsv(text);
            }
            handleText(text);
        })
        .catch(err => {
            console.error('[reconocer]', err);
            if (!isEmbedMode()) revealMapViewport();
        });
}

// Parse CSV rows with support for double-quoted and single-quoted fields
function parseCsvRows(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inDouble = false;
    let inSingle = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"' && !inSingle) {
            if (inDouble && next === '"') {
                field += '"';
                i += 1;
                continue;
            }
            inDouble = !inDouble;
            continue;
        }

        if (char === "'" && !inDouble) {
            if (inSingle && next === "'") {
                field += "'";
                i += 1;
                continue;
            }
            inSingle = !inSingle;
            continue;
        }

        if (char === ',' && !inDouble && !inSingle) {
            row.push(field);
            field = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inDouble && !inSingle) {
            if (char === '\r' && next === '\n') continue;
            row.push(field);
            if (row.length > 0) rows.push(row);
            row = [];
            field = '';
            continue;
        }

        field += char;
    }

    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

function normalizeCategoryValue(value) {
    const cleaned = String(value || '').trim().toLowerCase().replace(/[^a-z]/g, '');
    return cleaned.length === 1 ? cleaned : '';
}

function findRowCategory(row, indices = {}) {
    const categoryKeys = new Set(['m', 'o', 'r', 'e']);

    // Usar solo la columna "categoria"; no inferir desde el nombre del archivo (ej. o22.jpg)
    if (indices.categoria >= 0 && row[indices.categoria] != null) {
        const candidate = normalizeCategoryValue(row[indices.categoria]);
        if (categoryKeys.has(candidate)) return candidate;
    }

    // Respaldo: revisar solo columnas entre premio y relato, nunca el relato ni el archivo
    const relatoIndex = indices.relato >= 0 ? indices.relato : row.length;
    const startIndex = Math.max(3, indices.categoria >= 0 ? indices.categoria : 3);
    for (let i = startIndex; i < relatoIndex; i++) {
        const candidate = normalizeCategoryValue(row[i]);
        if (categoryKeys.has(candidate)) return candidate;
    }

    return '';
}

function hexToRgba(hex, alpha = 0.6) {
    const cleaned = String(hex || '').trim().replace('#', '');
    if (!/^[0-9a-fA-F]{3,6}$/.test(cleaned)) return `rgba(0,0,0,${alpha})`;
    const full = cleaned.length === 3
        ? cleaned.split('').map(ch => ch + ch).join('')
        : cleaned;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// ─────────────────────────────────────────────
// MARCADORES
// ─────────────────────────────────────────────

function closeAllOpenPopups() {
    const entries = [...openPopupEntries];
    openPopupEntries.length = 0;
    entries.forEach(function (entry) {
        if (mapInstance && isRewardVideoHito(entry.marker._archivo)) {
            clearRewardPopupZoom(mapInstance, entry.popup);
        } else {
            pausePopupVideos(entry.popup);
        }
        entry.popup.remove();
    });
}

function isRewardVideoHito(archivo) {
    return typeof hitoHasUnlockVideo === 'function' && hitoHasUnlockVideo(archivo);
}

function ensureMapZoomFadeEl() {
    const fade = document.getElementById('map-zoom-fade');
    if (!fade) return null;
    if (fade.parentElement !== document.body) {
        document.body.appendChild(fade);
    }
    return fade;
}

function showRewardMapFade() {
    const fade = ensureMapZoomFadeEl();
    if (!fade) return;

    if (rewardMapFadePulseTimer) {
        window.clearTimeout(rewardMapFadePulseTimer);
        rewardMapFadePulseTimer = null;
    }

    fade.classList.remove('is-pulse');
    fade.classList.add('is-active', 'is-flash');

    rewardMapFadePulseTimer = window.setTimeout(function () {
        fade.classList.remove('is-flash');
        fade.classList.add('is-pulse');
        rewardMapFadePulseTimer = null;
    }, 1150);
}

function hideRewardMapFade() {
    const fade = document.getElementById('map-zoom-fade');
    if (!fade) return;

    if (rewardMapFadePulseTimer) {
        window.clearTimeout(rewardMapFadePulseTimer);
        rewardMapFadePulseTimer = null;
    }

    fade.classList.remove('is-active', 'is-flash', 'is-pulse');
}

function showRewardZoomHint() {
    const hint = document.getElementById('map-zoom-hint');
    if (!hint) return;
    if (hint.parentElement !== document.body) {
        document.body.appendChild(hint);
    }
    hint.classList.add('is-visible');
    hint.setAttribute('aria-hidden', 'false');
    if (rewardHitoZoomHintTimer) clearTimeout(rewardHitoZoomHintTimer);
    rewardHitoZoomHintTimer = window.setTimeout(hideRewardZoomHint, 14000);
}

function hideRewardZoomHint() {
    const hint = document.getElementById('map-zoom-hint');
    if (!hint) return;
    hint.classList.remove('is-visible');
    hint.setAttribute('aria-hidden', 'true');
    if (rewardHitoZoomHintTimer) {
        clearTimeout(rewardHitoZoomHintTimer);
        rewardHitoZoomHintTimer = null;
    }
}

const REWARD_MAP_LOCK_HANDLERS = [
    'scrollZoom', 'boxZoom', 'doubleClickZoom', 'touchZoomRotate', 'dragPan', 'dragRotate'
];

function rewardWheelScaleDelta(event) {
    let dy = event.deltaY;
    if (event.deltaMode === 1) dy *= 16;
    if (event.deltaMode === 2) dy *= window.innerHeight;
    return -dy * 0.0042;
}

function clampRewardPopupScale(scale) {
    return Math.min(REWARD_POPUP_SCALE_MAX, Math.max(REWARD_POPUP_SCALE_MIN, scale));
}

function getRewardViewportBounds() {
    return {
        left: REWARD_VIEWPORT_PADDING.left,
        top: REWARD_VIEWPORT_PADDING.top,
        right: window.innerWidth - REWARD_VIEWPORT_PADDING.right,
        bottom: window.innerHeight - REWARD_VIEWPORT_PADDING.bottom
    };
}

function getRewardPopupTransformEl(popupEl) {
    return popupEl ? popupEl.querySelector('.mapboxgl-popup-content') : null;
}

function applyRewardPopupTransform(popupEl, scale, tx, ty) {
    const content = getRewardPopupTransformEl(popupEl);
    if (!content) return;
    content.style.transformOrigin = '50% 50%';
    content.style.transform = 'translate(' + tx.toFixed(1) + 'px, ' + ty.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
}

function centerRewardPopupInViewport(popupEl) {
    const content = getRewardPopupTransformEl(popupEl);
    if (!content) return;

    rewardVideoPopupTranslateX = 0;
    rewardVideoPopupTranslateY = 0;
    applyRewardPopupTransform(popupEl, REWARD_POPUP_SCALE_MIN, 0, 0);

    const rect = content.getBoundingClientRect();
    const viewport = getRewardViewportBounds();
    const targetCenterX = (viewport.left + viewport.right) * 0.5;
    const targetCenterY = (viewport.top + viewport.bottom) * 0.5;

    rewardVideoPopupTranslateX = targetCenterX - (rect.left + rect.width * 0.5);
    rewardVideoPopupTranslateY = targetCenterY - (rect.top + rect.height * 0.5);
}

function fitRewardVideoInViewport(popupEl, desiredScale) {
    const content = getRewardPopupTransformEl(popupEl);
    if (!content) return desiredScale;

    const viewport = getRewardViewportBounds();
    let scale = clampRewardPopupScale(desiredScale);
    let tx = rewardVideoPopupTranslateX;
    let ty = rewardVideoPopupTranslateY;

    for (let attempt = 0; attempt < 28; attempt++) {
        applyRewardPopupTransform(popupEl, scale, tx, ty);
        const rect = content.getBoundingClientRect();

        const shiftLeft = viewport.left - rect.left;
        const shiftRight = rect.right - viewport.right;
        const shiftTop = viewport.top - rect.top;
        const shiftBottom = rect.bottom - viewport.bottom;
        const hasOverflow = shiftLeft > 0 || shiftRight > 0 || shiftTop > 0 || shiftBottom > 0;

        if (!hasOverflow) break;

        if (shiftLeft > 0) tx += shiftLeft;
        if (shiftRight > 0) tx -= shiftRight;
        if (shiftTop > 0) ty += shiftTop;
        if (shiftBottom > 0) ty -= shiftBottom;

        applyRewardPopupTransform(popupEl, scale, tx, ty);
        const fittedRect = content.getBoundingClientRect();
        const stillOverflow =
            fittedRect.left < viewport.left - 0.5 ||
            fittedRect.right > viewport.right + 0.5 ||
            fittedRect.top < viewport.top - 0.5 ||
            fittedRect.bottom > viewport.bottom + 0.5;

        if (stillOverflow && scale > REWARD_POPUP_SCALE_MIN + 0.02) {
            scale = Math.max(REWARD_POPUP_SCALE_MIN, scale - 0.035);
            tx *= 0.9;
            ty *= 0.9;
        } else if (!stillOverflow) {
            break;
        }
    }

    rewardVideoPopupTranslateX = tx;
    rewardVideoPopupTranslateY = ty;
    return scale;
}

function applyRewardPopupScale(popupEl, scale) {
    if (!popupEl) return scale;
    const fittedScale = fitRewardVideoInViewport(popupEl, scale);
    rewardVideoPopupScale = fittedScale;
    return fittedScale;
}

function stopRewardPopupScaleAnimation() {
    if (rewardPopupScaleAnimRaf) {
        window.cancelAnimationFrame(rewardPopupScaleAnimRaf);
        rewardPopupScaleAnimRaf = null;
    }
}

function syncRewardPopupScaleTargetToFit() {
    if (!rewardPopupZoomPopupEl) return;
    const fitted = applyRewardPopupScale(rewardPopupZoomPopupEl, rewardVideoPopupScale);
    if (fitted < rewardVideoPopupScaleTarget) {
        rewardVideoPopupScaleTarget = fitted;
    }
}

function tickRewardPopupScaleAnimation() {
    const diff = rewardVideoPopupScaleTarget - rewardVideoPopupScale;
    if (Math.abs(diff) < 0.002) {
        rewardVideoPopupScale = applyRewardPopupScale(rewardPopupZoomPopupEl, rewardVideoPopupScaleTarget);
        rewardPopupScaleAnimRaf = null;
        return;
    }

    const nextScale = rewardVideoPopupScale + diff * 0.16;
    const fitted = applyRewardPopupScale(rewardPopupZoomPopupEl, nextScale);
    if (fitted < rewardVideoPopupScaleTarget - 0.002) {
        rewardVideoPopupScaleTarget = fitted;
    }
    rewardPopupScaleAnimRaf = window.requestAnimationFrame(tickRewardPopupScaleAnimation);
}

function setRewardPopupScaleTarget(scale, animate) {
    rewardVideoPopupScaleTarget = clampRewardPopupScale(scale);
    if (!animate) {
        stopRewardPopupScaleAnimation();
        rewardVideoPopupScale = applyRewardPopupScale(rewardPopupZoomPopupEl, rewardVideoPopupScaleTarget);
        rewardVideoPopupScaleTarget = rewardVideoPopupScale;
        return;
    }
    if (!rewardPopupScaleAnimRaf) {
        rewardPopupScaleAnimRaf = window.requestAnimationFrame(tickRewardPopupScaleAnimation);
    }
}

function lockMapForRewardZoom(map) {
    if (!map || rewardMapLockedForZoom) return;
    rewardMapLockedForZoom = true;
    REWARD_MAP_LOCK_HANDLERS.forEach(function (name) {
        if (map[name]) map[name].disable();
    });
}

function unlockMapForRewardZoom(map) {
    if (!map || !rewardMapLockedForZoom) return;
    rewardMapLockedForZoom = false;
    REWARD_MAP_LOCK_HANDLERS.forEach(function (name) {
        if (map[name]) map[name].enable();
    });
}

function resetRewardVideoPopupFromEl(popupEl) {
    if (!popupEl) return;

    const inner = popupEl.querySelector('.popup-inner');
    const panel = popupEl.querySelector('.popup-video-panel');
    const video = popupEl.querySelector('.popup-video');

    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    if (panel) panel.setAttribute('hidden', '');
    const content = popupEl.querySelector('.mapboxgl-popup-content');
    if (content) {
        content.style.transform = '';
        content.style.transformOrigin = '';
        content.style.transition = '';
    }
    if (inner) {
        inner.classList.remove('popup-inner--video-open');
        inner.style.gridTemplateRows = '';
        inner.style.height = '';
        inner.style.transform = '';
        inner.style.transformOrigin = '';
    }
    popupEl.classList.remove('category-popup--reward-zoom');
    rewardVideoPopupTranslateX = 0;
    rewardVideoPopupTranslateY = 0;
}

function resetRewardVideoPopup(popup) {
    const popupEl = popup && popup.getElement ? popup.getElement() : null;
    resetRewardVideoPopupFromEl(popupEl);
}

function clearRewardPopupZoom(map, popup) {
    rewardVideoZoomActive = false;
    rewardVideoPopupScale = 1;
    rewardVideoPopupScaleTarget = 1;
    rewardVideoPopupTranslateX = 0;
    rewardVideoPopupTranslateY = 0;
    stopRewardPopupScaleAnimation();
    hideRewardZoomHint();
    hideRewardMapFade();

    if (rewardPopupWheelHandler) {
        window.removeEventListener('wheel', rewardPopupWheelHandler, true);
    }
    rewardPopupWheelHandler = null;

    if (rewardPopupResizeHandler) {
        window.removeEventListener('resize', rewardPopupResizeHandler);
    }
    rewardPopupResizeHandler = null;

    const popupEl = (popup && popup.getElement && popup.getElement())
        || rewardPopupZoomPopupEl;
    resetRewardVideoPopupFromEl(popupEl);
    rewardPopupZoomPopupEl = null;

    unlockMapForRewardZoom(map);
}

function bindRewardPopupZoom(map, popup, marker) {
    clearRewardPopupZoom(map);
    if (!map || !popup || !marker || !isRewardVideoHito(marker._archivo)) return;

    const popupEl = popup.getElement && popup.getElement();
    if (!popupEl) return;

    rewardVideoZoomActive = true;
    rewardVideoPopupScale = REWARD_POPUP_SCALE_MIN;
    rewardVideoPopupScaleTarget = REWARD_POPUP_SCALE_MIN;
    rewardPopupZoomPopupEl = popupEl;
    popupEl.classList.add('category-popup--reward-zoom');
    lockMapForRewardZoom(map);

    rewardPopupWheelHandler = function (event) {
        if (!rewardVideoZoomActive || !rewardPopupZoomPopupEl) return;
        event.preventDefault();
        event.stopImmediatePropagation();

        const delta = rewardWheelScaleDelta(event) || (event.deltaY < 0 ? REWARD_POPUP_SCALE_STEP : -REWARD_POPUP_SCALE_STEP);
        setRewardPopupScaleTarget(rewardVideoPopupScaleTarget + delta, true);

        if (rewardVideoPopupScaleTarget > REWARD_POPUP_UNLOCK_SCALE + 0.04) {
            hideRewardZoomHint();
        }
    };

    window.addEventListener('wheel', rewardPopupWheelHandler, { passive: false, capture: true });

    rewardPopupResizeHandler = function () {
        if (!rewardVideoZoomActive || !rewardPopupZoomPopupEl) return;
        centerRewardPopupInViewport(rewardPopupZoomPopupEl);
        syncRewardPopupScaleTargetToFit();
    };
    window.addEventListener('resize', rewardPopupResizeHandler);
}

function animateRewardPopupZoomIn(popupEl) {
    if (!popupEl) return;
    setRewardPopupScaleTarget(REWARD_POPUP_SCALE_MIN, false);
    window.requestAnimationFrame(function () {
        setRewardPopupScaleTarget(REWARD_POPUP_UNLOCK_SCALE, true);
    });
}

function animateRewardPopupCenterThenZoom(popupEl) {
    if (!popupEl) return;
    const content = getRewardPopupTransformEl(popupEl);
    if (content) content.style.transition = 'transform 0.6s ease';

    centerRewardPopupInViewport(popupEl);
    applyRewardPopupTransform(
        popupEl,
        REWARD_POPUP_SCALE_MIN,
        rewardVideoPopupTranslateX,
        rewardVideoPopupTranslateY
    );

    window.setTimeout(function () {
        if (content) content.style.transition = '';
        animateRewardPopupZoomIn(popupEl);
    }, 620);
}

function activateRewardVideoView(map, marker, popup) {
    if (!map || !marker || !isRewardVideoHito(marker._archivo)) return;

    const popupEl = popup.getElement && popup.getElement();
    if (!popupEl) return;

    console.log('[reconocer] reward video unlock:', marker._archivo, 'build:', RECONOCER_MAP_BUILD);

    showRewardMapFade();
    bindRewardPopupZoom(map, popup, marker);
    showRewardZoomHint();

    window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
            animateRewardPopupCenterThenZoom(popupEl);
        });
    });
}

function mutePageAudioForRewardPopup() {
    if (typeof window.reconocerMutePageAudio === 'function') {
        window.reconocerMutePageAudio();
    }
}

function pausePopupVideos(popup) {
    const root = popup && popup.getElement && popup.getElement();
    if (!root) return;
    root.querySelectorAll('.popup-video').forEach(function (video) {
        video.pause();
        video.currentTime = 0;
    });
}

function removePopupEntry(popup) {
    const idx = openPopupEntries.findIndex(entry => entry.popup === popup);
    if (idx >= 0) {
        const entry = openPopupEntries[idx];
        if (mapInstance && isRewardVideoHito(entry.marker._archivo)) {
            clearRewardPopupZoom(mapInstance, entry.popup);
        } else {
            pausePopupVideos(entry.popup);
        }
        entry.popup.remove();
        openPopupEntries.splice(idx, 1);
    }
}

function wirePopupUnlockVideo(map, popup, marker) {
    const archivo = marker && marker._archivo ? marker._archivo : '';
    const videoSrc = typeof getHitoVideoSrcForImage === 'function'
        ? getHitoVideoSrcForImage(archivo)
        : '';
    if (!videoSrc) return;

    const root = popup.getElement && popup.getElement();
    if (!root) return;

    const unlockBtn = root.querySelector('.popup-unlock');
    const inner = root.querySelector('.popup-inner');
    const panel = root.querySelector('.popup-video-panel');
    const video = root.querySelector('.popup-video');
    if (!unlockBtn || !inner || !panel || !video) return;

    unlockBtn.classList.add('popup-unlock--interactive');
    unlockBtn.setAttribute('role', 'button');
    unlockBtn.setAttribute('tabindex', '0');
    unlockBtn.setAttribute('aria-label', 'Desbloquear video');

    function revealVideo(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (inner.classList.contains('popup-inner--video-open')) return;

        inner.classList.add('popup-inner--video-open');
        inner.style.gridTemplateRows = POPUP_UNLOCK_HEIGHT + 'px ' + POPUP_IMG_SIZE + 'px ' + POPUP_VIDEO_HEIGHT + 'px';
        inner.style.height = (POPUP_HEIGHT + POPUP_VIDEO_HEIGHT) + 'px';
        panel.removeAttribute('hidden');

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }

        window.requestAnimationFrame(function () {
            activateRewardVideoView(map, marker, popup);
        });
    }

    unlockBtn.addEventListener('click', revealVideo);
    unlockBtn.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            revealVideo(event);
        }
    });
}

function panPopupIntoView(map, popup) {
    const popupEl = popup.getElement();
    if (!popupEl) return;
    const rect = popupEl.getBoundingClientRect();
    const footerHeight = 85;
    const padding = 10;
    if (rect.top < padding) {
        map.panBy([0, rect.top - padding], { duration: 300 });
    } else if (rect.bottom > window.innerHeight - footerHeight - padding) {
        map.panBy([0, rect.bottom - (window.innerHeight - footerHeight - padding)], { duration: 300 });
    }
    if (rect.left < padding) {
        map.panBy([rect.left - padding, 0], { duration: 300 });
    } else if (rect.right > window.innerWidth - 110 - padding) {
        map.panBy([rect.right - (window.innerWidth - 110 - padding), 0], { duration: 300 });
    }
}

function trackPopupClose(popup, entry) {
    const onClose = () => {
        popup.off('close', onClose);
        if (mapInstance && entry.marker && isRewardVideoHito(entry.marker._archivo)) {
            clearRewardPopupZoom(mapInstance, popup);
        } else {
            pausePopupVideos(popup);
        }
        const idx = openPopupEntries.indexOf(entry);
        if (idx >= 0) openPopupEntries.splice(idx, 1);
    };
    popup.on('close', onClose);
}

function handleMarkerPopupClick(map, marker, popup) {
    const openIndex = openPopupEntries.findIndex(entry => entry.marker === marker);
    if (openIndex >= 0) {
        removePopupEntry(openPopupEntries[openIndex].popup);
        return;
    }

    // WebSockets event: Abrir detalle de marcador/hito
    if (marker._tienePremio) {
        sendWsPayload({
            Pagina: "Recompensa",
            ID: marker._hitoId
        });
    } else {
        sendWsPayload({
            Pagina: "Hito",
            ID: marker._hitoId
        });
    }

    if (openPopupEntries.length >= MAX_OPEN_POPUPS) {
        closeAllOpenPopups();
    }

    if (popup.isOpen && popup.isOpen()) {
        popup.remove();
    }

    if (isRewardVideoHito(marker._archivo)) {
        mutePageAudioForRewardPopup();
    }

    popup.setLngLat(marker.getLngLat()).addTo(map);
    const entry = { marker, popup };
    openPopupEntries.push(entry);
    trackPopupClose(popup, entry);

    window.setTimeout(function () {
        wirePopupUnlockVideo(map, popup, marker);
        panPopupIntoView(map, popup);
    }, 50);
}

function agregarMarcador(map, row, markers, indices = {}) {
    const archivo = String(indices.archivo >= 0 ? row[indices.archivo] : row[0] || '').trim();
    const lat = parseFloat(indices.lat >= 0 ? row[indices.lat] : row[1]);
    const lng = parseFloat(indices.lng >= 0 ? row[indices.lng] : row[2]);
    const categoriaRaw = findRowCategory(row, indices);
    const relatoRaw = indices.relato >= 0 ? row[indices.relato] : row[row.length - 1];

    const premioRaw = indices.premio >= 0 ? row[indices.premio] : '';
    const tienePremio = String(premioRaw).toLowerCase().trim() === 'si';
    
    let hitoId = 0;
    if (indices.id >= 0 && row[indices.id]) {
        hitoId = parseInt(row[indices.id], 10);
    } else {
        const match = archivo.match(/\d+/);
        if (match) hitoId = parseInt(match[0], 10);
    }

    if (!archivo || isNaN(lat) || isNaN(lng)) return;

    const categoria = String(categoriaRaw || '')
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .charAt(0); // m, e, r, o

    const relato = String(relatoRaw || '').trim().replace(/^['"]|['"]$/g, '');
    const imageUrl = `./img/${encodeURIComponent(archivo)}`;
    const extension = archivo.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'];
    const isImage = imageExtensions.includes(extension);
    const previewUrl = isImage ? imageUrl : 'https://placehold.co/120x120?text=NO+IMG';
    const el = document.createElement('img');
    el.src = previewUrl;
    el.alt = archivo;
    el.width = 66;
    el.height = 66;
    el.className = 'marker';
    el.title = archivo;
    el.style.cursor = 'pointer';
    el.onerror = () => el.src = 'https://placehold.co/66x66?text=no+img';

    const popupImage = isImage
        ? `<img src="${imageUrl}" alt="${archivo}" style="grid-column:1;grid-row:2;width:${POPUP_IMG_SIZE}px;height:${POPUP_IMG_SIZE}px;object-fit:cover;border-radius:0;display:block;background:transparent;">`
        : `<img src="https://placehold.co/640x400?text=NO+IMG" alt="Archivo no disponible" style="grid-column:1;grid-row:2;width:${POPUP_IMG_SIZE}px;height:${POPUP_IMG_SIZE}px;object-fit:cover;border-radius:0;display:block;background:transparent;">`;

    const popupText = relato
        ? `<p class="popup-relato" style="width:100%;height:${POPUP_TEXT_HEIGHT}px;font-size:${POPUP_FONT_SIZE}px;padding:${POPUP_PADDING}px;color:#ffffff;box-sizing:border-box;margin:0;">${relato}</p>`
        : '';

    const isRefugioPopup = isRefugioCategory(categoria);
    const categoryColor = getCategoryColor(categoria);
    const categoryBackground = getCategoryTextPanelBackground(categoria);
    const unlockBgStyle = isRefugioPopup ? '' : `background-color:${categoryColor};`;
    const videoSrc = typeof getHitoVideoSrcForImage === 'function'
        ? getHitoVideoSrcForImage(archivo)
        : '';
    const popupUnlockClass = videoSrc ? 'popup-unlock popup-unlock--has-video' : 'popup-unlock';
    const popupUnlock = `<div class="${popupUnlockClass}" style="grid-column:1;grid-row:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${POPUP_IMG_SIZE}px;height:${POPUP_UNLOCK_HEIGHT}px;min-height:${POPUP_UNLOCK_HEIGHT}px;${unlockBgStyle}color:${POPUP_UNLOCK_TEXT_COLOR};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1;letter-spacing:0.04em;">DESBLOQUEAR</div>`;
    const textPanelBgStyle = isRefugioPopup ? '' : `background-color:${categoryBackground};`;
    const popupTextPanel = `<div class="popup-text-panel" style="grid-column:2;grid-row:2;width:${POPUP_TEXT_WIDTH}px;height:${POPUP_IMG_SIZE}px;${textPanelBgStyle}display:flex;align-items:center;box-sizing:border-box;">${popupText}</div>`;
    const popupVideoPanel = videoSrc
        ? `<div class="popup-video-panel" style="grid-column:1 / -1;grid-row:3;width:${POPUP_WIDTH}px;height:${POPUP_VIDEO_HEIGHT}px;" hidden><video class="popup-video" src="${videoSrc}" playsinline controls preload="metadata"></video></div>`
        : '';
    const popupInnerClass = videoSrc ? 'popup-inner popup-inner--has-video' : 'popup-inner';
    const popupContent = `<div class="${popupInnerClass}" style="display:grid;grid-template-columns:${POPUP_IMG_SIZE}px ${POPUP_TEXT_WIDTH}px;grid-template-rows:${POPUP_UNLOCK_HEIGHT}px ${POPUP_IMG_SIZE}px;width:${POPUP_WIDTH}px;height:${POPUP_HEIGHT}px;">${popupUnlock}${popupImage}${popupTextPanel}${popupVideoPanel}</div>`;

    const popup = new mapboxgl.Popup({
        offset: POPUP_OFFSET,
        closeButton: true,
        closeOnClick: false,
        className: isRefugioPopup ? 'category-popup category-popup--refugio' : 'category-popup',
        maxWidth: `${POPUP_WIDTH}px`,
        anchor: 'bottom'
    })
        .setHTML(popupContent);

    const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat]);

    marker._categoria = categoria || '';
    marker._archivo = archivo;
    marker._popup = popup;
    marker._hitoId = isNaN(hitoId) ? 0 : hitoId;
    marker._tienePremio = tienePremio;
    marker.addTo(map);

    const markerEl = marker.getElement();
    markerEl.classList.add('map-marker-hit');
    markerEl.style.pointerEvents = 'auto';
    el.style.pointerEvents = 'auto';

    el.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleMarkerPopupClick(map, marker, popup);
    });
    markers.push(marker);
}

function getVisibleMarkers(markers, activeSet) {
    if (!markers.length) return [];
    if (!activeSet || activeSet.size === 0) return markers.slice();
    return markers.filter(function (m) {
        return activeSet.has((m._categoria || '').toLowerCase());
    });
}

function fitMapToFilteredMarkers(map, markers, activeSet) {
    if (!map) return;
    const visible = getVisibleMarkers(markers, activeSet);
    if (!visible.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reducedMotion ? 0 : MAP_FIT_DURATION_MS;

    if (visible.length === 1) {
        const ll = visible[0].getLngLat();
        map.flyTo({
            center: [ll.lng, ll.lat],
            zoom: MAP_FIT_SINGLE_ZOOM,
            duration: duration,
            essential: true
        });
        return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    visible.forEach(function (m) {
        const ll = m.getLngLat();
        bounds.extend([ll.lng, ll.lat]);
    });

    map.fitBounds(bounds, {
        padding: MAP_FIT_PADDING,
        maxZoom: MAP_FIT_MAX_ZOOM,
        duration: duration,
        essential: true
    });
}

function scheduleMapFitToFilteredMarkers(map, markers, activeSet) {
    if (!map) return;
    window.requestAnimationFrame(function () {
        fitMapToFilteredMarkers(map, markers, activeSet);
    });
}

function setMarkerFilterVisible(marker, map, visible) {
    const markerEl = marker.getElement();
    if (!markerEl) return;

    if (visible) {
        if (!marker._map) marker.addTo(map);
        markerEl.classList.remove('marker-filter-hidden');
        return;
    }

    markerEl.classList.add('marker-filter-hidden');
}

/* UI helpers: mostrar/ocultar marcadores según categorías activas */
function updateMarkersFilter(map, markers, activeSet) {
    markers.forEach(function (m) {
        const cat = (m._categoria || '').toLowerCase();
        const shouldShow = activeSet.size === 0 || activeSet.has(cat);

        if (!shouldShow) {
            const openIndex = openPopupEntries.findIndex(function (entry) {
                return entry.marker === m;
            });
            if (openIndex >= 0) removePopupEntry(openPopupEntries[openIndex].popup);
        }

        setMarkerFilterVisible(m, map, shouldShow);
    });
}

function initCategoryUI(map, markers) {
    const categoriesButton = document.getElementById('categories-button');
    const categoriesNav = document.getElementById('categories-nav');
    if (!categoriesNav) return;

    // Mostrar botones de categorías por defecto en la página de mapa (ya están visibles por CSS)
    const catButtons = categoriesNav.querySelectorAll('.category-button');

    // Evento para el footer 'CATEGORÍAS' -> ahora alterna las rectángulos de apoyo visual
    function toggleCategoryRects() {
        const rectsFooter = document.getElementById('category-rects-footer');
        if (rectsFooter) rectsFooter.classList.toggle('open');
        const isOpen = rectsFooter && rectsFooter.classList.contains('open');
        const arrow = document.getElementById('cat-arrow');
        if (arrow) arrow.classList.toggle('vertical', isOpen);
        if (categoriesButton) categoriesButton.classList.toggle('underlined', isOpen);
        const catArrowBtn = document.getElementById('cat-arrow-btn');
        if (catArrowBtn) catArrowBtn.classList.toggle('active', isOpen);
    }

    if (categoriesButton) {
        categoriesButton.addEventListener('click', toggleCategoryRects);
    }

    const catArrowBtn = document.getElementById('cat-arrow-btn');
    if (catArrowBtn) {
        catArrowBtn.addEventListener('click', toggleCategoryRects);
    }

    // Filtro 3: multi-select de fotos; fondo = categoría del botón picado
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = (btn.dataset.category || '').toLowerCase();

            btn.classList.toggle('active');
            const isActive = btn.classList.contains('active');
            const act = getActiveCategorySet(catButtons);

            // --- WEBSOCKETS EVENT: Cambios de vista de Mapa ---
            let mapaId = "Completo";
            if (act.size === 1) {
                if (act.has("m")) mapaId = "Memoria";
                else if (act.has("o")) mapaId = "Oficio";
                else if (act.has("e")) mapaId = "Encuentro";
                else if (act.has("r")) mapaId = "Refugio";
            }
            sendWsPayload({
                Pagina: "Mapa",
                ID: mapaId
            });

            if (getCurrentMapBgMode() === 'blue') {
                if (act.size === 0) {
                    startMapBluePreviewLoop(map, { fitOverview: true });
                    return;
                }

                stopMapBluePreviewLoop();
                updateMarkersFilter(map, markers, act);
                scheduleMapFitToFilteredMarkers(map, markers, act);

                const variant = resolveBlueVariantFromCategoryClick(catButtons, category, isActive);
                if (variant) {
                    mapBlueVariant = variant;
                    scheduleBlueMapVariantApply(map, true);
                }
                return;
            }

            updateMarkersFilter(map, markers, act);
            scheduleMapFitToFilteredMarkers(map, markers, act);
        });
    });

    // Inicial: asegurar que todos los marcadores se muestren
    updateMarkersFilter(map, markers, new Set());
}
