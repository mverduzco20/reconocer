// Reward video zoom and popup unlock
// ─────────────────────────────────────────────
// MARCADORES
// ─────────────────────────────────────────────

function closeAllOpenPopups() {
    const entries = [...openPopupEntries];
    openPopupEntries.length = 0;
    entries.forEach(function (entry) {
        if (mapInstance && isRewardVideoHito(entry.marker._archivo)) {
            clearRewardPopupZoom(mapInstance, entry.popup);
        } else {
            pausePopupVideos(entry.popup);
        }
        entry.popup.remove();
    });
}

function isRewardVideoHito(archivo) {
    return typeof hitoHasUnlockVideo === 'function' && hitoHasUnlockVideo(archivo);
}

function ensureMapZoomFadeEl() {
    const fade = document.getElementById('map-zoom-fade');
    if (!fade) return null;
    if (fade.parentElement !== document.body) {
        document.body.appendChild(fade);
    }
    return fade;
}

function showRewardMapFade() {
    const fade = ensureMapZoomFadeEl();
    if (!fade) return;

    if (rewardMapFadePulseTimer) {
        window.clearTimeout(rewardMapFadePulseTimer);
        rewardMapFadePulseTimer = null;
    }

    fade.classList.remove('is-pulse');
    fade.classList.add('is-active', 'is-flash');

    rewardMapFadePulseTimer = window.setTimeout(function () {
        fade.classList.remove('is-flash');
        fade.classList.add('is-pulse');
        rewardMapFadePulseTimer = null;
    }, 1150);
}

function hideRewardMapFade() {
    const fade = document.getElementById('map-zoom-fade');
    if (!fade) return;

    if (rewardMapFadePulseTimer) {
        window.clearTimeout(rewardMapFadePulseTimer);
        rewardMapFadePulseTimer = null;
    }

    fade.classList.remove('is-active', 'is-flash', 'is-pulse');
}

function showRewardZoomHint() {
    const hint = document.getElementById('map-zoom-hint');
    if (!hint) return;
    if (hint.parentElement !== document.body) {
        document.body.appendChild(hint);
    }
    hint.classList.add('is-visible');
    hint.setAttribute('aria-hidden', 'false');
    if (rewardHitoZoomHintTimer) clearTimeout(rewardHitoZoomHintTimer);
    rewardHitoZoomHintTimer = window.setTimeout(hideRewardZoomHint, 14000);
}

function hideRewardZoomHint() {
    const hint = document.getElementById('map-zoom-hint');
    if (!hint) return;
    hint.classList.remove('is-visible');
    hint.setAttribute('aria-hidden', 'true');
    if (rewardHitoZoomHintTimer) {
        clearTimeout(rewardHitoZoomHintTimer);
        rewardHitoZoomHintTimer = null;
    }
}

const REWARD_MAP_LOCK_HANDLERS = [
    'scrollZoom', 'boxZoom', 'doubleClickZoom', 'touchZoomRotate', 'dragPan', 'dragRotate'
];

function rewardWheelScaleDelta(event) {
    let dy = event.deltaY;
    if (event.deltaMode === 1) dy *= 16;
    if (event.deltaMode === 2) dy *= window.innerHeight;
    return -dy * 0.0042;
}

function clampRewardPopupScale(scale) {
    return Math.min(REWARD_POPUP_SCALE_MAX, Math.max(REWARD_POPUP_SCALE_MIN, scale));
}

function getRewardViewportBounds() {
    return {
        left: REWARD_VIEWPORT_PADDING.left,
        top: REWARD_VIEWPORT_PADDING.top,
        right: window.innerWidth - REWARD_VIEWPORT_PADDING.right,
        bottom: window.innerHeight - REWARD_VIEWPORT_PADDING.bottom
    };
}

function getRewardPopupTransformEl(popupEl) {
    return popupEl ? popupEl.querySelector('.mapboxgl-popup-content') : null;
}

function applyRewardPopupTransform(popupEl, scale, tx, ty) {
    const content = getRewardPopupTransformEl(popupEl);
    if (!content) return;
    content.style.transformOrigin = '50% 50%';
    content.style.transform = 'translate(' + tx.toFixed(1) + 'px, ' + ty.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
}

function centerRewardPopupInViewport(popupEl) {
    const content = getRewardPopupTransformEl(popupEl);
    if (!content) return;

    rewardVideoPopupTranslateX = 0;
    rewardVideoPopupTranslateY = 0;
    applyRewardPopupTransform(popupEl, REWARD_POPUP_SCALE_MIN, 0, 0);

    const rect = content.getBoundingClientRect();
    const viewport = getRewardViewportBounds();
    const targetCenterX = (viewport.left + viewport.right) * 0.5;
    const targetCenterY = (viewport.top + viewport.bottom) * 0.5;

    rewardVideoPopupTranslateX = targetCenterX - (rect.left + rect.width * 0.5);
    rewardVideoPopupTranslateY = targetCenterY - (rect.top + rect.height * 0.5);
}

function fitRewardVideoInViewport(popupEl, desiredScale) {
    const content = getRewardPopupTransformEl(popupEl);
    if (!content) return desiredScale;

    const viewport = getRewardViewportBounds();
    let scale = clampRewardPopupScale(desiredScale);
    let tx = rewardVideoPopupTranslateX;
    let ty = rewardVideoPopupTranslateY;

    for (let attempt = 0; attempt < 28; attempt++) {
        applyRewardPopupTransform(popupEl, scale, tx, ty);
        const rect = content.getBoundingClientRect();

        const shiftLeft = viewport.left - rect.left;
        const shiftRight = rect.right - viewport.right;
        const shiftTop = viewport.top - rect.top;
        const shiftBottom = rect.bottom - viewport.bottom;
        const hasOverflow = shiftLeft > 0 || shiftRight > 0 || shiftTop > 0 || shiftBottom > 0;

        if (!hasOverflow) break;

        if (shiftLeft > 0) tx += shiftLeft;
        if (shiftRight > 0) tx -= shiftRight;
        if (shiftTop > 0) ty += shiftTop;
        if (shiftBottom > 0) ty -= shiftBottom;

        applyRewardPopupTransform(popupEl, scale, tx, ty);
        const fittedRect = content.getBoundingClientRect();
        const stillOverflow =
            fittedRect.left < viewport.left - 0.5 ||
            fittedRect.right > viewport.right + 0.5 ||
            fittedRect.top < viewport.top - 0.5 ||
            fittedRect.bottom > viewport.bottom + 0.5;

        if (stillOverflow && scale > REWARD_POPUP_SCALE_MIN + 0.02) {
            scale = Math.max(REWARD_POPUP_SCALE_MIN, scale - 0.035);
            tx *= 0.9;
            ty *= 0.9;
        } else if (!stillOverflow) {
            break;
        }
    }

    rewardVideoPopupTranslateX = tx;
    rewardVideoPopupTranslateY = ty;
    return scale;
}

function applyRewardPopupScale(popupEl, scale) {
    if (!popupEl) return scale;
    const fittedScale = fitRewardVideoInViewport(popupEl, scale);
    rewardVideoPopupScale = fittedScale;
    return fittedScale;
}

function stopRewardPopupScaleAnimation() {
    if (rewardPopupScaleAnimRaf) {
        window.cancelAnimationFrame(rewardPopupScaleAnimRaf);
        rewardPopupScaleAnimRaf = null;
    }
}

function syncRewardPopupScaleTargetToFit() {
    if (!rewardPopupZoomPopupEl) return;
    const fitted = applyRewardPopupScale(rewardPopupZoomPopupEl, rewardVideoPopupScale);
    if (fitted < rewardVideoPopupScaleTarget) {
        rewardVideoPopupScaleTarget = fitted;
    }
}

function tickRewardPopupScaleAnimation() {
    const diff = rewardVideoPopupScaleTarget - rewardVideoPopupScale;
    if (Math.abs(diff) < 0.002) {
        rewardVideoPopupScale = applyRewardPopupScale(rewardPopupZoomPopupEl, rewardVideoPopupScaleTarget);
        rewardPopupScaleAnimRaf = null;
        return;
    }

    const nextScale = rewardVideoPopupScale + diff * 0.16;
    const fitted = applyRewardPopupScale(rewardPopupZoomPopupEl, nextScale);
    if (fitted < rewardVideoPopupScaleTarget - 0.002) {
        rewardVideoPopupScaleTarget = fitted;
    }
    rewardPopupScaleAnimRaf = window.requestAnimationFrame(tickRewardPopupScaleAnimation);
}

function setRewardPopupScaleTarget(scale, animate) {
    rewardVideoPopupScaleTarget = clampRewardPopupScale(scale);
    if (!animate) {
        stopRewardPopupScaleAnimation();
        rewardVideoPopupScale = applyRewardPopupScale(rewardPopupZoomPopupEl, rewardVideoPopupScaleTarget);
        rewardVideoPopupScaleTarget = rewardVideoPopupScale;
        return;
    }
    if (!rewardPopupScaleAnimRaf) {
        rewardPopupScaleAnimRaf = window.requestAnimationFrame(tickRewardPopupScaleAnimation);
    }
}

function lockMapForRewardZoom(map) {
    if (!map || rewardMapLockedForZoom) return;
    rewardMapLockedForZoom = true;
    REWARD_MAP_LOCK_HANDLERS.forEach(function (name) {
        if (map[name]) map[name].disable();
    });
}

function unlockMapForRewardZoom(map) {
    if (!map || !rewardMapLockedForZoom) return;
    rewardMapLockedForZoom = false;
    REWARD_MAP_LOCK_HANDLERS.forEach(function (name) {
        if (map[name]) map[name].enable();
    });
}

function resetRewardVideoPopupFromEl(popupEl) {
    if (!popupEl) return;

    const inner = popupEl.querySelector('.popup-inner');
    const panel = popupEl.querySelector('.popup-video-panel');
    const video = popupEl.querySelector('.popup-video');

    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    if (panel) panel.setAttribute('hidden', '');
    const content = popupEl.querySelector('.mapboxgl-popup-content');
    if (content) {
        content.style.transform = '';
        content.style.transformOrigin = '';
        content.style.transition = '';
    }
    if (inner) {
        inner.classList.remove('popup-inner--video-open');
        inner.style.gridTemplateRows = '';
        inner.style.height = '';
        inner.style.transform = '';
        inner.style.transformOrigin = '';
    }
    popupEl.classList.remove('category-popup--reward-zoom');
    rewardVideoPopupTranslateX = 0;
    rewardVideoPopupTranslateY = 0;
}

function resetRewardVideoPopup(popup) {
    const popupEl = popup && popup.getElement ? popup.getElement() : null;
    resetRewardVideoPopupFromEl(popupEl);
}

function clearRewardPopupZoom(map, popup) {
    rewardVideoZoomActive = false;
    rewardVideoPopupScale = 1;
    rewardVideoPopupScaleTarget = 1;
    rewardVideoPopupTranslateX = 0;
    rewardVideoPopupTranslateY = 0;
    stopRewardPopupScaleAnimation();
    hideRewardZoomHint();
    hideRewardMapFade();

    if (rewardPopupWheelHandler) {
        window.removeEventListener('wheel', rewardPopupWheelHandler, true);
    }
    rewardPopupWheelHandler = null;

    if (rewardPopupResizeHandler) {
        window.removeEventListener('resize', rewardPopupResizeHandler);
    }
    rewardPopupResizeHandler = null;

    const popupEl = (popup && popup.getElement && popup.getElement())
        || rewardPopupZoomPopupEl;
    resetRewardVideoPopupFromEl(popupEl);
    rewardPopupZoomPopupEl = null;

    unlockMapForRewardZoom(map);
}

function bindRewardPopupZoom(map, popup, marker) {
    clearRewardPopupZoom(map);
    if (!map || !popup || !marker || !isRewardVideoHito(marker._archivo)) return;

    const popupEl = popup.getElement && popup.getElement();
    if (!popupEl) return;

    rewardVideoZoomActive = true;
    rewardVideoPopupScale = REWARD_POPUP_SCALE_MIN;
    rewardVideoPopupScaleTarget = REWARD_POPUP_SCALE_MIN;
    rewardPopupZoomPopupEl = popupEl;
    popupEl.classList.add('category-popup--reward-zoom');
    lockMapForRewardZoom(map);

    rewardPopupWheelHandler = function (event) {
        if (!rewardVideoZoomActive || !rewardPopupZoomPopupEl) return;
        event.preventDefault();
        event.stopImmediatePropagation();

        const delta = rewardWheelScaleDelta(event) || (event.deltaY < 0 ? REWARD_POPUP_SCALE_STEP : -REWARD_POPUP_SCALE_STEP);
        setRewardPopupScaleTarget(rewardVideoPopupScaleTarget + delta, true);

        if (rewardVideoPopupScaleTarget > REWARD_POPUP_UNLOCK_SCALE + 0.04) {
            hideRewardZoomHint();
        }
    };

    window.addEventListener('wheel', rewardPopupWheelHandler, { passive: false, capture: true });

    rewardPopupResizeHandler = function () {
        if (!rewardVideoZoomActive || !rewardPopupZoomPopupEl) return;
        centerRewardPopupInViewport(rewardPopupZoomPopupEl);
        syncRewardPopupScaleTargetToFit();
    };
    window.addEventListener('resize', rewardPopupResizeHandler);
}

function animateRewardPopupZoomIn(popupEl) {
    if (!popupEl) return;
    setRewardPopupScaleTarget(REWARD_POPUP_SCALE_MIN, false);
    window.requestAnimationFrame(function () {
        setRewardPopupScaleTarget(REWARD_POPUP_UNLOCK_SCALE, true);
    });
}

function animateRewardPopupCenterThenZoom(popupEl) {
    if (!popupEl) return;
    const content = getRewardPopupTransformEl(popupEl);
    if (content) content.style.transition = 'transform 0.6s ease';

    centerRewardPopupInViewport(popupEl);
    applyRewardPopupTransform(
        popupEl,
        REWARD_POPUP_SCALE_MIN,
        rewardVideoPopupTranslateX,
        rewardVideoPopupTranslateY
    );

    window.setTimeout(function () {
        if (content) content.style.transition = '';
        animateRewardPopupZoomIn(popupEl);
    }, 620);
}

function activateRewardVideoView(map, marker, popup) {
    if (!map || !marker || !isRewardVideoHito(marker._archivo)) return;

    const popupEl = popup.getElement && popup.getElement();
    if (!popupEl) return;

    console.log('[reconocer] reward video unlock:', marker._archivo, 'build:', RECONOCER_MAP_BUILD);

    showRewardMapFade();
    bindRewardPopupZoom(map, popup, marker);
    showRewardZoomHint();

    window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
            animateRewardPopupCenterThenZoom(popupEl);
        });
    });
}

function pausePopupVideos(popup) {
    const root = popup && popup.getElement && popup.getElement();
    if (!root) return;
    root.querySelectorAll('.popup-video').forEach(function (video) {
        video.pause();
        video.currentTime = 0;
    });
}

function removePopupEntry(popup) {
    const idx = openPopupEntries.findIndex(entry => entry.popup === popup);
    if (idx >= 0) {
        const entry = openPopupEntries[idx];
        if (mapInstance && isRewardVideoHito(entry.marker._archivo)) {
            clearRewardPopupZoom(mapInstance, entry.popup);
        } else {
            pausePopupVideos(entry.popup);
        }
        entry.popup.remove();
        openPopupEntries.splice(idx, 1);
    }
}

