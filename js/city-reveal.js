(function () {
   const CITY_COLLAGE = {
      sourceW: 2336,
      sourceH: 3118,
      pieces: [
         { x: 1080, y: 0, w: 1256, h: 1080, order: 1 },
         { x: 620, y: 260, w: 880, h: 720, order: 2 },
         { x: 0, y: 480, w: 920, h: 980, order: 3 },
         { x: 480, y: 920, w: 920, h: 780, order: 4 },
         { x: 260, y: 1320, w: 1020, h: 820, order: 5 },
         { x: 760, y: 1980, w: 1400, h: 980, order: 6 },
         { x: 420, y: 2580, w: 980, h: 538, order: 7 }
      ]
   };

   let stage = null;
   let collage = null;
   let pieceEls = [];
   let reducedMotion = false;

   function getScrollY() {
      return window.scrollY
         || document.documentElement.scrollTop
         || document.body.scrollTop
         || 0;
   }

   function buildCollage() {
      stage = document.getElementById('city-stage');
      collage = document.getElementById('city-collage');
      if (!stage || !collage || collage.dataset.built === '1') return;

      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      CITY_COLLAGE.pieces
         .sort(function (a, b) { return a.order - b.order; })
         .forEach(function (piece) {
            const el = document.createElement('div');
            el.className = 'city-piece';
            el.style.left = (piece.x / CITY_COLLAGE.sourceW * 100) + '%';
            el.style.top = (piece.y / CITY_COLLAGE.sourceH * 100) + '%';
            el.style.width = (piece.w / CITY_COLLAGE.sourceW * 100) + '%';
            el.style.height = (piece.h / CITY_COLLAGE.sourceH * 100) + '%';

            const img = document.createElement('img');
            img.src = './img/city.png';
            img.alt = '';
            img.decoding = 'async';
            img.style.width = (CITY_COLLAGE.sourceW / piece.w * 100) + '%';
            img.style.height = (CITY_COLLAGE.sourceH / piece.h * 100) + '%';
            img.style.left = (-piece.x / piece.w * 100) + '%';
            img.style.top = (-piece.y / piece.h * 100) + '%';

            el.appendChild(img);
            collage.appendChild(el);
            pieceEls.push(el);
         });

      collage.dataset.built = '1';

      if (typeof positionCityImage === 'function') {
         positionCityImage();
      }

      if (reducedMotion) {
         pieceEls.forEach(function (el) {
            el.style.opacity = '1';
         });
         return;
      }

      window.addEventListener('scroll', updateCityReveal, { passive: true });
      document.addEventListener('scroll', updateCityReveal, { passive: true });
      window.addEventListener('resize', updateCityReveal);
      window.addEventListener('cityLayoutReady', updateCityReveal);
      updateCityReveal();
   }

   function updateCityReveal() {
      if (!stage || !pieceEls.length || reducedMotion) return;

      const vh = window.innerHeight;
      const stageTop = stage.offsetTop;
      const stageH = stage.offsetHeight || 1;
      const scrollBottom = getScrollY() + vh;

      const revealStart = stageTop - vh * 0.55;
      const revealEnd = stageTop + stageH * 0.45;
      const range = Math.max(1, revealEnd - revealStart);
      const progress = Math.min(1, Math.max(0, (scrollBottom - revealStart) / range));
      const fadeSpan = 0.9;
      const n = pieceEls.length;

      pieceEls.forEach(function (el, index) {
         const t = (progress * (n - 1 + fadeSpan) - index) / fadeSpan;
         const opacity = Math.min(1, Math.max(0, t));
         el.style.opacity = String(opacity);
      });
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildCollage);
   } else {
      buildCollage();
   }
})();
