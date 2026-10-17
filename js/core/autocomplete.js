/**
 * autocomplete.js — Autocomplete search input component with keyboard navigation.
 * Queries dataService for matching cricketers, renders styled suggestions,
 * and handles selection.
 */

import { search } from './data-service.js';

/**
 * Creates an Autocomplete component attached to a container element.
 * @param {HTMLElement} container - Wrapper element
 * @param {Object} options
 * @param {function(Object): void} options.onSelect - Called when player is chosen
 * @param {string} [options.placeholder='Type cricketer name...']
 * @param {number} [options.limit=8]
 * @returns {Object} Autocomplete controller API
 */
export function createAutocomplete(container, options = {}) {
  const {
    onSelect,
    placeholder = 'Type cricketer name...',
    limit = 8,
  } = options;

  container.innerHTML = `
    <div class="autocomplete">
      <div class="autocomplete__input-wrapper">
        <input
          type="text"
          class="autocomplete__input"
          placeholder="${placeholder}"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-autocomplete="list"
          aria-expanded="false"
          aria-label="Guess cricketer name"
        />
        <button type="button" class="autocomplete__clear-btn" style="display: none;" aria-label="Clear input">✕</button>
      </div>
      <ul class="autocomplete__dropdown" style="display: none;" role="listbox"></ul>
    </div>
  `;

  const inputEl = container.querySelector('.autocomplete__input');
  const clearBtn = container.querySelector('.autocomplete__clear-btn');
  const dropdownEl = container.querySelector('.autocomplete__dropdown');

  let activeIndex = -1;
  let currentResults = [];
  let debounceTimer = null;

  function closeDropdown() {
    dropdownEl.style.display = 'none';
    dropdownEl.innerHTML = '';
    inputEl.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
    currentResults = [];
  }

  function renderDropdown(players, query) {
    currentResults = players;
    activeIndex = -1;

    if (!players || players.length === 0) {
      dropdownEl.innerHTML = `<li class="autocomplete__empty">No cricketers found for "${escapeHtml(query)}"</li>`;
      dropdownEl.style.display = 'block';
      inputEl.setAttribute('aria-expanded', 'true');
      return;
    }

    const html = players.map((player, idx) => {
      return `
        <li class="autocomplete__item" role="option" data-index="${idx}" id="ac-item-${idx}">
          <div class="autocomplete__item-name">${escapeHtml(player.name)}</div>
          <div class="autocomplete__item-meta">
            <span class="autocomplete__item-tag">${escapeHtml(player.country)}</span>
            <span>${escapeHtml(player.role)}</span>
          </div>
        </li>
      `;
    }).join('');

    dropdownEl.innerHTML = html;
    dropdownEl.style.display = 'block';
    inputEl.setAttribute('aria-expanded', 'true');
  }

  function highlightItem(index) {
    const items = dropdownEl.querySelectorAll('.autocomplete__item');
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('autocomplete__item--active');
        item.scrollIntoView({ block: 'nearest' });
        inputEl.setAttribute('aria-activedescendant', item.id);
      } else {
        item.classList.remove('autocomplete__item--active');
      }
    });
  }

  function selectItem(index) {
    if (index >= 0 && index < currentResults.length) {
      const selected = currentResults[index];
      inputEl.value = '';
      clearBtn.style.display = 'none';
      closeDropdown();
      if (onSelect) {
        onSelect(selected);
      }
    }
  }

  function handleInput() {
    const val = inputEl.value.trim();
    clearBtn.style.display = val.length > 0 ? 'flex' : 'none';

    clearTimeout(debounceTimer);
    if (val.length < 2) {
      closeDropdown();
      return;
    }

    debounceTimer = setTimeout(() => {
      const matches = search(val, limit);
      renderDropdown(matches, val);
    }, 150);
  }

  function handleKeyDown(e) {
    const isOpen = dropdownEl.style.display === 'block';

    if (e.key === 'ArrowDown') {
      if (!isOpen) return;
      e.preventDefault();
      activeIndex = (activeIndex + 1) % currentResults.length;
      highlightItem(activeIndex);
    } else if (e.key === 'ArrowUp') {
      if (!isOpen) return;
      e.preventDefault();
      activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
      highlightItem(activeIndex);
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0) {
        e.preventDefault();
        selectItem(activeIndex);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        closeDropdown();
      }
    }
  }

  // Event Listeners
  inputEl.addEventListener('input', handleInput);
  inputEl.addEventListener('keydown', handleKeyDown);

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    clearBtn.style.display = 'none';
    closeDropdown();
    inputEl.focus();
  });

  dropdownEl.addEventListener('click', (e) => {
    const item = e.target.closest('.autocomplete__item');
    if (item) {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      selectItem(idx);
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    focus() {
      inputEl.focus();
    },
    clear() {
      inputEl.value = '';
      clearBtn.style.display = 'none';
      closeDropdown();
    },
    disable() {
      inputEl.disabled = true;
      clearBtn.style.display = 'none';
      closeDropdown();
    },
    enable() {
      inputEl.disabled = false;
    },
    setValue(val) {
      inputEl.value = val;
      clearBtn.style.display = val ? 'flex' : 'none';
    },
  };
}
