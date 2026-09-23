import { useState } from "react";
import BootScreen from "@/os/BootScreen";
import Desktop from "@/os/Desktop";

export default function App() {
  const [booting, setBooting] = useState(true);
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ci-bg">
      <Desktop />
      {booting && <BootScreen onDone={() => setBooting(false)} />}
    </div>
  );
}
