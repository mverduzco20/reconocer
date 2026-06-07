(function () {
   const audio = document.getElementById('global-audio');
   const volumeSlider = document.getElementById('volume-slider');
   if (!audio) return;

   const STORAGE_VOLUME = 'audioVolume';
   const STORAGE_TIME = 'audioTime';
   const STORAGE_TRACK = 'audioTrack';
   const audioBase = audio.dataset.audioBase || './audio/';
   const startMuted = audio.dataset.startMuted === 'true';

   const FALLBACK_PLAYLIST = [
      'bombilla..mp4',
      'fuenterisco.mp4',
      'casaestudio_1.mp4',
      'iglesia.mp4',
      'mercadoflores.mp4',
      'casaroja.mp4'
   ];

   let playlist = [];
   let trackIndex = 0;
   let ready = false;

   function getSavedVolume() {
      return parseFloat(localStorage.getItem(STORAGE_VOLUME) || '0');
   }

   function getInitialVolume() {
      return startMuted ? 0 : getSavedVolume();
   }

   function getSavedTime() {
      return parseFloat(localStorage.getItem(STORAGE_TIME) || '0');
   }

   function getSavedTrack() {
      const index = parseInt(localStorage.getItem(STORAGE_TRACK) || '0', 10);
      return Number.isNaN(index) ? 0 : index;
   }

   function applyVolume(val, persist) {
      const volume = Math.max(0, Math.min(1, val));
      audio.volume = volume;
      audio.muted = volume === 0;
      if (volumeSlider) {
         volumeSlider.value = String(volume);
         volumeSlider.classList.toggle('active', volume > 0);
      }
      if (persist !== false) {
         localStorage.setItem(STORAGE_VOLUME, String(volume));
      }
      return volume;
   }

   function saveState() {
      if (!ready) return;
      const volume = audio.muted ? 0 : audio.volume;
      localStorage.setItem(STORAGE_VOLUME, String(volume));
      localStorage.setItem(STORAGE_TIME, String(audio.currentTime));
      localStorage.setItem(STORAGE_TRACK, String(trackIndex));
   }

   function ensurePlaying() {
      return audio.play().catch(function () {});
   }

   function restoreTime() {
      const savedTime = getSavedTime();
      if (Number.isNaN(savedTime) || savedTime <= 0) return;
      if (audio.duration && savedTime < audio.duration) {
         audio.currentTime = savedTime;
      }
   }

   function loadTrack(index) {
      if (!playlist.length) return;
      trackIndex = ((index % playlist.length) + playlist.length) % playlist.length;
      audio.src = audioBase + playlist[trackIndex];
      audio.load();
   }

   function playNextTrack() {
      loadTrack(trackIndex + 1);
      audio.addEventListener('canplay', function () {
         audio.currentTime = 0;
         ensurePlaying();
         saveState();
      }, { once: true });
   }

   function resumeFromStorage() {
      applyVolume(getInitialVolume());
      if (!ready) return ensurePlaying();
      restoreTime();
      return ensurePlaying();
   }

   function bindPlaybackEvents() {
      audio.addEventListener('ended', playNextTrack);
   }

   function startAfterReady() {
      ready = true;
      bindPlaybackEvents();
      loadTrack(getSavedTrack());
      applyVolume(getInitialVolume(), !startMuted);

      audio.addEventListener('loadedmetadata', function onReady() {
         restoreTime();
         const initialVolume = getInitialVolume();
         if (initialVolume > 0) {
            ensurePlaying().catch(function () {
               function resumeOnce() {
                  resumeFromStorage();
                  document.removeEventListener('pointerdown', resumeOnce);
                  document.removeEventListener('keydown', resumeOnce);
               }
               document.addEventListener('pointerdown', resumeOnce);
               document.addEventListener('keydown', resumeOnce);
            });
         } else {
            ensurePlaying();
         }
      }, { once: true });
   }

   fetch(audioBase + 'playlist.json')
      .then(function (res) {
         if (!res.ok) throw new Error('playlist missing');
         return res.json();
      })
      .then(function (files) {
         playlist = Array.isArray(files) ? files.filter(Boolean) : FALLBACK_PLAYLIST;
         if (!playlist.length) playlist = FALLBACK_PLAYLIST.slice();
         startAfterReady();
      })
      .catch(function () {
         playlist = FALLBACK_PLAYLIST.slice();
         startAfterReady();
      });

   window.addEventListener('pageshow', function () {
      if (!ready) return;
      if (startMuted) {
         applyVolume(0, false);
         ensurePlaying();
         return;
      }
      if (getSavedVolume() > 0) resumeFromStorage();
   });

   if (volumeSlider) {
      volumeSlider.addEventListener('input', function (e) {
         e.stopPropagation();
         const val = applyVolume(parseFloat(this.value));
         if (val > 0) ensurePlaying();
         saveState();
      });

      volumeSlider.addEventListener('click', function (e) {
         e.stopPropagation();
         if (parseFloat(this.value) === 0) {
            applyVolume(1);
            ensurePlaying();
            saveState();
         }
      });
   }

   window.addEventListener('beforeunload', saveState);
   setInterval(saveState, 2000);
})();
