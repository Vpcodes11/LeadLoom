import Image from "next/image";

/**
 * Full-bleed background photography (Unsplash License: free for commercial use, no attribution
 * required). Served from images.unsplash.com through next/image, so each visitor gets a resized,
 * modern-format copy. The overlay keeps white text readable over bright skies.
 */
export const PHOTOS = {
  // Golden-hour meadow with a lone tree: unsplash.com/photos/fh1RIFQI_8M
  meadow: "https://images.unsplash.com/photo-1626348448069-9b156d20faeb",
  // Stars over a golden wheat field: unsplash.com/photos/ekAX5n1uw2U
  night: "https://images.unsplash.com/photo-1567618614330-de8d46051dbb",
  // Calm golden field at the edge of a wood: unsplash.com/photos/vi3KPA1_9BY
  field: "https://images.unsplash.com/photo-1655857235282-bd934e956feb",
} as const;

export function Photo({ src, alt = "", position = "center", priority = false, overlay }: {
  src: string;
  alt?: string;
  position?: string;
  priority?: boolean;
  overlay: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={alt ? undefined : true}>
      <Image src={src} alt={alt} fill priority={priority} sizes="100vw" quality={78} className="ll-photo object-cover" style={{ objectPosition: position }} />
      <div className="absolute inset-0" style={{ background: overlay }} />
      <div className="ll-grain absolute inset-0" />
    </div>
  );
}
