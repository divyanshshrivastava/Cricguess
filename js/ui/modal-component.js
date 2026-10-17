/**
 * modal-component.js — Reusable modal DOM factory and standard game dialogs.
 */

import { openModal, closeModal, setupModalDismiss } from '../core/modal.js';

/**
 * Create a modal DOM structure.
 * @param {Object} options
 * @param {string} options.id - Modal ID
 * @param {string} options.title - Header title
 * @param {string} options.contentHtml - Body content HTML
 * @param {string} [options.footerHtml=''] - Footer HTML
 * @returns {{ backdrop: HTMLElement, open: Function, close: Function, updateBody: Function }}
 */
export function createModal({ id, title, contentHtml, footerHtml = '' }) {
  // Remove existing modal with this ID if present
  const existing = document.getElementById(id);
  if (existing) {
    existing.parentNode.removeChild(existing);
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = id;
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', `${id}-title`);

  backdrop.innerHTML = `
    <div class="modal">
      <header class="modal__header">
        <h2 class="modal__title" id="${id}-title">${title}</h2>
        <button type="button" class="modal__close" data-modal-close aria-label="Close dialog">✕</button>
      </header>
      <div class="modal__body">
        ${contentHtml}
      </div>
      ${footerHtml ? `<footer class="modal__footer">${footerHtml}</footer>` : ''}
    </div>
  `;

  document.body.appendChild(backdrop);
  setupModalDismiss(backdrop);

  return {
    backdrop,
    open: () => openModal(backdrop),
    close: () => closeModal(backdrop),
    updateBody: (html) => {
      const body = backdrop.querySelector('.modal__body');
      if (body) body.innerHTML = html;
    },
    updateFooter: (html) => {
      let footer = backdrop.querySelector('.modal__footer');
      if (!footer && html) {
        footer = document.createElement('footer');
        footer.className = 'modal__footer';
        backdrop.querySelector('.modal').appendChild(footer);
      }
      if (footer) footer.innerHTML = html;
    },
  };
}
