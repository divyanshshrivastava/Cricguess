/**
 * seo.js — Dynamic <head> metadata & JSON-LD structured data manager.
 */

import { SITE } from '../config.js';

/**
 * Set or update a meta tag in document head.
 * @param {string} name - Attribute name (name or property)
 * @param {string} value - Attribute value (e.g. 'description' or 'og:title')
 * @param {string} content - Meta tag content
 */
function setMeta(name, value, content) {
  let el = document.querySelector(`meta[${name}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(name, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Update page SEO tags.
 * @param {Object} options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} [options.url] - Canonical URL
 * @param {string} [options.image] - Social preview image URL
 * @param {Object} [options.jsonLd] - Schema.org JSON-LD object
 */
export function updateSEO({
  title,
  description,
  url = window.location.href,
  image = `${SITE.url}/assets/og-image.svg`,
  jsonLd = null,
}) {
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  document.title = fullTitle;

  setMeta('name', 'description', description);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:type', 'website');

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);

  // Update canonical link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);

  // Inject or update JSON-LD
  if (jsonLd) {
    let script = document.getElementById('json-ld-seo');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-seo';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }
}
