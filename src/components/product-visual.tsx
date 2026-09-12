import Image from "next/image";
const palettes = [
  ["#d8ff3e", "#7cab6c"],
  ["#d8c8ef", "#876d9e"],
  ["#b6e6dc", "#428276"],
  ["#f1c6a8", "#c77452"],
];
export function ProductVisual({
  images,
  name,
  index = 0,
  className = "",
  priority = false,
}: {
  images: string[];
  name: string;
  index?: number;
  className?: string;
  priority?: boolean;
}) {
  if (images[0])
    return (
      <div className={`relative overflow-hidden bg-canvas ${className}`}>
        <Image
          src={images[0]}
          alt={`${name} product packaging`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
      </div>
    );
  const [a, b] = palettes[index % palettes.length];
  return (
    <div
      aria-label={`${name} placeholder product artwork`}
      role="img"
      className={`product-art grain relative overflow-hidden ${className}`}
      style={{ "--art-a": a, "--art-b": b } as React.CSSProperties}
    />
  );
}
