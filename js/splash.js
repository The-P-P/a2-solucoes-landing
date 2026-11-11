(function () {
  var STORAGE_KEY = "a2_splash_seen";
  var splash = document.getElementById("splash");
  var audio = document.getElementById("splash-audio");

  if (!splash) return;

  if (document.documentElement.classList.contains("splash-skip")) {
    removeNodes();
    return;
  }

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      removeNodes();
      return;
    }
  } catch (e) {}

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsapReady = typeof window.gsap !== "undefined";

  function markSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
  }

  function stopAudio() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {}
  }

  function removeNodes() {
    stopAudio();
    document.documentElement.classList.add("splash-skip");
    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
    if (audio && audio.parentNode) audio.parentNode.removeChild(audio);
  }

  function tryPlayAudio() {
    if (!audio || reduced) return;
    try {
      audio.volume = 1;
      audio.currentTime = 0;
      var playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    } catch (e) {}
  }

  function fadeOutAudio(durationSec) {
    if (!audio || audio.paused) {
      stopAudio();
      return;
    }
    if (!gsapReady) {
      stopAudio();
      return;
    }
    window.gsap.to(audio, {
      volume: 0,
      duration: durationSec,
      ease: "power1.in",
      onComplete: stopAudio,
    });
  }

  function quickDismiss(holdMs, leaveMs) {
    markSeen();
    splash.classList.add("is-static", "is-ready");
    window.setTimeout(function () {
      splash.classList.add("is-leaving");
      window.setTimeout(removeNodes, leaveMs);
    }, holdMs);
  }

  if (reduced || !gsapReady) {
    quickDismiss(reduced ? 400 : 500, reduced ? 200 : 400);
    return;
  }

  // Áudio o mais cedo possível (antes do setup visual)
  markSeen();
  tryPlayAudio();

  var logo = splash.querySelector(".splash-logo");

  window.gsap.set(logo, {
    opacity: 0,
    scale: 1.22,
    transformOrigin: "50% 50%",
  });

  splash.classList.add("is-ready");

  var tl = window.gsap.timeline({
    onComplete: removeNodes,
  });

  // Entrada mais longa: logo “aproxima” e assenta
  tl.to(
    logo,
    {
      opacity: 1,
      scale: 1,
      duration: 1.55,
      ease: "power3.out",
    },
    0.05
  );

  // Micro impacto / respiração da marca
  tl.to(
    logo,
    {
      scale: 1.04,
      duration: 0.28,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
    },
    2.05
  );

  // Hold mais longo; saída cinematográfica
  tl.to(
    logo,
    {
      scale: 1.12,
      duration: 0.55,
      ease: "power1.in",
    },
    3.55
  );

  tl.to(
    splash,
    {
      opacity: 0,
      duration: 0.55,
      ease: "power2.inOut",
      onStart: function () {
        fadeOutAudio(0.5);
      },
    },
    3.55
  );
})();
