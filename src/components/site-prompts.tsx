"use client";

import { WhatsappLogo, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { NewsletterForm } from "./newsletter-form";
import { contactDetails } from "@/lib/contact";

type Consent = "all" | "essential";

export function SitePrompts() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("titun-cookie-consent");
    if (!consent) queueMicrotask(() => setShowConsent(true));
    const dismissedAt = Number(localStorage.getItem("titun-welcome-dismissed") ?? 0);
    const elapsed = Date.now() - dismissedAt;
    if (elapsed > 30 * 24 * 60 * 60 * 1000) {
      const timer = window.setTimeout(() => setShowWelcome(true), 9000);
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
  };

  return (
    <>
      {showWelcome && (
        <aside
          id="welcome-offer"
          aria-label="First-order offer"
          className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-sm border border-ink bg-white p-6 shadow-[0_18px_60px_rgba(24,21,17,.18)]"
        >
          <button
            onClick={dismissWelcome}
            className="absolute right-3 top-3 grid h-11 w-11 place-content-center"
            aria-label="Close welcome offer"
          >
            <X />
          </button>
          <p className="max-w-[12ch] font-display text-4xl leading-[.95] tracking-[-.03em]">
            Welcome to TITUN.
          </p>
          <p className="mb-5 mt-4 max-w-[34ch] text-sm leading-relaxed text-ink/70">
            Enjoy 10% off your first order and receive considered notes from
            TITUN.
          </p>
          <NewsletterForm source="welcome" compact onSuccess={rememberWelcomeSignup} />
        </aside>
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
