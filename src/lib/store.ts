import { useSyncExternalStore } from "react";

/**
 * A tiny reactive, localStorage-backed store — no external dependency.
 *
 * This stands in for a real backend (CI Database / CI Data Hub). The
 * contract it establishes — one shared piece of state, read by every
 * module through selectors, mutated through named functions, persisted
 * outside any single component — is what a real API-backed store will
 * replace later without changing how modules consume it.
 */
type Listener = () => void;

export interface Store<T> {
  get: () => T;
  set: (updater: T | ((prev: T) => T)) => void;
  subscribe: (listener: Listener) => () => void;
}

export function createStore<T>(key: string, initial: T): Store<T> {
  let state: T = loadInitial();
  const listeners = new Set<Listener>();

  function loadInitial(): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // private mode, quota, or corrupt data — fall back to defaults
    }
    return initial;
  }

  function persist() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // best-effort only; the app still works in-memory for this session
    }
  }

  function get() {
    return state;
  }

  function set(updater: T | ((prev: T) => T)) {
    state = typeof updater === "function" ? (updater as (prev: T) => T)(state) : updater;
    persist();
    listeners.forEach((l) => l());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { get, set, subscribe };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** Reset a store back to a fresh value and re-persist it (used by "reset demo data"). */
export function resetStore<T>(store: Store<T>, value: T) {
  store.set(value);
}
