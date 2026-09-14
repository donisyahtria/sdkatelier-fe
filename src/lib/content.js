import { defaultContent } from "../data/content";

const isText = (value) => typeof value === "string" && value.trim().length > 0;
export function isSafeUrl(value) {
  if (!isText(value)) return false;
  try {
    return ["http:", "https:"].includes(
      new URL(value, window.location.origin).protocol,
    );
  } catch {
    return false;
  }
}

function validContent(data) {
  return (
    data &&
    isText(data.studio?.name) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.studio.email) &&
    isText(data.studio.location) &&
    ["image", "gif", "video"].includes(data.hero?.media?.type) &&
    isSafeUrl(data.hero.media.src) &&
    isText(data.hero.media.alt) &&
    (!data.hero.media.poster || isSafeUrl(data.hero.media.poster)) &&
    isText(data.hero.eyebrow) &&
    isText(data.hero.caption) &&
    Array.isArray(data.hero.title) &&
    data.hero.title.length === 2 &&
    data.hero.title.every(isText) &&
    Array.isArray(data.about?.heading) &&
    data.about.heading.every(isText) &&
    isText(data.about.text) &&
    isText(data.about.more) &&
    Array.isArray(data.about.images) &&
    data.about.images.length >= 2 &&
    data.about.images.every(
      (item) => isSafeUrl(item.src) && isText(item.alt),
    ) &&
    Array.isArray(data.projects) &&
    data.projects.length > 0 &&
    new Set(data.projects.map((item) => item.id)).size ===
      data.projects.length &&
    data.projects.every(
      (item) =>
        isText(item.id) &&
        isText(item.name) &&
        ["Residential", "Commercial"].includes(item.category) &&
        isText(item.description) &&
        isText(item.location) &&
        isText(item.year) &&
        Array.isArray(item.images) &&
        item.images.length > 0 &&
        item.images.every(isSafeUrl),
    ) &&
    isText(data.journal?.title) &&
    isText(data.journal.caption) &&
    Array.isArray(data.journal.images) &&
    data.journal.images.length === 2 &&
    data.journal.images.every(
      (item) => isSafeUrl(item.src) && isText(item.alt),
    ) &&
    Array.isArray(data.services) &&
    data.services.length > 0 &&
    data.services.every(
      (item) =>
        isText(item.title) && isText(item.stage) && isText(item.description),
    )
  );
}

export async function getContent(signal) {
  const endpoint = import.meta.env.VITE_CMS_CONTENT_URL;
  if (!endpoint) return defaultContent;
  const response = await fetch(endpoint, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`CMS returned ${response.status}`);
  const data = await response.json();
  if (!validContent(data))
    throw new Error("CMS content does not match the expected schema");
  return data;
}
