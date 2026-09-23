import { useAppState, advanceCandidate, rejectCandidate } from "@/lib/data";

const STAGE_LABEL: Record<string, string> = {
  applied: "Move to interview",
  interview: "Extend offer",
  offer: "Mark hired",
};

export default function Recruit() {
  const state = useAppState();

  return (
    <div className="max-w-2xl space-y-2">
      <p className="text-xs text-ci-muted mb-2">
        Marking a candidate "hired" creates their real record in CI HR — no re-entry, and CI Payroll/CI Attendance
        pick them up immediately.
      </p>
      {state.candidates.map((c) => (
        <div key={c.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-ci-muted">
                {c.role} · {c.department} · ${c.offerSalary.toLocaleString()}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
                c.stage === "hired"
                  ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                  : c.stage === "rejected"
                  ? "border-red-500/30 text-red-600 bg-red-500/10"
                  : "border-ci-border text-ci-muted bg-ci-border/30"
              }`}
            >
              {c.stage}
            </span>
          </div>
          {c.stage !== "hired" && c.stage !== "rejected" && (
            <div className="flex gap-2">
              <button onClick={() => advanceCandidate(c.id)} className="text-[11px] text-ci-accent hover:underline">
                {STAGE_LABEL[c.stage]} →
              </button>
              <button onClick={() => rejectCandidate(c.id)} className="text-[11px] text-red-600 hover:underline">
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
