import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Find an order",
  robots: { index: false, follow: false, noarchive: true },
};

export default function AccountPage() {
  return (
    <ContentPage title="Find your order" introduction="TITUN does not require a customer account. Use the reference from your confirmation email to check an order.">
      <form action="/checkout/verify" className="max-w-xl">
        <label className="grid gap-2 text-sm">Order reference<input required name="reference" placeholder="TIT-…" className="h-12 border-b border-ink/35 bg-transparent text-base uppercase outline-none focus:border-ink" /></label>
        <button className="mt-6 min-h-12 bg-ink px-6 font-semibold text-white">Check order</button>
      </form>
    </ContentPage>
  );
}
