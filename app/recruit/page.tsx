import type { Metadata } from "next";
import Link from "next/link";
import SubNav from "@/src/sections/Nav/SubNav";
import SiteCredit from "@/src/components/SiteCredit/SiteCredit";
import {
  RECRUITMENT,
  RECRUITMENT_FAQ,
  RECRUITMENT_ROUNDS,
  RECRUITMENT_STEPS,
  RECRUITMENT_TEAMS,
} from "@/src/data/recruitment";
import { INSTAGRAM, SITE_URL } from "@/src/utils/constants";
import { padNumber as pad } from "@/src/utils/math";
import EventsLink from "./EventsLink";
import RecruitForm from "./RecruitForm";
import ScrollLink from "./ScrollLink";
import "./Recruit.css";

// The application Server Action waits on Apps Script, which can take well
// over 10s; give it room on hosts whose default limit is shorter.
export const maxDuration = 60;

const description =
  "ECell RV University is recruiting. Join the PR, social media and content, design, documentation or tech team and help build the startup community on campus.";

export const metadata: Metadata = {
  title: "Join the Team",
  description,
  openGraph: {
    title: "Join the Team | ECell RV University",
    description,
    url: `${SITE_URL}/recruit`,
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "ECell RV University Recruitment",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Team | ECell RV University",
    description,
  },
  alternates: {
    canonical: `${SITE_URL}/recruit`,
  },
};

export default function RecruitPage() {
  return (
    <>
      <SubNav />
      <main className="rc-page">
        {/* ============ HERO ============ */}
        <section className="rc-hero">
          <div className="rc-hero-copy">
            <p className="rc-eyebrow">
              <span />
              {RECRUITMENT.season.toUpperCase()}
            </p>

            <h1>
              Your seat
              <br />
              is <em>waiting.</em>
            </h1>

            <p className="rc-hero-tagline">
              Build things. Meet founders. Make things happen.
            </p>

            <p className="rc-hero-intro">
              ECell is opening its doors again, and this time we&apos;re looking
              for new members to join our teams. Pick your team. Tell us who
              you are. Let&apos;s build together.
            </p>

            <div className="rc-actions">
              {RECRUITMENT.isOpen && (
                <ScrollLink
                  className="rc-button rc-button--solid"
                  href="#apply"
                  targets={["#rc-form", "#apply"]}
                  focusField
                >
                  Register now <span aria-hidden="true">→</span>
                </ScrollLink>
              )}
              <ScrollLink className="rc-button" href="#teams">
                SEE THE TEAMS <span aria-hidden="true">↓</span>
              </ScrollLink>
            </div>
          </div>

          <aside className="rc-status" aria-label="Recruitment details">
            <p className={`rc-status__state${RECRUITMENT.isOpen ? " is-open" : ""}`}>
              <i aria-hidden="true" />
              {RECRUITMENT.isOpen ? "APPLICATIONS OPEN" : "APPLICATIONS CLOSED"}
            </p>
            <dl>
              <div>
                <dt>Deadline</dt>
                <dd>{RECRUITMENT.deadline}</dd>
              </div>
              <div>
                <dt>Teams hiring</dt>
                <dd>{pad(RECRUITMENT_TEAMS.length)}</dd>
              </div>
              <div>
                <dt>Rounds</dt>
                <dd>{pad(RECRUITMENT_ROUNDS.length)}</dd>
              </div>
              <div>
                <dt>Open to</dt>
                <dd>{RECRUITMENT.openTo}</dd>
              </div>
            </dl>
          </aside>
        </section>

        <div className="rc-content">
          {/* ============ TEAMS ============ */}
          <section id="teams" className="rc-section" aria-labelledby="rc-teams-title">
            <div className="rc-section-head">
              <h2 id="rc-teams-title">THE TEAMS</h2>
              <span>{pad(RECRUITMENT_TEAMS.length)} OPEN</span>
            </div>

            <ul className="rc-teams">
              {RECRUITMENT_TEAMS.map((team) => (
                <li className="rc-team" key={team.id}>
                  <h3>{team.name}</h3>
                  <p className="rc-team__tagline">{team.tagline}</p>
                  <p>{team.description}</p>
                  <ul className="rc-team__duties">
                    {team.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          {/* ============ PROCESS ============ */}
          <section className="rc-section" aria-labelledby="rc-process-title">
            <div className="rc-section-head">
              <h2 id="rc-process-title">HOW IT WORKS</h2>
              <span>{pad(RECRUITMENT_STEPS.length)} STEPS</span>
            </div>

            <ol className="rc-steps">
              {RECRUITMENT_STEPS.map((step, index) => (
                <li className="rc-step" key={step.title}>
                  <span>{pad(index + 1)}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* ============ APPLY ============ */}
          <section id="apply" className="rc-section" aria-labelledby="rc-apply-title">
            <div className="rc-section-head">
              <h2 id="rc-apply-title">APPLY</h2>
              <span>CLOSES {RECRUITMENT.deadline.toUpperCase()}</span>
            </div>

            <div className="rc-apply">
              <div className="rc-apply__intro">
                <h3>
                  Five minutes.
                  <br />
                  <em>Honest answers.</em>
                </h3>
                <p>
                  We read every application ourselves. Tell us what you care
                  about. That counts for more than polished writing or a long CV.
                </p>
              </div>

              {RECRUITMENT.isOpen ? (
                <RecruitForm />
              ) : (
                <div className="rc-success">
                  <h3>
                    Applications are <em>closed.</em>
                  </h3>
                  <p>
                    This round is over. Follow{" "}
                    <a href={INSTAGRAM.url} target="_blank" rel="noreferrer">
                      {INSTAGRAM.handle}
                    </a>{" "}
                    to hear when the next one opens.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ============ FAQ ============ */}
          <section className="rc-section" aria-labelledby="rc-faq-title">
            <div className="rc-section-head">
              <h2 id="rc-faq-title">QUESTIONS</h2>
              <a href={`mailto:${RECRUITMENT.contactEmail}`}>
                {RECRUITMENT.contactEmail.toUpperCase()} ↗
              </a>
            </div>

            <div className="rc-faq">
              {RECRUITMENT_FAQ.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ============ EVENTS ============ */}
          <section className="rc-section rc-explore" aria-labelledby="rc-explore-title">
            <div className="rc-section-head">
              <h2 id="rc-explore-title">WHILE YOU&apos;RE HERE</h2>
              <span>EVENTS &amp; WORKSHOPS</span>
            </div>

            <div className="rc-explore__body">
              <h3>
                See what you&apos;d
                <br />
                <em>be building.</em>
              </h3>
              <EventsLink className="rc-button rc-button--solid">
                Explore events <span aria-hidden="true">→</span>
              </EventsLink>
            </div>
          </section>
        </div>

        <footer className="rc-footer">
          <span>ECELL RV UNIVERSITY</span>
          <span>BUILD / FAIL / LEARN / REPEAT</span>
          <Link className="rc-footer-home" href="/" aria-label="Back to homepage">
            ← HOME
          </Link>
        </footer>

        <SiteCredit />
      </main>
    </>
  );
}
