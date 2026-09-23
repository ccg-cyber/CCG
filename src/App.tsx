import { useState } from "react";
import BootScreen from "@/os/BootScreen";
import Desktop from "@/os/Desktop";
import { hasRestorableSession } from "@/os/WindowManagerContext";

export default function App() {
  // The boot sequence is a first-start moment, not a "you reopened the
  // tab" tax — a real OS doesn't replay its startup animation every time
  // you wake it, only on an actual cold start. If there's a session to
  // resume (windows you had open), skip straight to the desktop with them
  // restored instead of rebooting past a screen you've already seen.
  const [booting, setBooting] = useState(() => !hasRestorableSession());
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ci-bg">
      <Desktop />
      {booting && <BootScreen onDone={() => setBooting(false)} />}
    </div>
  );
}
