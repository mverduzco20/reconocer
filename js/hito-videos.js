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
