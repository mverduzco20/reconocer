// WebSocket control (TouchDesigner / panel remoto)
// ─────────────────────────────────────────────
// WEBSOCKETS (TOUCHDESIGNER CONTROL)
// Panel remoto: RECONOCER_WS.remoteControlUrl (js/ws-config.js)
// ─────────────────────────────────────────────
const wsUrl = (window.RECONOCER_WS && window.RECONOCER_WS.url) || "wss://td-tests-b8ab469bdcc6.herokuapp.com";

function getMarkerWsId(marker) {
    const archivo = marker && marker._archivo ? String(marker._archivo).trim() : '';
    if (!archivo) return '';
    return archivo.replace(/\.[^.]+$/i, '').toLowerCase();
}

function markerHasRewardProjection(marker) {
    if (!marker) return false;
    const archivo = marker._archivo || '';
    return Boolean(marker._tienePremio) || isRewardVideoHito(archivo);
}

function buildMarkerWsPayload(marker, options) {
    const archivo = marker && marker._archivo ? String(marker._archivo).trim() : '';
    const wsId = getMarkerWsId(marker);
    const isReward = markerHasRewardProjection(marker);
    const payload = {
        Pagina: isReward ? 'Recompensa' : 'Hito',
        ID: wsId || marker._hitoId,
        Archivo: archivo
    };

    if (isReward && typeof getHitoVideoSrcForImage === 'function') {
        const videoSrc = getHitoVideoSrcForImage(archivo);
        if (videoSrc) {
            const videoName = decodeURIComponent(String(videoSrc).split('/').pop().split('?')[0]);
            payload.Video = videoName;
        }
    }

    if (options && options.unlock) {
        payload.Accion = 'Desbloquear';
    }

    return payload;
}

function findMarkerFromWsPayload(id, wantsRecompensa) {
    if (!hitosMarkers.length) return null;
    const raw = String(id == null ? '' : id).trim();
    if (!raw) return null;

    const stem = raw.toLowerCase();
    if (/^[meroe]\d+$/i.test(stem)) {
        const byStem = hitosMarkers.find(function (m) {
            return getMarkerWsId(m) === stem;
        });
        if (byStem) return byStem;
    }

    if (/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(stem)) {
        const byFile = hitosMarkers.find(function (m) {
            return String(m._archivo || '').toLowerCase() === stem;
        });
        if (byFile) return byFile;
    }

    const targetId = Number(raw);
    if (!Number.isFinite(targetId) || targetId <= 0) return null;

    return hitosMarkers.find(function (m) {
        return m._hitoId === targetId && Boolean(m._tienePremio) === Boolean(wantsRecompensa);
    }) || hitosMarkers.find(function (m) {
        return m._hitoId === targetId;
    }) || null;
}

function isWsEcho(rawMessage) {
    return Date.now() - lastWsSentAt < 150 && rawMessage === lastWsSent;
}

function connectWebSocket() {
    if (isEmbedMode()) {
        initEmbedMessageBridge();
        return;
    }

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log("[reconocer] WebSocket conectado");
        sendWsPayload({ Pagina: "Mapa", ID: "Completo" });
    };

    ws.onclose = () => {
        console.log("[reconocer] WebSocket desconectado, reconectando...");
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error("[reconocer] WebSocket error:", error);
        ws.close();
    };

    ws.onmessage = (event) => {
        if (isWsEcho(event.data)) return;
        let payload;
        try {
            payload = JSON.parse(event.data);
        } catch (e) {
            return;
        }
        handleRemotePayload(payload);
    };
}

function sendWsPayload(payload) {
    if (suppressWsSend) return;
    if (ws && ws.readyState === WebSocket.OPEN) {
        const body = JSON.stringify(payload);
        lastWsSent = body;
        lastWsSentAt = Date.now();
        console.log("[reconocer] Enviando payload:", payload);
        ws.send(body);
    }
}

function consumePendingRemoteCommand() {
    let raw = '';
    try {
        raw = sessionStorage.getItem('reconocerWsPending') || '';
        if (raw) sessionStorage.removeItem('reconocerWsPending');
    } catch (e) { /* ignore */ }
    if (!raw) return;
    try {
        handleRemotePayload(JSON.parse(raw));
    } catch (e) { /* ignore */ }
}

function handleRemotePayload(payload) {
    if (!payload || !payload.Pagina) return;
    const pagina = payload.Pagina;

    if (pagina === 'Home') {
        if (!isEmbedMode()) {
            window.location.href = './index.html';
        }
        return;
    }

    if (pagina === 'Documentación') {
        if (!isEmbedMode()) {
            window.location.href = './docs/index.html';
        }
        return;
    }

    if (pagina === 'Hito') {
        openRemoteMarker(payload.ID, false);
        return;
    }

    if (pagina === 'Recompensa') {
        openRemoteMarker(payload.ID, true);
        return;
    }

    if (pagina === 'Mapa') {
        applyRemoteMapaView(payload.ID || 'Completo');
    }
}

function openRemoteMarker(id, wantsRecompensa) {
    if (!mapInstance) return;

    const marker = findMarkerFromWsPayload(id, wantsRecompensa);
    if (!marker || !marker._popup) return;

    suppressWsSend = true;
    handleMarkerPopupClick(mapInstance, marker, marker._popup);
    suppressWsSend = false;
}

function wireMapNavigationLinks() {
    if (isEmbedMode()) return;
    document.querySelectorAll('.footer-link[href], .corner-logo[href]').forEach(function (link) {
        link.addEventListener('click', function () {
            const href = (link.getAttribute('href') || '').toLowerCase();
            if (href.includes('docs')) {
                sendWsPayload({ Pagina: 'Documentación' });
            } else if (href.includes('index.html')) {
                sendWsPayload({ Pagina: 'Home' });
            } else if (href.includes('map.html')) {
                sendWsPayload({ Pagina: 'Mapa', ID: 'Completo' });
            }
        });
    });
}

function applyRemoteMapaView(mapaId) {
    if (!mapInstance) return;
    const categoriesNav = document.getElementById('categories-nav');
    if (!categoriesNav) return;

    const catButtons = categoriesNav.querySelectorAll('.category-button');
    const targetCat = Object.prototype.hasOwnProperty.call(MAPA_VIEW_TO_CATEGORY, mapaId)
        ? MAPA_VIEW_TO_CATEGORY[mapaId]
        : null;

    catButtons.forEach(function (btn) {
        const cat = (btn.dataset.category || '').toLowerCase();
        if (targetCat === null) {
            btn.classList.remove('active');
        } else {
            btn.classList.toggle('active', cat === targetCat);
        }
    });

    const act = getActiveCategorySet(catButtons);

    if (getCurrentMapBgMode() === 'blue') {
        if (act.size === 0) {
            startMapBluePreviewLoop(mapInstance, { fitOverview: true });
            return;
        }

        stopMapBluePreviewLoop();
        const activeCat = act.values().next().value;
        const variant = MAP_BLUE_VARIANT_BY_CATEGORY[activeCat];
        if (variant) {
            mapBlueVariant = variant;
            scheduleBlueMapVariantApply(mapInstance, true);
        }
    }

    updateMarkersFilter(mapInstance, hitosMarkers, act);
    if (act.size > 0) {
        scheduleMapFitToFilteredMarkers(mapInstance, hitosMarkers, act);
    }
}

