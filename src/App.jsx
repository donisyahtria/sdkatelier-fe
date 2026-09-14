import { useEffect, useRef, useState } from "react";
import { defaultContent } from "./data/content";
import { getContent, isSafeUrl } from "./lib/content";
import { RevealLine, MotionImage } from "./components/Motion";
import { usePageMotion } from "./hooks/usePageMotion";
import ProjectDialog from "./components/ProjectDialog";

function Arrow({ diagonal = false, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden="true"
      {...props}
    >
      {diagonal ? (
        <path d="M5 19 19 5M5 5h14v14" />
      ) : (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

function SectionLabel({ children, className = "" }) {
  return (
    <span className={`section-label ${className}`} data-reveal="fade">
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Header({ studio }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);
  return (
    <header className="topbar" data-reveal="fade">
      <a
        href="#home"
        className="monogram"
        aria-label={`${studio.name} — beranda`}
      >
        d<span>.</span>
      </a>
      <span className="topbar-note">SPACES WITH SOUL.</span>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? "CLOSE −" : "MENU +"}
      </button>
      <nav
        id="main-nav"
        aria-label="Navigasi utama"
        className={open ? "is-open" : ""}
      >
        {[
          ["home", "MAIN"],
          ["about", "ABOUT"],
          ["projects", "PROJECTS"],
          ["services", "SERVICES"],
          ["contact", "CONTACT"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            {label}
            <span className="nav-dot" />
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero({ hero, studio, reducedMotion }) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(reducedMotion);
  const [failed, setFailed] = useState(false);
  useEffect(() => setPaused(reducedMotion), [reducedMotion]);
  useEffect(() => setFailed(false), [hero.media.src]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else video.play().catch(() => setPaused(true));
  }, [paused, hero.media.src]);
  const words = studio.name.split(" ");
  const showVideo = hero.media.type === "video" && !failed;
  const frozenGif = hero.media.type === "gif" && paused;
  return (
    <section className="hero" aria-label="Djiwaruang Studio">
      <h1 className="wordmark" aria-label={studio.name} key={studio.name}>
        {words.map((word, index) => (
          <RevealLine
            className={`wordmark-word ${index === words.length - 1 ? "wordmark-studio" : ""}`}
            delay={200 + index * 100}
            key={index}
          >
            {Array.from(word).map((letter, i) => (
              <span className="letter" key={i} aria-hidden="true">
                {letter}
              </span>
            ))}
          </RevealLine>
        ))}
      </h1>
      <div className="hero-meta">
        <RevealLine delay={400}>INDEPENDENT DESIGN STUDIO</RevealLine>
        <RevealLine delay={600}>{hero.eyebrow}</RevealLine>
      </div>
      <div
        className={`hero-frame ${paused ? "motion-paused" : ""}`}
        data-reveal="hero"
        style={{ "--reveal-delay": "400ms" }}
      >
        {showVideo ? (
          <video
            className="hero-media"
            ref={videoRef}
            src={hero.media.src}
            poster={hero.media.poster}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
            aria-label={hero.media.alt}
          />
        ) : frozenGif && !hero.media.poster ? (
          <div className="hero-media paused-placeholder">Motion paused</div>
        ) : (
          <img
            className={`hero-media ${hero.media.type === "image" ? "drifting-image" : ""}`}
            src={
              failed
                ? hero.media.poster || defaultContent.hero.media.src
                : frozenGif
                  ? hero.media.poster
                  : hero.media.src
            }
            alt={hero.media.alt}
            fetchPriority="high"
          />
        )}
        <div className="hero-shade" />
        <span className="hero-image-note">DESIGNED TO FEEL LIKE YOU.</span>
        <div className="hero-bottom">
          <span>{hero.caption}</span>
          <button
            className="motion-toggle"
            onClick={() => setPaused(!paused)}
            aria-label={paused ? "Putar animasi hero" : "Jeda animasi hero"}
            aria-pressed={!paused}
          >
            <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
            {paused ? "PLAY" : "PAUSE"}
          </button>
        </div>
      </div>
      <h2 className="hero-statement">
        <RevealLine>{hero.title[0]}</RevealLine>
        <RevealLine delay={120}>{hero.title[1]}</RevealLine>
      </h2>
    </section>
  );
}

function About({ about }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section id="about" className="about section-space">
      <div className="about-title">
        <SectionLabel>THE STUDIO</SectionLabel>
        <h2>
          {about.heading.map((line, index) => (
            <RevealLine key={line} delay={index * 100}>
              {line}
            </RevealLine>
          ))}
        </h2>
        <span className="small-note">
          CONSIDERED DESIGN.
          <br />
          EVERYDAY BEAUTY.
        </span>
      </div>
      <div className="about-body">
        <span className="about-side-note">A LITTLE ABOUT US</span>
        <figure className="about-photo">
          <MotionImage src={about.images[0].src} alt={about.images[0].alt} />
          <figcaption>01 / A sense of belonging.</figcaption>
        </figure>
        <div className="about-copy">
          <MotionImage
            src={about.images[1].src}
            alt={about.images[1].alt}
            delay={160}
          />
          <p>{about.text}</p>
          <div id="about-more" hidden={!expanded}>
            <p>{about.more}</p>
          </div>
          <button
            className="pill-button"
            aria-expanded={expanded}
            aria-controls="about-more"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "LESS ABOUT US" : "MORE ABOUT US"}
            <span aria-hidden="true">{expanded ? "−" : "+"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Projects({ projects, email }) {
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null);
  const filtered = projects.filter(
    (project) => filter === "All" || project.category === filter,
  );
  const visible = showAll ? filtered : filtered.slice(0, 4);
  return (
    <section id="projects" className="projects section-space">
      <div className="section-heading">
        <SectionLabel>SELECTED PROJECTS</SectionLabel>
        <h2 className="editorial-title">
          <RevealLine>Revealing the</RevealLine>
          <RevealLine delay={100}>
            potential <i>of every</i>
          </RevealLine>
          <RevealLine as="strong" delay={200}>
            SPACE.
          </RevealLine>
        </h2>
      </div>
      <div className="project-toolbar">
        <span>A SELECTION OF SPACES WE'VE SHAPED</span>
        <div className="project-filters" aria-label="Filter proyek">
          {["All", "Residential", "Commercial"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setFilter(item);
                setShowAll(false);
              }}
              className={filter === item ? "active" : ""}
              aria-pressed={filter === item}
            >
              {item}
              <span>
                {String(
                  item === "All"
                    ? projects.length
                    : projects.filter((project) => project.category === item)
                        .length,
                ).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="project-list">
        {visible.map((project, index) => (
          <article
            className={`project-row ${index % 2 ? "project-reversed" : ""}`}
            key={project.id}
          >
            <button
              className="project-info"
              onClick={() => setSelected(project)}
              aria-label={`Lihat proyek ${project.name}`}
            >
              <span className="project-index">
                ({String(projects.indexOf(project) + 1).padStart(2, "0")})
              </span>
              <span className="project-info-center">
                <span className="category-tag">{project.category}</span>
                <h3>{project.name}</h3>
                <span className="project-location">
                  {project.location} · {project.year}
                </span>
              </span>
              <span className="project-view">
                EXPLORE PROJECT <Arrow diagonal />
              </span>
            </button>
            {project.images.slice(0, 2).map((src, i) => (
              <button
                className="project-image"
                key={`${src}-${i}`}
                onClick={() => setSelected(project)}
                aria-label={`Lihat ${project.name}, foto ${i + 1}`}
              >
                <MotionImage
                  src={src}
                  alt={`${project.name} — interior ${project.category.toLowerCase()}`}
                  zoom={false}
                />
                <span className="image-arrow">
                  <Arrow diagonal />
                </span>
              </button>
            ))}
          </article>
        ))}
      </div>
      {filtered.length > 4 && (
        <div className="projects-more">
          <button className="pill-button" onClick={() => setShowAll(!showAll)}>
            {showAll ? "FEWER PROJECTS" : "MORE PROJECTS"}
            <span>{showAll ? "−" : "+"}</span>
          </button>
        </div>
      )}
      {selected && (
        <ProjectDialog
          key={selected.id}
          project={selected}
          onClose={() => setSelected(null)}
          email={email}
        />
      )}
    </section>
  );
}

function Services({ services, email }) {
  const [active, setActive] = useState(null);
  return (
    <section id="services" className="services section-space">
      <div className="section-heading">
        <SectionLabel>WHAT WE DO</SectionLabel>
        <h2 className="editorial-title">
          <RevealLine>A thoughtful &</RevealLine>
          <RevealLine delay={100}>personal</RevealLine>
          <RevealLine as="strong" delay={200}>
            PROCESS.
          </RevealLine>
        </h2>
      </div>
      <div className="services-list">
        {services.map((service, index) => (
          <div
            className={`service-row ${active === index ? "expanded" : ""}`}
            key={service.title}
          >
            <span className="service-stage">{service.stage}</span>
            <div className="service-main">
              <h3>
                <button
                  aria-expanded={active === index}
                  aria-controls={`service-${index}`}
                  onClick={() => setActive(active === index ? null : index)}
                >
                  <span>{service.title}</span>
                  <span className="service-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="service-toggle" aria-hidden="true">
                    {active === index ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div id={`service-${index}`} hidden={active !== index}>
                <p>{service.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="service-cta">
        <p>Good spaces begin with a conversation.</p>
        <a
          className="pill-button"
          href={`mailto:${email}?subject=Let's%20talk%20about%20my%20space`}
        >
          LET'S TALK ABOUT YOUR SPACE
          <Arrow diagonal />
        </a>
      </div>
    </section>
  );
}

function Journal({ studio, journal }) {
  const hasInstagram = isSafeUrl(studio.instagramUrl);
  return (
    <section className="journal section-space">
      <div className="journal-top">
        <SectionLabel>THE IN-BETWEEN</SectionLabel>
        <span>DETAILS, INSPIRATIONS & EVERYDAY MOMENTS</span>
      </div>
      <div className="journal-collage">
        <MotionImage src={journal.images[0].src} alt={journal.images[0].alt} />
        <span
          className="journal-word"
          data-parallax="marquee"
          aria-label={journal.title}
        >
          <span className="marquee-track" aria-hidden="true">
            <span>{journal.title}&nbsp;&nbsp;</span>
            <span>{journal.title}&nbsp;&nbsp;</span>
          </span>
        </span>
        <MotionImage
          src={journal.images[1].src}
          alt={journal.images[1].alt}
          delay={150}
        />
      </div>
      <div className="journal-bottom">
        <span>{journal.caption}</span>
        {hasInstagram && (
          <a href={studio.instagramUrl} target="_blank" rel="noreferrer">
            FIND US ON INSTAGRAM
            <Arrow diagonal />
          </a>
        )}
      </div>
    </section>
  );
}

function OtherPages() {
  return (
    <section className="other-pages section-space" aria-label="Jelajahi proyek">
      <SectionLabel>OTHER PAGES</SectionLabel>
      <a href="#projects" className="other-pages-link">
        <RevealLine>PROJECTS</RevealLine>
        <Arrow diagonal />
      </a>
    </section>
  );
}

function Footer({ studio }) {
  return (
    <footer id="contact" className="footer section-space">
      <div className="contact-heading">
        <SectionLabel>HAVE A SPACE IN MIND?</SectionLabel>
        <a href={`mailto:${studio.email}`} className="contact-title">
          <RevealLine>Let's make</RevealLine>
          <RevealLine delay={100}>room for you.</RevealLine>
          <Arrow diagonal />
        </a>
      </div>
      <div className="footer-links">
        <span>
          THOUGHTFUL INTERIORS.
          <br />
          MEANINGFUL CONNECTIONS.
        </span>
        <div>
          <span className="footer-label">SAY HELLO</span>
          <a href={`mailto:${studio.email}`}>{studio.email}</a>
          <span>Based in {studio.location}</span>
        </div>
        <div>
          <span className="footer-label">EXPLORE</span>
          <a href="#about">About the studio</a>
          <a href="#projects">Selected projects</a>
          <a href="#services">Our services</a>
        </div>
        <a href="#home" className="back-top">
          BACK TO TOP ↑
        </a>
      </div>
      <a className="footer-wordmark" href={`mailto:${studio.email}`}>
        <RevealLine>{studio.name}</RevealLine>
        <Arrow diagonal />
      </a>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {studio.name.toUpperCase()}
        </span>
        <span>SPACES WITH SOUL.</span>
        <span>DESIGNED WITH INTENTION.</span>
      </div>
    </footer>
  );
}

export default function App() {
  const rootRef = useRef(null);
  const [content, setContent] = useState(defaultContent);
  const reducedMotion = useReducedMotion();
  usePageMotion(rootRef, reducedMotion);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    getContent(controller.signal)
      .then(setContent)
      .catch((error) => {
        if (error.name !== "AbortError")
          console.warn("CMS unavailable; displaying local content.", error);
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Lewati ke konten
      </a>
      <div className="site-shell" id="home" ref={rootRef}>
        <Header studio={content.studio} />
        <main id="main-content">
          <Hero
            hero={content.hero}
            studio={content.studio}
            reducedMotion={reducedMotion}
          />
          <About about={content.about} />
          <Projects projects={content.projects} email={content.studio.email} />
          <Services services={content.services} email={content.studio.email} />
          <Journal studio={content.studio} journal={content.journal} />
          <OtherPages />
        </main>
        <Footer studio={content.studio} />
      </div>
    </>
  );
}
