// Keep the mask separate from its moving child so typography never shifts layout.
export function RevealLine({
  as: Tag = "span",
  children,
  className = "",
  delay = 0,
}) {
  return (
    <Tag
      className={`motion-line ${className}`}
      data-reveal="line"
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      <span className="motion-line-inner">{children}</span>
    </Tag>
  );
}

export function MotionImage({
  src,
  alt,
  className = "",
  delay = 0,
  zoom = true,
}) {
  return (
    <span
      className={`motion-image ${className}`}
      data-reveal={zoom ? "image" : "photo"}
      data-parallax="image"
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      <span className="motion-image-crop">
        <img src={src} alt={alt} loading="lazy" />
      </span>
    </span>
  );
}
