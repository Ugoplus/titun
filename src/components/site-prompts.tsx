"use client";

import { WhatsappLogo, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { NewsletterForm } from "./newsletter-form";
import { DialogShell } from "./dialog-shell";
import Image from "next/image";

type Consent = "all" | "essential";

export function SitePrompts({ whatsappHref }: { whatsappHref: string }) {
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
          backdropClassName="p-3 sm:p-5 md:p-8"
          panelClassName="relative m-auto max-h-[calc(100svh-1.5rem)] w-full max-w-[22rem] overflow-y-auto bg-cream shadow-[0_18px_60px_rgba(24,21,17,.18)] sm:max-w-[32rem] md:max-h-[calc(100svh-4rem)] md:max-w-[58rem]"
        >
          <button
            onClick={dismissWelcome}
            data-autofocus
            className="absolute right-3 top-3 z-20 grid h-11 w-11 place-content-center border border-ink/25 bg-white/95 text-ink transition-colors hover:bg-ink hover:text-white md:right-5 md:top-5"
            aria-label="Close welcome offer"
          >
            <X size={22} />
          </button>
          <div className="grid md:grid-cols-[.82fr_1.18fr]">
            <div className="relative hidden md:block md:min-h-[34rem]">
              <Image
                src="/images/titun/ritual-spa.jpg"
                alt="TITUN refreshing towels arranged for a calm wellness ritual"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
            <div className="flex items-center px-5 pb-6 pt-16 sm:px-8 sm:pb-8 sm:pt-16 md:p-10 lg:p-12">
              <div className="w-full max-w-lg">
                <h2 id="welcome-offer-title" className="text-balance font-display text-4xl leading-[.92] tracking-[-.03em] sm:text-5xl md:text-[4.25rem]">
                  A more considered kind of refresh.
                </h2>
                <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink/70 md:mt-5 md:text-base">
                  Join the TITUN list for 10% off your first order, new collection notes and invitations from our community.
                </p>
                <div className="mt-5 max-w-lg md:mt-7">
                  <NewsletterForm source="welcome" onSuccess={rememberWelcomeSignup} />
                </div>
                <p className="mt-3 max-w-[54ch] text-xs leading-relaxed text-ink/60 md:mt-4">
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
          className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-full max-h-[85svh] overflow-y-auto border-t border-ink bg-ink p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white shadow-[0_18px_60px_rgba(24,21,17,.3)] sm:inset-x-4 sm:bottom-4 sm:w-auto sm:max-w-4xl sm:border md:flex md:items-end md:justify-between md:gap-8 md:p-6"
        >
          <div className="max-w-2xl">
            <p className="font-display text-2xl">Your privacy, considered.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Essential storage keeps your basket and checkout working. Analytics stay off unless you accept.
            </p>
            {showPreferences && (
              <div className="mt-4 border-t border-white/20 pt-4 text-sm">
                <p><strong>Essential:</strong> always active</p>
                <p className="mt-2"><strong>Analytics:</strong> enabled only with “Accept all”</p>
              </div>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 md:mt-0 md:flex md:justify-end">
            <button
              onClick={() => saveConsent("all")}
              className="col-span-2 min-h-11 bg-gold px-4 text-sm font-semibold text-ink md:order-3"
            >
              Accept all
            </button>
            <button
              onClick={() => saveConsent("essential")}
              className="min-h-11 border border-white/40 px-3 text-sm font-semibold"
            >
              Essential only
            </button>
            <button
              onClick={() => setShowPreferences((open) => !open)}
              className="min-h-11 border border-white/40 px-3 text-sm font-semibold"
              aria-expanded={showPreferences}
            >
              Preferences
            </button>
          </div>
        </aside>
      )}

      {whatsappHref && (
        <a
          href={`${whatsappHref}?text=Hello%20TITUN%2C%20I%E2%80%99d%20like%20to%20learn%20more.`}
          aria-label="Chat with TITUN on WhatsApp"
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-content-center rounded-full bg-walnut text-white shadow-[0_10px_32px_rgba(24,21,17,.24)] transition-transform hover:-translate-y-1"
        >
          <WhatsappLogo size={25} weight="fill" />
        </a>
      )}
    </>
  );
}
