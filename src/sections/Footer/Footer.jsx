import './Footer.css';

const FOOTER_LINKS = [
  { label: 'About', href: '#aboutSection' },
  { label: 'Events', href: '#eventsSection' },
  { label: 'Speakers', href: '#speakers' },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-rule" />
      <div className="wrap footer-main">
        <div className="footer-intro">
          <span className="footer-eyebrow">ENTREPRENEURSHIP CELL / RV UNIVERSITY</span>
          <h2>Let&apos;s build what&apos;s next.</h2>
        </div>

        <div className="footer-links" aria-label="Footer navigation">
          <span className="footer-links-label">EXPLORE</span>
          {FOOTER_LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        <a className="footer-contact" href="mailto:ecell@rvu.edu.in">
          <span>START A CONVERSATION</span>
          <strong>ecell@rvu.edu.in <span aria-hidden="true">↗</span></strong>
        </a>
      </div>

      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} ECELL RV UNIVERSITY</span>
        <button className="footer-top-button" onClick={scrollToTop} type="button">
          BACK TO TOP <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
