/**
 * Module-level registry enforcing that only ONE dropdown is open at a time,
 * deterministically (independent of focus/blur timing). Each DropdownSelect
 * registers its close handler when it opens; opening another closes the
 * previous one. Also lets the host close the open dropdown (e.g. on scroll).
 */
let currentClose: (() => void) | null = null;
// Whether the currently-open dropdown is inline. Modal dropdowns close via their
// own backdrop, so the host's tap detector (markUserTap) must NOT close them
// (it would close on a panel swipe). Only inline dropdowns use markUserTap.
let currentIsInline = false;

// Subscribers notified whenever the open/closed state changes (e.g. the host
// locks its ScrollView while a dropdown is open so the list scrolls internally).
const listeners = new Set<(open: boolean) => void>();
function notify(): void {
  const open = currentClose != null;
  listeners.forEach((l) => l(open));
}

/** Subscribe to open-state changes. Returns an unsubscribe fn. */
export function subscribeOpen(listener: (open: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Register an opening dropdown. Closes the previously-open one (if different). */
export function registerOpen(close: () => void, isInline = false): void {
  if (currentClose && currentClose !== close) {
    const prev = currentClose;
    currentClose = close;
    currentIsInline = isInline;
    prev();
    notify();
    return;
  }
  currentClose = close;
  currentIsInline = isInline;
  notify();
}

/** Unregister on close. No-op if this isn't the current one. */
export function unregisterOpen(close: () => void): void {
  if (currentClose === close) {
    currentClose = null;
    notify();
  }
}

/** Close whichever dropdown is currently open (host hook, e.g. on scroll). */
export function closeOpenDropdowns(): void {
  if (currentClose) {
    const c = currentClose;
    currentClose = null;
    c();
    notify();
  }
}

// --- outside-tap detection (keyboard-independent) ---
// Touch events bubble child -> parent. The open dropdown's wrapper calls
// markInsideTap() first; the host root calls markUserTap() after. So if a tap
// reached the root WITHOUT passing through the dropdown, it was outside -> close.
// This works whether or not the keyboard is up (a keyboard collapse/Done/Back
// produces NO app touch, so the dropdown stays open).
let insideTap = false;

/** The open dropdown's wrapper calls this on touch start (fires before root). */
export function markInsideTap(): void {
  insideTap = true;
}

/** Host root calls this on every touch start. Closes the open dropdown if the
 *  touch did not originate inside it. */
export function markUserTap(): void {
  if (insideTap) {
    insideTap = false; // tap was inside the open dropdown — keep it open
    return;
  }
  // Only close INLINE dropdowns here. Modal dropdowns close via their backdrop;
  // closing them on every host touch would kill a panel swipe (scroll).
  if (currentIsInline) closeOpenDropdowns();
}
