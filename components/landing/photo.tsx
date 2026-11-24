import Image from "next/image";

/** Full-bleed still background (a frame from the Leadloom hero film), with a readability overlay. */
export function Photo({ src, position = "center", overlay }: { src: string; position?: string; overlay: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Image src={src} alt="" fill sizes="100vw" quality={80} className="ll-photo object-cover" style={{ objectPosition: position }} />
      <div className="absolute inset-0" style={{ background: overlay }} />
      <div className="ll-grain absolute inset-0" />
    </div>
  );
}
