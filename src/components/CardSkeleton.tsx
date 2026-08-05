export function CardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-surface p-3">
      <div
        className="h-32 flex-shrink-0 animate-pulse rounded-lg bg-surface-2"
        style={{ width: "5.5rem" }}
      />
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-14 animate-pulse rounded bg-surface-2" />
          <div className="h-3.5 w-10 animate-pulse rounded bg-surface-2" />
        </div>
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-3 w-full animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-surface-2" />
        <div className="mt-auto flex items-center gap-3 pt-2">
          <div className="h-3 w-10 animate-pulse rounded bg-surface-2" />
          <div className="ml-auto h-3 w-14 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 md:grid-cols-[3rem_1fr_5rem_5rem_6rem] md:gap-4 md:px-5">
      <div className="mx-auto h-5 w-5 animate-pulse rounded bg-surface-2" />
      <div className="flex items-center gap-3">
        <div className="hidden h-14 w-10 animate-pulse rounded bg-surface-2 sm:block" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
      <div className="hidden h-4 w-8 animate-pulse justify-self-end rounded bg-surface-2 md:block" />
      <div className="hidden h-4 w-10 animate-pulse justify-self-end rounded bg-surface-2 md:block" />
      <div className="hidden h-4 w-6 animate-pulse justify-self-end rounded bg-surface-2 md:block" />
    </div>
  );
}

export function TableSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="hidden grid-cols-[3rem_1fr_5rem_5rem_6rem] gap-4 border-b border-border px-5 py-3 md:grid">
        <div className="h-3 w-8 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-16 animate-pulse rounded bg-surface-2" />
        <div className="ml-auto h-3 w-8 animate-pulse rounded bg-surface-2" />
        <div className="ml-auto h-3 w-10 animate-pulse rounded bg-surface-2" />
        <div className="ml-auto h-3 w-6 animate-pulse rounded bg-surface-2" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_100%_at_80%_0%,color-mix(in_oklch,var(--accent)_16%,transparent),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="h-5 w-24 animate-pulse rounded bg-surface-2" />
        <div className="mt-3 h-10 w-72 animate-pulse rounded bg-surface-2" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-surface-2" />
      </div>
    </section>
  );
}

function FiltersBarSkeleton() {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
      <div className="h-9 flex-1 animate-pulse rounded-md bg-surface-2" />
      <div className="flex gap-2">
        <div className="h-9 w-28 animate-pulse rounded-md bg-surface-2" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-surface-2" />
      </div>
    </div>
  );
}

export function ExplorerSkeleton({
  variant,
  count,
}: {
  variant: "grid" | "table";
  count?: number;
}) {
  return (
    <div>
      <HeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <FiltersBarSkeleton />
        {variant === "grid" ? (
          <CardGridSkeleton count={count ?? 9} />
        ) : (
          <TableSkeleton count={count ?? 10} />
        )}
      </div>
    </div>
  );
}
