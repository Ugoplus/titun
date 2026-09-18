import type { ReactNode } from "react";

export function ContentPage({
  title,
  introduction,
  headerAlign = "left",
  singleLineTitle = false,
  children,
}: {
  title: string;
  introduction: string;
  headerAlign?: "left" | "center";
  singleLineTitle?: boolean;
  children: ReactNode;
}) {
  const isCentered = headerAlign === "center";

  return (
    <div className="bg-white">
      <header className="border-b border-ink/15 px-5 py-16 md:px-8 md:py-24">
        <div className={`mx-auto max-w-[1200px] ${isCentered ? "text-center" : ""}`}>
          <h1 className={`max-w-5xl font-display leading-[.86] tracking-[-.035em] ${singleLineTitle ? "whitespace-nowrap text-[clamp(1.625rem,5vw,4rem)]" : "text-[clamp(4rem,8vw,6rem)]"} ${isCentered ? "mx-auto" : ""}`}>
            {title}
          </h1>
          <p className={`mt-8 max-w-2xl text-lg leading-relaxed text-ink/65 ${isCentered ? "mx-auto" : ""}`}>
            {introduction}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        {children}
      </div>
    </div>
  );
}
