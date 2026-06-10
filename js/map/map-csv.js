// CSV parsing and hitos loading
function processHitosCsvText(map, markers, text) {
    const rows = parseCsvRows(String(text || '').trim());
    if (rows.length < 2) return;

    const header = rows[0].map(col => String(col || '').trim().toLowerCase());
    const indices = {
        archivo: header.findIndex(h => h.includes('archivo') || h.includes('nombre')),
        lat: header.findIndex(h => h.includes('lat')),
        lng: header.findIndex(h => h.includes('long')),
        categoria: header.findIndex(h => h.includes('categoria')),
        relato: header.findIndex(h => h.includes('relato')),
        id: header.findIndex(h => h === 'id' || h === 'identificador'),
        premio: header.findIndex(h => h.includes('premio') || h.includes('recompensa'))
    };

    rows.slice(1).forEach(function (row, index) {
        try {
            agregarMarcador(map, row, markers, indices, index + 1);
        } catch (err) {
            console.error('[reconocer] No se pudo crear marcador fila', index + 1, err);
        }
    });
    hitosMarkers = markers;
    prefetchedHitosBounds = markersToBounds(markers);
    initCategoryUI(map, markers);
    if (isEmbedMode()) {
        scheduleInitialMapView(map, true);
    } else {
        applyInitialMapView(map, { instant: true });
    }
    consumePendingRemoteCommand();
}

function loadHitosMarkers(map, markers, csvPrefetch) {
    const handleText = function (text) {
        if (!text) return;
        processHitosCsvText(map, markers, text);
    };

    if (prefetchedHitosCsvText) {
        handleText(prefetchedHitosCsvText);
        return;
    }

    const source = csvPrefetch || fetch(CSV_URL, { cache: 'no-store' })
        .then(res => {
            if (!res.ok) throw new Error(`No se pudo cargar el CSV: ${res.status}`);
            return res.text();
        });

    Promise.resolve(source)
        .then(function (text) {
            if (text) {
                prefetchedHitosCsvText = text;
                prefetchedHitosBounds = extractHitosBoundsFromCsv(text);
            }
            handleText(text);
        })
        .catch(err => {
            console.error('[reconocer]', err);
            if (!isEmbedMode()) revealMapViewport();
        });
}

// Parse CSV rows with support for double-quoted and single-quoted fields
function parseCsvRows(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inDouble = false;
    let inSingle = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"' && !inSingle) {
            if (inDouble && next === '"') {
                field += '"';
                i += 1;
                continue;
            }
            inDouble = !inDouble;
            continue;
        }

        if (char === "'" && !inDouble) {
            if (inSingle && next === "'") {
                field += "'";
                i += 1;
                continue;
            }
            inSingle = !inSingle;
            continue;
        }

        if (char === ',' && !inDouble && !inSingle) {
            row.push(field);
            field = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inDouble && !inSingle) {
            if (char === '\r' && next === '\n') continue;
            row.push(field);
            if (row.length > 0) rows.push(row);
            row = [];
            field = '';
            continue;
        }

        field += char;
    }

    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

function normalizeCategoryValue(value) {
    const cleaned = String(value || '').trim().toLowerCase().replace(/[^a-z]/g, '');
    return cleaned.length === 1 ? cleaned : '';
}

function findRowCategory(row, indices = {}) {
    const categoryKeys = new Set(['m', 'o', 'r', 'e']);

    // Usar solo la columna "categoria"; no inferir desde el nombre del archivo (ej. o22.jpg)
    if (indices.categoria >= 0 && row[indices.categoria] != null) {
        const candidate = normalizeCategoryValue(row[indices.categoria]);
        if (categoryKeys.has(candidate)) return candidate;
    }

    // Respaldo: revisar solo columnas entre premio y relato, nunca el relato ni el archivo
    const relatoIndex = indices.relato >= 0 ? indices.relato : row.length;
    const startIndex = Math.max(3, indices.categoria >= 0 ? indices.categoria : 3);
    for (let i = startIndex; i < relatoIndex; i++) {
        const candidate = normalizeCategoryValue(row[i]);
        if (categoryKeys.has(candidate)) return candidate;
    }

    return '';
}

function hexToRgba(hex, alpha = 0.6) {
    const cleaned = String(hex || '').trim().replace('#', '');
    if (!/^[0-9a-fA-F]{3,6}$/.test(cleaned)) return `rgba(0,0,0,${alpha})`;
    const full = cleaned.length === 3
        ? cleaned.split('').map(ch => ch + ch).join('')
        : cleaned;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

