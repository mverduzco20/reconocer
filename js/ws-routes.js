/**
 * Rutas y detección de página para WebSocket (home / docs / mapa).
 */
(function () {
    function getPageKind() {
        const path = window.location.pathname.replace(/\/$/, '');
        if (/\/map\.html$/i.test(path)) return 'map';
        if (/\/docs(\/index\.html)?$/i.test(path) || /\/docs$/i.test(path)) return 'docs';
        return 'home';
    }

    function sitePath(target) {
        const fromDocs = getPageKind() === 'docs';
        const paths = {
            home: './index.html',
            docs: './docs/index.html',
            map: './map.html'
        };
        const href = paths[target] || paths.home;
        return fromDocs ? '../' + href.replace(/^\.\//, '') : href;
    }

    function pageOpenPayload(kind) {
        if (kind === 'docs') return { Pagina: 'Documentación' };
        if (kind === 'map') return { Pagina: 'Mapa', ID: 'Completo' };
        return { Pagina: 'Home' };
    }

    window.RECONOCER_WS_ROUTES = Object.freeze({
        getPageKind: getPageKind,
        sitePath: sitePath,
        pageOpenPayload: pageOpenPayload
    });
})();
