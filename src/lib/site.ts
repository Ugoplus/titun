const fallbackUrl = "https://titunrenewal.com";

export const siteUrl = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl);
  } catch {
    return new URL(fallbackUrl);
  }
})();

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
