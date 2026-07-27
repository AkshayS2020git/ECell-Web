import './Footer.css';

const FOOTER_LINKS = [
  { label: 'About', href: '#aboutSection' },
  { label: 'Events', href: '#eventsSection' },
  { label: 'Speakers', href: '#speakers' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/rv.university/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ecell-rv-university/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@RVUniversity' },
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

        <div className="footer-socials" aria-label="Social media links">
          <span className="footer-links-label">FOLLOW</span>
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label} <span aria-hidden="true">↗</span>
            </a>
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
