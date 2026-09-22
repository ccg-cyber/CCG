import { Routes, Route } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Home from "@/pages/Home";
import ModulePage from "@/pages/ModulePage";

export default function App() {
  return (
    <div className="flex min-h-screen bg-ci-bg">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modules/:slug" element={<ModulePage />} />
        </Routes>
      </div>
    </div>
  );
}
