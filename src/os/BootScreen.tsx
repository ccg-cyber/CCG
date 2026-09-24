import { useEffect, useState } from "react";

const FILL_MS = 1100;

/**
 * A real OS's boot screen doesn't scroll a log past you — Windows shows a
 * logo and a few dots, macOS shows a logo and a thin progress bar, both
 * silent otherwise. The previous version's terminal-style "CI CORE
 * ...loading" lines read as a dev console, not a product — this is the
 * quieter, more literal version: the actual app icon, and a progress bar,
 * nothing performing "hacker" for the sake of it.
 *
 * App.tsx only mounts this on a genuine cold start — no session to resume
 * (see WindowManagerContext.hasRestorableSession) — so it plays once, the
 * first time, not every time the browser/PWA happens to reload the page.
 * Click, or any key, skips straight to the desktop.
 */
export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [filled, setFilled] = useState(false);
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fillTimer = setTimeout(() => setFilled(true), 50);
    const hintTimer = setTimeout(() => setShowSkipHint(true), 900);
    const doneTimer = setTimeout(finish, FILL_MS + 350);

    function onKey() {
      finish();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(hintTimer);
      clearTimeout(doneTimer);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    setFading((wasFading) => {
      if (!wasFading) setTimeout(onDone, 400);
      return true;
    });
  }

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center gap-5 cursor-pointer transition-opacity duration-400 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <img
        src="/icon-512.png"
        alt=""
        className="h-20 w-20 rounded-2xl"
        style={{ animation: "ci-fade-up 0.5s ease-out both" }}
      />
      <div className="w-40 h-[3px] rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white/80 transition-[width] ease-in-out"
          style={{ width: filled ? "100%" : "0%", transitionDuration: `${FILL_MS}ms` }}
        />
      </div>
      <div
        className={`text-[11px] text-white/30 tracking-wide transition-opacity duration-500 ${
          showSkipHint ? "opacity-100" : "opacity-0"
        }`}
      >
        Click, or press any key, to continue
      </div>
    </div>
  );
}
