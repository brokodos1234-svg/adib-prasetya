import Image from "next/image";

export function Logo({
  className = "h-8 w-auto",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="BSS logo"
      width={861}
      height={320}
      className={`${className} ${invert ? "brightness-0 invert" : ""}`}
      priority
    />
  );
}
