export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-text-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-display font-semibold text-foreground">Bandwise</span>
          <span>Built by TechLink Solutions.</span>
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs">
          <span>© {new Date().getFullYear()} Bandwise. All rights reserved.</span>
          <span>Reading · Listening · Writing · Speaking, all AI-evaluated.</span>
        </div>
      </div>
    </footer>
  );
}
