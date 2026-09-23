import { useEffect, useState } from "react";

const BOOT_LINES = [
  "CI CORE ...................... loading",
  "CI IDENTITY ................... ok",
  "CI DATA HUB ................... mounted",
  "CI ORCHESTRATOR ............... online",
  "42 / 90 modules ............... ready",
  "Starting Ci Desktop Environment",
];

const STEP_MS = 240;

/**
 * The moment the user asked for: you should feel like a machine is
 * starting up, not like a page is loading. App.tsx only mounts this on a
 * genuine cold start — no session to resume (see
 * WindowManagerContext.hasRestorableSession) — so it plays once, the
 * first time, not every time the browser/PWA happens to reload the page.
 * Client-side navigation within the OS never re-triggers it either way,
 * the same way opening an app on a real desktop doesn't reboot the
 * machine. Click, or any key, skips straight to the desktop.
 */
export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [revealed, setRevealed] = useState(0);
  const [filled, setFilled] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fillTimer = setTimeout(() => setFilled(true), 50);
    const interval = setInterval(() => {
      setRevealed((r) => (r >= BOOT_LINES.length ? r : r + 1));
    }, STEP_MS);
    const doneTimer = setTimeout(finish, STEP_MS * BOOT_LINES.length + 500);

    function onKey() {
      finish();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(fillTimer);
      clearInterval(interval);
      clearTimeout(doneTimer);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    setFading((wasFading) => {
      if (!wasFading) setTimeout(onDone, 500);
      return true;
    });
  }

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center gap-6 cursor-pointer transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-ci-accent to-ci-accent2" />
      <div className="font-mono tracking-[0.35em] text-xs text-white/60">CI BUSINESS OS</div>
      <div className="w-64 h-1 rounded bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-ci-accent to-ci-accent2 transition-[width] ease-out"
          style={{ width: filled ? "100%" : "0%", transitionDuration: `${STEP_MS * BOOT_LINES.length}ms` }}
        />
      </div>
      <div className="font-mono text-[11px] text-white/40 space-y-1 min-h-[110px] w-72">
        {BOOT_LINES.slice(0, revealed).map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className="font-mono text-[10px] text-white/25 tracking-wider">click, or press any key, to continue</div>
    </div>
  );
}
