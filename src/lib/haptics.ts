/**
 * Triggers a subtle vibration on devices that support it.
 * Used for premium tactile feedback on mobile.
 */
export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  switch (style) {
    case 'light':
      navigator.vibrate(10);
      break;
    case 'medium':
      navigator.vibrate(20);
      break;
    case 'heavy':
      navigator.vibrate(40);
      break;
    case 'success':
      navigator.vibrate([20, 50, 20]);
      break;
    default:
      navigator.vibrate(10);
  }
};
