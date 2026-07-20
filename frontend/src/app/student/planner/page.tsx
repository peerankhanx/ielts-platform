export default function PlannerPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-border bg-background p-8">
      <span className="rounded-full bg-info/10 px-3 py-1 text-xs font-medium text-info">Next milestone</span>
      <h1 className="font-display text-2xl font-bold">Study Planner</h1>
      <p className="text-sm text-text-soft">
        This module is scaffolded in the route structure and ready to be built out — full Study Planner functionality
        ships in the next increment, once the matching backend module is in place.
      </p>
    </div>
  );
}
