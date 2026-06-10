// WebSocket control (TouchDesigner / panel remoto)
// ─────────────────────────────────────────────
// WEBSOCKETS (TOUCHDESIGNER CONTROL)
// Panel remoto: RECONOCER_WS.remoteControlUrl (js/ws-config.js)
// TD espera: Hito ID = fila CSV (1–94), Recompensa ID = video (1–12)
// ─────────────────────────────────────────────
const wsUrl = (window.RECONOCER_WS && window.RECONOCER_WS.url) || "wss://td-tests-b8ab469bdcc6.herokuapp.com";

function getMarkerWsId(marker) {
    const archivo = marker && marker._archivo ? String(marker._archivo).trim() : '';
    if (!archivo) return '';
    return archivo.replace(/\.[^.]+$/i, '').toLowerCase();
}

/** Imagen del hito — misma que abre el popup en la web (fila del CSV). */
function buildHitoWsPayload(marker) {
    const archivo = marker && marker._archivo ? String(marker._archivo).trim() : '';
    return {
        Pagina: 'Hito',
        ID: marker && marker._hitoRowId ? marker._hitoRowId : 0,
        Archivo: archivo
    };
}

/** Video de recompensa — ID 1–12 según hito-videos.js (solo al desbloquear). */
function buildRecompensaWsPayload(marker) {
    const archivo = marker && marker._archivo ? String(marker._archivo).trim() : '';
    const rewardId = typeof getRecompensaIdForImage === 'function'
        ? getRecompensaIdForImage(archivo)
        : 0;
    if (!rewardId) return null;

    const payload = {
        Pagina: 'Recompensa',
        ID: rewardId,
        Archivo: archivo
    };

    if (typeof getHitoVideoSrcForImage === 'function') {
        const videoSrc = getHitoVideoSrcForImage(archivo);
        if (videoSrc) {
            payload.Video = decodeURIComponent(String(videoSrc).split('/').pop().split('?')[0]);
        }
    }

    return payload;
}

function findMarkerFromWsPayload(id, pagina) {
    if (!hitosMarkers.length) return null;
    const raw = String(id == null ? '' : id).trim();
    if (!raw) return null;

    const num = Number(raw);
    if (Number.isFinite(num) && num > 0) {
        if (pagina === 'Recompensa' && num <= 12) {
            const byReward = hitosMarkers.find(function (m) {
                return typeof getRecompensaIdForImage === 'function'
                    && getRecompensaIdForImage(m._archivo) === num;
            });
            if (byReward) return byReward;
        }

        const byRow = hitosMarkers.find(function (m) {
            return m._hitoRowId === num;
        });
        if (byRow) return byRow;
    }

    const stem = raw.toLowerCase();
    if (/^[meroe]\d+$/i.test(stem)) {
        return hitosMarkers.find(function (m) {
            return getMarkerWsId(m) === stem;
        }) || null;
    }

    if (/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(stem)) {
        return hitosMarkers.find(function (m) {
            return String(m._archivo || '').toLowerCase() === stem;
        }) || null;
    }

    return null;
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
    if (!payload || !payload.Pagina) return;

    if (isEmbedMode()) {
        console.log("[reconocer] Enviando payload (embed→parent):", payload);
        window.parent.postMessage({ type: 'reconocer-ws-send', payload: payload }, '*');
        return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
        const body = JSON.stringify(payload);
        lastWsSent = body;
        lastWsSentAt = Date.now();
        console.log("[reconocer] Enviando payload:", payload);
        ws.send(body);
    } else {
        console.warn("[reconocer] WebSocket no conectado, no se envió:", payload);
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

    if (pagina === 'Hito' || pagina === 'Recompensa') {
        openRemoteMarker(payload.ID, pagina);
        return;
    }

    if (pagina === 'Mapa') {
        applyRemoteMapaView(payload.ID || 'Completo');
    }
}

function openRemoteMarker(id, pagina) {
    if (!mapInstance) return;

    const marker = findMarkerFromWsPayload(id, pagina);
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
