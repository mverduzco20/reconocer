// ─────────────────────────────────────────────
// CONFIGURACIÓN DE MAPBOX
// Reemplaza con tu token en: https://account.mapbox.com
// ─────────────────────────────────────────────
// const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';
const MAPBOX_TOKEN = '';

const CSV_URL = './csv/hitos.csv';
const MAP_CENTER = [-99.1950, 19.3445]; // lng, lat — centro aproximado de los puntos
const MAP_ZOOM = 16;
// const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';
const MAP_STYLE = 'mapbox://styles/juan-fuentes/cmpbrv3ue001k01rv1vsi4heo';

// ─────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
        container: 'mapa',
        style: MAP_STYLE,
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        antialias: true
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

    const nombre = columnas[0].trim();
    const lat    = parseFloat(columnas[1]);
    const lng    = parseFloat(columnas[2]);

    if (isNaN(lat) || isNaN(lng)) return;

    // Elemento HTML personalizado para el marcador (imagen 64×64px)
    const el = document.createElement('img');
    el.src = 'https://placehold.co/64x64';
    el.width = 64;
    el.height = 64;
    el.className = 'marker';
    el.title = nombre;
    el.style.cursor = 'pointer';

    const popup = new mapboxgl.Popup({ offset: 10, closeButton: true })
        .setHTML(`<p>${nombre}</p><p style="opacity:0.5;font-size:0.7rem">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>`);

    new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
}
