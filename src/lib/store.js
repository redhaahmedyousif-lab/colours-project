/**
 * Minimal state container: State → Actions → UI update.
 *
 * Actions call `set()` with a new (immutable) slice of state. UI code
 * subscribes to the exact slice it renders, so a like updates one button and
 * a new comment updates one list, instead of re-rendering whole pages.
 */
export function createStore(initial) {
  let state = initial;
  const subscribers = new Set();

  return {
    get: () => state,

    set(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...next };
      subscribers.forEach((fn) => fn(state));
    },

    /** Call `listener(slice)` whenever `selector(state)` changes. Returns an unsubscribe function. */
    subscribe(selector, listener, { immediate = true } = {}) {
      let last = selector(state);
      const fn = (s) => {
        const next = selector(s);
        if (next !== last) {
          last = next;
          listener(next);
        }
      };
      subscribers.add(fn);
      if (immediate) listener(last);
      return () => subscribers.delete(fn);
    },
  };
}
