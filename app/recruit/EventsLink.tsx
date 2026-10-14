"use client";

import React from "react";
import Link from "next/link";
import { startPageTransition } from "@/src/components/PageTransition/PageTransition";

type EventsLinkProps = Omit<React.ComponentProps<typeof Link>, "href" | "onNavigate">;

/** A link to /events that plays the same curtain as the nav's Events link. */
export default function EventsLink(props: EventsLinkProps): React.ReactElement {
  return (
    <Link
      href="/events"
      // The curtain navigates once the screen is covered. New-tab and
      // modified clicks never reach here.
      onNavigate={(event) => {
        event.preventDefault();
        startPageTransition("/events");
      }}
      {...props}
    />
  );
}
