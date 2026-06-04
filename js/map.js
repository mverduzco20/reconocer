// ─────────────────────────────────────────────
// CONFIGURACIÓN DE MAPBOX
// Reemplaza con tu token en: https://account.mapbox.com
// ─────────────────────────────────────────────

const CSV_URL = './csv/hitos.csv';
const MAP_CENTER = [-99.1950, 19.3445]; // lng, lat — centro aproximado de los puntos
const MAP_ZOOM = 10;
const MAP_STYLE = 'mapbox://styles/valentina-nacif/cmpdcwwba00fc01scddw0cd2w';

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

    map.on('load', () => {
        console.log('[reconocer] Map loaded con estilo:', MAP_STYLE);
        const style = map.getStyle();
        console.log('[reconocer] Style name:', style.name);
        console.log('[reconocer] Style version:', style.version);
        console.log('[reconocer] Style sprite:', style.sprite);
        console.log('[reconocer] Style glyphs:', style.glyphs);
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

    // Cargar y parsear el CSV
    fetch(CSV_URL)
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
            // después de cargar marcadores, inicializar la UI si existe
            initCategoryUI(map, markers);
        })
        .catch(err => console.error('[reconocer]', err));
});

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

    if (indices.categoria >= 0 && row[indices.categoria] != null) {
        const candidate = normalizeCategoryValue(row[indices.categoria]);
        if (categoryKeys.has(candidate)) return candidate;
    }

    const startIndex = Math.max(3, indices.categoria >= 0 ? indices.categoria : 3);
    for (let i = startIndex; i < row.length; i++) {
        const candidate = normalizeCategoryValue(row[i]);
        if (categoryKeys.has(candidate)) return candidate;
    }

    return '';
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
    el.onerror = () => el.src = 'https://placehold.co/66x66?text=no+img';

    const popupImage = isImage
        ? `<img src="${imageUrl}" alt="${archivo}" style="width:100%;height:auto;border-radius:0;display:block;">`
        : `<img src="https://placehold.co/320x200?text=NO+IMG" alt="Archivo no disponible" style="width:100%;height:auto;border-radius:0;display:block;">`;

    const popupText = relato
        ? `<p style="margin:0;line-height:1.4;color:#111;font-family:'Courier New',Courier,monospace;font-size:13px;">${relato}</p>`
        : '';

    const categoryColor = getCategoryColor(categoria);
    const popupContent = `<div style="background-color:${categoryColor};padding:0;border-radius:0;opacity:0.6;">${popupImage}${popupText}</div>`;

    const popup = new mapboxgl.Popup({ offset: 10, closeButton: true })
        .setHTML(popupContent);

    const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup);

    // almacenar meta (categoría) y la instancia del marcador
    marker._categoria = categoria || '';
    marker.addTo(map);
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
    if (categoriesButton) {
        categoriesButton.addEventListener('click', (e) => {
            const rectsFooter = document.getElementById('category-rects-footer');
            if (rectsFooter) rectsFooter.classList.toggle('open');
            const arrow = document.getElementById('cat-arrow');
            if (arrow) arrow.classList.toggle('vertical');
        });
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
