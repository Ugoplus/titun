"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="m-0 bg-[#f8f6f1] font-sans text-[#181511]">
        <main className="grid min-h-screen place-content-center px-5 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[.09em]">TITUN</p>
          <h1 className="mt-3 font-serif text-5xl leading-none">Let’s try that again.</h1>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed">
            The page could not finish loading. Your basket remains stored on this device.
          </p>
          <button
            onClick={reset}
            className="mx-auto mt-8 min-h-12 bg-[#181511] px-6 font-semibold text-white"
          >
            Reload TITUN
          </button>
        </main>
      </body>
    </html>
  );
}
