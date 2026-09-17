"use client";

import { WhatsappLogo, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { NewsletterForm } from "./newsletter-form";
import { DialogShell } from "./dialog-shell";
import Image from "next/image";
import { contactDetails } from "@/lib/contact";

type Consent = "all" | "essential";

export function SitePrompts() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("titun-cookie-consent");
    if (!consent) {
      queueMicrotask(() => setShowConsent(true));
      return;
    }
    const dismissedAt = Number(localStorage.getItem("titun-welcome-dismissed") ?? 0);
    const elapsed = Date.now() - dismissedAt;
    if (elapsed > 30 * 24 * 60 * 60 * 1000) {
      const timer = window.setTimeout(() => setShowWelcome(true), 4000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem("titun-welcome-dismissed", String(Date.now()));
    setShowWelcome(false);
  };

  const rememberWelcomeSignup = () => {
    localStorage.setItem("titun-welcome-dismissed", String(Date.now()));
  };

  const saveConsent = (consent: Consent) => {
    localStorage.setItem("titun-cookie-consent", consent);
    setShowConsent(false);
    setShowPreferences(false);
    const dismissedAt = Number(localStorage.getItem("titun-welcome-dismissed") ?? 0);
    if (Date.now() - dismissedAt > 30 * 24 * 60 * 60 * 1000) {
      window.setTimeout(() => setShowWelcome(true), 1200);
    }
  };

  return (
    <>
      {showWelcome && (
        <DialogShell
          labelledBy="welcome-offer-title"
          onClose={dismissWelcome}
          backdropClassName="p-0"
          panelClassName="relative min-h-full w-full overflow-hidden bg-cream"
        >
          <button
            onClick={dismissWelcome}
            data-autofocus
            className="absolute right-4 top-4 z-20 grid h-12 w-12 place-content-center border border-ink/25 bg-cream text-ink transition-colors hover:bg-ink hover:text-white md:right-7 md:top-7"
            aria-label="Close welcome offer"
          >
            <X size={22} />
          </button>
          <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative min-h-[38vh] lg:min-h-screen">
              <Image
                src="/images/titun/ritual-spa.jpg"
                alt="TITUN refreshing towels arranged for a calm wellness ritual"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex items-center px-5 py-16 md:px-12 lg:px-[7vw]">
              <div className="w-full max-w-xl">
                <h2 id="welcome-offer-title" className="text-balance font-display text-[clamp(3.5rem,7vw,6rem)] leading-[.88] tracking-[-.035em]">
                  A more considered kind of refresh.
                </h2>
                <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-ink/70 md:text-lg">
                  Join the TITUN list for 10% off your first order, new collection notes and invitations from our community.
                </p>
                <div className="mt-10 max-w-lg">
                  <NewsletterForm source="welcome" onSuccess={rememberWelcomeSignup} />
                </div>
                <p className="mt-5 max-w-[54ch] text-xs leading-relaxed text-ink/60">
                  By joining, you agree to receive TITUN emails. You can unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </DialogShell>
      )}

      {showConsent && (
        <aside
          aria-label="Cookie preferences"
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-4xl border border-ink bg-ink p-5 text-white shadow-[0_18px_60px_rgba(24,21,17,.3)] md:flex md:items-end md:justify-between md:gap-8 md:p-6"
        >
          <div className="max-w-2xl">
            <p className="font-display text-2xl">Your privacy, considered.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Essential storage keeps the basket and checkout working. Optional
              analytics will only be used with your permission.
            </p>
            {showPreferences && (
              <div className="mt-4 border-t border-white/20 pt-4 text-sm">
                <p><strong>Essential:</strong> always active</p>
                <p className="mt-2"><strong>Analytics:</strong> enabled only with “Accept all”</p>
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 md:mt-0 md:justify-end">
            <button
              onClick={() => saveConsent("essential")}
              className="min-h-11 border border-white/40 px-4 text-sm font-semibold"
            >
              Reject non-essential
            </button>
            <button
              onClick={() => setShowPreferences((open) => !open)}
              className="min-h-11 border border-white/40 px-4 text-sm font-semibold"
            >
              Manage preferences
            </button>
            <button
              onClick={() => saveConsent("all")}
              className="min-h-11 bg-gold px-4 text-sm font-semibold text-ink"
            >
              Accept all
            </button>
          </div>
        </aside>
      )}

      {contactDetails.whatsappHref && (
        <a
          href={`${contactDetails.whatsappHref}?text=Hello%20TITUN%2C%20I%E2%80%99d%20like%20to%20learn%20more.`}
          aria-label="Chat with TITUN on WhatsApp"
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-content-center rounded-full bg-walnut text-white shadow-[0_10px_32px_rgba(24,21,17,.24)] transition-transform hover:-translate-y-1"
        >
          <WhatsappLogo size={25} weight="fill" />
        </a>
      )}
    </>
  );
}
