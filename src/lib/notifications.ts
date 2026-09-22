import type { AppState } from "./types";
import { customerName } from "./data";

/**
 * Notifications are computed from live data, not stored — an overdue
 * invoice IS a notification, there's no separate copy of it to go stale.
 * The only thing that needs persisting is which ones a user dismissed,
 * which is what `dismissedNotificationIds` in AppState is for.
 *
 * Both CI Home (top few) and CI Notifications (full list) call this same
 * function, so the two never disagree about what counts as unread.
 */
export interface Notification {
  id: string;
  text: string;
  moduleHref: string;
  moduleName: string;
}

export function computeNotifications(state: AppState): Notification[] {
  const list: Notification[] = [];

  for (const inv of state.invoices) {
    if (inv.status === "overdue") {
      list.push({
        id: `notif-inv-${inv.id}`,
        text: `Invoice #${inv.number} is ${inv.overdueDays} days overdue — ${customerName(state, inv.customerId)}.`,
        moduleHref: "/modules/invoicing",
        moduleName: "CI Invoicing",
      });
    }
  }

  for (const t of state.tasks) {
    if (!t.done && t.priority === "high") {
      list.push({
        id: `notif-task-${t.id}`,
        text: t.title,
        moduleHref: "/modules/tasks",
        moduleName: "CI Tasks",
      });
    }
  }

  const unread = state.emails.filter((e) => e.unread).length;
  if (unread > 0) {
    list.push({
      id: "notif-mail-unread",
      text: `${unread} unread message(s) in your inbox.`,
      moduleHref: "/modules/mail",
      moduleName: "CI Mail",
    });
  }

  const openTickets = state.tickets.filter((t) => t.status === "open").length;
  if (openTickets > 0) {
    list.push({
      id: "notif-tickets-open",
      text: `${openTickets} open support ticket(s) need attention.`,
      moduleHref: "/modules/customer-service",
      moduleName: "CI Customer Service",
    });
  }

  return list;
}

export function visibleNotifications(state: AppState): Notification[] {
  const dismissed = new Set(state.dismissedNotificationIds);
  return computeNotifications(state).filter((n) => !dismissed.has(n.id));
}
