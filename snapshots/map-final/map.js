// ─────────────────────────────────────────────
// CONFIGURACIÓN DE MAPBOX
// Reemplaza con tu token en: https://account.mapbox.com
// ─────────────────────────────────────────────

const CSV_URL = './csv/hitos.csv';
const MAP_CENTER = [-99.1950, 19.3445]; // lng, lat — centro aproximado de los puntos
const MAP_ZOOM = 15.5;
const MAP_STYLE = 'mapbox://styles/valentina-nacif/cmpdcwwba00fc01scddw0cd2w';
const POPUP_SCALE = 0.7;
const POPUP_IMG_SIZE = Math.round(252 * POPUP_SCALE);
const POPUP_WIDTH = Math.round(504 * POPUP_SCALE);
const POPUP_HEIGHT = POPUP_IMG_SIZE;
const POPUP_TEXT_WIDTH = POPUP_WIDTH - POPUP_IMG_SIZE;
const POPUP_TEXT_HEIGHT = Math.round(POPUP_IMG_SIZE * 0.74);
const POPUP_FONT_SIZE = Math.round(15 * POPUP_SCALE);
const POPUP_PADDING = Math.round(11 * POPUP_SCALE);
const POPUP_MAX_WIDTH = Math.round(476 * POPUP_SCALE);
const POPUP_OFFSET = Math.round(14 * POPUP_SCALE);
const MAX_OPEN_POPUPS = 3;
const MARKER_OPACITY = 0.7;
const openPopupEntries = [];

const MAP_NEAR_WHITE = '#f1f1f1';
const MAP_STREET_LINE = '#f0f0f0';
const MAP_STREET_FILL = '#f2f2f2';
const MAP_LABEL_LIGHT = '#e8e8e8';

const MAP_DARK_BG = '#000000';
const MAP_DARK_STREET_FILL = '#141414';
const MAP_DARK_STREET_LINE = '#3a3a3a';
const MAP_DARK_LABEL = '#5a5a5a';

const PROJECT_COLORS = ['#0000ff', '#e9c47e', '#92f47b', '#ec00ea'];

const MAP_BG_MODES = ['white', 'dark', 'colorful'];
const MAP_BG_LABELS = ['Mapa blanco', 'Mapa negro', 'Mapa colorido'];

let mapBgModeIndex = 0;

function isRoadLayer(id) {
    return /road|street|highway|bridge|tunnel|path|motorway|trunk|primary|secondary|tertiary|residential|service|transport|rail|avenue|calle/i.test(id);
}

function setMapContainerMode(color, mode) {
    const container = document.getElementById('map-container');
    const mapa = document.getElementById('mapa');
    if (container) {
        container.style.backgroundColor = color;
        container.classList.remove('map-bg-dark', 'map-bg-colorful');
        if (mode === 'dark') container.classList.add('map-bg-dark');
        if (mode === 'colorful') container.classList.add('map-bg-colorful');
    }
    if (mapa) mapa.style.backgroundColor = color;
}

function applyMapWhiteningEffect(map) {
    const style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;

    setMapContainerMode(MAP_NEAR_WHITE, 'white');

    for (const layer of style.layers) {
        const { id, type } = layer;
        const road = isRoadLayer(id);
        try {
            if (type === 'background') {
                map.setPaintProperty(id, 'background-color', MAP_NEAR_WHITE);
            } else if (type === 'fill') {
                map.setPaintProperty(id, 'fill-color', road ? MAP_STREET_FILL : MAP_NEAR_WHITE);
                map.setPaintProperty(id, 'fill-opacity', road ? 0.55 : 0.98);
            } else if (type === 'fill-extrusion') {
                map.setPaintProperty(id, 'fill-extrusion-color', MAP_NEAR_WHITE);
                map.setPaintProperty(id, 'fill-extrusion-opacity', 0.12);
            } else if (type === 'line') {
                map.setPaintProperty(id, 'line-color', MAP_STREET_LINE);
                map.setPaintProperty(id, 'line-opacity', road ? 0.16 : 0.12);
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', MAP_LABEL_LIGHT);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', MAP_STREET_LINE);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', -1);
                map.setPaintProperty(id, 'raster-brightness-min', 0.9);
                map.setPaintProperty(id, 'raster-brightness-max', 1);
                map.setPaintProperty(id, 'raster-contrast', 0.08);
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
                map.setPaintProperty(id, 'line-opacity', road ? 0.8 : 0.3);
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', MAP_DARK_LABEL);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', MAP_DARK_STREET_LINE);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', -0.85);
                map.setPaintProperty(id, 'raster-brightness-min', 0.04);
                map.setPaintProperty(id, 'raster-brightness-max', 0.18);
                map.setPaintProperty(id, 'raster-contrast', 0.25);
            }
        } catch (_) {
            /* algunas capas no admiten ciertas propiedades */
        }
    }
}

function applyMapColorfulEffect(map) {
    const style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;

    setMapContainerMode(MAP_NEAR_WHITE, 'colorful');

    let roadColorIndex = 0;

    for (const layer of style.layers) {
        const { id, type } = layer;
        const road = isRoadLayer(id);
        const projectColor = PROJECT_COLORS[roadColorIndex % PROJECT_COLORS.length];
        try {
            if (type === 'background') {
                map.setPaintProperty(id, 'background-color', MAP_NEAR_WHITE);
            } else if (type === 'fill') {
                map.setPaintProperty(id, 'fill-color', MAP_NEAR_WHITE);
                map.setPaintProperty(id, 'fill-opacity', 0.98);
            } else if (type === 'fill-extrusion') {
                map.setPaintProperty(id, 'fill-extrusion-color', MAP_NEAR_WHITE);
                map.setPaintProperty(id, 'fill-extrusion-opacity', 0.08);
            } else if (type === 'line') {
                if (road) {
                    map.setPaintProperty(id, 'line-color', projectColor);
                    map.setPaintProperty(id, 'line-opacity', 0.78);
                    roadColorIndex += 1;
                } else {
                    map.setPaintProperty(id, 'line-color', MAP_NEAR_WHITE);
                    map.setPaintProperty(id, 'line-opacity', 0.04);
                }
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', MAP_LABEL_LIGHT);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', MAP_LABEL_LIGHT);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', -1);
                map.setPaintProperty(id, 'raster-brightness-min', 0.9);
                map.setPaintProperty(id, 'raster-brightness-max', 1);
                map.setPaintProperty(id, 'raster-contrast', 0.08);
            }
        } catch (_) {
            /* algunas capas no admiten ciertas propiedades */
        }
    }
}

function applyMapBackgroundByMode(map, mode) {
    if (mode === 'dark') applyMapDarkEffect(map);
    else if (mode === 'colorful') applyMapColorfulEffect(map);
    else applyMapWhiteningEffect(map);
}

function cycleMapBackground(map) {
    mapBgModeIndex = (mapBgModeIndex + 1) % MAP_BG_MODES.length;
    applyMapBackgroundByMode(map, MAP_BG_MODES[mapBgModeIndex]);
}

function initMapBackgroundUI(map) {
    const filterButton = document.getElementById('footer-cat-companion');
    if (!filterButton || filterButton.dataset.bgBound === '1') return;

    filterButton.dataset.bgBound = '1';
    filterButton.setAttribute('aria-label', MAP_BG_LABELS[mapBgModeIndex]);
    filterButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!map || !map.isStyleLoaded()) return;
        cycleMapBackground(map);
        filterButton.setAttribute('aria-label', MAP_BG_LABELS[mapBgModeIndex]);
    });
}

// ─────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    mapboxgl.accessToken = window.MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
        container: 'mapa',
        style: MAP_STYLE,
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        antialias: true
    });

    // Marcadores creados a partir del CSV
    const markers = [];
    // Categorías activas
    const activeCategories = new Set();

    initMapBackgroundUI(map);

    map.on('load', () => {
        mapBgModeIndex = 0;
        applyMapBackgroundByMode(map, MAP_BG_MODES[mapBgModeIndex]);
        console.log('[reconocer] Map loaded con estilo:', MAP_STYLE);
        const style = map.getStyle();
        console.log('[reconocer] Style name:', style.name);
        console.log('[reconocer] Style version:', style.version);
        console.log('[reconocer] Style sprite:', style.sprite);
        console.log('[reconocer] Style glyphs:', style.glyphs);
        loadHitosMarkers(map, markers);
    });

    map.on('error', (event) => {
        console.error('[reconocer] Mapbox error:', event.error || event);
        if (event && event.error && event.error.message) {
            console.error('[reconocer] Detalle:', event.error.message);
        }
    });

    map.on('styledata', () => {
        console.log('[reconocer] Style data cargada');
    });

    // Controles de navegación (zoom + rotación)
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

});

function loadHitosMarkers(map, markers) {
    fetch(CSV_URL, { cache: 'no-store' })
        .then(res => {
            if (!res.ok) throw new Error(`No se pudo cargar el CSV: ${res.status}`);
            return res.text();
        })
        .then(text => {
            const rows = parseCsvRows(text.trim());
            if (rows.length < 2) return;

            const header = rows[0].map(col => String(col || '').trim().toLowerCase());
            const indices = {
                archivo: header.findIndex(h => h.includes('archivo') || h.includes('nombre')),
                lat: header.findIndex(h => h.includes('lat')),
                lng: header.findIndex(h => h.includes('long')),
                categoria: header.findIndex(h => h.includes('categoria')),
                relato: header.findIndex(h => h.includes('relato'))
            };

            rows.slice(1).forEach(row => agregarMarcador(map, row, markers, indices));
            initCategoryUI(map, markers);
        })
        .catch(err => console.error('[reconocer]', err));
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

// Mapeo de colores por categoría
function getCategoryColor(categoria) {
    const colorMap = {
        'm': '#e9c47e', // memoria
        'o': '#5959d2', // oficio
        'r': '#92f47b', // refugio
        'e': '#ec00ea'  // encuentro
    };
    return colorMap[String(categoria || '').toLowerCase()] || '#f0f0f0';
}

function closeAllOpenPopups() {
    const entries = [...openPopupEntries];
    openPopupEntries.length = 0;
    entries.forEach(entry => entry.popup.remove());
}

function removePopupEntry(popup) {
    const idx = openPopupEntries.findIndex(entry => entry.popup === popup);
    if (idx >= 0) {
        openPopupEntries[idx].popup.remove();
        openPopupEntries.splice(idx, 1);
    }
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

    if (openPopupEntries.length >= MAX_OPEN_POPUPS) {
        closeAllOpenPopups();
    }

    if (popup.isOpen && popup.isOpen()) {
        popup.remove();
    }

    popup.setLngLat(marker.getLngLat()).addTo(map);
    const entry = { marker, popup };
    openPopupEntries.push(entry);
    trackPopupClose(popup, entry);

    setTimeout(() => panPopupIntoView(map, popup), 50);
}

function agregarMarcador(map, row, markers, indices = {}) {
    const archivo = String(indices.archivo >= 0 ? row[indices.archivo] : row[0] || '').trim();
    const lat = parseFloat(indices.lat >= 0 ? row[indices.lat] : row[1]);
    const lng = parseFloat(indices.lng >= 0 ? row[indices.lng] : row[2]);
    const categoriaRaw = findRowCategory(row, indices);
    const relatoRaw = indices.relato >= 0 ? row[indices.relato] : row[row.length - 1];

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
    el.style.opacity = String(MARKER_OPACITY);
    el.onerror = () => el.src = 'https://placehold.co/66x66?text=no+img';

    const popupImage = isImage
        ? `<img src="${imageUrl}" alt="${archivo}" style="width:${POPUP_IMG_SIZE}px;height:${POPUP_IMG_SIZE}px;object-fit:cover;border-radius:0;display:block;background:transparent;flex-shrink:0;">`
        : `<img src="https://placehold.co/640x400?text=NO+IMG" alt="Archivo no disponible" style="width:${POPUP_IMG_SIZE}px;height:${POPUP_IMG_SIZE}px;object-fit:cover;border-radius:0;display:block;background:transparent;flex-shrink:0;">`;

    const popupText = relato
        ? `<p class="popup-relato" style="width:${POPUP_TEXT_WIDTH}px;height:${POPUP_TEXT_HEIGHT}px;font-size:${POPUP_FONT_SIZE}px;padding:${POPUP_PADDING}px;">${relato}</p>`
        : '';

    const categoryColor = getCategoryColor(categoria);
    const categoryBackground = hexToRgba(categoryColor, 0.7);
    const popupContent = `<div class="popup-inner" style="background-color:${categoryBackground};width:${POPUP_WIDTH}px;height:${POPUP_HEIGHT}px;">${popupImage}${popupText}</div>`;

    const popup = new mapboxgl.Popup({
        offset: POPUP_OFFSET,
        closeButton: true,
        closeOnClick: false,
        className: 'category-popup',
        maxWidth: `${POPUP_MAX_WIDTH}px`,
        anchor: 'bottom'
    })
        .setHTML(popupContent);

    const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat]);

    marker._categoria = categoria || '';
    marker._popup = popup;
    marker.addTo(map);

    const markerEl = marker.getElement();
    markerEl.classList.add('map-marker-hit');
    markerEl.style.pointerEvents = 'auto';
    markerEl.style.opacity = String(MARKER_OPACITY);
    el.style.pointerEvents = 'auto';

    el.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleMarkerPopupClick(map, marker, popup);
    });
    markers.push(marker);
}

/* UI helpers: mostrar/ocultar marcadores según categorías activas */
function updateMarkersFilter(map, markers, activeSet) {
    markers.forEach(m => {
        const cat = (m._categoria || '').toLowerCase();
        if (activeSet.size === 0) {
            // mostrar todo
            m.addTo(map);
        } else if (activeSet.has(cat)) {
            m.addTo(map);
        } else {
            const openIndex = openPopupEntries.findIndex(entry => entry.marker === m);
            if (openIndex >= 0) removePopupEntry(openPopupEntries[openIndex].popup);
            try { m.remove(); } catch (e) { /* no importa */ }
        }
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
        const arrow = document.getElementById('cat-arrow');
        if (arrow) arrow.classList.toggle('vertical');
        if (categoriesButton) categoriesButton.classList.toggle('underlined');
    }

    if (categoriesButton) {
        categoriesButton.addEventListener('click', toggleCategoryRects);
    }

    const catArrowBtn = document.getElementById('cat-arrow-btn');
    if (catArrowBtn) {
        catArrowBtn.addEventListener('click', toggleCategoryRects);
    }

    // Click en botones de categoría controla el filtrado (multi-select)
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const act = new Set();
            catButtons.forEach(b => { if (b.classList.contains('active')) act.add((b.dataset.category||'').toLowerCase()); });
            updateMarkersFilter(map, markers, act);
        });
    });

    // Inicial: asegurar que todos los marcadores se muestren
    updateMarkersFilter(map, markers, new Set());
}
