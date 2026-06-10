/** Control de volumen del footer — solo videos de recompensa en el mapa. */
(function () {
    const volumeSlider = document.getElementById('volume-slider');
    if (!volumeSlider) return;

    const STORAGE_VOLUME = 'rewardVideoVolume';
    const STORAGE_LAST_VOLUME = 'rewardVideoLastVolume';

    function getLastAudibleVolume() {
        const last = parseFloat(localStorage.getItem(STORAGE_LAST_VOLUME) || '1');
        return Number.isNaN(last) || last <= 0 ? 1 : last;
    }

    function getRewardVideos() {
        return Array.from(document.querySelectorAll('.popup-video'));
    }

    function applyVolumeToVideos(volume) {
        const audible = volume > 0;
        getRewardVideos().forEach(function (video) {
            video.muted = !audible;
            video.volume = audible ? volume : getLastAudibleVolume();
        });
    }

    function applyVolume(val, persist) {
        const volume = Math.max(0, Math.min(1, val));
        if (volume === 0) {
            applyMuteUI(persist);
            return 0;
        }
        volumeSlider.value = String(volume);
        volumeSlider.classList.add('active');
        applyVolumeToVideos(volume);
        if (persist !== false) {
            localStorage.setItem(STORAGE_VOLUME, String(volume));
            localStorage.setItem(STORAGE_LAST_VOLUME, String(volume));
        }
        return volume;
    }

    function applyMuteUI(persist) {
        const last = getLastAudibleVolume();
        volumeSlider.value = '0.5';
        volumeSlider.classList.remove('active');
        getRewardVideos().forEach(function (video) {
            video.muted = true;
            video.volume = last;
        });
        if (persist !== false) {
            localStorage.setItem(STORAGE_VOLUME, '0');
        }
    }

    function restoreSavedVolume() {
        const saved = parseFloat(localStorage.getItem(STORAGE_VOLUME) || '1');
        if (!Number.isNaN(saved) && saved > 0) {
            applyVolume(saved, false);
        } else {
            applyMuteUI(false);
        }
    }

    window.reconocerApplyRewardVideoVolume = function (video) {
        if (!video) return;
        const saved = parseFloat(localStorage.getItem(STORAGE_VOLUME) || '1');
        const volume = !Number.isNaN(saved) && saved > 0 ? saved : getLastAudibleVolume();
        video.muted = volume <= 0;
        video.volume = volume > 0 ? volume : getLastAudibleVolume();
        if (volume > 0) {
            volumeSlider.value = String(volume);
            volumeSlider.classList.add('active');
        }
    };

    window.reconocerMutePageAudio = function () {
        applyMuteUI();
    };

    restoreSavedVolume();

    let lastVolumeBeforeMute = getLastAudibleVolume();
    let sliderClickStartX = 0;
    let sliderDidMove = false;
    let mutedAtPointerDown = false;

    volumeSlider.addEventListener('pointerdown', function (e) {
        mutedAtPointerDown = !volumeSlider.classList.contains('active');
        if (!mutedAtPointerDown) {
            lastVolumeBeforeMute = parseFloat(volumeSlider.value);
        }
        sliderClickStartX = e.clientX;
        sliderDidMove = false;
    });

    volumeSlider.addEventListener('pointermove', function (e) {
        if (Math.abs(e.clientX - sliderClickStartX) > 4) {
            sliderDidMove = true;
        }
    });

    volumeSlider.addEventListener('input', function (e) {
        e.stopPropagation();
        const val = applyVolume(parseFloat(this.value));
        if (val > 0) {
            lastVolumeBeforeMute = val;
        }
    });

    volumeSlider.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sliderDidMove) return;
        e.preventDefault();
        if (!mutedAtPointerDown) {
            applyMuteUI();
        } else {
            applyVolume(lastVolumeBeforeMute || getLastAudibleVolume());
        }
    });
})();
