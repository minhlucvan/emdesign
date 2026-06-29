/**
 * chatCssService — Chat CSS injection service.
 *
 * Separates CSS logic from the ChatModeController React component.
 * Pure functions: buildChatCSS returns a CSS string, injectChatCSS
 * creates/removes a style element in document.head.
 */

const STYLE_ID = 'emdesign-chat-css';

/**
 * Build the CSS string for the chat overlay.
 * @param isDark - true for dark mode, false for light mode
 * @returns CSS string
 */
export function buildChatCSS(isDark: boolean): string {
  const bg = isDark ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)';
  const text = isDark ? 'hsl(0 0% 90%)' : 'hsl(0 0% 10%)';

  return [
    `body.emdesign-chat-active .sidebar-item { display: none; }`,
    `body.emdesign-chat-active .sidebar-subheading { display: none; }`,
    `body.emdesign-chat-active .search-field { display: none; }`,
    `body.emdesign-chat-active .sidebar-header { display: flex; }`,
    `:root { --emdesign-bg: ${bg}; --emdesign-text: ${text}; }`,
  ].join('\n');
}

/**
 * Inject or remove the chat CSS style element.
 * @param enabled - true to add, false to remove
 */
export function injectChatCSS(enabled: boolean): void {
  const existing = document.getElementById(STYLE_ID);

  if (enabled) {
    if (existing) return; // already injected — no-op
    const isDark =
      document.body.classList.contains('dark') ||
      document.querySelector('[data-theme="dark"]') !== null ||
      (document.querySelector('.sidebar')?.getAttribute('data-color-scheme') === 'dark');

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = buildChatCSS(isDark);
    document.head.appendChild(style);
    document.body.classList.add('emdesign-chat-active');
  } else {
    if (existing) existing.remove();
    document.body.classList.remove('emdesign-chat-active');
  }
}
