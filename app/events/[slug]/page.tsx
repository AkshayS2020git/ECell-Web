import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getAllEventSlugs } from "@/src/data/eventsData";
import { SITE_URL } from "@/src/utils/constants";
import EventDetailClient from "./EventDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    // metaTitle already ends with the site name, so skip the layout template.
    title: { absolute: event.metaTitle },
    description: event.metaDescription,
    openGraph: {
      title: event.metaTitle,
      description: event.metaDescription,
      url: `${SITE_URL}/events/${event.slug}`,
      images: [
        {
          url: "/og-image.webp",
          width: 1200,
          height: 630,
          alt: event.title,
          type: "image/webp",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.metaTitle,
      description: event.metaDescription,
    },
    alternates: {
      canonical: `${SITE_URL}/events/${event.slug}`,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
