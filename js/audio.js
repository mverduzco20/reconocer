/** Stub legacy: el audio ambiente fue eliminado. Volumen solo en reward-video-audio.js */
(function () {
    var audio = document.getElementById('global-audio');
    if (audio) {
        try {
            audio.pause();
            audio.removeAttribute('src');
            audio.querySelectorAll('source').forEach(function (source) {
                source.remove();
            });
            audio.load();
        } catch (e) { /* ignore */ }
    }
    window.reconocerMutePageAudio = function () {};
})();
