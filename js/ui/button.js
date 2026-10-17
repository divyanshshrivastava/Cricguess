/**
 * button.js — Button helper utilities and styled button HTML generators.
 */

/**
 * Generate HTML string for a styled button.
 * @param {Object} options
 * @param {string} options.text - Button label
 * @param {string} [options.variant='primary'] - 'primary' | 'accent' | 'secondary' | 'ghost'
 * @param {string} [options.size=''] - 'sm' | 'lg' | ''
 * @param {string} [options.icon=''] - Emoji or icon character
 * @param {string} [options.id=''] - Element ID
 * @param {string} [options.className=''] - Extra CSS classes
 * @param {boolean} [options.disabled=false]
 * @returns {string} HTML button string
 */
export function renderButtonHTML({
  text,
  variant = 'primary',
  size = '',
  icon = '',
  id = '',
  className = '',
  disabled = false,
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size ? `btn--${size}` : '',
    className,
  ].filter(Boolean).join(' ');

  const idAttr = id ? `id="${id}"` : '';
  const disabledAttr = disabled ? 'disabled' : '';
  const iconSpan = icon ? `<span class="btn__icon">${icon}</span>` : '';

  return `<button type="button" class="${classes}" ${idAttr} ${disabledAttr}>${iconSpan}<span>${text}</span></button>`;
}
