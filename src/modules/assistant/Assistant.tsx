import AskCiBar from "@/components/AskCiBar";

/**
 * The exact same component embedded in CI Home's dashboard, given its
 * own address. This is what "one intelligence, everywhere" means in
 * practice: there's no separate "Assistant" logic to keep in sync with
 * Home's copy, because there is no copy — it's the same component.
 */
export default function Assistant() {
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-ci-muted mb-4">
        The same Ask CI you see on Home, reachable on its own. Ask about a customer, chase an invoice, or find a
        module.
      </p>
      <AskCiBar />
    </div>
  );
}
