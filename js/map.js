// ─────────────────────────────────────────────
// CONFIGURACIÓN DE MAPBOX
// Reemplaza con tu token en: https://account.mapbox.com
// ─────────────────────────────────────────────
// const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';

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
            rows.forEach(row => agregarMarcador(map, row));
        })
        .catch(err => console.error('[reconocer]', err));
});

// ─────────────────────────────────────────────
// MARCADORES
// ─────────────────────────────────────────────
function agregarMarcador(map, row) {
    const columnas = row.split(',');
    if (columnas.length < 3) return;

    const archivo = columnas[0].trim();
    const lat     = parseFloat(columnas[1]);
    const lng     = parseFloat(columnas[2]);

    if (isNaN(lat) || isNaN(lng)) return;

    const imageUrl = `./img/${encodeURIComponent(archivo)}`;
    const extension = archivo.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'];
    const isImage = imageExtensions.includes(extension);
    const previewUrl = isImage ? imageUrl : 'https://placehold.co/120x120?text=NO+IMG';

    // Elemento HTML personalizado para el marcador (imagen 64×64px)
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

    new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
}
