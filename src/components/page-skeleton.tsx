/** Placeholder shown instantly while a page loads, so clicks never feel frozen. */
export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div className="animate-pulse space-y-8" role="status" aria-live="polite">
      <span className="sr-only">{label}…</span>
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-ink-200" />
        <div className="h-9 w-72 max-w-full rounded-xl bg-ink-200" />
        <div className="h-4 w-96 max-w-full rounded-full bg-ink-100" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-24 bg-white" />
        ))}
      </div>
      <div className="card h-28 bg-white" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-20 bg-white" />
        ))}
      </div>
    </div>
  );
}
