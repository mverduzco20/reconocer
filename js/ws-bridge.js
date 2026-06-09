/**
 * WebSocket bridge: home, documentación y navegación entre páginas.
 * Reenvía comandos al mapa embebido (iframe) cuando aplica.
 */
(function () {
    if (!window.RECONOCER_WS || !window.RECONOCER_WS_ROUTES) return;

    const wsUrl = window.RECONOCER_WS.url;
    const routes = window.RECONOCER_WS_ROUTES;
    let ws;
    let lastSent = '';
    let lastSentAt = 0;

    function sendPayload(payload) {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const body = JSON.stringify(payload);
        lastSent = body;
        lastSentAt = Date.now();
        ws.send(body);
    }

    function queueMapCommand(payload) {
        try {
            sessionStorage.setItem('reconocerWsPending', JSON.stringify(payload));
        } catch (e) { /* ignore */ }
    }

    function getMapIframe() {
        return document.getElementById('map-iframe')
            || document.getElementById('docs-map-iframe');
    }

    function forwardToMapIframe(payload) {
        const iframe = getMapIframe();
        if (!iframe || !iframe.contentWindow) return false;
        iframe.contentWindow.postMessage({ type: 'reconocer-ws', payload: payload }, '*');
        return true;
    }

    function scrollToMapSection() {
        const section = document.getElementById('map-preview')
            || document.getElementById('docs-preview');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function navigateToMap(payload) {
        queueMapCommand(payload);
        window.location.href = routes.sitePath('map');
    }

    function handleMapCommand(payload) {
        const kind = routes.getPageKind();
        if (kind === 'home' || kind === 'docs') {
            if (forwardToMapIframe(payload)) {
                scrollToMapSection();
                return;
            }
        }
        if (kind !== 'map') {
            navigateToMap(payload);
        }
    }

    function handlePayload(payload) {
        if (!payload || !payload.Pagina) return;
        const pagina = payload.Pagina;
        const kind = routes.getPageKind();

        if (pagina === 'Home') {
            if (kind !== 'home') {
                window.location.href = routes.sitePath('home');
            }
            return;
        }

        if (pagina === 'Documentación') {
            if (kind !== 'docs') {
                window.location.href = routes.sitePath('docs');
            }
            return;
        }

        if (pagina === 'Mapa' || pagina === 'Hito' || pagina === 'Recompensa') {
            handleMapCommand(payload);
        }
    }

    function wireNavigationLinks() {
        document.querySelectorAll('.footer-link[href], .corner-logo[href]').forEach(function (link) {
            link.addEventListener('click', function () {
                const href = (link.getAttribute('href') || '').toLowerCase();
                if (href.includes('docs')) {
                    sendPayload({ Pagina: 'Documentación' });
                } else if (href.includes('map.html')) {
                    sendPayload({ Pagina: 'Mapa', ID: 'Completo' });
                } else if (href.includes('index.html')) {
                    sendPayload({ Pagina: 'Home' });
                }
            });
        });
    }

    function connect() {
        ws = new WebSocket(wsUrl);

        ws.onopen = function () {
            const kind = routes.getPageKind();
            if (kind !== 'map') {
                sendPayload(routes.pageOpenPayload(kind));
            }
        };

        ws.onclose = function () {
            setTimeout(connect, 3000);
        };

        ws.onerror = function () {
            ws.close();
        };

        ws.onmessage = function (event) {
            if (Date.now() - lastSentAt < 150 && event.data === lastSent) return;
            let payload;
            try {
                payload = JSON.parse(event.data);
            } catch (e) {
                return;
            }
            handlePayload(payload);
        };
    }

    function init() {
        wireNavigationLinks();
        connect();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
