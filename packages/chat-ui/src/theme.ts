"use client"

import React from "react"

/**
 * CSS variable reference — matches shadcn-chatbot-kit's zinc dark theme.
 * Injected into .emdesign-chat-root scope.
 */
export const shadcnVars: Record<string, string> = {
  '--background': '240 10% 3.9%',
  '--foreground': '0 0% 98%',
  '--muted': '240 3.7% 15.9%',
  '--muted-foreground': '240 5% 64.9%',
  '--popover': '240 10% 3.9%',
  '--popover-foreground': '0 0% 98%',
  '--card': '240 10% 3.9%',
  '--card-foreground': '0 0% 98%',
  '--border': '240 3.7% 15.9%',
  '--input': '240 3.7% 15.9%',
  '--primary': '0 0% 98%',
  '--primary-foreground': '240 5.9% 10%',
  '--secondary': '240 3.7% 15.9%',
  '--secondary-foreground': '0 0% 98%',
  '--accent': '240 3.7% 15.9%',
  '--accent-foreground': '0 0% 98%',
  '--destructive': '0 62.8% 30.6%',
  '--destructive-foreground': '0 0% 98%',
  '--ring': '240 4.9% 83.9%',
  '--radius': '0.5rem',
};

export const css = (v: string) => `hsl(var(${v}))`;

let injected = false;
export function injectShadcnVars(rootClass = 'emdesign-chat-root') {
  if (injected) return;
  injected = true;
  const vars = Object.entries(shadcnVars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  const style = document.createElement('style');
  style.id = 'emdesign-chat-vars';
  style.textContent = `.${rootClass} {\n${vars}\n}\n.${rootClass} { color: ${css('--foreground')}; background: ${css('--background')}; font-size: 13px; }`;
  document.head.appendChild(style);
}

export function resetVarInjection() {
  injected = false;
}
