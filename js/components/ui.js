import { icon } from './icons.js';
export function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
export function heading(eyebrow, title, text) { return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="subtitle">${text}</p></div><div class="heading-date">${icon('clock')}<span>${new Intl.DateTimeFormat('en-GB', {weekday:'short',day:'numeric',month:'short',timeZone:'Asia/Dhaka'}).format(new Date())}</span></div></div>`; }
export function emptyState(title, text, glyph = 'book', link = '') { return `<div class="empty-state"><span class="empty-icon">${icon(glyph)}</span><h3>${title}</h3><p>${text}</p>${link}</div>`; }
