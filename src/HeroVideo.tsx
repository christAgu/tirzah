import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const poster = "/images/hero-saffron.webp";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!preference) return;
    const update = () => {
      setMotionAllowed(!preference.matches);
      if (preference.matches) {
        videoRef.current?.pause();
        setPlaying(false);
        setStarted(false);
      }
    };
    update();
    preference.addEventListener?.("change", update);
    return () => preference.removeEventListener?.("change", update);
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      void video.play().catch(() => setPlaying(false));
    }
  };

  return (
    <div className="hero-media">
      <img
        className="hero-photo"
        src={poster}
        srcSet="/images/hero-saffron-480.webp 480w, /images/hero-saffron.webp 900w"
        sizes="(max-width: 650px) calc(100vw - 40px), (max-width: 1150px) 45vw, 580px"
        width="900"
        height="1350"
        decoding="async"
        alt="Matcha au safran Tirzah, spécialité maison, sur un socle de pierre dans une lumière rose et dorée"
        fetchPriority="high"
      />
      <video
        key={motionAllowed ? "motion" : "still"}
        ref={videoRef}
        className={`hero-photo hero-video ${started && motionAllowed && !failed ? "is-playing" : ""}`}
        width="720"
        height="1080"
        poster={poster}
        autoPlay={motionAllowed && !failed}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onPlaying={() => {
          setStarted(true);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onError={(event) => {
          if (event.target === event.currentTarget) setFailed(true);
        }}
      >
        {motionAllowed && !failed && (
          <>
            <source src="/videos/saffron-matcha.webm" type="video/webm" />
            <source
              src="/videos/saffron-matcha.mp4"
              type="video/mp4"
              onError={() => setFailed(true)}
            />
          </>
        )}
      </video>
      {motionAllowed && !failed && (
        <button
          className="hero-video-toggle"
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
          <span>{playing ? "Pause" : "Lire"}</span>
        </button>
      )}
    </div>
  );
}
