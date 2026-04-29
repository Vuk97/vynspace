import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BedDouble,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Coins,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Globe2,
  GraduationCap,
  HandCoins,
  HandHeart,
  HelpCircle,
  Home,
  KeyRound,
  Landmark,
  Layers3,
  Leaf,
  Link,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Network,
  Phone,
  Play,
  ReceiptText,
  Ruler,
  ScrollText,
  Search,
  Send,
  ShieldCheck,
  Sofa,
  Sparkles,
  Trophy,
  UploadCloud,
  UsersRound,
  Video,
  WalletCards,
  Wifi,
  X,
} from "lucide-react";
import HeroScene from "./HeroScene.jsx";
import PageScene from "./PageScene.jsx";

const navItems = [
  { id: "home", label: "Home" },
  { id: "spaces", label: "Spaces" },
  { id: "apt", label: "APT" },
  { id: "jobs", label: "Jobs" },
  { id: "finance", label: "Finance" },
  { id: "campus", label: "Campus" },
  { id: "about", label: "About" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

const utilityItems = [
  { id: "faq", label: "FAQ" },
  { id: "donation", label: "Donation" },
  { id: "metaverse", label: "Metaverse" },
];

const spaces = [
  {
    id: "campus",
    title: "Campus",
    eyebrow: "Digital city hall",
    summary:
      "A guided dashboard for documents, appointments, courses, community, rewards, and institutional processes.",
    icon: GraduationCap,
    accent: "cyan",
    bullets: ["Government links", "Document vault", "Courses and clubs", "University data"],
  },
  {
    id: "apt",
    title: "APT",
    eyebrow: "Housing access",
    summary:
      "Verified users can view homes, check eligibility, request viewings, and generate rental contracts.",
    icon: Building2,
    accent: "green",
    bullets: ["Apartment filters", "Eligibility checks", "Viewing requests", "Contract flow"],
  },
  {
    id: "jobs",
    title: "Jobs",
    eyebrow: "Work and training",
    summary:
      "Opportunities, skill assessment, matching, employer outreach, and staffing-style placement workflows.",
    icon: BriefcaseBusiness,
    accent: "amber",
    bullets: ["Training listings", "Fit scores", "Company profiles", "Placement contracts"],
  },
  {
    id: "finance",
    title: "Finance",
    eyebrow: "Banking layer",
    summary:
      "White-label account creation, spending insights, payments, and future loans, insurance, and investments.",
    icon: Landmark,
    accent: "violet",
    bullets: ["Solaris integration", "Transfers", "Income and expense", "USDT pilot"],
  },
];

const pageCards = [
  ...spaces,
  {
    id: "register",
    title: "Register",
    eyebrow: "Verified onboarding",
    summary:
      "Capture personal data, documents, consent, and identity verification before service access is unlocked.",
    icon: ShieldCheck,
    accent: "cyan",
  },
  {
    id: "about",
    title: "About",
    eyebrow: "Vision and mission",
    summary:
      "The company story, founder vision, and operating principles behind VYN Space.",
    icon: Globe2,
    accent: "green",
  },
  {
    id: "blog",
    title: "Blog",
    eyebrow: "Updates and voices",
    summary:
      "Editorial updates from VYN Space plus user stories from the relocation journey.",
    icon: ScrollText,
    accent: "amber",
  },
  {
    id: "contact",
    title: "Appointments",
    eyebrow: "CEO and team contact",
    summary:
      "Business inquiries, partner calls, and direct contact through Calendly and a secure form.",
    icon: CalendarDays,
    accent: "violet",
  },
  {
    id: "faq",
    title: "FAQ",
    eyebrow: "Fast answers",
    summary:
      "Plain answers with direct links for verification, housing, banking, jobs, and campus access.",
    icon: HelpCircle,
    accent: "cyan",
  },
  {
    id: "donation",
    title: "Donation",
    eyebrow: "Support access",
    summary:
      "Donation paths for PayPal and crypto contributions with compliance-first messaging.",
    icon: HandCoins,
    accent: "green",
  },
  {
    id: "metaverse",
    title: "Metaverse",
    eyebrow: "Immersive future",
    summary:
      "A future 3D space for registered users, events, support, and avatar-led navigation.",
    icon: Layers3,
    accent: "violet",
  },
];

const apartments = [
  {
    title: "VYN Mitte Compact",
    city: "Berlin",
    size: "42 sqm",
    layout: "1.5 rooms",
    furnished: "Yes",
    extras: "Balcony",
    energy: "Included",
    wifi: "Yes",
    price: "M",
    status: "Available",
  },
  {
    title: "Rhine Study Loft",
    city: "Cologne",
    size: "31 sqm",
    layout: "Studio",
    furnished: "Yes",
    extras: "Shared garden",
    energy: "Included",
    wifi: "Yes",
    price: "S",
    status: "Available",
  },
  {
    title: "Isar Family Base",
    city: "Munich",
    size: "68 sqm",
    layout: "3 rooms",
    furnished: "No",
    extras: "Basement",
    energy: "Metered",
    wifi: "No",
    price: "L",
    status: "Taken until 15 Aug 2026",
  },
];

const jobs = [
  {
    role: "Junior Logistics Coordinator",
    company: "Partner employer",
    location: "Hamburg",
    type: "Full time",
    fit: "88%",
    tags: ["B1 German", "Driving license useful", "Placement fee"],
  },
  {
    role: "Nursing Training Program",
    company: "Care academy",
    location: "Frankfurt",
    type: "Training",
    fit: "81%",
    tags: ["A2 to B1", "Visa pathway", "Certification"],
  },
  {
    role: "Software Support Assistant",
    company: "SaaS partner",
    location: "Remote Germany",
    type: "Part time",
    fit: "76%",
    tags: ["English", "Customer support", "Student friendly"],
  },
];

const blogPosts = [
  {
    title: "How verified onboarding reduces housing friction",
    category: "Housing",
    date: "April 2026",
    summary:
      "Why trusted identity and document readiness can shorten the path from apartment search to signed contract.",
  },
  {
    title: "From arrival to first appointment",
    category: "Campus",
    date: "April 2026",
    summary:
      "A practical look at how task tracking, document storage, and curated links support the first weeks in Germany.",
  },
  {
    title: "Financial access without speculation",
    category: "Finance",
    date: "March 2026",
    summary:
      "VYN Space's approach to accounts, payments, insurance, and cautious digital-asset pilots.",
  },
];

const sceneNarratives = {
  spaces: {
    eyebrow: "Spatial product map",
    title: "Each orbit is a protected service surface.",
    text: "The public site sells the idea; the protected app becomes a spatial command center for verified users.",
    points: ["Preview hub", "Locked services", "Shared identity", "3D-ready shell"],
  },
  apt: {
    eyebrow: "Housing layer",
    title: "Apartment data behaves like a live eligibility system.",
    text: "Listings, criteria, viewings, and contracts are presented as one journey instead of separate landlord paperwork.",
    points: ["Availability", "Criteria", "Viewing", "Contract"],
  },
  finance: {
    eyebrow: "Financial core",
    title: "Banking is staged as controlled infrastructure.",
    text: "Accounts, transfers, analytics, insurance, and future investments stay visually high-trust, not speculative.",
    points: ["Solaris", "Transfers", "Insurance", "USDT review"],
  },
  jobs: {
    eyebrow: "Matching engine",
    title: "Candidates, skills, employers, and contracts form a live network.",
    text: "The design makes fit score, readiness, training, and placement feel like a precise operating system.",
    points: ["Assessment", "Fit score", "Employer route", "Placement"],
  },
  campus: {
    eyebrow: "Digital city hall",
    title: "Campus turns bureaucracy into a visible map.",
    text: "Tasks, documents, appointments, university data, courses, and community sit inside one navigable civic layer.",
    points: ["Documents", "Appointments", "Courses", "Rewards"],
  },
  registration: {
    eyebrow: "Trust gateway",
    title: "Verification becomes the opening sequence.",
    text: "The first user action feels like entering a secure institution-grade system, not filling another form.",
    points: ["Personal data", "Documents", "ID provider", "Unlocked access"],
  },
  about: {
    eyebrow: "Company signal",
    title: "The mission is visualized as controlled global access.",
    text: "The founder story, team, and vision sit inside the same design language as the actual product.",
    points: ["Founders", "Mission", "Partners", "Trust"],
  },
  blog: {
    eyebrow: "Editorial feed",
    title: "Posts feel like dispatches from the platform.",
    text: "Updates and user stories are framed as signal cards inside the VYN Space operating environment.",
    points: ["Housing", "Campus", "Finance", "Stories"],
  },
  appointments: {
    eyebrow: "Contact bridge",
    title: "Business conversations get a premium entry point.",
    text: "Calendly, partner contact, and form submission are presented as a direct channel into the company core.",
    points: ["CEO calls", "Partners", "Support", "Institutions"],
  },
  faq: {
    eyebrow: "Answer graph",
    title: "Frequently asked questions become a searchable trust layer.",
    text: "The FAQ is designed to reduce anxiety around verification, access, finance, housing, and the future metaverse.",
    points: ["Access", "Verification", "Finance", "Metaverse"],
  },
  donation: {
    eyebrow: "Support channel",
    title: "Donations sit behind compliance-first trust signals.",
    text: "PayPal and crypto routes are clear, restrained, and visually separated from speculation.",
    points: ["PayPal", "USDT", "Compliance", "Impact"],
  },
  metaverse: {
    eyebrow: "Immersive layer",
    title: "The future 3D world is already part of the interface language.",
    text: "Events, support, and avatar navigation can grow from the current WebGL shell without rebuilding the brand.",
    points: ["Avatar", "Events", "Fallback", "WebGL"],
  },
};

function getInitialRoute() {
  const hash = window.location.hash.replace("#", "");
  const allRoutes = new Set([
    "home",
    "spaces",
    "apt",
    "jobs",
    "finance",
    "campus",
    "about",
    "blog",
    "contact",
    "faq",
    "donation",
    "metaverse",
    "register",
  ]);
  return allRoutes.has(hash) ? hash : "home";
}

export default function App() {
  const [route, setRoute] = useState(getInitialRoute);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncRoute = () => {
      setRoute(getInitialRoute());
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    const label =
      [...navItems, ...utilityItems, { id: "register", label: "Register" }].find(
        (item) => item.id === route,
      )?.label || "Home";
    document.title = label === "Home" ? "VYN Space" : `${label} | VYN Space`;
  }, [route]);

  const Page = useMemo(() => {
    const pages = {
      home: HomePage,
      spaces: SpacesPage,
      apt: AptPage,
      jobs: JobsPage,
      finance: FinancePage,
      campus: CampusPage,
      about: AboutPage,
      blog: BlogPage,
      contact: ContactPage,
      faq: FaqPage,
      donation: DonationPage,
      metaverse: MetaversePage,
      register: RegisterPage,
    };
    return pages[route] || HomePage;
  }, [route]);

  return (
    <>
      <Header route={route} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Page />
      <Footer />
    </>
  );
}

function Header({ route, menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="VYN Space home">
        <img src={`${import.meta.env.BASE_URL}vynspacelogo.webp`} alt="" />
        <span>VYN Space</span>
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.id} className={route === item.id ? "active" : ""} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <ButtonLink to="register" variant="compact" icon={ShieldCheck}>
          Register
        </ButtonLink>
        <button
          className="icon-button menu-button"
          type="button"
          aria-label="Open navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {[...navItems, ...utilityItems, { id: "register", label: "Register" }].map((item) => (
            <a key={item.id} className={route === item.id ? "active" : ""} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

function HomePage() {
  return (
    <main>
      <section className="hero premium-hero">
        <HeroScene />
        <div className="hero-vignette" />
        <div className="hero-shell">
          <div className="hero-content">
            <p className="eyebrow">Verified life onboarding for Germany</p>
            <img
              className="hero-logo"
              src={`${import.meta.env.BASE_URL}vynspacelogo.webp`}
              alt="VYN Space logo"
            />
            <h1>VYN Space</h1>
            <p className="hero-copy">
              A trust layer for arrival, housing, banking, work, education, and community, built
              around one verified identity instead of scattered paperwork.
            </p>
            <div className="button-row">
              <ButtonLink to="spaces" icon={ArrowRight}>
                Enter Spaces
              </ButtonLink>
              <ButtonLink to="register" variant="secondary" icon={ShieldCheck}>
                Verify Access
              </ButtonLink>
            </div>
          </div>

          <aside className="hero-console" aria-label="VYN Space access status">
            <div className="console-topline">
              <span>Access Core</span>
              <strong>Prepared</strong>
            </div>
            <div className="console-meter" aria-hidden="true">
              <span style={{ width: "78%" }} />
            </div>
            <div className="console-grid">
              {[
                [BadgeCheck, "Identity", "IDnow-ready"],
                [Network, "Spaces", "Subdomain-ready"],
                [Layers3, "3D layer", "Lazy-load plan"],
              ].map(([Icon, title, text]) => (
                <div className="console-item" key={title}>
                  <Icon size={17} />
                  <span>{title}</span>
                  <small>{text}</small>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <nav className="orbit-nav" aria-label="Core VYN Space services">
          {spaces.map((space) => {
            const Icon = space.icon;
            return (
              <a className={`orbit-chip ${space.accent}`} href={`#${space.id}`} key={space.id}>
                <Icon size={18} />
                <span>{space.title}</span>
              </a>
            );
          })}
        </nav>
      </section>

      <section className="signal-section">
        <div className="signal-copy">
          <p className="eyebrow">System shape</p>
          <h2>One verified profile moves through every service.</h2>
        </div>
        <div className="signal-runway" aria-label="Verified onboarding sequence">
          {[
            ["01", "Register"],
            ["02", "Verify"],
            ["03", "Match"],
            ["04", "Contract"],
          ].map(([number, label]) => (
            <div className="runway-node" key={number}>
              <span>{number}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-tight">
        <SectionHeader
          eyebrow="Core spaces"
          title="Four locked spaces, one operational spine"
          summary="Each space has its own product surface, but the same verified user profile, documents, consent, and process state travel across all of them."
        />
        <ServiceSlider />
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="Overview"
          title="Product map"
          summary="The public site previews the platform; the protected app becomes the working layer after verification."
        />
        <div className="card-grid three">
          {pageCards.map((card) => (
            <RouteCard key={card.id} item={card} />
          ))}
        </div>
      </section>

      <section className="process-band">
        <div>
          <p className="eyebrow">Access model</p>
          <h2>Register once. Verify once. Unlock the ecosystem.</h2>
        </div>
        <div className="process-steps">
          {[
            ["1", "Personal data"],
            ["2", "Document check"],
            ["3", "ID verification"],
            ["4", "Spaces login"],
          ].map(([number, label]) => (
            <div className="process-step" key={number}>
              <span>{number}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SpacesPage() {
  return (
    <PageShell
      eyebrow="Spaces preview"
      title="Campus, APT, Jobs, and Finance"
      summary="Spaces is the preview hub for VYN Space's four core modules. The public page explains what users receive after onboarding; operational access can live on spaces.vyn-space.io or a protected app route."
      actions={
        <>
          <ButtonLink to="register" icon={ShieldCheck}>
            Start Verification
          </ButtonLink>
          <ButtonLink to="home" variant="secondary" icon={Home}>
            Back Home
          </ButtonLink>
        </>
      }
    >
      <div className="locked-band">
        <LockKeyhole size={22} />
        <div>
          <strong>Access rule</strong>
          <p>
            Full service access is available only after registration, verification, and login.
            Protected services can be served from www.vyn-space.io/spaces or spaces.vyn-space.io.
          </p>
        </div>
      </div>

      <div className="service-stack">
        {spaces.map((space) => {
          const Icon = space.icon;
          return (
            <article className={`service-panel ${space.accent}`} key={space.id}>
              <div className="service-panel-icon">
                <Icon size={28} />
              </div>
              <div>
                <p className="eyebrow">{space.eyebrow}</p>
                <h2>{space.title}</h2>
                <p>{space.summary}</p>
                <div className="tag-row">
                  {space.bullets.map((bullet) => (
                    <span key={bullet}>{bullet}</span>
                  ))}
                </div>
              </div>
              <ButtonLink to={space.id} variant="ghost" icon={ChevronRight}>
                Preview
              </ButtonLink>
            </article>
          );
        })}
      </div>

      <section className="section-subgrid">
        <InfoBlock
          icon={ShieldCheck}
          title="Verification service"
          text="The onboarding flow is prepared for providers such as IDnow, including identity checks, document validation, consent capture, and audit status."
        />
        <InfoBlock
          icon={KeyRound}
          title="Authentication path"
          text="The first release can use magic links, then move toward step-up authentication, session risk checks, and stronger key management."
        />
        <InfoBlock
          icon={Layers3}
          title="Future 3D layer"
          text="The app shell is planned around lazy-loaded 3D assets, mobile fallback, and a lightweight first bundle for future avatar support."
        />
      </section>
    </PageShell>
  );
}

function AptPage() {
  return (
    <PageShell
      eyebrow="APT"
      title="Housing for verified users"
      summary="APT presents apartments with structured criteria, availability, and a clear path from eligibility to viewing request or automated rental contract."
    >
      <ProtectedNotice />

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <span>Berlin, Cologne, Munich</span>
        </div>
        <button className="filter-button" type="button">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="listing-grid">
        {apartments.map((apt) => (
          <article className="listing-card" key={apt.title}>
            <div className="listing-visual">
              <Building2 size={34} />
              <span className={apt.status === "Available" ? "status available" : "status taken"}>
                {apt.status}
              </span>
            </div>
            <div className="listing-body">
              <h2>{apt.title}</h2>
              <div className="meta-grid">
                <Meta icon={MapPin} label={apt.city} />
                <Meta icon={Ruler} label={apt.size} />
                <Meta icon={BedDouble} label={apt.layout} />
                <Meta icon={Sofa} label={`Furnished ${apt.furnished}`} />
                <Meta icon={Leaf} label={`Energy ${apt.energy}`} />
                <Meta icon={Wifi} label={`WiFi ${apt.wifi}`} />
              </div>
              <div className="tag-row">
                <span>{apt.extras}</span>
                <span>Price {apt.price}</span>
              </div>
              <div className="button-row">
                <button className="btn primary" type="button">
                  <span>Apply</span>
                  <ArrowRight size={18} />
                </button>
                <button className="btn secondary" type="button">
                  <span>Viewing</span>
                  <CalendarDays size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="section-subgrid">
        <InfoBlock
          icon={BriefcaseBusiness}
          title="Stable job or institution"
          text="Users provide employer, university, or institution details so housing partners can validate stability."
        />
        <InfoBlock
          icon={Banknote}
          title="Sufficient income"
          text="Income data can be verified through documents first and banking data later when Finance is connected."
        />
        <InfoBlock
          icon={FileCheck2}
          title="Residence visa"
          text="Residence status and document dates are checked before contract generation."
        />
      </section>

      <FlowPanel
        title="Automated rental contract"
        steps={["Criteria met", "Landlord approval", "Contract generated", "Digital signature"]}
      />
    </PageShell>
  );
}

function FinancePage() {
  return (
    <PageShell
      eyebrow="Finance"
      title="Banking products with a trust-first rollout"
      summary="Finance starts as an outsourced white-label banking layer, then grows toward proprietary products as compliance, risk, and partner integrations mature."
    >
      <ProtectedNotice />

      <div className="dashboard-layout">
        <section className="balance-panel">
          <p className="eyebrow">Demo wallet</p>
          <h2>EUR 2,480.50</h2>
          <p>Verified balance, transactions, transfers, income, expenses, loans, insurance, and future investment pathways.</p>
          <div className="mini-chart" aria-hidden="true">
            <span style={{ height: "38%" }} />
            <span style={{ height: "62%" }} />
            <span style={{ height: "44%" }} />
            <span style={{ height: "78%" }} />
            <span style={{ height: "56%" }} />
            <span style={{ height: "84%" }} />
            <span style={{ height: "67%" }} />
          </div>
        </section>
        <div className="finance-actions">
          {[
            [CreditCard, "Account creation", "Solaris white-label integration and verified customer onboarding."],
            [ReceiptText, "Transactions", "Balances, transfers, income, expense tracking, and statements."],
            [Coins, "USDT pilot", "A controlled stablecoin-only pilot with clear custody and security decisions."],
            [ShieldCheck, "Insurance", "Offer insurance based on verified user and banking data when compliant."],
          ].map(([Icon, title, text]) => (
            <InfoBlock key={title} icon={Icon} title={title} text={text} />
          ))}
        </div>
      </div>

      <section className="compliance-panel">
        <div>
          <p className="eyebrow">Security notes</p>
          <h2>Built to avoid crypto-hype risk</h2>
        </div>
        <ul className="check-list">
          <li>
            <CheckCircle2 size={18} /> Reuse prior verification before bank account creation.
          </li>
          <li>
            <CheckCircle2 size={18} /> Begin with magic links, then move to stronger authentication.
          </li>
          <li>
            <CheckCircle2 size={18} /> Define key custody, recovery, and transaction approval policies.
          </li>
          <li>
            <CheckCircle2 size={18} /> Treat liquidity pools as legal and compliance review items.
          </li>
        </ul>
      </section>
    </PageShell>
  );
}

function JobsPage() {
  return (
    <PageShell
      eyebrow="Jobs"
      title="Job, training, and placement engine"
      summary="Jobs connects verified profiles with companies and training providers, while supporting VYN Space's staffing-style commission model."
    >
      <ProtectedNotice />

      <div className="job-board">
        {jobs.map((job) => (
          <article className="job-card" key={job.role}>
            <div>
              <p className="eyebrow">{job.company}</p>
              <h2>{job.role}</h2>
              <p>{job.location} · {job.type}</p>
            </div>
            <div className="fit-score">
              <span>{job.fit}</span>
              <small>fit</small>
            </div>
            <div className="tag-row">
              {job.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <ButtonLink to="register" variant="secondary" icon={ClipboardCheck}>
              Complete Test
            </ButtonLink>
          </article>
        ))}
      </div>

      <section className="section-subgrid">
        <InfoBlock
          icon={ClipboardCheck}
          title="Assessment test"
          text="Maps suitable jobs, training routes, strengths, weaknesses, and support needs."
        />
        <InfoBlock
          icon={UsersRound}
          title="Indirect outreach"
          text="Companies view categorized profiles and contact candidates through VYN Space."
        />
        <InfoBlock
          icon={CircleDollarSign}
          title="Financial groups"
          text="Profiles can be sorted into three financial readiness groups for housing and job support."
        />
      </section>

      <FlowPanel
        title="Placement contract flow"
        steps={["Profile verified", "Employer match", "Interview process", "In-house contract"]}
      />
    </PageShell>
  );
}

function CampusPage() {
  return (
    <PageShell
      eyebrow="Campus"
      title="Digital city hall and community layer"
      summary="Campus is the retention system: dashboard, documents, appointments, courses, universities, partner institutions, community, and rewards."
    >
      <ProtectedNotice />

      <section className="campus-dashboard">
        <div className="task-panel">
          <p className="eyebrow">Dashboard</p>
          <h2>Today in Campus</h2>
          <ul className="task-list">
            <li>
              <span className="task-state done" />
              Upload residence certificate
            </li>
            <li>
              <span className="task-state active" />
              Book city registration appointment
            </li>
            <li>
              <span className="task-state" />
              Start B1 course module
            </li>
            <li>
              <span className="task-state" />
              Submit partner referral proof
            </li>
          </ul>
        </div>
        <div className="campus-modules">
          {[
            [Link, "Useful links", "Government systems, phone numbers, appointment portals."],
            [UploadCloud, "Documents", "Store, submit, and reuse documents across processes."],
            [BookOpenCheck, "Courses", "Skool-based courses, certifications, tutorials, podcasts, and videos."],
            [Trophy, "Rewards", "Referral links, partner proof submissions, and contribution points."],
            [Network, "LinkedIn-like layer", "Profiles, institutions, universities, companies, and community groups."],
            [GraduationCap, "University integration", "Schedules, lectures, grades, exams, certificates, and degrees."],
          ].map(([Icon, title, text]) => (
            <InfoBlock key={title} icon={Icon} title={title} text={text} />
          ))}
        </div>
      </section>

      <section className="integration-band">
        <p className="eyebrow">Institutional integrations</p>
        <h2>Built for authorities, universities, refugee organizations, and partner companies.</h2>
        <div className="tag-row">
          <span>Third-country national registration</span>
          <span>Student data import</span>
          <span>Exchange students</span>
          <span>Insurance services</span>
          <span>Citizen administration</span>
          <span>Data sharing with consent</span>
        </div>
      </section>
    </PageShell>
  );
}

function RegisterPage() {
  return (
    <PageShell
      eyebrow="Registration"
      title="Verified access starts here"
      summary="The onboarding form is structured around personal data, documents, consent, and identity verification before the user can access Campus, APT, Jobs, and Finance."
    >
      <section className="register-layout">
        <form className="register-form">
          <div className="form-row">
            <label>
              Full name
              <input type="text" placeholder="First and last name" />
            </label>
            <label>
              Email
              <input type="email" placeholder="name@example.com" />
            </label>
          </div>
          <div className="form-row">
            <label>
              User group
              <select defaultValue="">
                <option value="" disabled>
                  Select group
                </option>
                <option>Refugee</option>
                <option>Student</option>
                <option>Skilled worker</option>
              </select>
            </label>
            <label>
              Current city
              <input type="text" placeholder="Berlin" />
            </label>
          </div>
          <label>
            Main goal
            <select defaultValue="">
              <option value="" disabled>
                Select priority
              </option>
              <option>Find housing</option>
              <option>Open finance access</option>
              <option>Find job or training</option>
              <option>Use Campus services</option>
            </select>
          </label>
          <label>
            Documents
            <div className="upload-zone">
              <UploadCloud size={22} />
              <span>Passport, visa, residence permit, income proof, student or employment proof</span>
            </div>
          </label>
          <button className="btn primary form-submit" type="button">
            <span>Continue to verification</span>
            <ShieldCheck size={18} />
          </button>
        </form>

        <div className="verification-card">
          <p className="eyebrow">Verification flow</p>
          <h2>IDnow-ready check</h2>
          <ul className="check-list">
            <li>
              <CheckCircle2 size={18} /> Personal data collected
            </li>
            <li>
              <CheckCircle2 size={18} /> Documents uploaded
            </li>
            <li>
              <Clock3 size={18} /> Identity provider session
            </li>
            <li>
              <LockKeyhole size={18} /> Spaces unlocked after approval
            </li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}

function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A calmer system for a complicated journey"
      summary="VYN Space exists to replace scattered relocation processes with one guided, trusted operating layer for life in Germany."
    >
      <section className="story-grid">
        <div>
          <p className="eyebrow">Mission</p>
          <h2>Make integration visible, structured, and faster.</h2>
          <p>
            Refugees, international students, and skilled workers often face the same problem:
            critical steps are spread across landlords, banks, employers, universities, authorities,
            and informal advice. VYN Space brings these steps into one verified flow.
          </p>
        </div>
        <div>
          <p className="eyebrow">Vision</p>
          <h2>A digital onboarding system for Germany.</h2>
          <p>
            The long-term direction is a proprietary trust, banking, housing, job, campus, and
            community ecosystem with institution-grade data handling and a future 3D support layer.
          </p>
        </div>
      </section>

      <TeamSection />
    </PageShell>
  );
}

function TeamSection() {
  const team = [
    ["Founder and CEO", "Business inquiries, partnerships, product vision."],
    ["Operations Lead", "Housing, campus processes, user success."],
    ["Institution Partnerships", "Universities, authorities, NGOs, employers."],
  ];

  return (
    <section className="section-inner">
      <SectionHeader
        eyebrow="Team"
        title="People behind VYN Space"
        summary="Team profiles are structured for LinkedIn links and partner credibility."
      />
      <div className="card-grid three">
        {team.map(([role, text]) => (
          <article className="person-card" key={role}>
            <div className="person-avatar">
              <UsersRound size={28} />
            </div>
            <h2>{role}</h2>
            <p>{text}</p>
            <a href="#contact">
              LinkedIn profile <ExternalLink size={16} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function BlogPage() {
  return (
    <PageShell
      eyebrow="Blog"
      title="Current posts from VYN Space and the community"
      summary="Editorial updates, integration guidance, partner insights, and user stories."
    >
      <div className="blog-grid">
        {blogPosts.map((post) => (
          <article className="blog-card" key={post.title}>
            <p className="eyebrow">{post.category} · {post.date}</p>
            <h2>{post.title}</h2>
            <p>{post.summary}</p>
            <a href="#contact">
              Read post <ChevronRight size={16} />
            </a>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function ContactPage() {
  return (
    <PageShell
      eyebrow="Appointments and contact"
      title="Speak with VYN Space"
      summary="Business inquiries can book a CEO meeting through Calendly. Users and partners can also send a direct message."
    >
      <section className="contact-layout">
        <div className="calendar-panel">
          <CalendarDays size={34} />
          <p className="eyebrow">Calendly</p>
          <h2>CEO meeting</h2>
          <p>Use this path for partnerships, investors, institutions, employers, and strategic business inquiries.</p>
          <a className="btn primary" href="https://calendly.com/" target="_blank" rel="noreferrer">
            <span>Open Calendly</span>
            <ExternalLink size={18} />
          </a>
        </div>
        <form className="contact-form">
          <label>
            Name
            <input type="text" placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            Topic
            <select defaultValue="">
              <option value="" disabled>
                Select topic
              </option>
              <option>Business inquiry</option>
              <option>Housing partnership</option>
              <option>Employer partnership</option>
              <option>User support</option>
            </select>
          </label>
          <label>
            Message
            <textarea placeholder="How can VYN Space help?" rows="5" />
          </label>
          <button className="btn secondary form-submit" type="button">
            <span>Send Message</span>
            <Send size={18} />
          </button>
        </form>
      </section>

      <section className="section-subgrid">
        <InfoBlock icon={Mail} title="Email" text="hello@vyn-space.io" />
        <InfoBlock icon={Phone} title="Phone" text="Partner phone number can be added here." />
        <InfoBlock icon={MapPin} title="Location" text="Germany focused, international user base." />
      </section>
    </PageShell>
  );
}

function FaqPage() {
  const faqs = [
    [
      "Who is VYN Space for?",
      "Refugees, international students, and skilled workers who need structured access to housing, finance, jobs, education, bureaucracy, and community in Germany.",
    ],
    [
      "Why is verification required?",
      "Verification protects users, partners, landlords, employers, and financial providers by confirming identity and documents before sensitive services are unlocked.",
    ],
    [
      "Can I use APT, Jobs, Finance, or Campus without registering?",
      "The public site shows previews. Full access requires registration, verification, and login.",
    ],
    [
      "Will VYN Space become a bank?",
      "The initial finance layer can be outsourced through white-label providers. The long-term goal is a proprietary banking system when licensing, risk, and compliance requirements are met.",
    ],
    [
      "What is the metaverse area?",
      "It is a future immersive experience for verified users, events, support, and avatar-guided navigation.",
    ],
  ];

  return (
    <PageShell
      eyebrow="FAQ"
      title="Answers before onboarding"
      summary="Short, direct answers for users, partners, and institutions."
    >
      <div className="faq-list">
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}

function DonationPage() {
  return (
    <PageShell
      eyebrow="Donation"
      title="Support verified access"
      summary="Donations help VYN Space expand onboarding support, housing access, campus resources, and partner programs."
    >
      <section className="donation-grid">
        <article className="donation-card">
          <HandHeart size={34} />
          <h2>PayPal</h2>
          <p>Traditional donation route for supporters who want a simple payment flow.</p>
          <a className="btn primary" href="https://www.paypal.com/donate" target="_blank" rel="noreferrer">
            <span>Donate</span>
            <ExternalLink size={18} />
          </a>
        </article>
        <article className="donation-card">
          <WalletCards size={34} />
          <h2>Crypto</h2>
          <p>Crypto donations can start with USDT only and should include compliance review before launch.</p>
          <button className="btn secondary" type="button">
            <span>USDT wallet pending</span>
            <LockKeyhole size={18} />
          </button>
        </article>
      </section>
    </PageShell>
  );
}

function MetaversePage() {
  return (
    <PageShell
      eyebrow="Metaverse"
      title="The future immersive layer"
      summary="Registered users will be able to enter a VYN Space metaverse for guided support, events, community, and spatial service navigation."
    >
      <section className="metaverse-stage">
        <HeroScene compact />
        <div>
          <p className="eyebrow">Future access</p>
          <h2>Events, support, and avatar navigation</h2>
          <p>
            The web app is prepared for a future 3D avatar or chatbot by keeping the initial site
            lightweight and making the immersive layer optional, lazy-loaded, and device-aware.
          </p>
          <div className="button-row">
            <ButtonLink to="register" icon={ShieldCheck}>
              Register for Access
            </ButtonLink>
            <ButtonLink to="spaces" variant="secondary" icon={Layers3}>
              View Spaces
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="section-subgrid">
        <InfoBlock
          icon={Activity}
          title="Performance budget"
          text="Lazy-load avatar assets, cap mobile textures, and keep the first page fast before loading WebGL."
        />
        <InfoBlock
          icon={Video}
          title="Fallback mode"
          text="Mobile and low-power devices can use standard dashboards instead of a full 3D world."
        />
        <InfoBlock
          icon={MessageAvatarIcon}
          title="AI assistant"
          text="The chat or avatar layer can reuse verified user context and Campus tasks with explicit consent."
        />
      </section>
    </PageShell>
  );
}

function PageShell({ eyebrow, title, summary, actions, children, scene }) {
  const sceneKey =
    scene ||
    eyebrow
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")[0];
  const narrative = sceneNarratives[sceneKey] || sceneNarratives.spaces;

  return (
    <main className={`page page-${sceneKey}`}>
      <section className="page-hero cinematic-page-hero">
        <PageScene variant={sceneKey} />
        <div className="page-hero-shade" />
        <div className="page-hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
        {actions && <div className="button-row">{actions}</div>}
      </section>
      <section className={`spatial-scroll-stage spatial-${sceneKey}`}>
        <PageScene variant={sceneKey} />
        <div className="spatial-stage-shade" />
        <div className="spatial-scroll-copy">
          <p className="eyebrow">{narrative.eyebrow}</p>
          <h2>{narrative.title}</h2>
          <p>{narrative.text}</p>
        </div>
        <div className="spatial-points" aria-label={`${title} spatial signals`}>
          {narrative.points.map((point, index) => (
            <div className="spatial-point" key={point}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{point}</strong>
            </div>
          ))}
        </div>
      </section>
      <div className="page-content">{children}</div>
    </main>
  );
}

function SectionHeader({ eyebrow, title, summary }) {
  return (
    <div className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{summary}</p>
    </div>
  );
}

function ServiceSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % spaces.length);
    }, 4600);
    return () => window.clearInterval(timer);
  }, []);

  const current = spaces[active];
  const Icon = current.icon;

  return (
    <div className={`slider ${current.accent}`}>
      <div className="slider-copy">
        <p className="eyebrow">{current.eyebrow}</p>
        <h3>{current.title}</h3>
        <p>{current.summary}</p>
        <div className="button-row">
          <ButtonLink to="spaces" icon={ArrowRight}>
            Learn More
          </ButtonLink>
          <ButtonLink to="register" variant="secondary" icon={ShieldCheck}>
            Register Now
          </ButtonLink>
        </div>
      </div>
      <div className="slider-visual">
        <Icon size={74} />
        <div className="signal-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="slider-dots" aria-label="Slider controls">
        {spaces.map((space, index) => (
          <button
            key={space.id}
            className={index === active ? "active" : ""}
            type="button"
            aria-label={`Show ${space.title}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </div>
  );
}

function RouteCard({ item }) {
  const Icon = item.icon;

  return (
    <article className={`route-card ${item.accent || "cyan"}`}>
      <div className="route-icon">
        <Icon size={24} />
      </div>
      <p className="eyebrow">{item.eyebrow}</p>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <a href={`#${item.id}`}>
        Open <ChevronRight size={16} />
      </a>
    </article>
  );
}

function ButtonLink({ to, children, variant = "primary", icon: Icon = ArrowRight }) {
  return (
    <a className={`btn ${variant}`} href={`#${to}`}>
      <span>{children}</span>
      {Icon && <Icon size={18} />}
    </a>
  );
}

function ProtectedNotice() {
  return (
    <div className="locked-band">
      <LockKeyhole size={22} />
      <div>
        <strong>Logged-in users only</strong>
        <p>
          This is a high-fidelity preview. Production access requires completed registration,
          verification, and authenticated login.
        </p>
      </div>
      <ButtonLink to="register" variant="ghost" icon={ShieldCheck}>
        Verify
      </ButtonLink>
    </div>
  );
}

function InfoBlock({ icon: Icon, title, text }) {
  return (
    <article className="info-block">
      <div className="info-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Meta({ icon: Icon, label }) {
  return (
    <span className="meta">
      <Icon size={16} />
      {label}
    </span>
  );
}

function FlowPanel({ title, steps }) {
  return (
    <section className="flow-panel">
      <div>
        <p className="eyebrow">Process</p>
        <h2>{title}</h2>
      </div>
      <div className="flow-steps">
        {steps.map((step, index) => (
          <div className="flow-step" key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function DigitalScene({ compact = false }) {
  return (
    <div className={compact ? "digital-scene compact" : "digital-scene"} aria-hidden="true">
      <div className="grid-plane" />
      <div className="city-node node-a" />
      <div className="city-node node-b" />
      <div className="city-node node-c" />
      <div className="city-node node-d" />
      <div className="data-rail rail-a" />
      <div className="data-rail rail-b" />
      <div className="scan-card scan-a">
        <span />
        <span />
        <span />
      </div>
      <div className="scan-card scan-b">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function MessageAvatarIcon(props) {
  return <Sparkles {...props} />;
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <a className="brand" href="#home" aria-label="VYN Space home">
          <img src={`${import.meta.env.BASE_URL}vynspacelogo.webp`} alt="" />
          <span>VYN Space</span>
        </a>
        <p>Housing, finance, jobs, campus, and community access for a clearer start in Germany.</p>
      </div>
      <nav aria-label="Footer navigation">
        {[...utilityItems, { id: "register", label: "Register" }].map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
