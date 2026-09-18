export function StripeLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 360 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M360 77.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5V96c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9Zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8ZM247.1 31.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8Zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4ZM169.8 25.7l25.1-5.4V0l-25.1 5.3v20.4ZM194.9 33.3h-25.1v87.5h25.1V33.3ZM142.9 40.7l-1.6-7.4h-21.6v87.5h25V61.5c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4ZM92.9 11.6l-24.4 5.2-.1 80.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V99c-3.2 1.3-19 5.9-19-8.9V54.6h19V33.3h-19.1l.2-21.7ZM25.3 58.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V36.2c-8.3-3.3-16.5-4.6-24.8-4.6C13.5 31.6 0 42.2 0 59.9c0 27.6 38 23.2 38 35.1 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-3.4-27.3-8v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-28.2-.1-29.8-38.2-24.5-38.2-35.7Z" fill="#533AFD" />
    </svg>
  );
}

export function PaystackLogo({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 42 38" className="h-7 w-8 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="38" height="7" rx="2" fill="#00C3F7" />
        <rect x="1" y="11" width="40" height="7" rx="2" fill="#00C3F7" />
        <rect x="1" y="21" width="38" height="7" rx="2" fill="#00C3F7" />
        <rect x="1" y="31" width="24" height="6" rx="2" fill="#00C3F7" />
      </svg>
      <span className="text-lg font-extrabold tracking-[-.035em] text-[#011B33]">paystack</span>
    </span>
  );
}

export function StripePaymentMethodLogos() {
  const badgeClass = "flex h-8 min-w-12 items-center justify-center border border-ink/15 bg-white px-2";

  return (
    <div
      aria-label="Eligible Stripe payment methods may include Apple Pay, Google Pay, Visa, Mastercard, American Express and Link"
      className="mt-3 flex flex-wrap items-center gap-2"
    >
      <span className={badgeClass} aria-hidden="true">
        <AppleLogo size={15} weight="fill" />
        <span className="ml-1 text-[10px] font-semibold">Pay</span>
      </span>
      <span className={badgeClass} aria-hidden="true">
        <GoogleLogo size={15} weight="bold" />
        <span className="ml-1 text-[10px] font-semibold">Pay</span>
      </span>
      <span className={badgeClass} title="Visa" aria-hidden="true">
        <Visa width={34} height={22} />
      </span>
      <span className={badgeClass} title="Mastercard" aria-hidden="true">
        <Mastercard width={34} height={22} />
      </span>
      <span className={badgeClass} title="American Express" aria-hidden="true">
        <Amex width={34} height={22} />
      </span>
      <span className={`${badgeClass} text-[11px] font-bold tracking-[-.02em]`} aria-hidden="true">
        Link
      </span>
    </div>
  );
}
import { AppleLogo, GoogleLogo } from "@phosphor-icons/react";
import { Amex, Mastercard, Visa } from "react-payment-logos/dist/flat-rounded";
