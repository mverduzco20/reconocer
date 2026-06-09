/**
 * WebSocket bridge for pages without the full map (home, docs).
 * Forwards remote commands and navigates to map.html when needed.
 */
(function () {
    if (!window.RECONOCER_WS) return;

    const wsUrl = window.RECONOCER_WS.url;
    let ws;
    let lastSent = '';
    let lastSentAt = 0;

    function isMapPage() {
        return /map\.html?$/i.test(window.location.pathname);
    }

    function isDocsPage() {
        return /docs\/index\.html?$/i.test(window.location.pathname);
    }

    function pathTo(href) {
        return isDocsPage() ? '../' + href.replace(/^\.\//, '') : href;
    }

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

    function navigateToMap(payload) {
        queueMapCommand(payload);
        window.location.href = pathTo('./map.html');
    }

    function handlePayload(payload) {
        if (!payload || !payload.Pagina) return;
        const pagina = payload.Pagina;

        if (pagina === 'Home') {
            if (!/index\.html?$/i.test(window.location.pathname)) {
                window.location.href = pathTo('./index.html');
            }
            return;
        }

        if (pagina === 'Documentación') {
            if (!isDocsPage()) {
                window.location.href = pathTo('./docs/index.html');
            }
            return;
        }

        if (pagina === 'Mapa' || pagina === 'Hito' || pagina === 'Recompensa') {
            if (!isMapPage()) {
                navigateToMap(payload);
            }
        }
    }

    function connect() {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            if (!isMapPage()) {
                sendPayload({ Pagina: 'Home' });
            }
        };

        ws.onclose = () => setTimeout(connect, 3000);

        ws.onerror = () => ws.close();

        ws.onmessage = (event) => {
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', connect);
    } else {
        connect();
    }
})();
