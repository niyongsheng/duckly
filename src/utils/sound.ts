/**
 * Play the notification sound alert.
 * Silently ignores autoplay restrictions and unsupported environments.
 */
export function playNotificationSound(): void {
  try {
    const audio = new Audio("/sounds/notification.wav");
    audio.volume = 0.5;
    audio.play().catch(() => {
      // autoplay blocked by browser — silently ignore
    });
  } catch {
    // Audio API not supported
  }
}
