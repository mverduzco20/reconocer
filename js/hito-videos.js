// Mapeo imagen del hito → archivo de video (12 hitos con desbloqueo).
window.HITO_VIDEO_BASE = './img/';
window.HITO_VIDEO_BY_IMAGE = {
    'e21.jpg': 'bombilla.mp4',
    'e22.jpg': 'chimalistac.mp4',
    'm45.jpg': 'casablanca.mp4',
    'r52.jpg': 'riscofuente.mp4',
    'o26.jpg': 'mfloress.mp4',
    'e24.jpg': 'iglesia.mp4',
    'm44.jpg': 'casaestudio.mp4',
    'r48.jpg': 'sanangelinn.mp4',
    'e14.jpg': 'melchor.mp4',
    'r36.jpg': 'convento.mp4',
    'e2.jpg': 'jacinto.mp4',
    'r7.jpg': 'casaroja.mp4'
};

// Orden fijo de las 12 recompensas (ID 1–12 en TouchDesigner / panel remoto).
window.HITO_RECOMPENSA_ORDER = Object.keys(window.HITO_VIDEO_BY_IMAGE);

function getRecompensaIdForImage(archivo) {
    const key = String(archivo || '').trim().toLowerCase();
    if (!key || !window.HITO_RECOMPENSA_ORDER) return 0;
    const idx = window.HITO_RECOMPENSA_ORDER.indexOf(key);
    return idx >= 0 ? idx + 1 : 0;
}

function hitoHasUnlockVideo(archivo) {
    return !!getHitoVideoSrcForImage(archivo);
}

function getHitoVideoSrcForImage(archivo) {
    const key = String(archivo || '').trim().toLowerCase();
    if (!key || !window.HITO_VIDEO_BY_IMAGE) return '';

    const file = window.HITO_VIDEO_BY_IMAGE[key];
    if (!file) return '';

    const base = window.HITO_VIDEO_BASE || './img/';
    return base + encodeURIComponent(file);
}
