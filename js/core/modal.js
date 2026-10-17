/**
 * modal.js — Generic modal manager with accessibility, focus trapping, and animations.
 */

let activeModal = null;
let previousFocusedElement = null;

/**
 * Open a modal element.
 * @param {HTMLElement} modalBackdrop - The .modal-backdrop container
 */
export function openModal(modalBackdrop) {
  if (!modalBackdrop) return;

  if (activeModal && activeModal !== modalBackdrop) {
    closeModal(activeModal);
  }

  previousFocusedElement = document.activeElement;
  activeModal = modalBackdrop;

  modalBackdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // Focus close button or first focusable element
  const focusable = modalBackdrop.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length > 0) {
    setTimeout(() => focusable[0].focus(), 50);
  }

  // Bind keydown for ESC and Tab trap
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Close an open modal element.
 * @param {HTMLElement} [modalBackdrop] - Defaults to currently active modal
 */
export function closeModal(modalBackdrop = activeModal) {
  if (!modalBackdrop) return;

  modalBackdrop.classList.remove('is-open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeyDown);

  if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
    previousFocusedElement.focus();
  }

  if (activeModal === modalBackdrop) {
    activeModal = null;
  }
}

function handleKeyDown(e) {
  if (!activeModal) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal(activeModal);
    return;
  }

  if (e.key === 'Tab') {
    const focusables = Array.from(
      activeModal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

/**
 * Set up backdrop click closing on a modal element.
 * @param {HTMLElement} modalBackdrop
 */
export function setupModalDismiss(modalBackdrop) {
  if (!modalBackdrop) return;

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop || e.target.closest('[data-modal-close]')) {
      closeModal(modalBackdrop);
    }
  });
}
