import React from "react";
import type { EventDetailData } from "@/src/content/events";

interface EventContactsProps {
  contacts: EventDetailData["contacts"];
}

export default function EventContacts({ contacts }: EventContactsProps): React.ReactElement {
  return (
    <section className="contact" id="contact">
      <p className="eyebrow">
        <span className="eyebrow__rule" />
        For further queries, contact
      </p>

      <ul className="contact__list">
        {contacts.map((contact) => (
          <li key={contact.name}>
            <span className="contact__name">{contact.name}</span>
            <a
              className="contact__phone"
              href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
            >
              {contact.phone}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
