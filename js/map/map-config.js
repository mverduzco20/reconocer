// Map constants and category palette
const CSV_URL = './csv/hitos.csv';
const MAP_CENTER = [-99.1950, 19.3445]; // lng, lat — centro aproximado de los puntos
const MAP_ZOOM = 15.5;
const CARTOGRAPHY_MAP_CENTER = [-99.2010, 19.3445];
const CARTOGRAPHY_MAP_ZOOM = 15.5;
const CARTOGRAPHY_MAP_PADDING = { top: 20, bottom: 60, left: 180, right: 65 };
const INITIAL_MAP_ALL_MARKERS_PADDING = { top: 55, bottom: 65, left: 210, right: 75 };
const POPUP_UNLOCK_TEXT_COLOR = '#ffffff';
const RECONOCER_MAP_BUILD = window.RECONOCER_BUILD || 'dev';
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

const FILTER_C_CATEGORY_COLORS = ['#e9c47e', '#0000ff', '#92f47b', '#ec00ea'];

const CATEGORY_COLOR_MAP = {
    m: '#e9c47e', // memoria — dorado
    o: '#0000ff', // oficio — azul
    r: '#0f3d18', // refugio — UI mapa/footer; popups usan REFUGIO_PANEL_*
    e: '#ec00ea'  // encuentro — rosa
};

const REFUGIO_PANEL_COLOR = '#8a9f82';
const REFUGIO_PANEL_ALPHA = 0.75;

const MAP_BLUE_VARIANT_BY_CATEGORY = {
    m: 'memoria',
    o: 'oficio',
    r: 'green',
    e: 'encuentro'
};

const MAPA_VIEW_TO_CATEGORY = {
    Completo: null,
    Memoria: 'm',
    Oficio: 'o',
    Encuentro: 'e',
    Refugio: 'r'
};

