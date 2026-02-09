/**
 * Keyboard shortcuts handler
 */

export interface KeyboardShortcuts {
  Space: () => void         // Play/pause
  KeyK: () => void          // Play/pause (alternative)
  KeyF: () => void          // Fullscreen
  KeyM: () => void          // Mute
  KeyT: () => void          // Theater mode
  ArrowLeft: () => void     // Seek backward 5s
  ArrowRight: () => void    // Seek forward 5s
  ArrowUp: () => void       // Volume up
  ArrowDown: () => void     // Volume down
  Digit0: () => void        // Seek to 0%
  Digit1: () => void        // Seek to 10%
  Digit2: () => void        // Seek to 20%
  Digit3: () => void        // Seek to 30%
  Digit4: () => void        // Seek to 40%
  Digit5: () => void        // Seek to 50%
  Digit6: () => void        // Seek to 60%
  Digit7: () => void        // Seek to 70%
  Digit8: () => void        // Seek to 80%
  Digit9: () => void        // Seek to 90%
}

export function createKeyboardHandler(
  shortcuts: Partial<KeyboardShortcuts>
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return
    }

    const handler = shortcuts[event.code as keyof KeyboardShortcuts]
    if (handler) {
      event.preventDefault()
      handler()
    }
  }
}
