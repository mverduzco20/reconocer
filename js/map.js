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
            const rows = text.trim().split('\n').slice(1); // omitir encabezado
            rows.forEach(row => agregarMarcador(map, row, markers));
            // después de cargar marcadores, inicializar la UI si existe
            initCategoryUI(map, markers);
        })
        .catch(err => console.error('[reconocer]', err));
});

// ─────────────────────────────────────────────
// MARCADORES
// ─────────────────────────────────────────────
function agregarMarcador(map, row, markers) {
    const columnas = row.split(',');
    if (columnas.length < 3) return;

    const archivo = columnas[0].trim();
    const lat     = parseFloat(columnas[1]);
    const lng     = parseFloat(columnas[2]);
    // la categoría suele ser la última columna (CSV con comas internas)
    const categoriaRaw = columnas[columnas.length - 1] ? columnas[columnas.length - 1].trim() : '';
    const categoria = categoriaRaw.toLowerCase().replace(/[^a-z]/g, '').charAt(0); // m, e, r, o

    if (isNaN(lat) || isNaN(lng)) return;

    const imageUrl = `./img/${encodeURIComponent(archivo)}`;
    const extension = archivo.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'];
    const isImage = imageExtensions.includes(extension);
    const previewUrl = isImage ? imageUrl : 'https://placehold.co/120x120?text=NO+IMG';

    const el = document.createElement('img');
    el.src = previewUrl;
    el.alt = archivo;
    el.width = 64;
    el.height = 64;
    el.className = 'marker';
    el.title = archivo;
    el.style.cursor = 'pointer';
    el.onerror = () => el.src = 'https://placehold.co/64x64?text=no+img';

    const popupImage = isImage
        ? `<img src="${imageUrl}" alt="${archivo}" style="max-width:280px;width:100%;height:auto;border-radius:12px;display:block;">`
        : `<img src="https://placehold.co/280x200?text=NO+IMG" alt="Archivo no disponible" style="max-width:280px;width:100%;height:auto;border-radius:12px;display:block;">`;

    const popup = new mapboxgl.Popup({ offset: 10, closeButton: true })
        .setHTML(popupImage);

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
            // si es enlace (home) no hacemos toggle aquí
            if (categoriesButton.tagName.toLowerCase() === 'a') return;
            const rects = categoriesNav.querySelector('.cat-rects');
            if (rects) rects.classList.toggle('visible');
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
