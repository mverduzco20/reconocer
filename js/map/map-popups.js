// Popup wiring (video unlock + retry)
function wirePopupUnlockVideo(map, popup, marker) {
    const archivo = marker && marker._archivo ? marker._archivo : '';
    const videoSrc = typeof getHitoVideoSrcForImage === 'function'
        ? getHitoVideoSrcForImage(archivo)
        : '';
    if (!videoSrc) return;

    const root = popup.getElement && popup.getElement();
    if (!root) return;

    const unlockBtn = root.querySelector('.popup-unlock:not(.popup-unlock--retry)');
    const inner = root.querySelector('.popup-inner');
    const panel = root.querySelector('.popup-video-panel');
    const video = root.querySelector('.popup-video');
    if (!unlockBtn || !inner || !panel || !video) return;

    unlockBtn.classList.add('popup-unlock--interactive');
    unlockBtn.setAttribute('role', 'button');
    unlockBtn.setAttribute('tabindex', '0');
    unlockBtn.setAttribute('aria-label', 'Desbloquear video');

    function revealVideo(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (inner.classList.contains('popup-inner--video-open')) return;

        inner.classList.add('popup-inner--video-open');
        inner.style.gridTemplateRows = POPUP_UNLOCK_HEIGHT + 'px ' + POPUP_IMG_SIZE + 'px ' + POPUP_VIDEO_HEIGHT + 'px';
        inner.style.height = (POPUP_HEIGHT + POPUP_VIDEO_HEIGHT) + 'px';
        panel.removeAttribute('hidden');

        const recompensaPayload = buildRecompensaWsPayload(marker);
        if (recompensaPayload) sendWsPayload(recompensaPayload);

        if (typeof window.reconocerApplyRewardVideoVolume === 'function') {
            window.reconocerApplyRewardVideoVolume(video);
        } else {
            video.muted = false;
            video.volume = 1;
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }

        window.requestAnimationFrame(function () {
            activateRewardVideoView(map, marker, popup);
        });
    }

    unlockBtn.addEventListener('click', revealVideo);
    unlockBtn.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            revealVideo(event);
        }
    });
}

function wirePopupRetryImage(popup, marker) {
    const archivo = marker && marker._archivo ? marker._archivo : '';
    const videoSrc = typeof getHitoVideoSrcForImage === 'function'
        ? getHitoVideoSrcForImage(archivo)
        : '';
    if (videoSrc) return;

    const root = popup.getElement && popup.getElement();
    if (!root) return;

    const unlockBtn = root.querySelector('.popup-unlock:not(.popup-unlock--retry)');
    const inner = root.querySelector('.popup-inner');
    const retryBtn = root.querySelector('.popup-unlock--retry');
    if (!unlockBtn || !inner || !retryBtn) return;

    unlockBtn.classList.add('popup-unlock--interactive');
    unlockBtn.setAttribute('role', 'button');
    unlockBtn.setAttribute('tabindex', '0');
    unlockBtn.setAttribute('aria-label', 'Desbloquear');

    function revealRetry(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (inner.classList.contains('popup-inner--retry-open')) return;

        inner.classList.add('popup-inner--retry-open');
        inner.style.gridTemplateRows = POPUP_UNLOCK_HEIGHT + 'px ' + POPUP_IMG_SIZE + 'px ' + POPUP_UNLOCK_HEIGHT + 'px';
        inner.style.height = (POPUP_HEIGHT + POPUP_UNLOCK_HEIGHT) + 'px';
        retryBtn.removeAttribute('hidden');

        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                retryBtn.classList.add('popup-unlock--retry--shown');
            });
        });
    }

    unlockBtn.addEventListener('click', revealRetry);
    unlockBtn.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            revealRetry(event);
        }
    });
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

function stylePopupCloseButton(popup, categoria) {
    const root = popup.getElement && popup.getElement();
    if (!root) return;

    const closeBtn = root.querySelector('.mapboxgl-popup-close-button');
    if (!closeBtn) return;

    const content = root.querySelector('.mapboxgl-popup-content');
    const bg = isRefugioCategory(categoria)
        ? hexToRgba(REFUGIO_PANEL_COLOR, REFUGIO_PANEL_ALPHA)
        : getCategoryColor(categoria);

    closeBtn.style.backgroundColor = bg;
    closeBtn.style.color = '#ffffff';

    if (content) {
        content.style.setProperty('--popup-text-width', POPUP_TEXT_WIDTH + 'px');
        content.style.setProperty('--popup-close-bg', bg);
    }
}

function trackPopupClose(popup, entry) {
    const onClose = () => {
        popup.off('close', onClose);
        if (mapInstance && entry.marker && isRewardVideoHito(entry.marker._archivo)) {
            clearRewardPopupZoom(mapInstance, popup);
        } else {
            pausePopupVideos(popup);
        }
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

    // WebSockets: Hito = misma imagen que el popup (fila CSV 1–94)
    sendWsPayload(buildHitoWsPayload(marker));

    if (openPopupEntries.length >= MAX_OPEN_POPUPS) {
        closeAllOpenPopups();
    }

    if (popup.isOpen && popup.isOpen()) {
        popup.remove();
    }

    refreshMarkerPopupHtml(marker);
    popup.setLngLat(marker.getLngLat()).addTo(map);
    const entry = { marker, popup };
    openPopupEntries.push(entry);
    trackPopupClose(popup, entry);

    window.setTimeout(function () {
        stylePopupCloseButton(popup, marker._categoria);
        wirePopupUnlockVideo(map, popup, marker);
        wirePopupRetryImage(popup, marker);
        panPopupIntoView(map, popup);
    }, 50);
}

