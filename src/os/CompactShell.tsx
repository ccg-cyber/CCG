import { useEffect, useState } from "react";
import { Bell, CheckCircle2, ChevronRight } from "lucide-react";
import { useWindowManager, type OSWindow } from "./WindowManagerContext";
import ModuleWindowContent from "./ModuleWindowContent";
import WindowErrorBoundary from "./WindowErrorBoundary";
import { ModuleIcon } from "./moduleIcons";
import { getModuleById, searchModules } from "@/lib/registry";
import { visibleNotifications } from "@/lib/notifications";
import { useAppState, currentUserName } from "@/lib/data";

/**
 * Phone-width layout: the floating-window desktop metaphor doesn't hold up
 * on a 390px screen — no real handheld OS (Palm, the P800, iOS, Android)
 * shows draggable overlapping windows. Instead: one app fills the screen at
 * a time, a back button returns to a home-screen hub, and apps you left
 * keep running in the background (minimized, not closed) so returning to
 * one is instant, exactly like tapping an app icon on a phone.
 *
 * The hub is grouped by category (not one flat, same-color grid — the
 * flat version read as "random" rather than curated) and every tinted
 * icon color below tracks the same category id CATEGORIES/registry.ts
 * already assigns each module, so a color always means the same category
 * everywhere in Ci, not just on this screen.
 */
const SECTIONS: { label: string; icons: string[] }[] = [
  { label: "Work & Files", icons: ["ci-tasks", "ci-drive"] },
  { label: "Communicate", icons: ["ci-mail", "ci-calendar"] },
  { label: "Business", icons: ["ci-crm", "ci-invoicing"] },
  { label: "Intelligence & Control", icons: ["ci-assistant", "ci-approval-center"] },
];

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  home: { bg: "bg-ci-accent/10", text: "text-ci-accent" },
  work: { bg: "bg-sky-500/10", text: "text-sky-600" },
  communicate: { bg: "bg-violet-500/10", text: "text-violet-600" },
  files: { bg: "bg-amber-500/10", text: "text-amber-600" },
  business: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  intelligence: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-600" },
  control: { bg: "bg-rose-500/10", text: "text-rose-600" },
};

function iconStyle(moduleId: string) {
  const category = getModuleById(moduleId)?.category ?? "home";
  return CATEGORY_STYLE[category] ?? CATEGORY_STYLE.home;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** A running app, full-screen — fades and settles in on open, and eases
 * back out before the back button actually hands off to minimizeWindow,
 * so leaving a screen reads as a transition instead of a hard cut. */
function CompactApp({ win, onBack, onClose }: { win: OSWindow; onBack: () => void; onClose: () => void }) {
  const mod = getModuleById(win.moduleId);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleBack() {
    setLeaving(true);
    setTimeout(onBack, 180);
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col bg-ci-bg transition-[opacity,transform] duration-200 ease-out ${
        entered && !leaving ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
      }`}
      data-testid={`compact-app-${win.moduleId}`}
    >
      <div className="flex items-center gap-2 border-b border-ci-border bg-ci-panel px-2 shrink-0" style={{ height: 48 }}>
        <button
          onClick={handleBack}
          aria-label="Back"
          data-testid="compact-back"
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-ci-text hover:bg-ci-panel2 active:scale-95 transition-transform"
        >
          <span className="text-lg leading-none">‹</span> Home
        </button>
        <span className="flex-1 text-center text-sm font-medium truncate pr-14">{mod?.name}</span>
        <button
          onClick={onClose}
          aria-label="Close"
          data-testid="compact-close"
          className="absolute right-2 rounded-md px-2 py-1.5 text-xs text-ci-muted hover:bg-ci-panel2 active:scale-95 transition-transform"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <WindowErrorBoundary key={win.id} moduleName={mod?.name ?? "This app"} onClose={onClose}>
          <ModuleWindowContent moduleId={win.moduleId} />
        </WindowErrorBoundary>
      </div>
    </div>
  );
}

export default function CompactShell() {
  const { windows, activeId, openWindow, minimizeWindow, closeWindow, focusWindow } = useWindowManager();
  const [query, setQuery] = useState("");
  const state = useAppState();
  const notifCount = visibleNotifications(state).length;
  const pendingApprovalCount = state.approvals.filter((a) => a.status === "pending").length;
  const you = currentUserName();

  const active = windows.find((w) => w.id === activeId && !w.minimized);
  const results = query.trim() ? searchModules(query) : null;
  const homeMod = getModuleById("ci-home");
  const homeStyle = iconStyle("ci-home");
  const firstName = you.split(" ")[0];
  // The unset default profile name is literally "You" — before anyone has
  // filled in CI Admin Center's "My profile", greeting them with their own
  // placeholder ("Good morning, You.") reads as a bug, not personalization.
  const greetingLine = firstName.toLowerCase() === "you" ? `${greeting()}.` : `${greeting()}, ${firstName}.`;

  if (active) {
    return <CompactApp key={active.id} win={active} onBack={() => minimizeWindow(active.id)} onClose={() => closeWindow(active.id)} />;
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-ci-bg overflow-hidden">
      <div
        className="px-4 pt-5 pb-3 shrink-0"
        style={{ animation: "ci-fade-in 0.3s ease-out both" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold leading-tight">{greetingLine}</p>
            <div className="flex items-center gap-3 mt-0.5">
              {notifCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-ci-muted">
                  <Bell className="h-3 w-3" strokeWidth={2} /> {notifCount} notification{notifCount === 1 ? "" : "s"}
                </span>
              )}
              {pendingApprovalCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-ci-muted">
                  <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> {pendingApprovalCount} to approve
                </span>
              )}
              {notifCount === 0 && pendingApprovalCount === 0 && (
                <span className="text-[11px] text-ci-muted">All caught up.</span>
              )}
            </div>
          </div>
          {notifCount > 0 && (
            <span className="rounded-full bg-red-500/20 text-red-600 border border-red-500/30 px-2 py-0.5 text-xs shrink-0">
              {notifCount}
            </span>
          )}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything — mail, files, customer…"
          className="w-full rounded-full border border-ci-border bg-ci-panel px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {results ? (
          <div className="space-y-1.5" style={{ animation: "ci-fade-in 0.18s ease-out both" }}>
            {results.map((m) => {
              const s = iconStyle(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    openWindow(m.id);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm bg-ci-panel hover:bg-ci-panel2 active:scale-[0.98] transition-transform text-left"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.bg} ${s.text}`}>
                    <ModuleIcon moduleId={m.id} className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">{m.name}</span>
                  {m.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />}
                </button>
              );
            })}
            {results.length === 0 && <p className="text-xs text-ci-muted px-1 py-2">No modules match.</p>}
          </div>
        ) : (
          <>
            {homeMod && (
              <button
                onClick={() => openWindow("ci-home")}
                data-testid="app-icon-ci-home"
                className="w-full flex items-center gap-3 rounded-2xl bg-ci-panel border border-ci-border px-4 py-3.5 mb-5 text-left active:scale-[0.98] transition-transform"
                style={{ animation: "ci-fade-up 0.32s ease-out both" }}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${homeStyle.bg} ${homeStyle.text}`}>
                  <ModuleIcon moduleId="ci-home" className="h-6 w-6" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium">Ci Home</span>
                  <span className="block text-[11px] text-ci-muted truncate">Your command center</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ci-muted shrink-0" strokeWidth={2} />
              </button>
            )}

            {SECTIONS.map((section, sIdx) => (
              <div key={section.label} className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ci-muted mb-2">{section.label}</p>
                <div className="flex gap-4">
                  {section.icons.map((id, iIdx) => {
                    const mod = getModuleById(id);
                    if (!mod) return null;
                    const s = iconStyle(id);
                    return (
                      <button
                        key={id}
                        onClick={() => openWindow(id)}
                        data-testid={`app-icon-${id}`}
                        className="flex flex-col items-center gap-1.5 text-center w-16 active:scale-95 transition-transform"
                        style={{ animation: "ci-fade-up 0.32s ease-out both", animationDelay: `${40 + sIdx * 60 + iIdx * 30}ms` }}
                      >
                        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${s.bg} ${s.text}`}>
                          <ModuleIcon moduleId={id} className="h-6 w-6" />
                        </span>
                        <span className="text-[11px] text-ci-text leading-tight">{mod.name.replace("CI ", "")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {windows.some((w) => w.minimized) && (
              <div style={{ animation: "ci-fade-up 0.32s ease-out both", animationDelay: "280ms" }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ci-muted mb-2">Running</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {windows.filter((w) => w.minimized).map((w) => {
                    const mod = getModuleById(w.moduleId);
                    if (!mod) return null;
                    const s = iconStyle(w.moduleId);
                    return (
                      <button
                        key={w.id}
                        onClick={() => focusWindow(w.id)}
                        data-testid={`running-${w.moduleId}`}
                        className="shrink-0 flex items-center gap-2 rounded-full border border-ci-border bg-ci-panel pl-1.5 pr-3 py-1.5 text-xs whitespace-nowrap active:scale-95 transition-transform"
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${s.bg} ${s.text}`}>
                          <ModuleIcon moduleId={w.moduleId} className="h-3 w-3" />
                        </span>
                        {mod.name.replace("CI ", "")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
