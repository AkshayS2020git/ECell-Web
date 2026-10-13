"use client";

import React from "react";
import { scrollToY } from "@/src/utils/lenis";

// Clears the fixed nav so the target doesn't land underneath it.
const NAV_OFFSET = -100;

interface ScrollLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** In-page fallback, used without JavaScript, e.g. "#apply". */
  href: string;
  /** Selectors to scroll to, first match wins. Defaults to `href`. */
  targets?: string[];
  /** Move focus to the target's first field once there (mouse and trackpad only). */
  focusField?: boolean;
}

/**
 * An in-page link that scrolls with the site's smooth scroll instead of the
 * browser's instant jump, and leaves no #hash behind in the URL.
 */
export default function ScrollLink({
  href,
  targets = [href],
  focusField = false,
  onClick,
  ...props
}: ScrollLinkProps): React.ReactElement {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = targets
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .find((element) => element !== null);
    if (!target) return;

    event.preventDefault();
    // Scroll to a measured offset rather than the element: Lenis adds the
    // section's CSS scroll-margin on top of any offset, the native fallback
    // used on phones doesn't, so the two would land in different places.
    scrollToY(target.getBoundingClientRect().top + window.scrollY, { offset: NAV_OFFSET });

    // Skipped on touch screens, where focusing a field pops the keyboard up
    // over the form mid-scroll.
    if (focusField && window.matchMedia("(pointer: fine)").matches) {
      target
        .querySelector<HTMLElement>("input:not([type=hidden]):not([tabindex='-1']), select, textarea")
        ?.focus({ preventScroll: true });
    }
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
