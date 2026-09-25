import type { ReactNode } from "react";

export function isVideoMedia(url: string | null | undefined) {
  if (!url) return false;
  const clean = (url.split("?")[0] ?? "").toLowerCase();
  return /\.(mp4|webm|mov|m4v|ogg|ogv)(?:$|#)/.test(clean);
}

export function MediaPreview({
  url,
  alt,
  poster,
  className = "",
  controls = false,
  autoPlay = false,
  loop = false,
}: {
  url: string | null | undefined;
  alt: string;
  poster?: string | null;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}) {
  if (!url) return null;
  if (isVideoMedia(url)) {
    return (
      <video
        src={url}
        poster={poster ?? undefined}
        controls={controls}
        autoPlay={autoPlay}
        muted={autoPlay}
        loop={loop}
        playsInline
        preload="metadata"
        className={className}
        aria-label={alt}
      />
    );
  }
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}
