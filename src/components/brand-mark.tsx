import Image from "next/image";

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-11 w-11",
} as const;

export function BrandMark({
  size = "sm",
  className = "",
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-white/20 ${sizeClasses[size]} ${className}`}
    >
      <Image
        src="/brand/watering-can.png"
        alt="Kai Nuvari"
        fill
        sizes="44px"
        className="object-cover"
        priority
      />
    </span>
  );
}
