import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { InstructorIcon } from "@/components/icons";
import { clsx } from "@/lib/clsx";

type SanityImageRef = { asset?: { _ref: string; _type: "reference" } };

/** Circular avatar. Falls back to a generic unisex silhouette when there's no photo asset. */
export function Avatar({
  image,
  alt,
  size = 80,
  className,
}: {
  image: SanityImageRef | null | undefined;
  alt: string;
  size?: number;
  className?: string;
}) {
  if (!image?.asset?._ref) {
    return (
      <span
        className={clsx(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-neutral-400",
          className,
        )}
        style={{ width: size, height: size }}
        role="img"
        aria-label={alt}
      >
        <InstructorIcon style={{ width: size * 0.6, height: size * 0.6 }} />
      </span>
    );
  }

  return (
    <Image
      src={urlFor(image).width(size * 2).height(size * 2).url()}
      alt={alt}
      width={size}
      height={size}
      className={clsx("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
