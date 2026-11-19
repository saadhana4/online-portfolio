/**
 * Module-level state tracking whether the initial home loading sequence
 * has executed during this page session.
 * Kept in memory only (NOT in localStorage/sessionStorage) so a browser
 * refresh (F5) re-runs the sequence as requested.
 */
let hasCompletedInitialLoad = false;

export function getHasCompletedInitialLoad(): boolean {
  return hasCompletedInitialLoad;
}

export function setHasCompletedInitialLoad(val: boolean = true): void {
  hasCompletedInitialLoad = val;
}
