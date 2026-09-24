import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";

const PIN = "42665230";
const PIN_LENGTH = PIN.length;
const UNLOCK_KEY = "ci-os-unlocked";

/**
 * A casual gate for a demo deployed at a public URL — not real security.
 * The correct PIN lives right here in the bundled JS, so anyone who opens
 * devtools can read it; this only stops someone from stumbling onto
 * os.cierp.uk and clicking around, not a determined visitor. If this ever
 * needs to actually keep people out, that's CI IDENTITY (#55) territory —
 * real auth needs a real backend, the same gap noted for OAuth connectors
 * in ARCHITECTURE.md.
 */
export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function persistUnlock() {
  try {
    localStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    // best-effort — worst case this device asks for the PIN again next visit
  }
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const submittingRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") append(e.key);
      else if (e.key === "Backspace") backspace();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  function append(d: string) {
    if (submittingRef.current || digits.length >= PIN_LENGTH) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === PIN_LENGTH) {
      submittingRef.current = true;
      setTimeout(() => submit(next), 120);
    }
  }

  function backspace() {
    if (submittingRef.current) return;
    setDigits((d) => d.slice(0, -1));
  }

  function submit(value: string) {
    if (value === PIN) {
      persistUnlock();
      setUnlocking(true);
      setTimeout(onUnlock, 420);
    } else {
      setShake(true);
      setTimeout(() => {
        setDigits("");
        setShake(false);
        submittingRef.current = false;
      }, 380);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[2500] flex flex-col items-center text-white transition-[opacity,transform] duration-[420ms] ease-out ${
        unlocking ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at 30% 15%, #2b3470 0%, #12142b 45%, #0a0b16 100%)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-1 select-none" style={{ animation: "ci-fade-in 0.5s ease-out both" }}>
        <div className="text-6xl font-light tracking-tight tabular-nums">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="text-sm text-white/60">
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      <div
        className="flex flex-col items-center gap-6 pb-10 px-6 w-full max-w-xs"
        style={{ animation: "ci-fade-up 0.4s ease-out both", animationDelay: "120ms" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-ci-accent to-ci-accent2 mb-1" />
          <p className="text-xs text-white/50 tracking-wide">Enter PIN to unlock Ci</p>
          <div className={`flex gap-3 ${shake ? "animate-[ci-shake_0.4s_ease-in-out]" : ""}`}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full border border-white/40 transition-colors ${
                  i < digits.length ? "bg-white border-white" : "bg-transparent"
                } ${shake ? "!border-red-400" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {KEYS.map((k, i) => {
            if (k === "") return <div key={i} />;
            if (k === "back") {
              return (
                <button
                  key={i}
                  onClick={backspace}
                  aria-label="Delete"
                  className="h-16 w-16 mx-auto flex items-center justify-center rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-transform"
                >
                  <Delete className="h-5 w-5" strokeWidth={1.75} />
                </button>
              );
            }
            return (
              <button
                key={i}
                onClick={() => append(k)}
                className="h-16 w-16 mx-auto flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-xl font-light active:scale-90 transition-transform"
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
