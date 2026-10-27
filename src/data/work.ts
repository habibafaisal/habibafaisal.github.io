// Work history and projects. Used by the home page (summary) and /work (full entries).
// Edit the wording freely; `summary` is the one line shown on the home page.

export interface Link {
  label: string;
  href: string;
}

export interface WorkEntry {
  id: string;
  org: string;
  role: string;
  years: string;
  context: string;
  summary: string;
  body: string[];
  links?: Link[];
}

export const work: WorkEntry[] = [
  {
    id: 'fintech',
    org: 'Stealth US (freight-factoring)',
    role: 'Software engineer',
    years: '2026',
    context: 'Advancing cash to trucking companies against their unpaid invoices. I joined after working with the same founder at Sail Wellness.',
    summary: 'Built the core platform for an invoice-factoring fintech: funding decisions, ledger, money movement.',
    body: [
      'I designed and built the core platform from scratch: onboarding, invoice extraction, underwriting, funding, collections and the operator console.',
      'Funding decisions run through a deterministic rule engine over facts an LLM extracts from documents. The AI reads; the code decides. Every decision replays to the same answer because the extracted facts are frozen once, and the audit trail is append-only.',
      'Money moves through Column (ACH and Fedwire). Payment execution is idempotent, keyed per instruction, so retries and crash recovery don’t double-pay. The ledger is double-entry and reconciles against the bank, so differences surface on their own.',
      'I integrated Plaid for bank-account ownership, FMCSA for carrier verification, Auth0 for operator identity, and Anthropic’s API for document parsing.',
      'I led technical development of a deterministic backtest engine for the credit rules. The useful catches there came from factoring knowledge, not from the code. One headline backtest number turned out not to be point-in-time, so we retracted it and reported a smaller, point-in-time result.',
      'I also built the frontend: the operator console and the carrier portal. I used the product the way an operator would, mapped the full operator flows, and designed the UI around them.',
      'I worked directly with the founder to turn credit policy and cash-flow rules into shipped features, and pushed for quicker feedback loops throughout.',
    ],
  },
  {
    id: 'sail',
    org: 'Sail Wellness',
    role: 'Technical co-founder',
    years: '2025–2026',
    context: 'Health-tech. Joined as an engineer in 2025 and became technical co-founder later that year.',
    summary: 'Led the pivot from calorie tracking to ingredient safety, shown where people shop.',
    body: [
      'I led the pivot with the founder from calorie tracking to ingredient safety for products.',
      'Instead of asking people to open our own app, we put the information at the point of purchase: a Chrome extension that analyses ingredients on product, listing and checkout pages on Amazon, Instacart and Walmart.',
      'I designed the ingredient-matching, scoring and safety-detection logic behind it.',
      'During the pivot I dropped LLMs from scoring, because results had to be deterministic and explainable, and pushed for no-login access so we could see real engagement.',
      'Before the pivot, I built AI meal logging from photos and natural language in the mobile app, added subscriptions, and shipped the App Store and Play Store releases.',
      'When Sail hired part-time engineers, I shaped the work for them. I cut their scope and gave them the product context they needed to make good calls on their own.',
    ],
    links: [
      { label: 'sailwellness.app', href: 'https://sailwellness.app' },
      { label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/sail-%E2%80%93-clean-ingredient-f/mmgnbeoipmliebeopcegepfeddbgfdag' },
    ],
  },
  {
    id: 'livedin',
    org: 'Livedin',
    role: 'Software engineer',
    years: '2024–2025',
    context: 'Property management, Saudi Arabia.',
    summary: 'Shipped two property-management apps to the stores, the first one in four months.',
    body: [
      'I shipped the Livedin Host MVP in four months: a property-management app for hosts with check-in and check-out, chat support, a booking calendar and vendor payments, synced with Airbnb and other OTAs through a channel manager.',
      'I then built the Livedin Captain app for on-the-ground operations staff: task viewing, status updates and filtering.',
      'I ran both iOS and Android launches, from TestFlight and beta programs to the store releases, and introduced feature flags for controlled rollouts.',
      'I came in without knowing property management or the Saudi market, and learned both on the job.',
    ],
    links: [
      { label: 'Host on App Store', href: 'https://apps.apple.com/us/app/livedin-host/id6503932993' },
      { label: 'Host on Google Play', href: 'https://play.google.com/store/apps/details?id=com.livedin' },
      { label: 'Captain on App Store', href: 'https://apps.apple.com/us/app/captain-app/id6621250334' },
      { label: 'Captain on Google Play', href: 'https://play.google.com/store/apps/details?id=com.captainapp' },
    ],
  },
];

export interface Project {
  name: string;
  href?: string;
  body: string;
}

export const projects: Project[] = [
  {
    name: 'Mellow',
    href: '/mellow/',
    body: 'A Chrome extension that gives Google Docs a real dark mode: the page itself goes dark while images keep their true colours. Plus a writer sidebar with chapters, notes and a daily word goal. Free, with an optional Pro tier.',
  },
  {
    name: 'Swing Badminton',
    href: 'https://swing-badminton.letsplayyy.workers.dev',
    body: 'A badminton game in the browser, controlled by tracking your hand through the webcam. Play solo against the computer, or two players on one webcam. Free to play.',
  },
];
