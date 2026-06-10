(function () {
   const CITY_COLLAGE = {
      sourceW: 2336,
      sourceH: 3118,
      pieces: [
         { x: 1080, y: 0, w: 1256, h: 1080, order: 1, revealGroup: 1 },
         { x: 620, y: 260, w: 880, h: 720, order: 2, revealGroup: 2 },
         { x: 0, y: 480, w: 920, h: 980, order: 3, revealGroup: 1 },
         { x: 480, y: 920, w: 920, h: 780, order: 4, revealGroup: 2 },
         { x: 260, y: 1320, w: 1020, h: 820, order: 5, revealGroup: 3 },
         { x: 760, y: 1980, w: 1400, h: 980, order: 6, revealGroup: 4 },
         { x: 420, y: 2580, w: 980, h: 538, order: 7, revealGroup: 5 }
      ],
      revealStepSec: 0.34
   };

   let stage = null;
   let collage = null;
   let collageObserver = null;
   let collageRevealTimer = null;
   let collageRevealQueued = false;
   let reducedMotion = false;
   const COLLAGE_DELAY_AFTER_TEXT_MS = 1150;

   function buildCollage() {
      stage = document.getElementById('city-stage');
      collage = document.getElementById('city-collage');
      if (!stage || !collage || collage.dataset.built === '1') return;

      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const base = document.createElement('img');
      base.className = 'city-collage__base';
      base.src = './img/city.png';
      base.alt = '';
      base.decoding = 'async';
      base.loading = 'eager';
      collage.appendChild(base);

      const revealGroups = CITY_COLLAGE.pieces
         .map(function (piece) { return piece.revealGroup || piece.order; })
         .sort(function (a, b) { return a - b; });
      const maxRevealGroup = revealGroups[revealGroups.length - 1] || 1;
      const revealStepSec = CITY_COLLAGE.revealStepSec || 0.34;

      CITY_COLLAGE.pieces.forEach(function (piece) {
            const revealGroup = piece.revealGroup || piece.order;
            const el = document.createElement('div');
            el.className = 'city-piece city-piece--' + piece.order;
            el.dataset.revealGroup = String(revealGroup);
            el.style.setProperty('--reveal-delay', ((revealGroup - 1) * revealStepSec) + 's');
            el.style.zIndex = String(piece.order + 1);
            el.style.left = (piece.x / CITY_COLLAGE.sourceW * 100) + '%';
            el.style.top = (piece.y / CITY_COLLAGE.sourceH * 100) + '%';
            el.style.width = (piece.w / CITY_COLLAGE.sourceW * 100) + '%';
            el.style.height = (piece.h / CITY_COLLAGE.sourceH * 100) + '%';

            const img = document.createElement('img');
            img.src = './img/city.png';
            img.alt = '';
            img.decoding = 'async';
            img.loading = 'eager';
            img.style.width = (CITY_COLLAGE.sourceW / piece.w * 100) + '%';
            img.style.height = (CITY_COLLAGE.sourceH / piece.h * 100) + '%';
            img.style.left = (-piece.x / piece.w * 100) + '%';
            img.style.top = (-piece.y / piece.h * 100) + '%';

            el.appendChild(img);
            collage.appendChild(el);
         });

      collage.dataset.maxRevealGroup = String(maxRevealGroup);
      collage.dataset.revealStepSec = String(revealStepSec);

      collage.dataset.built = '1';

      if (typeof positionCityImage === 'function') {
         positionCityImage();
      }

      setupCityCollageReveal();
   }

   function setupCityCollageReveal() {
      if (!collage || !stage) return;

      if (collageObserver) {
         collageObserver.disconnect();
         collageObserver = null;
      }

      if (collageRevealTimer) {
         window.clearTimeout(collageRevealTimer);
         collageRevealTimer = null;
      }

      collageRevealQueued = false;
      collage.classList.remove('city-collage--pending');
      collage.classList.add('city-collage--shown', 'city-collage--complete');
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildCollage);
   } else {
      buildCollage();
   }

   window.addEventListener('cityLayoutReady', setupCityCollageReveal);
})();
