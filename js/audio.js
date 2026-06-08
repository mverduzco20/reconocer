(function () {
   const audio = document.getElementById('global-audio');
   const volumeSlider = document.getElementById('volume-slider');
   if (!audio) return;

   const STORAGE_VOLUME = 'audioVolume';
   const STORAGE_LAST_VOLUME = 'audioLastVolume';
   const STORAGE_TIME = 'audioTime';
   const STORAGE_TRACK = 'audioTrack';
   const audioBase = audio.dataset.audioBase || './audio/';

   const PLAYLIST_ORDER = [
      'bombilla..mp4',
      'fuenterisco.mp4',
      'casaestudio_1.mp4',
      'mercadoflores.mp4',
      'casaroja.mp4'
   ];

   let playlist = [];
   let trackIndex = 0;
   let ready = false;
   let currentSrc = '';

   function normalizePlaylist(files) {
      const incoming = Array.isArray(files) ? files.filter(Boolean) : PLAYLIST_ORDER.slice();
      const ordered = PLAYLIST_ORDER.filter(function (name) {
         return incoming.indexOf(name) !== -1;
      });
      return ordered.length ? ordered : PLAYLIST_ORDER.slice();
   }

   function getLastAudibleVolume() {
      const last = parseFloat(localStorage.getItem(STORAGE_LAST_VOLUME) || '1');
      return Number.isNaN(last) || last <= 0 ? 1 : last;
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
      if (volume === 0) {
         applyMuteUI();
         return 0;
      }
      audio.muted = false;
      audio.volume = volume;
      if (volumeSlider) {
         volumeSlider.value = String(volume);
         volumeSlider.classList.add('active');
      }
      if (persist !== false) {
         localStorage.setItem(STORAGE_VOLUME, String(volume));
         localStorage.setItem(STORAGE_LAST_VOLUME, String(volume));
      }
      return volume;
   }

   function applyMuteUI() {
      audio.volume = getLastAudibleVolume();
      audio.muted = true;
      if (volumeSlider) {
         volumeSlider.value = '0.5';
         volumeSlider.classList.remove('active');
      }
   }

   function saveState() {
      if (!ready || !playlist.length) return;
      const audible = audio.muted ? 0 : audio.volume;
      if (audible > 0) {
         localStorage.setItem(STORAGE_VOLUME, String(audible));
         localStorage.setItem(STORAGE_LAST_VOLUME, String(audible));
      }
      if (!Number.isNaN(audio.currentTime)) {
         localStorage.setItem(STORAGE_TIME, String(audio.currentTime));
      }
      localStorage.setItem(STORAGE_TRACK, String(trackIndex));
   }

   function ensurePlaying() {
      return audio.play().catch(function () {});
   }

   function restoreTime() {
      const savedTime = getSavedTime();
      if (Number.isNaN(savedTime) || savedTime <= 0) return;
      if (!audio.duration || Number.isNaN(audio.duration)) return;
      if (savedTime >= audio.duration - 0.25) return;
      if (Math.abs(audio.currentTime - savedTime) > 0.35) {
         audio.currentTime = savedTime;
      }
   }

   function loadTrack(index) {
      if (!playlist.length) return;
      trackIndex = ((index % playlist.length) + playlist.length) % playlist.length;
      const src = audioBase + playlist[trackIndex];
      if (currentSrc === src && audio.getAttribute('src')) {
         return;
      }
      currentSrc = src;
      audio.src = src;
      audio.load();
   }

   function playNextTrack() {
      loadTrack(trackIndex + 1);
      audio.addEventListener('canplay', function () {
         audio.currentTime = 0;
         localStorage.setItem(STORAGE_TIME, '0');
         applyMuteUI();
         ensurePlaying();
         saveState();
      }, { once: true });
   }

   function bindPlaybackEvents() {
      audio.addEventListener('ended', playNextTrack);
   }

   function startAfterReady(files) {
      playlist = normalizePlaylist(files);
      trackIndex = Math.min(Math.max(getSavedTrack(), 0), playlist.length - 1);
      ready = true;
      bindPlaybackEvents();
      loadTrack(trackIndex);
      applyMuteUI();

      audio.addEventListener('loadedmetadata', function () {
         restoreTime();
         ensurePlaying();
      }, { once: true });
   }

   fetch(audioBase + 'playlist.json')
      .then(function (res) {
         if (!res.ok) throw new Error('playlist missing');
         return res.json();
      })
      .then(function (files) {
         startAfterReady(files);
      })
      .catch(function () {
         startAfterReady(PLAYLIST_ORDER.slice());
      });

   window.addEventListener('pageshow', function () {
      if (!ready) return;
      applyMuteUI();
      restoreTime();
      ensurePlaying();
   });

   if (volumeSlider) {
      let lastVolumeBeforeMute = getLastAudibleVolume();
      let sliderClickStartX = 0;
      let sliderDidMove = false;
      let mutedAtPointerDown = false;

      volumeSlider.addEventListener('pointerdown', function (e) {
         mutedAtPointerDown = !volumeSlider.classList.contains('active');
         if (!mutedAtPointerDown) {
            lastVolumeBeforeMute = parseFloat(volumeSlider.value);
         }
         sliderClickStartX = e.clientX;
         sliderDidMove = false;
      });

      volumeSlider.addEventListener('pointermove', function (e) {
         if (Math.abs(e.clientX - sliderClickStartX) > 4) {
            sliderDidMove = true;
         }
      });

      volumeSlider.addEventListener('input', function (e) {
         e.stopPropagation();
         const val = applyVolume(parseFloat(this.value));
         if (val > 0) {
            lastVolumeBeforeMute = val;
            ensurePlaying();
         }
         saveState();
      });

      volumeSlider.addEventListener('click', function (e) {
         e.stopPropagation();
         if (sliderDidMove) return;
         e.preventDefault();
         if (!mutedAtPointerDown) {
            applyMuteUI();
         } else {
            applyVolume(lastVolumeBeforeMute || getLastAudibleVolume());
            ensurePlaying();
         }
         saveState();
      });
   }

   window.addEventListener('beforeunload', saveState);
   document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') saveState();
   });
   setInterval(saveState, 2000);
})();
