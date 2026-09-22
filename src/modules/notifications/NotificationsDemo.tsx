import { Link } from "react-router-dom";
import { useAppState, dismissNotification } from "@/lib/data";
import { visibleNotifications } from "@/lib/notifications";

export default function NotificationsDemo() {
  const state = useAppState();
  const notifications = visibleNotifications(state);

  return (
    <div className="max-w-2xl space-y-2">
      {notifications.map((n) => (
        <div key={n.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
          <div>
            <p className="text-sm">{n.text}</p>
            <Link to={n.moduleHref} className="text-[11px] text-ci-accent">
              {n.moduleName} →
            </Link>
          </div>
          <button onClick={() => dismissNotification(n.id)} className="shrink-0 text-xs text-ci-muted hover:text-ci-text">
            Dismiss
          </button>
        </div>
      ))}
      {notifications.length === 0 && <p className="text-sm text-ci-muted">You're all caught up.</p>}
    </div>
  );
}
