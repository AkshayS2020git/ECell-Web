import React from "react";
import "./SiteCredit.css";

/**
 * "Crafted with ♥ by ECell Tech Team" — the last line of every page.
 * The home page carries it inside its footer; other pages render this.
 */
export default function SiteCredit(): React.ReactElement {
  return (
    <p className="site-credit">
      Crafted with{" "}
      <span className="site-credit__heart" aria-label="love" role="img">
        ♥
      </span>{" "}
      by ECell Tech Team
    </p>
  );
}
