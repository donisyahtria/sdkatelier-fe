import { useEffect, useRef, useState } from "react";

function GalleryArrow({ previous = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d={previous ? "M20 12H4m6-6-6 6 6 6" : "M4 12h16m-6-6 6 6-6 6"} />
    </svg>
  );
}

function GalleryPhoto({ src, alt }) {
  const [status, setStatus] = useState("loading");
  return (
    <>
      {status === "loading" && (
        <span className="gallery-image-status" role="status">
          Memuat foto…
        </span>
      )}
      {status === "error" && (
        <span className="gallery-image-status" role="status">
          Foto belum bisa dimuat.
        </span>
      )}
      <img
        className={`gallery-main-image ${status === "ready" ? "is-loaded" : ""}`}
        src={src}
        alt={alt}
        draggable="false"
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />
    </>
  );
}

export default function ProjectDialog({ project, onClose, email }) {
  const dialogRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const swipeRef = useRef(null);
  const backdropPressRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = project.images.length;
  const hasMultiple = total > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = oldOverflow;
      if (opener instanceof HTMLElement && opener.isConnected)
        opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const strip = thumbnailsRef.current;
    const selected = strip?.children[activeIndex];
    if (!selected) return;
    const left = selected.offsetLeft;
    if (
      left < strip.scrollLeft ||
      left + selected.offsetWidth > strip.scrollLeft + strip.clientWidth
    ) {
      strip.scrollTo({
        left: left - (strip.clientWidth - selected.offsetWidth) / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [activeIndex]);

  const move = (direction) =>
    setActiveIndex((index) => (index + direction + total) % total);
  const onKeyDown = (event) => {
    if (!hasMultiple || event.altKey || event.ctrlKey || event.metaKey) return;
    const direction =
      event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (!direction) return;
    event.preventDefault();
    const next = (activeIndex + direction + total) % total;
    setActiveIndex(next);
    if (event.target.closest(".gallery-thumbnail"))
      thumbnailsRef.current?.children[next]?.focus({ preventScroll: true });
  };
  const onSwipeStart = (event) => {
    if (
      !hasMultiple ||
      !event.isPrimary ||
      event.pointerType === "mouse" ||
      event.target.closest("button")
    )
      return;
    swipeRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onSwipeEnd = (event) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
      move(dx < 0 ? 1 : -1);
  };

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog project-gallery-dialog"
      aria-labelledby="project-title"
      data-lenis-prevent
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onPointerDown={(event) => {
        backdropPressRef.current = event.target === dialogRef.current;
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && backdropPressRef.current)
          onClose();
      }}
    >
      <div className="gallery-dialog-content">
        <header className="gallery-header">
          <div>
            <span className="gallery-eyebrow">
              {project.category} / {project.year}
            </span>
            <h2 id="project-title">{project.name}</h2>
          </div>
          <button
            className="gallery-close"
            onClick={onClose}
            aria-label="Tutup detail proyek"
            autoFocus
          >
            <span>CLOSE</span>
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className="gallery-body">
          <section
            className="project-gallery"
            aria-label={`Galeri ${project.name}`}
            aria-roledescription="carousel"
          >
            <div
              className="gallery-stage"
              onPointerDown={onSwipeStart}
              onPointerUp={onSwipeEnd}
              onPointerCancel={() => {
                swipeRef.current = null;
              }}
            >
              <GalleryPhoto
                key={activeIndex}
                src={project.images[activeIndex]}
                alt={`${project.name} — foto interior ${activeIndex + 1} dari ${total}`}
              />
              {hasMultiple && (
                <>
                  <button
                    className="gallery-arrow gallery-previous"
                    onClick={() => move(-1)}
                    aria-label="Foto sebelumnya"
                  >
                    <GalleryArrow previous />
                  </button>
                  <button
                    className="gallery-arrow gallery-next"
                    onClick={() => move(1)}
                    aria-label="Foto berikutnya"
                  >
                    <GalleryArrow />
                  </button>
                </>
              )}
            </div>
            <div className="gallery-toolbar">
              <span className="gallery-hint">
                {hasMultiple ? (
                  <>
                    <span className="gallery-desktop-hint">
                      PILIH FOTO ATAU GUNAKAN TOMBOL ← →
                    </span>
                    <span className="gallery-mobile-hint">
                      GESER UNTUK MELIHAT FOTO
                    </span>
                  </>
                ) : (
                  "PROJECT GALLERY"
                )}
              </span>
              <span
                className="gallery-counter"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={`Foto ${activeIndex + 1} dari ${total}`}
              >
                <span>{String(activeIndex + 1).padStart(2, "0")}</span>
                <span aria-hidden="true"> / </span>
                {String(total).padStart(2, "0")}
              </span>
            </div>
            {hasMultiple && (
              <div
                className="gallery-thumbnails"
                ref={thumbnailsRef}
                aria-label="Pilih foto proyek"
              >
                {project.images.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    className={`gallery-thumbnail ${index === activeIndex ? "is-active" : ""}`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Lihat foto ${index + 1} dari ${total}`}
                    aria-pressed={index === activeIndex}
                    tabIndex={index === activeIndex ? 0 : -1}
                  >
                    <img src={src} alt="" loading="lazy" draggable="false" />
                    <span className="thumbnail-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
          <div className="gallery-project-details">
            <div>
              <span className="gallery-eyebrow">LOCATION / YEAR</span>
              <p>
                {project.location}, Indonesia
                <br />
                {project.year}
              </p>
            </div>
            <div>
              <span className="gallery-eyebrow">ABOUT THE PROJECT</span>
              <p>{project.description}</p>
            </div>
          </div>
          <a
            className="pill-button gallery-contact"
            href={`mailto:${email}?subject=${encodeURIComponent(`Diskusi proyek terinspirasi ${project.name}`)}`}
          >
            LET'S CREATE YOUR SPACE
            <GalleryArrow />
          </a>
        </div>
      </div>
    </dialog>
  );
}
