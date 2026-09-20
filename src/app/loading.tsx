export default function Loading() {
  return (
    <div role="status" className="grid min-h-[55svh] place-content-center px-5 text-center">
      <span className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink motion-reduce:animate-none" />
      <p className="mt-5 text-sm font-semibold">Preparing your TITUN experience…</p>
    </div>
  );
}
