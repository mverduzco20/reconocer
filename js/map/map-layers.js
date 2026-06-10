// Mapbox layer effects and background modes
function isRefugioCategory(categoria) {
    return String(categoria || '').toLowerCase() === 'r';
}

function getCategoryColor(categoria) {
    return CATEGORY_COLOR_MAP[String(categoria || '').toLowerCase()] || MAP_BLUE;
}

function getCategoryBackgroundAlpha(categoria) {
    return isRefugioCategory(categoria) ? REFUGIO_PANEL_ALPHA : 0.7;
}

function getCategoryTextPanelBackground(categoria) {
    if (isRefugioCategory(categoria)) {
        return hexToRgba(REFUGIO_PANEL_COLOR, REFUGIO_PANEL_ALPHA);
    }
    return hexToRgba(getCategoryColor(categoria), getCategoryBackgroundAlpha(categoria));
}

function getCategoryUnlockTextColor(categoria) {
    const cat = String(categoria || '').toLowerCase();
    if (cat === 'o' || cat === 'e') return '#ffffff';
    return '#000000';
}

function isRoadLayer(id) {
    return /road|street|highway|bridge|tunnel|path|motorway|trunk|primary|secondary|tertiary|residential|service|transport|rail|avenue|calle/i.test(id);
}

function applyMapCanvasFilter(mode, blueVariant) {
    const canvas = document.querySelector('#map-container .mapboxgl-canvas');
    if (!canvas) return;

    if (mode !== 'blue') {
        canvas.style.removeProperty('filter');
        return;
    }

    const filter = MAP_CANVAS_FILTERS[blueVariant] || MAP_CANVAS_FILTERS.base;
    canvas.style.setProperty('transition', 'filter ' + (mapBlueFilterTransitionMs / 1000) + 's ease-in-out', 'important');
    canvas.style.setProperty('filter', filter, 'important');
}

function setMapContainerMode(color, mode, blueVariant) {
    const container = document.getElementById('map-container');
    const mapa = document.getElementById('mapa');
    if (container) {
        container.style.backgroundColor = color;
        container.classList.remove(
            'map-bg-dark',
            'map-bg-blue',
            'map-bg-blue-base',
            'map-bg-blue-encuentro',
            'map-bg-blue-green',
            'map-bg-blue-oficio',
            'map-bg-blue-memoria'
        );
        if (mode === 'dark') container.classList.add('map-bg-dark');
        if (mode === 'blue') {
            container.classList.add('map-bg-blue');
            if (blueVariant === 'base') container.classList.add('map-bg-blue-base');
            if (blueVariant === 'encuentro') container.classList.add('map-bg-blue-encuentro');
            if (blueVariant === 'green') container.classList.add('map-bg-blue-green');
            if (blueVariant === 'oficio') container.classList.add('map-bg-blue-oficio');
            if (blueVariant === 'memoria') container.classList.add('map-bg-blue-memoria');
        }
    }
    if (mapa) mapa.style.backgroundColor = color;
    applyMapCanvasFilter(mode, blueVariant);
}

function applyMapWhiteningEffect(map) {
    const style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;

    setMapContainerMode(MAP_PURE_WHITE, 'white');

    for (const layer of style.layers) {
        const { id, type } = layer;
        const road = isRoadLayer(id);
        try {
            if (type === 'background') {
                map.setPaintProperty(id, 'background-color', MAP_PURE_WHITE);
            } else if (type === 'fill') {
                map.setPaintProperty(id, 'fill-color', road ? MAP_STREET_FILL : MAP_PURE_WHITE);
                map.setPaintProperty(id, 'fill-opacity', road ? 0.45 : 1);
            } else if (type === 'fill-extrusion') {
                map.setPaintProperty(id, 'fill-extrusion-color', MAP_PURE_WHITE);
                map.setPaintProperty(id, 'fill-extrusion-opacity', 0.08);
            } else if (type === 'line') {
                map.setPaintProperty(id, 'line-color', MAP_STREET_LINE);
                map.setPaintProperty(id, 'line-opacity', road ? 0.14 : 0.08);
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', MAP_LABEL_LIGHT);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', MAP_STREET_LINE);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', -1);
                map.setPaintProperty(id, 'raster-brightness-min', 0.94);
                map.setPaintProperty(id, 'raster-brightness-max', 1.04);
                map.setPaintProperty(id, 'raster-contrast', 0.04);
            }
        } catch (_) {
            /* algunas capas no admiten ciertas propiedades */
        }
    }
}

function applyMapDarkEffect(map) {
    const style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;

    setMapContainerMode(MAP_DARK_BG, 'dark');

    for (const layer of style.layers) {
        const { id, type } = layer;
        const road = isRoadLayer(id);
        try {
            if (type === 'background') {
                map.setPaintProperty(id, 'background-color', MAP_DARK_BG);
            } else if (type === 'fill') {
                map.setPaintProperty(id, 'fill-color', road ? MAP_DARK_STREET_FILL : MAP_DARK_BG);
                map.setPaintProperty(id, 'fill-opacity', road ? 0.9 : 1);
            } else if (type === 'fill-extrusion') {
                map.setPaintProperty(id, 'fill-extrusion-color', road ? MAP_DARK_STREET_FILL : MAP_DARK_BG);
                map.setPaintProperty(id, 'fill-extrusion-opacity', 0.35);
            } else if (type === 'line') {
                map.setPaintProperty(id, 'line-color', MAP_DARK_STREET_LINE);
                map.setPaintProperty(id, 'line-opacity', road ? 0.62 : 0.2);
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', MAP_DARK_LABEL);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', MAP_DARK_STREET_LINE);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', -1);
                map.setPaintProperty(id, 'raster-brightness-min', 0.01);
                map.setPaintProperty(id, 'raster-brightness-max', 0.1);
                map.setPaintProperty(id, 'raster-contrast', 0.3);
            }
        } catch (_) {
            /* algunas capas no admiten ciertas propiedades */
        }
    }
}

function getCurrentMapBgMode() {
    return MAP_BG_MODES[mapBgModeIndex];
}

function applyMapBlueEffect(map) {
    const style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;

    let bgColor;
    let areaFill;
    let streetFill;
    let lineColor;
    let labelColor;
    let rasterSat;

    let areaOpacity = 0.98;
    let roadOpacity = 0.88;

    if (mapBlueVariant === 'memoria') {
        bgColor = MAP_GOLD_BG;
        areaFill = MAP_GOLD_BG;
        streetFill = MAP_GOLD_STREET_FILL;
        lineColor = MAP_GOLD_STREET_LINE;
        labelColor = MAP_GOLD_LABEL;
        rasterSat = -0.15;
        areaOpacity = 0.84;
        roadOpacity = 0.72;
    } else if (mapBlueVariant === 'green') {
        bgColor = MAP_GREEN_BG;
        areaFill = MAP_GREEN_BG;
        streetFill = MAP_GREEN_STREET_FILL;
        lineColor = MAP_GREEN_STREET_LINE;
        labelColor = MAP_GREEN_LABEL;
        rasterSat = -0.2;
        areaOpacity = 0.82;
        roadOpacity = 0.7;
    } else if (mapBlueVariant === 'oficio') {
        bgColor = MAP_OFICIO_MONO_BG;
        areaFill = MAP_OFICIO_MONO_AREA;
        streetFill = MAP_OFICIO_MONO_STREET;
        lineColor = MAP_OFICIO_MONO_LINE;
        labelColor = MAP_OFICIO_MONO_LABEL;
        rasterSat = -1;
        areaOpacity = 0.88;
        roadOpacity = 0.8;
    } else if (mapBlueVariant === 'encuentro') {
        bgColor = MAP_PINK_BG;
        areaFill = MAP_PINK_BG;
        streetFill = MAP_PINK_STREET_FILL;
        lineColor = MAP_PINK;
        labelColor = MAP_PINK;
        rasterSat = 0.15;
        areaOpacity = 0.84;
        roadOpacity = 0.72;
    } else if (mapBlueVariant === 'base') {
        bgColor = MAP_PINK_BG;
        areaFill = MAP_PINK_BG;
        streetFill = MAP_PINK_STREET_FILL;
        lineColor = MAP_BLUE_STREET_LINE;
        labelColor = MAP_PINK;
        rasterSat = 0.15;
    } else {
        bgColor = MAP_BLUE_BG;
        areaFill = MAP_BLUE_BG;
        streetFill = MAP_BLUE_STREET_FILL;
        lineColor = MAP_BLUE_STREET_LINE;
        labelColor = MAP_BLUE_LABEL;
        rasterSat = -0.25;
    }

    const containerVariant = mapBlueVariant;
    setMapContainerMode(bgColor, 'blue', containerVariant);

    for (const layer of style.layers) {
        const { id, type } = layer;
        const road = isRoadLayer(id);
        try {
            if (type === 'background') {
                map.setPaintProperty(id, 'background-color', bgColor);
            } else if (type === 'fill') {
                map.setPaintProperty(id, 'fill-color', road ? streetFill : areaFill);
                map.setPaintProperty(id, 'fill-opacity', road ? roadOpacity : areaOpacity);
            } else if (type === 'fill-extrusion') {
                map.setPaintProperty(id, 'fill-extrusion-color', streetFill);
                map.setPaintProperty(id, 'fill-extrusion-opacity', 0.55);
            } else if (type === 'line') {
                map.setPaintProperty(id, 'line-color', lineColor);
                map.setPaintProperty(id, 'line-opacity', road ? 0.95 : 0.35);
            } else if (type === 'circle') {
                map.setPaintProperty(id, 'circle-color', streetFill);
                map.setPaintProperty(id, 'circle-opacity', 0.75);
            } else if (type === 'symbol') {
                if (map.getPaintProperty(id, 'text-color') !== undefined) {
                    map.setPaintProperty(id, 'text-color', labelColor);
                }
                if (map.getPaintProperty(id, 'icon-color') !== undefined) {
                    map.setPaintProperty(id, 'icon-color', labelColor);
                }
            } else if (type === 'raster') {
                map.setPaintProperty(id, 'raster-saturation', rasterSat);
                map.setPaintProperty(id, 'raster-brightness-min', 0.88);
                map.setPaintProperty(id, 'raster-brightness-max', 1.04);
                map.setPaintProperty(id, 'raster-contrast', 0.1);
            }
        } catch (_) {
            /* algunas capas no admiten ciertas propiedades */
        }
    }
}

function stopMapBluePreviewLoop() {
    mapBluePreviewActive = false;
    if (mapBluePreviewLoopTimer) {
        clearInterval(mapBluePreviewLoopTimer);
        mapBluePreviewLoopTimer = null;
    }
}

function clearCategoryButtonStates() {
    document.querySelectorAll('#categories-nav .category-button').forEach(function (btn) {
        btn.classList.remove('active');
    });
}

function showAllHitosMarkers(map) {
    if (map && hitosMarkers.length) updateMarkersFilter(map, hitosMarkers, new Set());
}

function getActiveCategorySet(catButtons) {
    const act = new Set();
    catButtons.forEach(function (b) {
        if (b.classList.contains('active')) act.add((b.dataset.category || '').toLowerCase());
    });
    return act;
}

function resolveBlueVariantFromCategoryClick(catButtons, clickedCategory, isClickedActive) {
    if (isClickedActive && MAP_BLUE_VARIANT_BY_CATEGORY[clickedCategory]) {
        return MAP_BLUE_VARIANT_BY_CATEGORY[clickedCategory];
    }
    for (const btn of catButtons) {
        if (!btn.classList.contains('active')) continue;
        const cat = (btn.dataset.category || '').toLowerCase();
        if (MAP_BLUE_VARIANT_BY_CATEGORY[cat]) return MAP_BLUE_VARIANT_BY_CATEGORY[cat];
    }
    return null;
}

function startMapBluePreviewLoop(map, options) {
    stopMapBluePreviewLoop();
    if (getCurrentMapBgMode() !== 'blue' || !map) return;

    clearCategoryButtonStates();
    showAllHitosMarkers(map);

    if (options && options.fitOverview) {
        scheduleMapFitToFilteredMarkers(map, hitosMarkers, new Set());
    }

    mapBluePreviewActive = true;
    mapBluePreviewLoopIndex = 0;

    function showPreviewVariant() {
        if (!mapBluePreviewActive || getCurrentMapBgMode() !== 'blue') return;
        mapBlueFilterTransitionMs = MAP_BLUE_FILTER_TRANSITION_LOOP_MS;
        mapBlueVariant = MAP_BLUE_PREVIEW_VARIANTS[mapBluePreviewLoopIndex];
        applyMapBlueEffect(map);
    }

    showPreviewVariant();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    mapBluePreviewLoopTimer = window.setInterval(function () {
        mapBluePreviewLoopIndex = (mapBluePreviewLoopIndex + 1) % MAP_BLUE_PREVIEW_VARIANTS.length;
        showPreviewVariant();
    }, MAP_BLUE_PREVIEW_INTERVAL_MS);
}

function scheduleBlueMapVariantApply(map, useFastTransition) {
    mapBlueFilterTransitionMs = useFastTransition
        ? MAP_BLUE_FILTER_TRANSITION_BUTTON_MS
        : MAP_BLUE_FILTER_TRANSITION_LOOP_MS;
    applyMapBlueEffect(map);
    window.requestAnimationFrame(function () {
        applyMapBlueEffect(map);
        mapBlueFilterTransitionMs = MAP_BLUE_FILTER_TRANSITION_LOOP_MS;
    });
}

function applyMapBackgroundByMode(map, mode) {
    if (mode !== 'blue') {
        stopMapBluePreviewLoop();
        mapBlueVariant = MAP_BLUE_DEFAULT_VARIANT;
    }
    if (mode === 'dark') applyMapDarkEffect(map);
    else if (mode === 'blue') applyMapBlueEffect(map);
    else applyMapWhiteningEffect(map);
}

function scheduleMapBackgroundReapply(map) {
    if (!map) return;
    clearTimeout(mapBackgroundReapplyTimer);
    mapBackgroundReapplyTimer = window.setTimeout(function () {
        if (!map.isStyleLoaded()) return;
        applyMapBackgroundByMode(map, getCurrentMapBgMode());
    }, 60);
}

function stopFilterCColorLoop() {
    if (filterCColorLoopTimer) {
        clearInterval(filterCColorLoopTimer);
        filterCColorLoopTimer = null;
    }
}

function startFilterCColorLoop(filterC) {
    stopFilterCColorLoop();
    if (!filterC) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
        filterC.style.color = MAP_BLUE;
        return;
    }

    filterCColorLoopIndex = 0;
    filterC.style.color = FILTER_C_CATEGORY_COLORS[0];
    filterCColorLoopTimer = window.setInterval(function () {
        filterCColorLoopIndex = (filterCColorLoopIndex + 1) % FILTER_C_CATEGORY_COLORS.length;
        filterC.style.color = FILTER_C_CATEGORY_COLORS[filterCColorLoopIndex];
    }, 1000);
}

function updateFilterButtonAppearance() {
    const filterButton = document.getElementById('footer-cat-companion');
    const filterC = filterButton && filterButton.querySelector('.footer-map-filter-c');
    if (!filterButton || !filterC) return;

    const mode = getCurrentMapBgMode();
    filterButton.classList.remove('footer-cat-companion--dark', 'footer-cat-companion--blue');
    stopFilterCColorLoop();

    if (mode === 'dark') {
        filterButton.classList.add('footer-cat-companion--dark');
        filterC.style.color = '';
    } else if (mode === 'blue') {
        filterButton.classList.add('footer-cat-companion--blue');
        startFilterCColorLoop(filterC);
    } else {
        filterC.style.color = '#ffffff';
    }

    filterButton.classList.toggle('active', mode !== 'white');
}

function cycleMapBackground(map) {
    const wasBlue = getCurrentMapBgMode() === 'blue';
    mapBgModeIndex = (mapBgModeIndex + 1) % MAP_BG_MODES.length;
    const nextMode = MAP_BG_MODES[mapBgModeIndex];

    if (nextMode === 'blue' && !wasBlue) {
        mapBlueVariant = MAP_BLUE_PREVIEW_VARIANTS[0];
    }

    applyMapBackgroundByMode(map, nextMode);

    if (nextMode === 'blue' && !wasBlue) {
        startMapBluePreviewLoop(map);
    }

    updateFilterButtonAppearance();
}

function initMapBackgroundUI(map) {
    const filterButton = document.getElementById('footer-cat-companion');
    if (!filterButton || filterButton.dataset.bgBound === '1') return;

    filterButton.dataset.bgBound = '1';
    filterButton.setAttribute('aria-label', MAP_BG_LABELS[mapBgModeIndex]);
    updateFilterButtonAppearance();
    filterButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!map || !map.isStyleLoaded()) return;
        cycleMapBackground(map);
        filterButton.setAttribute('aria-label', MAP_BG_LABELS[mapBgModeIndex]);
    });
}

