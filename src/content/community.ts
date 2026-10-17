// Canned answers for the WhatsApp community chat demo. The first rule that
// matches a visitor's message wins; rules 2-6 also appear as suggestion chips.

export interface QAEntry {
  id: string;
  chipLabel: string;
  pattern: RegExp;
  reply: string;
}

export const COMMUNITY_QA_RULES: QAEntry[] = [
  {
    id: "greetings",
    chipLabel: "Say Hello",
    pattern: /\b(hi|hello|hey|yo|sup|greetings)\b/i,
    reply: "Hey there! 👋 Type any question about ECell, events, joining, or building your idea, and I'll be happy to help!",
  },
  {
    id: "about",
    chipLabel: "What is ECell?",
    pattern: /\b(what is|about)\b.*\b(ecell|ecell|entrepreneurship cell)\b|\b(what is ecell|what is ecell|about ecell|about ecell)\b|\b(about)\b/i,
    reply: "ECell RV University is the campus entrepreneurship community. We help students explore ideas, learn from founders, meet collaborators, and take their first steps towards building something impactful.",
  },
  {
    id: "join",
    chipLabel: "How to join?",
    pattern: /\b(join|register|registration|membership|how to join|where to register|sign up|volunteer)\b/i,
    reply: "Tap 'Join the community' above to join our official WhatsApp group! We share event registrations, core team recruitments, and collaboration opportunities directly in the community.",
  },
  {
    id: "events",
    chipLabel: "Upcoming events",
    pattern: /\b(event|events|workshop|workshops|talk|talks|session|sessions)\b/i,
    reply: "We're the driving force behind top entrepreneurial events at RVU! Our This year lineup is going to start from Kalpvikas, Pitch-e-thon, founder sessions, and workshops. Join our WhatsApp community to lock in your spot and never miss an update!",
  },
    {
    id: "eligibility",
    chipLabel: "Who can join?",
    pattern: /\b(who can|eligible|eligibility|can i|for who|who is it for|requirements)\b/i,
    reply: "Anyone at RV University curious about entrepreneurship can join! You don't need a startup or prior experience — just curiosity and a willingness to learn and build.",
  },
  {
    id: "benefits",
    chipLabel: "Why join?",
    pattern: /\b(what do|offer|benefits|why join|why ecell|why ecell|opportunity|opportunities)\b/i,
    reply: "ECell brings you founder talks, hands-on workshops, hackathons, pitch competitions, mentorship, and a vibrant builder community. It is the ultimate launchpad to turn your ideas into action.",
  },
  {
    id: "startup",
    chipLabel: "Have an idea?",
    pattern: /\b(idea|ideas|startup|startups|build|building|founder|founders|mentor|mentors|collaborate|co-founder|cofounder)\b/i,
    reply: "Have an idea or looking to start something? You don't need to have everything figured out yet. Share your idea in our community to find co-founders, access mentors, and start building!",
  },
  {
    id: "Kalpvikas",
    chipLabel: "dates for events",
    pattern: /\b(when is kalpvikas| kalpvikas|pitch-e-thon|when is pitch-e-thon|when is pitch-e-thon)\b/i,
    reply: "For now the dates of the events are not offical but you can join our whatsapp community to get updates and exact dates",
  },
  {
  id: "kalpvikas_details",
  chipLabel: "About Kalpvikas",
  pattern: /\b(what is kalpvikas|kalpvikas summit|kalpvikas event)\b/i,
  reply: "Kalpvikas is RVU flagship TECH FEST. It lats for 2 days and hosts many flagship TECH events. Ecell takes part in this and Hosts different events such as HACKATHONS and FOUNDERS TAlK and many more!",
  },
  {
  id: "pitchethon_details",
  chipLabel: "About Pitch-e-thon",
  pattern: /\b(what is pitch[-\s]?e[-\s]?thon|pitch competition|pitch contest|pitch event)\b/i,
  reply: "Pitch-e-thon is our high-energy startup pitch competition! Students pitch their ideas to a panel of founders and investors. It's a great way to test your idea, win prizes, and get real feedback. Exact dates will be announced in our WhatsApp community!",
  },
  {
    id: "cost",
    chipLabel: "Is it free?",
    pattern: /\b(cost|fee|fees|free|paid|payment|price|money|charge)\b/i,
    reply: "Joining the ECell WhatsApp community is 100% free! Core team membership is also free, while select flagship events may have nominal registration fees.",
  },
  {
    id: "team",
    chipLabel: "Core Team",
    pattern: /\b(team|members|member|who runs|core team|lead|leaders|board)\b/i,
    reply: "ECell is student-led by a passionate team of student builders and organizers at RV University. The core team has 8 members consists of Advisory head, Advisory, President, VP and leads of all teams. You can see them in team section",
  },
  {
    id: "interested",
    chipLabel: "Get Involved",
    pattern: /\b(interested|get involved|want to participate)\b/i,
    reply: "Awesome! We'd love to have you onboard. Tap 'Join the community' above to hop into our official WhatsApp group and get involved right away.",
  },
  {
    id: "contact",
    chipLabel: "Contact & Socials",
    pattern: /\b(contact|reach|instagram|email|social|socials|handle|link|connect)\b/i,
    reply: "The fastest way to stay connected is by joining our WhatsApp group! You can also follow ECell RV University on Instagram and social channels for regular updates.",
  },
  {
    id: "ecell_general",
    chipLabel: "ECell Info",
    pattern: /\b(ecell|ecell)\b/i,
    reply: "ECell RV University is the campus entrepreneurship hub. Tap 'Join the community' to connect with fellow builders and stay updated on all upcoming opportunities!",
  },
];

export const COMMUNITY_DEFAULT_REPLY = "I can help with questions about ECell, joining the community, events, or building your startup idea. Type a question or tap one of the suggested topics below!";
