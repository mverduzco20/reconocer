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

      CITY_COLLAGE.pieces
         .sort(function (a, b) { return a.order - b.order; })
         .forEach(function (piece) {
            const el = document.createElement('div');
            el.className = 'city-piece city-piece--' + piece.order;
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

      collage.dataset.built = '1';

      if (typeof positionCityImage === 'function') {
         positionCityImage();
      }

      setupCityCollageReveal();
   }

   function setupCityCollageReveal() {
      if (!collage || !stage) return;

      if (reducedMotion) {
         collage.classList.remove('city-collage--pending');
         collage.classList.add('city-collage--shown');
         return;
      }

      if (collage.classList.contains('city-collage--shown')) return;

      if (collageObserver) {
         collageObserver.disconnect();
         collageObserver = null;
      }

      collage.classList.add('city-collage--pending');

      function showCollage() {
         if (collage.classList.contains('city-collage--shown')) return;
         collage.classList.remove('city-collage--pending');
         collage.classList.add('city-collage--shown');
         if (collageObserver) {
            collageObserver.disconnect();
            collageObserver = null;
         }
      }

      function scheduleCollageAfterText() {
         if (collage.classList.contains('city-collage--shown') || collageRevealTimer || collageRevealQueued) return;
         collageRevealQueued = true;

         function queueCollageReveal() {
            const cityCopy = document.querySelector('.city-copy');
            if (!cityCopy || !cityCopy.classList.contains('city-copy--shown')) return false;
            collageRevealTimer = window.setTimeout(showCollage, COLLAGE_DELAY_AFTER_TEXT_MS);
            return true;
         }

         if (queueCollageReveal()) return;

         const cityCopy = document.querySelector('.city-copy');
         if (!cityCopy) return;

         const copyObserver = new MutationObserver(function () {
            if (queueCollageReveal()) copyObserver.disconnect();
         });
         copyObserver.observe(cityCopy, { attributes: true, attributeFilter: ['class'] });
      }

      function isCityStageInView() {
         const rect = stage.getBoundingClientRect();
         const vh = window.innerHeight;
         return rect.top < vh * 0.88 && rect.bottom > vh * 0.08;
      }

      if (isCityStageInView()) {
         scheduleCollageAfterText();
         return;
      }

      if ('IntersectionObserver' in window) {
         collageObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
               if (entry.isIntersecting) scheduleCollageAfterText();
            });
         }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
         collageObserver.observe(stage);
      }

      function revealOnScroll() {
         if (!isCityStageInView()) return;
         scheduleCollageAfterText();
         window.removeEventListener('scroll', revealOnScroll);
         document.removeEventListener('scroll', revealOnScroll);
      }

      window.addEventListener('scroll', revealOnScroll, { passive: true });
      document.addEventListener('scroll', revealOnScroll, { passive: true });
      revealOnScroll();

      window.setTimeout(function () {
         if (!collage.classList.contains('city-collage--shown') && isCityStageInView()) {
            scheduleCollageAfterText();
         }
      }, 400);
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildCollage);
   } else {
      buildCollage();
   }

   window.addEventListener('cityLayoutReady', setupCityCollageReveal);
})();
