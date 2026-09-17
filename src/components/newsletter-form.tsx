"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

export function NewsletterForm({
  source = "footer",
  compact = false,
  onSuccess,
}: {
  source?: "welcome" | "footer";
  compact?: boolean;
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), source }),
    });
    if (response.ok) {
      setStatus("success");
      onSuccess?.();
    } else {
      setStatus("error");
    }
  };

  if (status === "success")
    return (
      <div role="status" className="border-t border-current/20 pt-4">
        <p className="font-semibold">Welcome to TITUN.</p>
        <p className="mt-1 text-sm opacity-70">
          Use code <strong>WELCOME10</strong> at checkout.
        </p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className={compact ? "" : "max-w-md"}>
      {source === "welcome" && (
        <label
          className="mb-3 block text-xs font-bold uppercase tracking-[.08em]"
          htmlFor={`newsletter-email-${source}`}
        >
          Your email address
        </label>
      )}
      <div className={source === "welcome" ? "grid gap-3 sm:grid-cols-[1fr_auto]" : "flex border-b border-current/40"}>
        {source !== "welcome" && (
          <label className="sr-only" htmlFor={`newsletter-email-${source}`}>
            Email address
          </label>
        )}
        <input
          id={`newsletter-email-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          className={source === "welcome"
            ? "h-14 min-w-0 border border-ink/35 bg-white px-4 text-base outline-none placeholder:text-ink/55 focus:border-ink"
            : "h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-current/55"}
        />
        <button
          disabled={status === "loading"}
          className={source === "welcome"
            ? "inline-flex min-h-14 items-center justify-center gap-4 bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-walnut disabled:cursor-wait disabled:opacity-50"
            : "flex h-12 w-12 items-center justify-center disabled:opacity-50"}
          aria-label="Join the TITUN newsletter"
        >
          {source === "welcome" && (status === "loading" ? "Joining…" : "Get 10% off")}
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm">
          We couldn’t save that address. Please try again.
        </p>
      )}
    </form>
  );
}
