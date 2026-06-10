/** Parche público: garantiza e8 → casaroja aunque el navegador tenga caché vieja. */
(function () {
    if (!window.HITO_VIDEO_BY_IMAGE) return;
    window.HITO_VIDEO_BY_IMAGE['e8.jpg'] = 'casaroja.mp4';
    delete window.HITO_VIDEO_BY_IMAGE['r7.jpg'];
    window.HITO_RECOMPENSA_ORDER = Object.keys(window.HITO_VIDEO_BY_IMAGE);
})();
