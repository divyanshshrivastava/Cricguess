/**
 * event-bus.js — Tiny pub/sub event bus for cross-module communication.
 * Avoids direct module coupling; modes and UI communicate via events
 * like 'game:won', 'game:lost', 'mode:changed', 'theme:changed'.
 */

/**
 * Creates a new EventBus instance.
 * @returns {EventBus}
 */
export function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  return {
    /**
     * Subscribe to an event.
     * @param {string} event - Event name (e.g. 'game:won')
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(callback);

      // Return unsubscribe function
      return () => listeners.get(event)?.delete(callback);
    },

    /**
     * Emit an event to all subscribers.
     * @param {string} event - Event name
     * @param {*} [data] - Optional payload
     */
    emit(event, data) {
      const handlers = listeners.get(event);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (err) {
            console.error(`[EventBus] Error in handler for "${event}":`, err);
          }
        });
      }
    },

    /**
     * Remove a specific listener for an event.
     * @param {string} event - Event name
     * @param {Function} callback - Handler to remove
     */
    off(event, callback) {
      listeners.get(event)?.delete(callback);
    },

    /**
     * Subscribe to an event, but only fire once.
     * @param {string} event - Event name
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    once(event, callback) {
      const wrapper = (data) => {
        callback(data);
        this.off(event, wrapper);
      };
      return this.on(event, wrapper);
    },

    /**
     * Remove all listeners for an event, or all events if none specified.
     * @param {string} [event] - Optional event name
     */
    clear(event) {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    },
  };
}
