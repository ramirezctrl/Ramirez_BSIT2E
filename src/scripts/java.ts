
  const formatTime = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = Math.floor(safeSeconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  document.querySelectorAll<HTMLElement>(".track-player").forEach((player) => {
    const audio = player.querySelector<HTMLAudioElement>(".track-audio");
    const button = player.querySelector<HTMLButtonElement>(".play-button");
    const seek = player.querySelector<HTMLInputElement>(".track-seek");
    const currentTime = player.querySelector<HTMLElement>(".current-time");
    const duration = player.querySelector<HTMLElement>(".duration");
    const status = player.querySelector<HTMLElement>(".track-status");

    if (!audio || !button || !seek || !currentTime || !duration || !status) return;

    const trackName =
      player.closest(".track")?.querySelector(".track-info h3")?.textContent?.trim() ?? "track";

    const setPlayState = (isPlaying: boolean) => {
      button.classList.toggle("is-playing", isPlaying);
      button.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${trackName}`);
    };

    const updateProgress = () => {
      const percent = audio.duration > 0
        ? (audio.currentTime / audio.duration) * 100
        : 0;

      seek.value = String(percent);
      seek.style.setProperty("--progress", `${percent}%`);
      currentTime.textContent = formatTime(audio.currentTime);
      duration.textContent = formatTime(audio.duration);
    };

    button.addEventListener("click", () => {
      if (audio.paused) {
        void audio.play().catch(() => {
          status.textContent = "Couldn't play this file. Check that the audio file exists.";
        });
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", () => {
      document.querySelectorAll<HTMLAudioElement>(".track-audio").forEach((otherAudio) => {
        if (otherAudio !== audio) otherAudio.pause();
      });

      status.textContent = "";
      setPlayState(true);
    });

    audio.addEventListener("pause", () => setPlayState(false));
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("timeupdate", updateProgress);

    audio.addEventListener("ended", () => {
      setPlayState(false);
      audio.currentTime = 0;
      updateProgress();
    });

    audio.addEventListener("error", () => {
      status.textContent = "Couldn't load this file. Check the audio path.";
    });

    seek.addEventListener("input", () => {
      if (audio.duration > 0) {
        audio.currentTime = (Number(seek.value) / 100) * audio.duration;
        updateProgress();
      }
    });
  });
