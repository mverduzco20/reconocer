/** Enlaces e iframe del mapa siempre apuntan al build actual (GitHub Pages / visitantes públicos). */
(function () {
    function currentBuild() {
        return window.RECONOCER_BUILD || String(Date.now());
    }

    function mapPageUrl(relativePath) {
        const base = relativePath || './map.html';
        return base + '?v=' + encodeURIComponent(currentBuild());
    }

    function initPublicMapLinks() {
        const build = currentBuild();

        const homeIframe = document.getElementById('map-iframe');
        if (homeIframe) {
            homeIframe.src = mapPageUrl('./map.html') + '&embed=1';
        }

        const docsIframe = document.getElementById('docs-map-iframe');
        if (docsIframe) {
            docsIframe.src = mapPageUrl('../map.html') + '&embed=1';
        }

        document.querySelectorAll('a[href*="map.html"]').forEach(function (link) {
            const href = link.getAttribute('href') || '';
            if (!href.includes('map.html')) return;
            const prefix = href.slice(0, href.indexOf('map.html'));
            link.setAttribute('href', prefix + 'map.html?v=' + encodeURIComponent(build));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPublicMapLinks);
    } else {
        initPublicMapLinks();
    }
})();
