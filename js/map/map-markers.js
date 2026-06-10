// Markers, filters, and category UI
function agregarMarcador(map, row, markers, indices = {}) {
    const archivo = String(indices.archivo >= 0 ? row[indices.archivo] : row[0] || '').trim();
    const lat = parseFloat(indices.lat >= 0 ? row[indices.lat] : row[1]);
    const lng = parseFloat(indices.lng >= 0 ? row[indices.lng] : row[2]);
    const categoriaRaw = findRowCategory(row, indices);
    const relatoRaw = indices.relato >= 0 ? row[indices.relato] : row[row.length - 1];

    const premioRaw = indices.premio >= 0 ? row[indices.premio] : '';
    const tienePremio = String(premioRaw).toLowerCase().trim() === 'si';
    
    let hitoId = 0;
    if (indices.id >= 0 && row[indices.id]) {
        hitoId = parseInt(row[indices.id], 10);
    } else {
        const match = archivo.match(/\d+/);
        if (match) hitoId = parseInt(match[0], 10);
    }

    if (!archivo || isNaN(lat) || isNaN(lng)) return;

    const categoria = String(categoriaRaw || '')
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .charAt(0); // m, e, r, o

    const relato = String(relatoRaw || '').trim().replace(/^['"]|['"]$/g, '');
    const imageUrl = `./img/${encodeURIComponent(archivo)}`;
    const extension = archivo.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'];
    const isImage = imageExtensions.includes(extension);
    const previewUrl = isImage ? imageUrl : 'https://placehold.co/120x120?text=NO+IMG';
    const el = document.createElement('img');
    el.src = previewUrl;
    el.alt = archivo;
    el.width = 66;
    el.height = 66;
    el.className = 'marker';
    el.title = archivo;
    el.style.cursor = 'pointer';
    el.onerror = () => el.src = 'https://placehold.co/66x66?text=no+img';

    const videoSrc = typeof getHitoVideoSrcForImage === 'function'
        ? getHitoVideoSrcForImage(archivo)
        : '';

    const popupImage = isImage
        ? `<img src="${imageUrl}" alt="${archivo}" style="grid-column:1;grid-row:2;width:${POPUP_IMG_SIZE}px;height:${POPUP_IMG_SIZE}px;object-fit:cover;border-radius:0;display:block;background:transparent;">`
        : `<img src="https://placehold.co/640x400?text=NO+IMG" alt="Archivo no disponible" style="grid-column:1;grid-row:2;width:${POPUP_IMG_SIZE}px;height:${POPUP_IMG_SIZE}px;object-fit:cover;border-radius:0;display:block;background:transparent;">`;

    const popupText = relato
        ? `<p class="popup-relato" style="width:100%;height:${POPUP_TEXT_HEIGHT}px;font-size:${POPUP_FONT_SIZE}px;padding:${POPUP_PADDING}px;color:#ffffff;box-sizing:border-box;margin:0;">${relato}</p>`
        : '';

    const isRefugioPopup = isRefugioCategory(categoria);
    const categoryColor = getCategoryColor(categoria);
    const categoryBackground = getCategoryTextPanelBackground(categoria);
    const unlockBgStyle = isRefugioPopup ? '' : `background-color:${categoryColor};`;
    const popupBarStyle = `display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${POPUP_IMG_SIZE}px;height:${POPUP_UNLOCK_HEIGHT}px;min-height:${POPUP_UNLOCK_HEIGHT}px;${unlockBgStyle}color:${POPUP_UNLOCK_TEXT_COLOR};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1;letter-spacing:0.04em;`;
    const popupUnlock = `<div class="popup-unlock popup-unlock--has-video" style="grid-column:1;grid-row:1;${popupBarStyle}">DESBLOQUEAR</div>`;
    const popupRetry = !videoSrc
        ? `<div class="popup-unlock popup-unlock--retry" style="grid-column:1;grid-row:3;${popupBarStyle}" hidden>INTENTE DE NUEVO</div>`
        : '';
    const textPanelBgStyle = isRefugioPopup ? '' : `background-color:${categoryBackground};`;
    const popupTextPanel = `<div class="popup-text-panel" style="grid-column:2;grid-row:2;width:${POPUP_TEXT_WIDTH}px;height:${POPUP_IMG_SIZE}px;${textPanelBgStyle}display:flex;align-items:center;box-sizing:border-box;">${popupText}</div>`;
    const popupVideoPanel = videoSrc
        ? `<div class="popup-video-panel" style="grid-column:1 / -1;grid-row:3;width:${POPUP_WIDTH}px;height:${POPUP_VIDEO_HEIGHT}px;" hidden><video class="popup-video" src="${videoSrc}" playsinline controls preload="metadata"></video></div>`
        : '';
    const popupInnerClass = videoSrc ? 'popup-inner popup-inner--has-video' : 'popup-inner popup-inner--no-video';
    const popupContent = `<div class="${popupInnerClass}" style="display:grid;grid-template-columns:${POPUP_IMG_SIZE}px ${POPUP_TEXT_WIDTH}px;grid-template-rows:${POPUP_UNLOCK_HEIGHT}px ${POPUP_IMG_SIZE}px;width:${POPUP_WIDTH}px;height:${POPUP_HEIGHT}px;">${popupUnlock}${popupRetry}${popupImage}${popupTextPanel}${popupVideoPanel}</div>`;

    const popup = new mapboxgl.Popup({
        offset: POPUP_OFFSET,
        closeButton: true,
        closeOnClick: false,
        className: isRefugioPopup ? 'category-popup category-popup--refugio' : 'category-popup',
        maxWidth: `${POPUP_WIDTH}px`,
        anchor: 'bottom'
    })
        .setHTML(popupContent);

    const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat]);

    marker._categoria = categoria || '';
    marker._archivo = archivo;
    marker._popup = popup;
    marker._hitoId = isNaN(hitoId) ? 0 : hitoId;
    marker._hitoWsId = archivo.replace(/\.[^.]+$/i, '').toLowerCase();
    marker._tienePremio = tienePremio;
    marker.addTo(map);

    const markerEl = marker.getElement();
    markerEl.classList.add('map-marker-hit');
    markerEl.style.pointerEvents = 'auto';
    el.style.pointerEvents = 'auto';

    el.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleMarkerPopupClick(map, marker, popup);
    });
    markers.push(marker);
}

function getVisibleMarkers(markers, activeSet) {
    if (!markers.length) return [];
    if (!activeSet || activeSet.size === 0) return markers.slice();
    return markers.filter(function (m) {
        return activeSet.has((m._categoria || '').toLowerCase());
    });
}

function fitMapToFilteredMarkers(map, markers, activeSet) {
    if (!map) return;
    const visible = getVisibleMarkers(markers, activeSet);
    if (!visible.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reducedMotion ? 0 : MAP_FIT_DURATION_MS;

    if (visible.length === 1) {
        const ll = visible[0].getLngLat();
        map.flyTo({
            center: [ll.lng, ll.lat],
            zoom: MAP_FIT_SINGLE_ZOOM,
            duration: duration,
            essential: true
        });
        return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    visible.forEach(function (m) {
        const ll = m.getLngLat();
        bounds.extend([ll.lng, ll.lat]);
    });

    map.fitBounds(bounds, {
        padding: MAP_FIT_PADDING,
        maxZoom: MAP_FIT_MAX_ZOOM,
        duration: duration,
        essential: true
    });
}

function scheduleMapFitToFilteredMarkers(map, markers, activeSet) {
    if (!map) return;
    window.requestAnimationFrame(function () {
        fitMapToFilteredMarkers(map, markers, activeSet);
    });
}

function setMarkerFilterVisible(marker, map, visible) {
    const markerEl = marker.getElement();
    if (!markerEl) return;

    if (visible) {
        if (!marker._map) marker.addTo(map);
        markerEl.classList.remove('marker-filter-hidden');
        return;
    }

    markerEl.classList.add('marker-filter-hidden');
}

/* UI helpers: mostrar/ocultar marcadores según categorías activas */
function updateMarkersFilter(map, markers, activeSet) {
    markers.forEach(function (m) {
        const cat = (m._categoria || '').toLowerCase();
        const shouldShow = activeSet.size === 0 || activeSet.has(cat);

        if (!shouldShow) {
            const openIndex = openPopupEntries.findIndex(function (entry) {
                return entry.marker === m;
            });
            if (openIndex >= 0) removePopupEntry(openPopupEntries[openIndex].popup);
        }

        setMarkerFilterVisible(m, map, shouldShow);
    });
}

function initCategoryUI(map, markers) {
    const categoriesButton = document.getElementById('categories-button');
    const categoriesNav = document.getElementById('categories-nav');
    if (!categoriesNav) return;

    // Mostrar botones de categorías por defecto en la página de mapa (ya están visibles por CSS)
    const catButtons = categoriesNav.querySelectorAll('.category-button');

    // Evento para el footer 'CATEGORÍAS' -> ahora alterna las rectángulos de apoyo visual
    function toggleCategoryRects() {
        const rectsFooter = document.getElementById('category-rects-footer');
        if (rectsFooter) rectsFooter.classList.toggle('open');
        const isOpen = rectsFooter && rectsFooter.classList.contains('open');
        const arrow = document.getElementById('cat-arrow');
        if (arrow) arrow.classList.toggle('vertical', isOpen);
        if (categoriesButton) categoriesButton.classList.toggle('underlined', isOpen);
        const catArrowBtn = document.getElementById('cat-arrow-btn');
        if (catArrowBtn) catArrowBtn.classList.toggle('active', isOpen);
    }

    if (categoriesButton) {
        categoriesButton.addEventListener('click', toggleCategoryRects);
    }

    const catArrowBtn = document.getElementById('cat-arrow-btn');
    if (catArrowBtn) {
        catArrowBtn.addEventListener('click', toggleCategoryRects);
    }

    // Filtro 3: multi-select de fotos; fondo = categoría del botón picado
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = (btn.dataset.category || '').toLowerCase();

            btn.classList.toggle('active');
            const isActive = btn.classList.contains('active');
            const act = getActiveCategorySet(catButtons);

            // --- WEBSOCKETS EVENT: Cambios de vista de Mapa ---
            let mapaId = "Completo";
            if (act.size === 1) {
                if (act.has("m")) mapaId = "Memoria";
                else if (act.has("o")) mapaId = "Oficio";
                else if (act.has("e")) mapaId = "Encuentro";
                else if (act.has("r")) mapaId = "Refugio";
            }
            sendWsPayload({
                Pagina: "Mapa",
                ID: mapaId
            });

            if (getCurrentMapBgMode() === 'blue') {
                if (act.size === 0) {
                    startMapBluePreviewLoop(map, { fitOverview: true });
                    return;
                }

                stopMapBluePreviewLoop();
                updateMarkersFilter(map, markers, act);
                scheduleMapFitToFilteredMarkers(map, markers, act);

                const variant = resolveBlueVariantFromCategoryClick(catButtons, category, isActive);
                if (variant) {
                    mapBlueVariant = variant;
                    scheduleBlueMapVariantApply(map, true);
                }
                return;
            }

            updateMarkersFilter(map, markers, act);
            scheduleMapFitToFilteredMarkers(map, markers, act);
        });
    });

    // Inicial: asegurar que todos los marcadores se muestren
    updateMarkersFilter(map, markers, new Set());
}
