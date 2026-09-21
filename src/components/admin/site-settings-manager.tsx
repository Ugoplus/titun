"use client";

import { FloppyDisk } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { SiteSettings } from "@/lib/site-content";

type SettingField = keyof SiteSettings;

const sections: Array<{
  name: string;
  description: string;
  fields: Array<{
    key: SettingField;
    label: string;
    help?: string;
    multiline?: boolean;
    type?: "email" | "tel";
    maxLength: number;
  }>;
}> = [
  {
    name: "Top announcement",
    description: "This message appears in the brown bar above the main navigation and links to the email sign-up form.",
    fields: [
      {
        key: "announcementText",
        label: "Announcement",
        maxLength: 140,
      },
    ],
  },
  {
    name: "Email sign-up popup",
    description: "Edit every message in the email popup, including what visitors see after registering.",
    fields: [
      { key: "emailPopupHeading", label: "Popup heading", maxLength: 90 },
      { key: "emailPopupCopy", label: "Popup message", multiline: true, maxLength: 320 },
      { key: "emailPopupButtonLabel", label: "Button label", maxLength: 40 },
      { key: "emailPopupConsentText", label: "Consent note", multiline: true, maxLength: 240 },
      { key: "emailPopupSuccessHeading", label: "Confirmation heading", maxLength: 90 },
      { key: "emailPopupSuccessCopy", label: "Confirmation message", multiline: true, maxLength: 240 },
      { key: "emailPopupSuccessButtonLabel", label: "Shop button label", maxLength: 40 },
    ],
  },
  {
    name: "About TITUN",
    description: "Edit the complete brand story shown on the About page. Each paragraph is kept separate for a clean reading layout.",
    fields: [
      { key: "aboutHeading", label: "Page heading", maxLength: 90 },
      { key: "aboutIntroduction", label: "Introduction", multiline: true, maxLength: 320 },
      { key: "aboutParagraphOne", label: "First paragraph", multiline: true, maxLength: 600 },
      { key: "aboutParagraphTwo", label: "Second paragraph", multiline: true, maxLength: 600 },
      { key: "aboutParagraphThree", label: "Third paragraph", multiline: true, maxLength: 600 },
      { key: "aboutClosing", label: "Closing line", maxLength: 140 },
    ],
  },
  {
    name: "Contact and social accounts",
    description: "These details appear on the Contact page, in the footer and on the WhatsApp chat button.",
    fields: [
      {
        key: "contactEmail",
        label: "Contact email",
        help: "Leave blank if the public email address is not ready yet.",
        type: "email",
        maxLength: 254,
      },
      {
        key: "whatsappNumber",
        label: "WhatsApp number",
        help: "A Nigerian number can be entered as 07069310085.",
        type: "tel",
        maxLength: 24,
      },
      {
        key: "instagramHandle",
        label: "Instagram account",
        help: "Enter the account name only, for example @Titunrenewal.",
        maxLength: 31,
      },
      {
        key: "tiktokHandle",
        label: "TikTok account",
        help: "Enter the account name only, for example @Titunrenewal.",
        maxLength: 31,
      },
    ],
  },
];

export function SiteSettingsManager({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  );

  const update = (key: SettingField, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const publish = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Site details could not be published");
      setSettings(result.settings);
      setSavedSettings(result.settings);
      toast.success("Site details published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Site details could not be published");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="site-details" className="mt-16 scroll-mt-6 border-t border-ink/20 pt-10">
      <div className="border-b border-ink/20 pb-7">
        <h2 className="font-display text-4xl tracking-[-.025em] md:text-5xl">Site details</h2>
        <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-ink/70">
          Manage the top announcement, email sign-up popup, About page story and public contact details in one place.
        </p>
      </div>

      <div className="divide-y divide-ink/20">
        {sections.map((section) => (
          <fieldset key={section.name} className="grid gap-5 py-8 lg:grid-cols-[minmax(13rem,.55fr)_minmax(24rem,1.45fr)] lg:gap-12">
            <legend className="sr-only">{section.name}</legend>
            <div>
              <h3 className="font-display text-3xl">{section.name}</h3>
              <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink/65">{section.description}</p>
            </div>
            <div className="grid gap-5">
              {section.fields.map((field) => {
                const helpId = field.help ? `${field.key}-help` : undefined;
                const sharedClassName = "w-full border border-ink/30 bg-white px-4 py-3 font-normal leading-relaxed focus:border-ink";
                return (
                  <label key={field.key} className="grid gap-2 text-sm font-semibold">
                    {field.label}
                    {field.multiline ? (
                      <textarea
                        value={settings[field.key]}
                        maxLength={field.maxLength}
                        rows={4}
                        aria-describedby={helpId}
                        onChange={(event) => update(field.key, event.target.value)}
                        className={`${sharedClassName} resize-y`}
                      />
                    ) : (
                      <input
                        value={settings[field.key]}
                        maxLength={field.maxLength}
                        type={field.type ?? "text"}
                        aria-describedby={helpId}
                        onChange={(event) => update(field.key, event.target.value)}
                        className={`${sharedClassName} min-h-12`}
                      />
                    )}
                    {field.help && (
                      <span id={helpId} className="text-xs font-normal leading-relaxed text-ink/60">
                        {field.help}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-ink/20 py-6 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-sm text-ink/65" role="status">
          {dirty ? "You have unpublished site changes." : "Site details are published."}
        </p>
        <button
          type="button"
          onClick={() => setSettings(savedSettings)}
          disabled={!dirty || saving}
          className="inline-flex min-h-12 items-center justify-center border border-ink/30 px-5 text-sm font-semibold hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Discard changes
        </button>
        <button
          type="button"
          onClick={() => void publish()}
          disabled={!dirty || saving}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-6 text-sm font-semibold text-white hover:bg-walnut disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FloppyDisk aria-hidden="true" /> {saving ? "Publishing…" : "Publish site details"}
        </button>
      </div>
    </section>
  );
}
