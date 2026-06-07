(function () {
   function initCityCopyReveal() {
      const cityStage = document.getElementById('city-stage');
      const blocks = document.querySelectorAll('.city-copy__block');
      if (!cityStage || !blocks.length) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
         blocks.forEach(function (block) {
            block.style.opacity = '1';
         });
         return;
      }

      function updateCityCopyReveal() {
         const vh = window.innerHeight;
         const stageRect = cityStage.getBoundingClientRect();

         const revealStartY = vh * 0.95;
         const revealEndY = vh * 0.05;
         const range = Math.max(1, revealStartY - revealEndY);
         const progress = Math.min(1, Math.max(0, (revealStartY - stageRect.top) / range));
         const fadeSpan = 0.38;
         const n = blocks.length;

         blocks.forEach(function (block, index) {
            const t = (progress * (n - 1 + fadeSpan) - index) / fadeSpan;
            const opacity = Math.min(1, Math.max(0, t));
            block.style.opacity = String(opacity);
         });
      }

      blocks.forEach(function (block) {
         block.style.opacity = '0';
      });

      window.addEventListener('scroll', updateCityCopyReveal, { passive: true });
      document.addEventListener('scroll', updateCityCopyReveal, { passive: true });
      window.addEventListener('resize', updateCityCopyReveal);
      window.addEventListener('cityLayoutReady', updateCityCopyReveal);
      updateCityCopyReveal();
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCityCopyReveal);
   } else {
      initCityCopyReveal();
   }
})();
