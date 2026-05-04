import React, { useRef, useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── BRAND TOKENS ──────────────────────────────────────────────────────────────
// Deeper pastel palette: all hues at ~22% saturation, ~85% lightness for a
// cohesive powdery feel. Bg is a soft slate-midnight; muted/dim are lifted so
// pastels still register with bloom on top.
const C = {
  bg: '#0E1626',
  bgVec: new THREE.Color('#0E1626'),
  navy: '#1A2236',
  cyan: '#BFE2EC',
  cyanHex: 0xbfe2ec,
  cyanDim: '#86B5C2',
  green: '#C5EAD6',
  greenHex: 0xc5ead6,
  violet: '#D0C5E8',
  violetHex: 0xd0c5e8,
  coral: '#F4CCC4',
  coralHex: 0xf4ccc4,
  amber: '#F0E1B5',
  amberHex: 0xf0e1b5,
  gold: '#ECDCB2',
  goldHex: 0xecdcb2,
  text: '#F4F7FC',
  muted: '#AEBACF',
  dim: '#445268',
  border: 'rgba(191,226,236,0.22)'
} as const;
const LOGO_URL = `${import.meta.env.BASE_URL}vynspace-mark-clean.webp`;
const APT_IMAGES = {
  mitte: `${import.meta.env.BASE_URL}generated/apt-mitte-arrival.webp`,
  rhine: `${import.meta.env.BASE_URL}generated/apt-rhine-student-studio.webp`,
  neukolln: `${import.meta.env.BASE_URL}generated/apt-neukolln-family-base.webp`,
  ehrenfeld: `${import.meta.env.BASE_URL}generated/apt-ehrenfeld-shared-loft.webp`,
  harburg: `${import.meta.env.BASE_URL}generated/apt-harburg-starter-home.webp`
} as const;
const JOB_IMAGES = {
  customer: `${import.meta.env.BASE_URL}generated/job-customer-operations-trainee.webp`,
  facility: `${import.meta.env.BASE_URL}generated/job-facility-coordinator.webp`,
  software: `${import.meta.env.BASE_URL}generated/job-software-support-intern.webp`,
  healthcare: `${import.meta.env.BASE_URL}generated/job-healthcare-admin-assistant.webp`,
  logistics: `${import.meta.env.BASE_URL}generated/job-logistics-planning-assistant.webp`
} as const;

// ─── STATIC DATA ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [{
  label: 'HOME',
  href: '#hero'
}, {
  label: 'SPACES',
  href: '#/spaces'
}, {
  label: 'APT',
  href: '#/apt'
}, {
  label: 'JOBS',
  href: '#/jobs'
}, {
  label: 'FINANCE',
  href: '#/finance'
}, {
  label: 'REGISTER',
  href: '#/register'
}, {
  label: 'ABOUT',
  href: '#/about'
}, {
  label: 'CONTACT',
  href: '#/contact'
}, {
  label: 'FAQ',
  href: '#/faq'
}];
const ROUTE_ALIASES: Record<string, string> = {
  faqs: 'faq',
  appointments: 'contact',
  'appointments-4': 'contact',
  services: 'spaces',
  'about-1': 'about',
  'contact-1': 'contact'
};
type SpaceItem = {
  id: string;
  code: string;
  label: string;
  tagline: string;
  desc: string;
  detail: string;
  bullets: string[];
  contentBlocks: Array<{
    title: string;
    items: string[];
  }>;
  color: string;
  colorHex: number;
  icon: string;
  zPos: number;
};
const SPACES: SpaceItem[] = [{
  id: 'spaces',
  code: 'HUB-00',
  label: 'Spaces',
  tagline: 'Preview hub',
  desc: 'A public map of APT, Jobs, and Finance. Full access opens after verification.',
  detail: 'Spaces bridges the public site and the verified member area.',
  bullets: ['APT, Jobs, Finance preview', 'Protected app after verification', 'One verified profile, every service'],
  contentBlocks: [{
    title: 'Access model',
    items: ['Public previews explain each service', 'Verified login unlocks the protected app', 'One profile travels across every space']
  }],
  color: C.cyan,
  colorHex: C.cyanHex,
  icon: '⬢',
  zPos: -80
}, {
  id: 'apt',
  code: 'SPC-01',
  label: 'APT',
  tagline: 'Housing access',
  desc: 'See homes, check eligibility, request viewings, sign a contract.',
  detail: 'Listings show city, size, layout, price, and availability for verified applicants.',
  bullets: ['Verified listings only', 'Eligibility check', 'Automated rental contract'],
  contentBlocks: [{
    title: 'Listing data',
    items: ['City, size, layout, rooms', 'Furnished, energy, WiFi, price', 'Availability and status']
  }, {
    title: 'Eligibility',
    items: ['Stable job, study, or institution', 'Income proof', 'Residence and verified identity']
  }],
  color: C.cyan,
  colorHex: C.cyanHex,
  icon: '⌂',
  zPos: -112
}, {
  id: 'jobs',
  code: 'SPC-02',
  label: 'Jobs',
  tagline: 'Work & training',
  desc: 'Listings, assessment, employer matching, placement.',
  detail: 'Companies see verified profiles. VYN Space earns commission on placements.',
  bullets: ['Jobs, internships, training', 'Skill and fit assessment', 'Indirect employer outreach'],
  contentBlocks: [{
    title: 'For candidates',
    items: ['Curated job and training listings', 'Assessment for fit and growth', 'Profile signals to employers']
  }, {
    title: 'For employers',
    items: ['Verified candidate profiles', 'Indirect outreach', 'Placement commission model']
  }],
  color: C.amber,
  colorHex: C.amberHex,
  icon: '◈',
  zPos: -144
}, {
  id: 'finance',
  code: 'SPC-03',
  label: 'Finance',
  tagline: 'Banking layer',
  desc: 'White-label banking, balances, transfers, future loans and insurance.',
  detail: 'Starts with a Solaris-style provider, reuses verification, and grows from there.',
  bullets: ['Solaris white-label path', 'Balances, transfers, insights', 'Loans and insurance, later'],
  contentBlocks: [{
    title: 'Initial rollout',
    items: ['White-label account creation', 'Balance, transactions, transfers', 'Income and expense view']
  }, {
    title: 'Roadmap',
    items: ['Loans, insurance, investments', 'Compliance review for any new product', 'Long-term: proprietary bank']
  }],
  color: C.violet,
  colorHex: C.violetHex,
  icon: '◉',
  zPos: -176
}, {
  id: 'register',
  code: 'SPC-04',
  label: 'Register',
  tagline: 'Verified onboarding',
  desc: 'Personal data, documents, consent, ID check. Then access opens.',
  detail: 'IDnow-style verification confirms identity and documents quickly.',
  bullets: ['Personal data and proofs', 'IDnow-style ID check', 'Magic link, then step-up auth'],
  contentBlocks: [{
    title: 'What we collect',
    items: ['Identity and contact', 'Passport, visa, residence proof', 'Income or institution proof']
  }, {
    title: 'How it unlocks',
    items: ['ID and document check', 'Spaces unlock after approval', 'Stronger auth for finance flows']
  }],
  color: C.coral,
  colorHex: C.coralHex,
  icon: '◎',
  zPos: -208
}, {
  id: 'about',
  code: 'SYS-05',
  label: 'About',
  tagline: 'Vision & mission',
  desc: 'A trust layer for life in Germany. Built like an institution, used like a product.',
  detail: 'A digital onboarding system designed for refugees, students, and skilled workers.',
  bullets: ['Founders and team', 'Mission and long-term direction', 'Trust over fragmentation'],
  contentBlocks: [{
    title: 'Story',
    items: ['Why VYN Space exists', 'Who it is built for', 'How it reduces relocation stress']
  }],
  color: C.green,
  colorHex: C.greenHex,
  icon: '◇',
  zPos: -240
}, {
  id: 'blog',
  code: 'SYS-06',
  label: 'Blog',
  tagline: 'Stories & updates',
  desc: 'Product updates, user voices, and integration explainers.',
  detail: 'The publication layer for platform news and partner stories.',
  bullets: ['Product updates', 'User stories', 'Partner and institution notes'],
  contentBlocks: [{
    title: 'Lanes',
    items: ['Updates from VYN Space', 'Voices from users and partners', 'Housing, jobs, and finance guides']
  }],
  color: C.amber,
  colorHex: C.amberHex,
  icon: '▤',
  zPos: -272
}, {
  id: 'contact',
  code: 'SYS-07',
  label: 'Contact',
  tagline: 'Appointments',
  desc: 'CEO Calendly for business, contact form for everyone else.',
  detail: 'Business, partner, and user channels into VYN Space.',
  bullets: ['CEO Calendly', 'Partner and institution contact', 'User support form'],
  contentBlocks: [{
    title: 'Channels',
    items: ['Business inquiries', 'Housing and employer partners', 'User support']
  }],
  color: C.cyan,
  colorHex: C.cyanHex,
  icon: '⌁',
  zPos: -304
}];
type VerifyStep = {
  num: string;
  label: string;
  desc: string;
  color: string;
};
const VERIFY_STEPS: VerifyStep[] = [{
  num: '01',
  label: 'Personal data',
  desc: 'Name, address, nationality, user group, relocation status, and consent captured securely.',
  color: C.cyan
}, {
  num: '02',
  label: 'Document check',
  desc: 'Passport, visa, residence permit, income, student, employer, or institution proof uploaded.',
  color: C.violet
}, {
  num: '03',
  label: 'ID verification',
  desc: 'Provider flow such as IDnow validates identity, liveness, and document authenticity.',
  color: C.green
}, {
  num: '04',
  label: 'Spaces login',
  desc: 'Full platform access unlocked. One profile, every service.',
  color: C.amber
}];
type FaqItem = {
  q: string;
  a: string;
};
const FAQ: FaqItem[] = [{
  q: 'Who is VYN Space for?',
  a: 'Refugees, international students, and skilled workers building a life in Germany.'
}, {
  q: 'Is verification mandatory?',
  a: 'Yes. APT, Jobs, and Finance unlock only after ID and document checks via a provider such as IDnow.'
}, {
  q: 'How do housing listings work?',
  a: 'APT shows city, size, layout, price, and availability. Eligibility is checked before viewings.'
}, {
  q: 'How does Finance launch?',
  a: 'A Solaris-style white-label first. Verified once, reused everywhere. Loans and insurance follow later.'
}];
const CTA_STATS = [{
  val: '3',
  label: 'CORE SPACES',
  color: C.cyan
}, {
  val: '1',
  label: 'VERIFIED PROFILE',
  color: C.green
}, {
  val: '3',
  label: 'USER GROUPS',
  color: C.amber
}];

type PageBlock = {
  title: string;
  body?: string;
  items?: string[];
};
type PageData = {
  key: string;
  eyebrow: string;
  title: string;
  intro: string;
  color: string;
  progress: number;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  blocks: PageBlock[];
  cta?: {
    label: string;
    href: string;
  };
};
type AptListing = {
  title: string;
  image: string;
  city: string;
  size: string;
  layout: string;
  rooms: string;
  furnished: string;
  extras: string[];
  energy: string;
  wifi: string;
  price: string;
  priceNote: string;
  availability: string;
  status: string;
  criteria: string[];
};
type JobListing = {
  title: string;
  image: string;
  company: string;
  city: string;
  type: string;
  salary: string;
  language: string;
  training: string;
  fit: string;
  status: string;
  strengths: string[];
};
const APT_LISTINGS: AptListing[] = [{
  title: 'Mitte Arrival Apartment',
  image: APT_IMAGES.mitte,
  city: 'Berlin',
  size: '54 sqm',
  layout: '2-room apartment',
  rooms: '2',
  furnished: 'Yes',
  extras: ['Balcony', 'Elevator', 'Document-ready landlord'],
  energy: 'Yes',
  wifi: 'Yes',
  price: 'EUR 1,180',
  priceNote: 'warm estimate / month',
  availability: 'Available from 01.07.2026',
  status: 'Applications open',
  criteria: ['Employment or university enrollment', 'Income proof or guarantor', 'Residence visa or permit']
}, {
  title: 'Rhine Student Studio',
  image: APT_IMAGES.rhine,
  city: 'Dusseldorf',
  size: '32 sqm',
  layout: 'Studio',
  rooms: '1',
  furnished: 'Yes',
  extras: ['Shared garden', 'Near transit', 'Starter furniture package'],
  energy: 'Yes',
  wifi: 'Yes',
  price: 'EUR 720',
  priceNote: 'warm estimate / month',
  availability: 'Available now',
  status: 'Viewing requests open',
  criteria: ['University, Ausbildung, or job contract', 'Verified ID documents', 'Deposit readiness']
}, {
  title: 'Neukolln Family Base',
  image: APT_IMAGES.neukolln,
  city: 'Berlin',
  size: '78 sqm',
  layout: '3-room apartment',
  rooms: '3',
  furnished: 'Partial',
  extras: ['Balcony', 'Cellar storage', 'Family-friendly building'],
  energy: 'Yes',
  wifi: 'No',
  price: 'EUR 1,540',
  priceNote: 'warm estimate / month',
  availability: 'Taken until 15.08.2026',
  status: 'Waitlist',
  criteria: ['Stable job or institution support', 'Sufficient monthly income', 'Residence status confirmed']
}, {
  title: 'Ehrenfeld Shared Loft',
  image: APT_IMAGES.ehrenfeld,
  city: 'Cologne',
  size: '46 sqm',
  layout: 'Shared 2-person flat',
  rooms: '2',
  furnished: 'Yes',
  extras: ['Coworking corner', 'Bike room', 'Close to S-Bahn'],
  energy: 'Yes',
  wifi: 'Yes',
  price: 'EUR 640',
  priceNote: 'per room / month',
  availability: 'Available from 15.06.2026',
  status: 'Partner review',
  criteria: ['Student or training contract', 'Verified profile complete', 'House rules accepted']
}, {
  title: 'Harburg Starter Home',
  image: APT_IMAGES.harburg,
  city: 'Hamburg',
  size: '61 sqm',
  layout: '2.5-room apartment',
  rooms: '2.5',
  furnished: 'No',
  extras: ['Balcony', 'Storage room', 'Family-friendly area'],
  energy: 'Yes',
  wifi: 'No',
  price: 'EUR 1,050',
  priceNote: 'cold estimate / month',
  availability: 'Available from 01.09.2026',
  status: 'Pre-application',
  criteria: ['Stable job or sponsor institution', 'SCHUFA alternative review', 'Residence permit or appointment proof']
}];
const JOB_LISTINGS: JobListing[] = [{
  title: 'Customer Operations Trainee',
  image: JOB_IMAGES.customer,
  company: 'Fintech partner',
  city: 'Berlin / Hybrid',
  type: 'Traineeship',
  salary: 'EUR 2,200-2,700 gross',
  language: 'English B2, German A2+',
  training: 'Customer support, KYC basics, banking operations',
  fit: 'Best for service-minded starters',
  status: 'Profile match open',
  strengths: ['Communication', 'Reliability', 'Detail orientation']
}, {
  title: 'Junior Facility Coordinator',
  image: JOB_IMAGES.facility,
  company: 'Housing partner',
  city: 'Dusseldorf',
  type: 'Full-time',
  salary: 'EUR 2,500-3,100 gross',
  language: 'German A2-B1, English helpful',
  training: 'Tenant communication, viewings, documentation',
  fit: 'Best for organized practical workers',
  status: 'Employer preview',
  strengths: ['Organization', 'Problem solving', 'Local mobility']
}, {
  title: 'Software Support Intern',
  image: JOB_IMAGES.software,
  company: 'Education technology partner',
  city: 'Cologne / Remote',
  type: 'Internship',
  salary: 'EUR 900-1,200 stipend',
  language: 'English B2, German optional',
  training: 'Helpdesk, QA, tutorial creation',
  fit: 'Best for students entering tech',
  status: 'Internship preview',
  strengths: ['Digital tools', 'Learning speed', 'Documentation']
}, {
  title: 'Healthcare Admin Assistant',
  image: JOB_IMAGES.healthcare,
  company: 'Community clinic partner',
  city: 'Hamburg',
  type: 'Ausbildung pathway',
  salary: 'Program-dependent',
  language: 'German B1 required',
  training: 'Reception, appointment systems, patient documents',
  fit: 'Best for care-oriented candidates',
  status: 'Training pathway',
  strengths: ['Empathy', 'Structure', 'German practice']
}, {
  title: 'Logistics Planning Assistant',
  image: JOB_IMAGES.logistics,
  company: 'Mobility partner',
  city: 'Frankfurt am Main',
  type: 'Full-time',
  salary: 'EUR 2,600-3,200 gross',
  language: 'German A2-B1, English B1',
  training: 'Route planning, warehouse coordination, supplier updates',
  fit: 'Best for structured hands-on candidates',
  status: 'Placement preview',
  strengths: ['Planning', 'Punctuality', 'Team coordination']
}];
const ORIGINAL_CONTACT = ['VYN SPACE Holding GmbH', 'Kirchhofstr. 3, 40721 Hilden, Germany', 'info@vyn-space.com', '+49 157 33 77 98 94', 'Geschäftsführer: Victor Ferrari Alvarez', 'Registergericht: Amtsgericht Düsseldorf, HRB 105979'];
const PAGE_DATA: Record<string, PageData> = {
  spaces: {
    key: 'spaces',
    eyebrow: 'Public Preview Hub',
    title: 'Our Spaces',
    intro: 'APT, Jobs, and Finance, unified by one verified profile. Public previews now, full access after verification.',
    color: C.cyan,
    progress: 0.1,
    stats: [{ value: '3', label: 'Core spaces' }, { value: '1', label: 'Verified profile' }, { value: 'IDnow', label: 'Verification path' }],
    blocks: [{
      title: 'VYN APT',
      body: 'Housing access for verified users: see homes, check eligibility, request viewings, sign contracts.',
      items: ['Listings by city, size, layout, rooms, price', 'Eligibility: stable job or study, income, residence', 'Automated rental contract on approval']
    }, {
      title: 'VYN Jobs',
      body: 'Career entry through jobs, internships, training, and placement support.',
      items: ['Listings and indirect profile outreach', 'Assessment for fit, strengths, and growth', 'Commission-style placement model']
    }, {
      title: 'VYN Finance',
      body: 'White-label banking access plus the tools to manage money, with insurance and loans on the roadmap.',
      items: ['Solaris-style white-label rollout', 'Accounts, transfers, income, expenses', 'Loans, insurance, investments later, after review']
    }],
    cta: { label: 'Start verified access', href: '#/register' }
  },
  apt: {
    key: 'apt',
    eyebrow: 'Housing Access',
    title: 'VYN APT',
    intro: 'APT turns the old promise of rent, buy, and invest into a structured verified housing flow for refugees, students, and skilled workers arriving in Germany.',
    color: C.cyan,
    progress: 0.24,
    stats: [{ value: '12+', label: 'Listing fields' }, { value: '3', label: 'Eligibility checks' }, { value: 'Auto', label: 'Contract generation' }],
    blocks: [{
      title: 'Property previews',
      items: ['City, size, layout, number of rooms, and price category', 'Furnished status, garden, balcony, extras, energy supply, and WiFi', 'Availability state, taken status, and future availability dates']
    }, {
      title: 'Eligibility criteria',
      items: ['Stable job, university, training provider, or institution', 'Sufficient income and supporting documents', 'Residence visa and successful identity verification']
    }, {
      title: 'Application flow',
      items: ['Users apply or request a viewing when criteria are met', 'Landlord and partner data can be kept inside the verified workflow', 'Automated rental contract is generated for signing once all criteria pass']
    }, {
      title: 'Original positioning',
      body: 'VYN APT offers a broad real estate selection for different needs and budgets, then moves applications into a safer verified process.'
    }],
    cta: { label: 'Register for access', href: '#/register' }
  },
  jobs: {
    key: 'jobs',
    eyebrow: 'Work and Training',
    title: 'VYN Jobs',
    intro: 'Jobs supports career entry with listings, internships, training opportunities, assessment, employer matching, indirect outreach, and placement contracts.',
    color: C.amber,
    progress: 0.31,
    stats: [{ value: '3', label: 'Financial groups' }, { value: 'Fit', label: 'Assessment' }, { value: 'B2B', label: 'Commission model' }],
    blocks: [{
      title: 'Candidate experience',
      items: ['Job and internship resources for students, refugees, and skilled workers', 'Assessment test for suitable jobs, strengths, weaknesses, and training paths', 'Profiles categorized into three financial readiness groups']
    }, {
      title: 'Company experience',
      items: ['Companies can list job offers and training programs', 'Companies view verified user profiles and reach out indirectly', 'Filled roles are removed from listings to keep the marketplace clean']
    }, {
      title: 'Placement model',
      items: ['VYN Space can earn commission like a staffing agency', 'In-house contracts are created when VYN Space places workers', 'Employer partnerships should emphasize ethical workplaces and personal development']
    }],
    cta: { label: 'Start profile', href: '#/register' }
  },
  finance: {
    key: 'finance',
    eyebrow: 'Banking Layer',
    title: 'VYN Finance',
    intro: 'Finance helps students and newcomers build financial independence through secure banking access, money management, and carefully reviewed financial products.',
    color: C.violet,
    progress: 0.38,
    stats: [{ value: 'Solaris', label: 'White label path' }, { value: 'USDT', label: 'If crypto launches' }, { value: 'Bank', label: 'Long-term goal' }],
    blocks: [{
      title: 'Money management',
      body: 'Having a bank account helps students and newcomers take control of their finances, track spending, set up automatic payments, and build money-management skills.',
      items: ['Account creation after verified onboarding', 'Balance, transactions, transfers, income, and expenses', 'Purchase-data insights via banking data, with explicit consent']
    }, {
      title: 'Funding and investment',
      body: 'VYN Space can connect users with funding and investment opportunities only through a compliance-reviewed finance direction.',
      items: ['Loans, insurance, and work benefits', 'NFTs, real estate, bonds, climate projects, social projects, and community projects only after legal review', 'Goal: build a proprietary bank']
    }, {
      title: 'Security and custody',
      items: ['Verification is reused from onboarding', 'Magic link first, stronger authentication later', 'Wallet keys, liquidity pool legality, custody, and USDT-only scope need security review']
    }],
    cta: { label: 'Verify before finance', href: '#/register' }
  },
  about: {
    key: 'about',
    eyebrow: 'Founded in Düsseldorf',
    title: 'Who We Are',
    intro: 'VYN SPACE is a community founded in 2022 in Düsseldorf, Germany, focused on accessible knowledge, ethical networking, and better integration into society.',
    color: C.green,
    progress: 0.55,
    blocks: [{
      title: 'Mission',
      body: 'By providing the next generation an accessible entrance to the world, VYN Space focuses on giving people better access to knowledge and developing their potential based on social ethics.'
    }, {
      title: 'Belief',
      body: 'Knowledge is power and networking is the key. VYN Space and partners offer their network and experience to students, employees, refugees, skilled workers, and everybody who wants to explore the full potential of global networking.'
    }, {
      title: 'New product vision',
      items: ['A digital onboarding operating system for life in Germany', 'Structured like an institution, smooth like a modern product', 'Built around housing, finance, and jobs']
    }],
    cta: { label: 'Meet the team', href: '#/team' }
  },
  team: {
    key: 'team',
    eyebrow: 'Founders and Team',
    title: 'Our Team',
    intro: 'Victor Ferrari Alvarez, Timo Bayertz, and Marina Lettere form the human trust layer behind the VYN Space mission.',
    color: C.cyan,
    progress: 0.58,
    blocks: [{
      title: 'Victor Ferrari Alvarez',
      body: 'Founder of VYN Space. Victor brings experience across sales, finance, emerging markets, fintech, international account management, entrepreneurship, credit, and real estate. His work centers on using knowledge and networking to create a more equitable and socially responsible business world.'
    }, {
      title: 'Timo Bayertz',
      body: 'Entrepreneur and businessman with leadership experience in Düsseldorf. Timo brings a strong sense for business, innovation, community responsibility, and long-term company development.'
    }, {
      title: 'Marina Lettere',
      body: 'Changemaker focused on social justice, equality, cultural studies, and inclusion work. Marina brings experience in refugee integration, workshops, community projects, film work, and social activism.'
    }],
    cta: { label: 'Contact VYN Space', href: '#/contact' }
  },
  contact: {
    key: 'contact',
    eyebrow: 'Appointments and Contact',
    title: 'Let us know',
    intro: 'Please reach out for inquiries, feedback, partnerships, housing, employers, universities, authorities, NGOs, or CEO business appointments.',
    color: C.cyan,
    progress: 0.68,
    blocks: [{
      title: 'Contact',
      items: ORIGINAL_CONTACT
    }, {
      title: 'Appointment paths',
      items: ['CEO Calendly for business inquiries', 'Partner, housing, employer, university, authority, and NGO contact', 'User support and platform questions']
    }, {
      title: 'Message form fields',
      items: ['First name and last name', 'Email, subject, and message', 'Topic: business inquiry, housing partnership, employer partnership, user support, or institution integration']
    }],
    cta: { label: 'Email VYN Space', href: 'mailto:info@vyn-space.com' }
  },
  faq: {
    key: 'faq',
    eyebrow: 'Frequently Asked Questions',
    title: 'Plain answers',
    intro: 'The FAQ explains who VYN Space is for, how access works, and how the platform supports students, refugees, skilled workers, partners, and institutions.',
    color: C.cyan,
    progress: 0.9,
    blocks: FAQ.map(item => ({ title: item.q, body: item.a })).concat([{
      title: 'Can only students use VYN Space?',
      body: 'No. VYN Space supports international students, refugees, skilled workers, and young people who want to develop themselves, network, and integrate into Germany.'
    }, {
      title: 'Does VYN Space cost anything?',
      body: 'Platform access can be free depending on the program and partner setup. Users may still pay for accommodation, visa, registration, or finance-related fees where relevant.'
    }]),
    cta: { label: 'Ask a question', href: '#/contact' }
  },
  register: {
    key: 'register',
    eyebrow: 'Verified Onboarding',
    title: 'Register once. Verify once.',
    intro: 'Access to APT, Jobs, and Finance unlocks only after personal data, documents, consent, and ID verification (e.g. IDnow).',
    color: C.coral,
    progress: 0.45,
    blocks: [{
      title: 'Required data',
      items: ['Personal data, email, city, user group, and main goal', 'Passport, visa, residence permit, income, student, employer, or institution proof', 'Consent capture and audit status']
    }, {
      title: 'Verification provider',
      items: ['IDnow-style identity, document, and liveness checks', 'Authenticity of the person and documents confirmed quickly', 'Spaces unlock after approval']
    }, {
      title: 'Login plan',
      items: ['Magic link initially', 'Step-up authentication later', 'Session risk checks for finance and document workflows']
    }],
    cta: { label: 'Contact to register', href: '#/contact' }
  },
  blog: {
    key: 'blog',
    eyebrow: 'Stories and Updates',
    title: 'VYN Blog',
    intro: 'A publication layer for VYN Space updates, user voices, housing guidance, finance notes, partner news, and integration stories.',
    color: C.amber,
    progress: 0.62,
    blocks: [{
      title: 'Editorial lanes',
      items: ['VYN Space product updates', 'User stories from refugees, students, and skilled workers', 'Housing, finance, and jobs explainers']
    }, {
      title: 'Content pillars',
      items: ['Verified onboarding and document readiness', 'Housing, employment, and banking guidance', 'Ethical partner workplaces']
    }],
    cta: { label: 'Share a story', href: '#/contact' }
  },
};
const getRouteKey = () => {
  const raw = window.location.hash.replace(/^#\/?/, '') || '';
  if (!raw || raw === 'hero') return null;
  const key = ROUTE_ALIASES[raw] ?? raw;
  return PAGE_DATA[key] ? key : null;
};

// ─── CANVAS TEXTURE FACTORIES ──────────────────────────────────────────────────

/** Creates a procedural window-lit building facade texture */
function makeBuildingTexture(w: number, h: number, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#030C1A';
  ctx.fillRect(0, 0, w, h);
  const cols = Math.floor(w / 8);
  const rows = Math.floor(h / 12);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = Math.random() > 0.55;
      if (lit) {
        const bright = Math.random();
        if (bright > 0.88) {
          ctx.fillStyle = accentColor + 'CC';
        } else if (bright > 0.72) {
          ctx.fillStyle = '#AADDFF88';
        } else {
          ctx.fillStyle = '#FFE08855';
        }
        ctx.fillRect(c * 8 + 1, r * 12 + 1, 5, 8);
      }
    }
  }
  // roof antenna
  ctx.strokeStyle = accentColor + '66';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h * 0.12);
  ctx.stroke();
  return new THREE.CanvasTexture(canvas);
}

/** Creates a glowing space-card texture with branding */
function makeSpaceCardTexture(label: string, tagline: string, code: string, color: string): THREE.CanvasTexture {
  const W = 512,
    H = 320;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Deep background
  ctx.fillStyle = '#010810';
  ctx.fillRect(0, 0, W, H);

  // Gradient wash
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, color + '18');
  grad.addColorStop(1, '#00000000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = color + '55';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // Top accent bar
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, 2);

  // Corner brackets
  const bSize = 14;
  ctx.strokeStyle = color + 'AA';
  ctx.lineWidth = 1.5;
  [[0, 0], [W, 0], [0, H], [W, H]].forEach(([cx, cy]) => {
    const sx = cx === 0 ? 1 : -1;
    const sy = cy === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx + sx * bSize, cy + sy);
    ctx.lineTo(cx + sx, cy + sy);
    ctx.lineTo(cx + sx, cy + sy * bSize);
    ctx.stroke();
  });

  // Code tag
  ctx.fillStyle = color + 'CC';
  ctx.font = '700 11px monospace';
  ctx.fillText(code, 20, 32);

  // Horizontal divider
  ctx.strokeStyle = color + '30';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 44);
  ctx.lineTo(W - 20, 44);
  ctx.stroke();

  // Label
  ctx.fillStyle = '#E8F4FF';
  ctx.font = '700 54px "Inter", sans-serif';
  ctx.fillText(label, 20, 116);

  // Tagline
  ctx.fillStyle = color;
  ctx.font = '500 18px "Inter", sans-serif';
  ctx.fillText(tagline.toUpperCase(), 20, 148);

  // Divider
  ctx.strokeStyle = color + '22';
  ctx.beginPath();
  ctx.moveTo(20, 168);
  ctx.lineTo(W - 20, 168);
  ctx.stroke();

  // Dots / data visualization
  for (let i = 0; i < 16; i++) {
    const x = 20 + i * 30;
    const barH = 10 + Math.random() * 40;
    ctx.fillStyle = color + (i % 3 === 0 ? 'CC' : '44');
    ctx.fillRect(x, H - 48 - barH, 18, barH);
  }

  // Status
  ctx.fillStyle = color + 'AA';
  ctx.font = '600 10px monospace';
  ctx.fillText('● ACTIVE', 20, H - 18);
  ctx.fillStyle = '#6B8099';
  ctx.fillText('ENTER →', W - 80, H - 18);
  return new THREE.CanvasTexture(canvas);
}

/** Creates the central identity hub hologram texture */
function makeIdentityTexture(): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#03060D';
  ctx.fillRect(0, 0, S, S);

  // Concentric hex rings
  const cx = S / 2,
    cy = S / 2;
  for (let r = 1; r <= 6; r++) {
    const radius = r * 38;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i * 60 - 30) * (Math.PI / 180);
      if (i === 0) ctx.moveTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));else ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(91,192,235,${0.04 + r * 0.04})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Radial spokes
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * (Math.PI / 180);
    ctx.strokeStyle = 'rgba(91,192,235,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 220 * Math.cos(a), cy + 220 * Math.sin(a));
    ctx.stroke();
  }

  // Core glow
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
  grd.addColorStop(0, 'rgba(91,192,235,0.3)');
  grd.addColorStop(0.5, 'rgba(91,192,235,0.08)');
  grd.addColorStop(1, 'rgba(91,192,235,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.fill();

  // VYN text
  ctx.fillStyle = 'rgba(232,244,255,0.9)';
  ctx.font = '700 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('VYN', cx, cy + 16);

  // Outer text ring
  ctx.font = '500 9px monospace';
  ctx.fillStyle = 'rgba(91,192,235,0.6)';
  const ringText = 'VERIFIED · IDENTITY · SYSTEM · GERMANY · 2026 · ';
  const charCount = ringText.length;
  for (let i = 0; i < charCount; i++) {
    const a = i / charCount * Math.PI * 2 - Math.PI / 2;
    const rx = cx + 215 * Math.cos(a);
    const ry = cy + 215 * Math.sin(a);
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ringText[i], 0, 0);
    ctx.restore();
  }
  return new THREE.CanvasTexture(canvas);
}

/** Creates a grid/data floor texture */
function makeFloorTexture(): THREE.CanvasTexture {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#03060D';
  ctx.fillRect(0, 0, S, S);
  const step = 64;
  ctx.strokeStyle = 'rgba(91,192,235,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= S; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, S);
    ctx.stroke();
  }
  for (let y = 0; y <= S; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(S, y);
    ctx.stroke();
  }

  // Diagonal accent lines
  ctx.strokeStyle = 'rgba(139,92,246,0.04)';
  for (let i = -S; i < S * 2; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + S, S);
    ctx.stroke();
  }

  // Intersection dots
  for (let x = 0; x <= S; x += step) {
    for (let y = 0; y <= S; y += step) {
      if (Math.random() > 0.7) {
        ctx.fillStyle = `rgba(91,192,235,${0.04 + Math.random() * 0.12})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return new THREE.CanvasTexture(canvas);
}

/** Tunnel glow ring texture */
function makeTunnelTexture(color: number): THREE.CanvasTexture {
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, S, S);
  const r = color >> 16 & 0xff;
  const g = color >> 8 & 0xff;
  const b = color & 0xff;
  const grd = ctx.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S / 2);
  grd.addColorStop(0, `rgba(${r},${g},${b},0)`);
  grd.addColorStop(0.7, `rgba(${r},${g},${b},0.6)`);
  grd.addColorStop(0.85, `rgba(${r},${g},${b},0.9)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

// ─── PRE-BUILT STATIC DATA ─────────────────────────────────────────────────────

const NUM_BUILDINGS = 118;
type BldgData = {
  x: number;
  z: number;
  h: number;
  w: number;
  d: number;
  colorIdx: number;
};
const BLDG_DATA: BldgData[] = Array.from({
  length: NUM_BUILDINGS
}, (_, i) => {
  const side = i % 2 === 0 ? 1 : -1;
  const row = Math.floor(i / 2);
  const spread = 22 + Math.random() * 16;
  return {
    x: side * (spread + Math.random() * 10),
    z: -46 - row * 7.2 - Math.random() * 4.5,
    h: 3 + Math.random() * 18,
    w: 1.1 + Math.random() * 1.9,
    d: 1.1 + Math.random() * 1.9,
    colorIdx: Math.floor(Math.random() * 4)
  };
});
const PARTICLE_COUNT = 3000;
const pPos = new Float32Array(PARTICLE_COUNT * 3);
const pCol = new Float32Array(PARTICLE_COUNT * 3);
const pSizes = new Float32Array(PARTICLE_COUNT);
const pColorPool = [new THREE.Color(C.cyan), new THREE.Color(C.green), new THREE.Color(C.violet), new THREE.Color(C.amber)];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 100;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
  pPos[i * 3 + 2] = -(Math.random() * 620);
  const pc = pColorPool[i % 4];
  pCol[i * 3] = pc.r;
  pCol[i * 3 + 1] = pc.g;
  pCol[i * 3 + 2] = pc.b;
  pSizes[i] = 0.3 + Math.random() * 1.4;
}

// Data stream ribbon lines
const RIBBON_COUNT = 24;
type RibbonData = {
  x: number;
  color: number;
  speed: number;
  offset: number;
};
const RIBBON_DATA: RibbonData[] = Array.from({
  length: RIBBON_COUNT
}, (_, i) => ({
  x: (i % 2 === 0 ? 1 : -1) * (13 + i % 8 * 2.6),
  color: [C.cyanHex, C.greenHex, C.violetHex, C.amberHex][i % 4],
  speed: 0.65 + Math.random() * 1.6,
  offset: Math.random() * 460
}));

// Tunnel arch positions
const TUNNEL_ARCHES: Array<{
  z: number;
  color: number;
  scale: number;
}> = [{
  z: -58,
  color: C.cyanHex,
  scale: 0.84
}, {
  z: -98,
  color: C.greenHex,
  scale: 0.8
}, {
  z: -138,
  color: C.violetHex,
  scale: 0.76
}, {
  z: -178,
  color: C.amberHex,
  scale: 0.72
}, {
  z: -220,
  color: C.cyanHex,
  scale: 0.7
}, {
  z: -270,
  color: C.greenHex,
  scale: 0.68
}, {
  z: -328,
  color: C.violetHex,
  scale: 0.66
}, {
  z: -386,
  color: C.cyanHex,
  scale: 0.64
}, {
  z: -444,
  color: C.greenHex,
  scale: 0.62
}, {
  z: -500,
  color: C.violetHex,
  scale: 0.6
}, {
  z: -556,
  color: C.amberHex,
  scale: 0.58
}];

// ─── 3D COMPONENT: PROCEDURAL CITY ────────────────────────────────────────────
const ProceduralCity: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const texColors = [C.cyan, C.green, C.violet, C.amber];
  const buildingMeshes = useMemo(() => {
    return BLDG_DATA.map(b => {
      const tex = makeBuildingTexture(32, 64, texColors[b.colorIdx]);
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d, 1, 1, 1);
      const mat = new THREE.MeshBasicMaterial({
        map: tex
      });
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(texColors[b.colorIdx]),
        transparent: true,
        opacity: 0.12
      });
      return {
        geo,
        mat,
        edgeGeo,
        edgeMat,
        b
      };
    });
  }, []);
  useFrame(({
    clock
  }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const ls = child.children[1] as THREE.LineSegments;
      if (ls?.material) {
        const mat = ls.material as THREE.LineBasicMaterial;
        mat.opacity = 0.035 + Math.abs(Math.sin(clock.elapsedTime * 0.22 + i * 0.38)) * 0.11;
      }
    });
  });
  return <group ref={groupRef}>
      {buildingMeshes.map(({
      geo,
      mat,
      edgeGeo,
      edgeMat,
      b
    }, i) => <group key={i} position={[b.x, b.h / 2 - 5.5, b.z]}>
          <mesh geometry={geo} material={mat} />
          <lineSegments geometry={edgeGeo} material={edgeMat} />
        </group>)}
    </group>;
};

// ─── 3D COMPONENT: DATA STREAM RIBBONS ────────────────────────────────────────
const DataStreamRibbons: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const ribbonObjects = useMemo(() => RIBBON_DATA.map(r => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6 * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: r.color,
      transparent: true,
      opacity: 0.0
    });
    return {
      geo,
      mat,
      lineObj: new THREE.Line(geo, mat)
    };
  }), []);
  useFrame(({
    clock,
    camera
  }) => {
    RIBBON_DATA.forEach((r, i) => {
      const {
        geo,
        mat
      } = ribbonObjects[i];
      const t = clock.elapsedTime * r.speed;
      const zBase = camera.position.z - (t * 60 + r.offset) % 460;
      const pos = geo.attributes.position.array as Float32Array;
      for (let j = 0; j < 6; j++) {
        pos[j * 3] = r.x + j % 2 * 0.08;
        pos[j * 3 + 1] = -6 + j * 5;
        pos[j * 3 + 2] = zBase - j * 8;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.02 + Math.abs(Math.sin(t * 0.5)) * 0.08;
    });
  });
  return <group ref={groupRef}>
      {ribbonObjects.map(({
      lineObj
    }, i) => <primitive key={i} object={lineObj} />)}
    </group>;
};

// ─── 3D COMPONENT: STARFIELD WITH CUSTOM SIZES ────────────────────────────────
const StarField: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    g.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));
    return g;
  }, []);
  useFrame(({
    clock
  }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.002;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.001) * 0.02;
    }
  });
  return <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.052} vertexColors transparent opacity={0.58} sizeAttenuation />
    </points>;
};

// ─── 3D COMPONENT: TEXTURED FLOOR ─────────────────────────────────────────────
const Floor: React.FC = () => {
  const tex = useMemo(() => {
    const t = makeFloorTexture();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(20, 110);
    return t;
  }, []);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.5, -330]}>
      <planeGeometry args={[180, 680, 1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={0.46} />
    </mesh>;
};

// ─── 3D COMPONENT: TUNNEL ARCH RINGS ──────────────────────────────────────────
const TunnelArch: React.FC<{
  z: number;
  color: number;
  scale: number;
  idx: number;
}> = ({
  z,
  color,
  scale,
  idx
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeTunnelTexture(color), [color]);
  const hexLineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i * 60 - 30) * (Math.PI / 180);
      pts.push(new THREE.Vector3(10 * scale * Math.cos(a), 10 * scale * Math.sin(a), 0));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15
    });
    return new THREE.Line(g, m);
  }, [scale, color]);
  const innerLineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i * 60 - 30) * (Math.PI / 180);
      pts.push(new THREE.Vector3(6.5 * scale * Math.cos(a), 6.5 * scale * Math.sin(a), 0));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.1
    });
    return new THREE.Line(g, m);
  }, [scale, color]);
  const billGeo = useMemo(() => new THREE.PlaneGeometry(22 * scale, 22 * scale), [scale]);
  const billMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.045,
    depthWrite: false,
    side: THREE.DoubleSide
  }), [tex]);
  useFrame(({
    clock
  }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime * 0.18 + idx * 1.1;
    groupRef.current.rotation.z = t;
    const hexLine = groupRef.current.children[0] as THREE.Line;
    if (hexLine?.material) {
      (hexLine.material as THREE.LineBasicMaterial).opacity = 0.08 + Math.abs(Math.sin(clock.elapsedTime * 0.34 + idx)) * 0.1;
    }
  });
  return <group position={[0, 0, z]}>
      <group ref={groupRef}>
        <primitive object={hexLineObj} />
        <primitive object={innerLineObj} />
      </group>
      {[0, 1, 2, 3, 4, 5].map(j => {
      const a = j * 60 * (Math.PI / 180);
      const cx = 10 * scale * Math.cos(a);
      const cy = 10 * scale * Math.sin(a);
      return <mesh key={j} position={[cx, cy, 0]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>;
    })}
      <mesh geometry={billGeo} material={billMat} />
    </group>;
};

// ─── 3D COMPONENT: IDENTITY HUB ────────────────────────────────────────────────
const IdentityHub: React.FC<{
  position: [number, number, number];
}> = ({
  position
}) => {
  const outerRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const idTex = useMemo(() => makeIdentityTexture(), []);

  // DNA-like double helix
  const helixPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80 * Math.PI * 4;
      pts.push(new THREE.Vector3(3.5 * Math.cos(t), i / 80 * 14 - 7, 3.5 * Math.sin(t)));
    }
    return pts;
  }, []);
  const helixGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(helixPoints), [helixPoints]);
  const helixMat = useMemo(() => new THREE.LineBasicMaterial({
    color: C.cyanHex,
    transparent: true,
    opacity: 0.28
  }), []);
  const helixLineObj = useMemo(() => new THREE.Line(helixGeo, helixMat), [helixGeo, helixMat]);
  const helix2Points = useMemo(() => helixPoints.map(p => new THREE.Vector3(-p.x, p.y, -p.z)), [helixPoints]);
  const helix2Geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(helix2Points), [helix2Points]);
  const helix2Mat = useMemo(() => new THREE.LineBasicMaterial({
    color: C.violetHex,
    transparent: true,
    opacity: 0.22
  }), []);
  const helix2LineObj = useMemo(() => new THREE.Line(helix2Geo, helix2Mat), [helix2Geo, helix2Mat]);
  const rungLineObjs = useMemo(() => helixPoints.filter((_, i) => i % 8 === 0).map(p => {
    const g = new THREE.BufferGeometry().setFromPoints([p, new THREE.Vector3(-p.x, p.y, -p.z)]);
    const m = new THREE.LineBasicMaterial({
      color: C.greenHex,
      transparent: true,
      opacity: 0.15
    });
    return new THREE.Line(g, m);
  }), [helixPoints]);

  // Orbital ring geoms
  const ring1Geo = useMemo(() => new THREE.TorusGeometry(5.5, 0.02, 4, 128), []);
  const ring2Geo = useMemo(() => new THREE.TorusGeometry(7.5, 0.018, 4, 128), []);
  const ring3Geo = useMemo(() => new THREE.TorusGeometry(10, 0.015, 4, 128), []);
  const ring1Mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: C.cyanHex,
    transparent: true,
    opacity: 0.18
  }), []);
  const ring2Mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: C.violetHex,
    transparent: true,
    opacity: 0.14
  }), []);
  const ring3Mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: C.greenHex,
    transparent: true,
    opacity: 0.10
  }), []);
  useFrame(({
    clock
  }) => {
    const t = clock.elapsedTime;
    if (outerRef.current) outerRef.current.rotation.y = t * 0.1;
    if (midRef.current) {
      midRef.current.rotation.x = t * 0.14;
      midRef.current.rotation.z = t * 0.07;
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.07;
      coreRef.current.scale.set(s, s, s);
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 0.9) * 0.12;
      glowRef.current.scale.set(s, s, s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 0.9) * 0.02;
    }
  });
  return <group position={position}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[11, 32, 32]} />
        <meshBasicMaterial color={C.cyanHex} transparent opacity={0.04} depthWrite={false} />
      </mesh>

      {/* Orbital rings */}
      <mesh ref={outerRef} geometry={ring1Geo} material={ring1Mat} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={ring2Geo} material={ring2Mat} rotation={[0.5, 0.3, 0]} />
      <mesh geometry={ring3Geo} material={ring3Mat} rotation={[1.1, 0.8, 0.4]} />

      {/* DNA double helix */}
      <group ref={midRef}>
        <primitive object={helixLineObj} />
        <primitive object={helix2LineObj} />
        {rungLineObjs.map((obj, i) => <primitive key={i} object={obj} />)}
      </group>

      {/* Core identity billboard (canvas tex) */}
      <mesh ref={coreRef}>
        <planeGeometry args={[5.5, 5.5]} />
        <meshBasicMaterial map={idTex} transparent opacity={0.92} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Inner hard sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 20, 20]} />
        <meshBasicMaterial color={C.cyanHex} transparent opacity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshBasicMaterial color="#E8F4FF" />
      </mesh>

      {/* Space orbit nodes */}
      {SPACES.map((sp, i) => {
      const a = i / SPACES.length * Math.PI * 2;
      return <SpaceOrbitNode key={sp.id} angle={a} radius={5.5} color={sp.colorHex} idx={i} />;
    })}
    </group>;
};
const SpaceOrbitNode: React.FC<{
  angle: number;
  radius: number;
  color: number;
  idx: number;
}> = ({
  angle,
  radius,
  color,
  idx
}) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({
    clock
  }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.18 + angle;
    ref.current.position.x = radius * Math.cos(t);
    ref.current.position.y = radius * Math.sin(t);
    const s = 1 + Math.sin(clock.elapsedTime * 1.4 + idx * 1.2) * 0.18;
    ref.current.scale.set(s, s, s);
  });
  return <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[0.28, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.48, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
    </group>;
};

// ─── 3D COMPONENT: SPACE PORTAL CARDS ─────────────────────────────────────────
const SpacePortalCard: React.FC<{
  space: SpaceItem;
  idx: number;
}> = ({
  space,
  idx
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const side = idx % 2 === 0 ? -1 : 1;
  const xPos = side * 14;
  const cardTex = useMemo(() => makeSpaceCardTexture(space.label, space.tagline, space.code, space.color), [space]);
  const cardGeo = useMemo(() => new THREE.PlaneGeometry(12, 7.5), []);
  const cardMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: cardTex,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide
  }), [cardTex]);

  // Edge frame
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(12, 7.5, 0.05)), []);
  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({
    color: space.colorHex,
    transparent: true,
    opacity: 0.45
  }), [space.colorHex]);

  // Corner crystals
  const crystalGeo = useMemo(() => new THREE.OctahedronGeometry(0.22, 0), []);
  const crystalMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: space.colorHex,
    transparent: true,
    opacity: 0.8
  }), [space.colorHex]);
  const glowGeo = useMemo(() => new THREE.PlaneGeometry(16, 11), []);
  const glowMat = useMemo(() => {
    const t = makeTunnelTexture(space.colorHex);
    return new THREE.MeshBasicMaterial({
      map: t,
      transparent: true,
      opacity: 0.1,
      depthWrite: false
    });
  }, [space.colorHex]);
  const connectorLineObj = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-xPos, 0, 0)]);
    const m = new THREE.LineBasicMaterial({
      color: space.colorHex,
      transparent: true,
      opacity: 0.1
    });
    return new THREE.Line(g, m);
  }, [xPos, space.colorHex]);
  useFrame(({
    clock
  }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.35 + idx * 1.4) * 0.8;
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(t * 0.12 + idx) * 0.08;
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + Math.abs(Math.sin(t * 0.5 + idx)) * 0.08;
    }
  });
  return <group ref={groupRef} position={[xPos, 0.5, space.zPos]}>
      <mesh ref={glowRef} geometry={glowGeo} material={glowMat} />
      <mesh ref={cardRef} geometry={cardGeo} material={cardMat} />
      <lineSegments geometry={edgeGeo} material={edgeMat} />
      <primitive object={connectorLineObj} />
      {([[-5.8, 3.5, 0.1], [5.8, 3.5, 0.1], [-5.8, -3.5, 0.1], [5.8, -3.5, 0.1]] as [number, number, number][]).map((pos, j) => <mesh key={j} geometry={crystalGeo} material={crystalMat} position={pos} />)}
    </group>;
};

// ─── 3D COMPONENT: FINALE GATEWAY ─────────────────────────────────────────────
const FinaleGateway: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const portalRef = useRef<THREE.Mesh>(null);
  const idTex = useMemo(() => makeIdentityTexture(), []);
  const archLineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const a = i / 32 * Math.PI * 2;
      pts.push(new THREE.Vector3(16 * Math.cos(a), 16 * Math.sin(a), 0));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color: C.cyanHex,
      transparent: true,
      opacity: 0.18
    });
    return new THREE.Line(g, m);
  }, []);
  useFrame(({
    clock
  }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.06;
    if (portalRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.04;
      portalRef.current.scale.set(s, s, s);
    }
  });
  return <group position={[0, 0, -560]}>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[22, 32, 32]} />
        <meshBasicMaterial color={C.cyanHex} transparent opacity={0.02} depthWrite={false} />
      </mesh>

      {/* Layered rings */}
      <group ref={groupRef}>
        {[14, 17, 20, 23].map((r, i) => {
        const colors = [C.cyanHex, C.violetHex, C.greenHex, C.amberHex];
        const opacities = [0.16, 0.12, 0.09, 0.07];
        return <mesh key={r} rotation={[i * 0.4, i * 0.3, 0]}>
              <torusGeometry args={[r, 0.03, 4, 160]} />
              <meshBasicMaterial color={colors[i]} transparent opacity={opacities[i]} />
            </mesh>;
      })}
      </group>

      <primitive object={archLineObj} />

      {/* Identity portal billboard */}
      <mesh ref={portalRef}>
        <circleGeometry args={[8, 64]} />
        <meshBasicMaterial map={idTex} transparent opacity={0.15} depthWrite={false} />
      </mesh>

      {/* Central void */}
      <mesh>
        <sphereGeometry args={[4, 24, 24]} />
        <meshBasicMaterial color={C.cyanHex} transparent opacity={0.06} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2, 18, 18]} />
        <meshBasicMaterial color="#E8F4FF" transparent opacity={0.18} />
      </mesh>

      {/* 6 crystalline pillars around gateway */}
      {[0, 1, 2, 3, 4, 5].map(i => {
      const a = i * 60 * (Math.PI / 180);
      return <mesh key={i} position={[Math.cos(a) * 11, Math.sin(a) * 11, 0]}>
            <octahedronGeometry args={[0.55, 0]} />
            <meshBasicMaterial color={[C.cyanHex, C.greenHex, C.violetHex, C.amberHex, C.coralHex, C.cyanHex][i]} transparent opacity={0.75} />
          </mesh>;
    })}
    </group>;
};

// ─── 3D COMPONENT: ATMOSPHERIC DEPTH FOG COLUMNS ──────────────────────────────
const AtmosphericColumns: React.FC = () => {
  const colData = useMemo(() => Array.from({
    length: 12
  }, (_, i) => ({
    x: (Math.random() - 0.5) * 62,
    z: -54 - i * 34,
    color: [C.cyanHex, C.violetHex, C.greenHex][i % 3],
    h: 8 + Math.random() * 16,
    speed: 0.2 + Math.random() * 0.5,
    offset: Math.random() * Math.PI * 2
  })), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({
    clock
  }) => {
    colData.forEach((col, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.008 + Math.abs(Math.sin(clock.elapsedTime * col.speed + col.offset)) * 0.024;
    });
  });
  return <group>
      {colData.map((col, i) => <mesh key={i} ref={el => {
      refs.current[i] = el;
    }} position={[col.x, col.h / 2 - 6, col.z]}>
          <cylinderGeometry args={[0.25, 1.5, col.h, 6, 1, true]} />
          <meshBasicMaterial color={col.color} transparent opacity={0.02} side={THREE.DoubleSide} />
        </mesh>)}
    </group>;
};

// ─── 3D COMPONENT: FLOATING DATA BYTES ────────────────────────────────────────
const FloatingBytes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const byteData = useMemo(() => Array.from({
    length: 42
  }, (_, i) => ({
    x: (Math.random() - 0.5) * 76,
    y: -4 + Math.random() * 14,
    z: -34 - (i * 9 + Math.random() * 7),
    color: [C.cyanHex, C.greenHex, C.violetHex][i % 3],
    speed: 0.22 + Math.random() * 0.56,
    offset: Math.random() * Math.PI * 2,
    size: 0.04 + Math.random() * 0.08
  })), []);
  const byteGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useFrame(({
    clock
  }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const d = byteData[i];
      if (!d) return;
      child.position.y = d.y + Math.sin(clock.elapsedTime * d.speed + d.offset) * 1.2;
      child.rotation.x = clock.elapsedTime * d.speed * 0.5;
      child.rotation.y = clock.elapsedTime * d.speed * 0.7;
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.06 + Math.abs(Math.sin(clock.elapsedTime * d.speed + d.offset)) * 0.2;
    });
  });
  return <group ref={groupRef}>
      {byteData.map((d, i) => <mesh key={i} geometry={byteGeo} position={[d.x, d.y, d.z]}>
          <meshBasicMaterial color={d.color} transparent opacity={0.15} />
        </mesh>)}
    </group>;
};

// ─── CAMERA CONTROLLER ─────────────────────────────────────────────────────────
const CameraController: React.FC<{
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}> = ({
  scrollProgress,
  mouseX,
  mouseY
}) => {
  const {
    camera
  } = useThree();
  const pos = useRef(new THREE.Vector3(0, 3, 24));
  const tgt = useRef(new THREE.Vector3(0, 0, -10));
  const vel = useRef(new THREE.Vector3());
  useFrame(() => {
    const prog = scrollProgress;
    // Camera path is 390 units (24 -> -366) to match the SECTIONS band math
    // and the SPACES.zPos distribution (-80 .. -304). With the previous -600
    // path the camera flew way past every card before its band activated.
    const totalZ = -390 * prog;
    const waveX = Math.sin(prog * Math.PI * 4.2) * 4.2 + mouseX * 1.8;
    const waveY = 2.7 + prog * 2.4 + Math.cos(prog * Math.PI * 2.5) * 1.2 + mouseY * 0.9;
    const desired = new THREE.Vector3(waveX, waveY, 24 + totalZ);
    // Tighter lerp (0.10 vs 0.038) so camera tracks scroll closely; previous
    // value lagged badly during fast scrolling, putting visible 3D cards out
    // of sync with the popup band that is keyed off raw scroll progress.
    vel.current.subVectors(desired, pos.current).multiplyScalar(0.10);
    pos.current.add(vel.current);
    camera.position.copy(pos.current);
    tgt.current.set(waveX * 0.4, waveY - 2.2, pos.current.z - 32);
    camera.lookAt(tgt.current);
  });
  return null;
};

// ─── MAIN SCENE ────────────────────────────────────────────────────────────────
const VynScene: React.FC<{
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}> = ({
  scrollProgress,
  mouseX,
  mouseY
}) => {
  const showPortals = scrollProgress > 0.035;
  return <group>
      <fog attach="fog" args={[C.bg, 20, 220]} />
      <CameraController scrollProgress={scrollProgress} mouseX={mouseX} mouseY={mouseY} />
      <Floor />
      <StarField />
      <ProceduralCity />
      <DataStreamRibbons />
      <AtmosphericColumns />
      <FloatingBytes />

      {/* Tunnel arch rings along the journey */}
      {TUNNEL_ARCHES.map((arch, i) => <TunnelArch key={i} z={arch.z} color={arch.color} scale={arch.scale} idx={i} />)}

      {/* Hero identity hub */}
      <IdentityHub position={[0, 0.8, -46]} />

      {/* Space portal cards */}
      {showPortals && SPACES.map((sp, i) => <SpacePortalCard key={sp.id} space={sp} idx={i} />)}

      {/* Finale gateway */}
      <FinaleGateway />

      {/* Mid-journey decorative panels */}
      {[{
      pos: [0, 2, -280] as [number, number, number],
      color: C.greenHex,
      w: 22,
      h: 12
    }, {
      pos: [-14, 0, -365] as [number, number, number],
      color: C.cyanHex,
      w: 14,
      h: 8
    }, {
      pos: [14, 1, -450] as [number, number, number],
      color: C.violetHex,
      w: 14,
      h: 8
    }].map((p, i) => <DeepPortal key={i} position={p.pos} color={p.color} w={p.w} h={p.h} idx={i} />)}
    </group>;
};
const DeepPortal: React.FC<{
  position: [number, number, number];
  color: number;
  w: number;
  h: number;
  idx: number;
}> = ({
  position,
  color,
  w,
  h,
  idx
}) => {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeTunnelTexture(color), [color]);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), [w, h]);
  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.25
  }), [color]);
  const fillMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.06,
    depthWrite: false
  }), [tex]);
  useFrame(({
    clock
  }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.3 + idx * 1.5) * 0.5;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.1 + idx) * 0.04;
  });
  return <group ref={ref} position={position}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <primitive object={fillMat} />
      </mesh>
      <lineSegments geometry={edgeGeo} material={edgeMat} />
    </group>;
};

// ─── HTML BRAND MARK ───────────────────────────────────────────────────────────
const VynMark: React.FC<{
  size?: number;
}> = ({
  size = 36
}) => <span style={{
  width: size,
  height: size,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  filter: `drop-shadow(0 0 ${Math.round(size * 0.35)}px rgba(91,192,235,0.38))`,
  flexShrink: 0
}}>
    <img src={LOGO_URL} alt="VYN Space logo" style={{
    width: size,
    height: size,
    objectFit: 'contain',
    display: 'block'
  }} />
  </span>;

// ─── SCROLL PROGRESS INDICATOR ─────────────────────────────────────────────────
// Each label's prog is the *center* of its matching scroll band so the active
// rail dot lights up exactly when the panel does. halfWidth defaults to 0.045
// (matches the 0.082 narrow bands); SPACES uses 0.105 because its band is
// 2.5x wider, and ORIGIN uses 0.05 to match the short hero band.
const SECTION_LABELS: Array<{ label: string; prog: number; halfWidth?: number }> = [
  { label: 'ORIGIN', prog: 0.04, halfWidth: 0.04 },
  { label: 'SPACES', prog: 0.179, halfWidth: 0.105 },
  { label: 'APT', prog: 0.324 },
  { label: 'JOBS', prog: 0.406 },
  { label: 'FINANCE', prog: 0.488 },
  { label: 'VERIFY', prog: 0.570 },
  { label: 'ABOUT', prog: 0.652 },
  { label: 'BLOG', prog: 0.734 },
  { label: 'CONTACT', prog: 0.816 },
  { label: 'FAQ', prog: 0.892, halfWidth: 0.028 },
  { label: 'ACCESS', prog: 0.965, halfWidth: 0.035 }
];
const ScrollIndicator: React.FC<{
  progress: number;
}> = ({
  progress
}) => <div className="scroll-indicator" style={{
  position: 'fixed',
  right: 22,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
  zIndex: 300
}}>
    {SECTION_LABELS.map(({ label, prog: sp, halfWidth = 0.045 }) => {
    const active = Math.abs(progress - sp) < halfWidth;
    const passed = progress > sp + halfWidth;
    return <div key={label} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }}>
          <div style={{
        width: active ? 18 : passed ? 6 : 4,
        height: active ? 1.5 : 1,
        backgroundColor: active ? C.cyan : passed ? C.cyanDim : C.dim,
        transition: 'all 0.35s ease',
        boxShadow: active ? `0 0 6px ${C.cyan}` : 'none'
      }} />
          {active && <span style={{
        color: C.cyan,
        fontSize: 6.5,
        letterSpacing: '0.22em',
        fontFamily: 'monospace',
        textTransform: 'uppercase' as const
      }}>
              {label}
            </span>}
        </div>;
  })}
    {/* Progress bar */}
    <div style={{
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: C.dim
  }}>
      <div style={{
      width: '100%',
      backgroundColor: C.cyan,
      height: `${progress * 100}%`,
      transition: 'height 0.1s linear',
      boxShadow: `0 0 4px ${C.cyan}`
    }} />
    </div>
  </div>;

// ─── NAVBAR ────────────────────────────────────────────────────────────────────
const NavBar: React.FC<{
  scrolled: boolean;
}> = ({
  scrolled
}) => {
  const [open, setOpen] = useState(false);
  return <motion.nav initial={{
    y: -72,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} transition={{
    duration: 1,
    ease: [0.16, 1, 0.3, 1]
  }} style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    backgroundColor: scrolled ? 'rgba(0,6,15,0.94)' : 'transparent',
    backdropFilter: scrolled ? 'blur(28px)' : 'none',
    borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
    transition: 'all 0.55s ease'
  }}>
      <div style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: '0 28px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
        <a href="#" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none'
      }}>
          <VynMark size={30} />
          <span style={{
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: 'monospace',
          letterSpacing: '0.08em'
        }}>
            VYN<span style={{
            color: C.cyan
          }}>·</span>SPACE
          </span>
        </a>

        <div className="hidden md:flex" style={{
        alignItems: 'center',
        gap: 26
      }}>
          {NAV_ITEMS.map(l => <a key={l.label} href={l.href} style={{
          color: C.muted,
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textDecoration: 'none',
          textTransform: 'uppercase',
          transition: 'color 0.2s, text-shadow 0.2s'
        }} onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = C.cyan;
          (e.currentTarget as HTMLElement).style.textShadow = `0 0 12px ${C.cyan}`;
        }} onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = C.muted;
          (e.currentTarget as HTMLElement).style.textShadow = 'none';
        }}>
              {l.label}
            </a>)}
        </div>

        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
          <button className="hidden md:flex" onClick={() => {
          window.location.hash = '/spaces';
        }} style={{
          background: 'none',
          border: `1px solid ${C.border}`,
          color: C.muted,
          fontSize: 9.5,
          padding: '7px 16px',
          borderRadius: 5,
          cursor: 'pointer',
          fontWeight: 600,
          letterSpacing: '0.14em',
          transition: 'all 0.2s',
          fontFamily: 'monospace'
        }} onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = C.cyan;
          (e.currentTarget as HTMLElement).style.color = C.text;
        }} onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = C.border;
          (e.currentTarget as HTMLElement).style.color = C.muted;
        }}>
            SPACES
          </button>
          <button className="hidden md:flex" onClick={() => {
          window.location.hash = '/register';
        }} style={{
          background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`,
          border: 'none',
          color: '#03060D',
          fontSize: 9.5,
          padding: '8px 18px',
          borderRadius: 5,
          cursor: 'pointer',
          fontWeight: 800,
          letterSpacing: '0.14em',
          fontFamily: 'monospace',
          boxShadow: `0 0 20px ${C.cyan}30`
        }}>
            REGISTER
          </button>
          <button className="md:hidden" onClick={() => setOpen(o => !o)} style={{
          background: 'none',
          border: 'none',
          color: C.muted,
          cursor: 'pointer',
          padding: 4
        }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {open ? <><line x1="4" y1="4" x2="16" y2="16" stroke={C.muted} strokeWidth="1.8" /><line x1="16" y1="4" x2="4" y2="16" stroke={C.muted} strokeWidth="1.8" /></> : <><line x1="3" y1="6" x2="17" y2="6" stroke={C.muted} strokeWidth="1.8" /><line x1="3" y1="10" x2="17" y2="10" stroke={C.muted} strokeWidth="1.8" /><line x1="3" y1="14" x2="17" y2="14" stroke={C.muted} strokeWidth="1.8" /></>}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} style={{
        backgroundColor: 'rgba(0,6,15,0.97)',
        borderTop: `1px solid ${C.border}`,
        overflow: 'hidden'
      }}>
            <div style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
              {NAV_ITEMS.map(l => <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{
            color: C.muted,
            fontSize: 13,
            textDecoration: 'none',
            letterSpacing: '0.12em',
            fontFamily: 'monospace'
          }}>
                  {l.label}
                </a>)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.nav>;
};

// ─── HERO OVERLAY ──────────────────────────────────────────────────────────────
const HeroOverlay: React.FC<{
  visible: boolean;
}> = ({
  visible
}) => <div style={{
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  pointerEvents: visible ? 'auto' : 'none',
  background: visible ? 'radial-gradient(ellipse at 50% 50%, rgba(3,6,13,0.82) 0%, rgba(3,6,13,0.58) 36%, rgba(3,6,13,0.20) 66%, transparent 86%)' : 'transparent'
}}>
    <motion.div initial={{
    opacity: 0,
    y: 50
  }} animate={{
    opacity: visible ? 1 : 0,
    y: visible ? 0 : -50
  }} transition={{
    duration: 0.9,
    ease: [0.16, 1, 0.3, 1]
  }} style={{
    textAlign: 'center',
    padding: '0 24px',
    maxWidth: 840,
    pointerEvents: 'none'
  }}>
      {/* Status pill */}
      <motion.div initial={{
      opacity: 0,
      y: 14
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.4,
      duration: 0.8
    }} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 30,
      padding: '5px 14px',
      borderRadius: 40,
      border: `1px solid ${C.border}`,
      backgroundColor: 'rgba(91,192,235,0.04)',
      fontFamily: 'monospace'
    }}>
        <motion.span animate={{
        opacity: [1, 0.2, 1],
        boxShadow: [`0 0 6px ${C.green}`, `0 0 14px ${C.green}`, `0 0 6px ${C.green}`]
      }} transition={{
        repeat: Infinity,
        duration: 2.4
      }} style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        backgroundColor: C.green,
        display: 'inline-block'
      }} />
        <span style={{
        color: C.green,
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: '0.26em',
        textTransform: 'uppercase' as const
      }}>
          VYN SPACE · HOUSING · EDUCATION · JOBS · FINANCE
        </span>
      </motion.div>

      <motion.div initial={{
      opacity: 0,
      scale: 0.86,
      y: 12
    }} animate={{
      opacity: 1,
      scale: 1,
      y: 0
    }} transition={{
      delay: 0.5,
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1]
    }} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 22,
      filter: 'drop-shadow(0 0 22px rgba(91,192,235,0.30))'
    }}>
        <img src={LOGO_URL} alt="VYN Space logo" style={{
        width: 78,
        height: 78,
        objectFit: 'contain',
        display: 'block'
      }} />
      </motion.div>

      {/* Main headline */}
      <motion.h1 initial={{
      opacity: 0,
      y: 54
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.6,
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1]
    }} style={{
      fontFamily: 'Comfortaa, Inter, sans-serif',
      fontSize: 'var(--hero-title-size)',
      fontWeight: 700,
      color: C.text,
      lineHeight: 0.98,
      letterSpacing: 0,
      margin: '0 0 8px'
    }}>
        Verified life
      </motion.h1>
      <motion.h1 initial={{
      opacity: 0,
      y: 54
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.78,
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1]
    }} style={{
      fontFamily: 'Comfortaa, Inter, sans-serif',
      fontSize: 'var(--hero-title-size)',
      fontWeight: 700,
      lineHeight: 0.98,
      letterSpacing: 0,
      margin: '0 0 34px',
      background: `linear-gradient(110deg, ${C.cyan} 0%, ${C.green} 45%, ${C.violet} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
        onboarding.
      </motion.h1>

      <motion.p initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 1.0,
      duration: 0.9
    }} style={{
      color: 'rgba(160,167,184,0.86)',
      fontSize: 'var(--hero-copy-size)',
      lineHeight: 1.76,
      maxWidth: 590,
      margin: '0 auto 42px',
      fontFamily: 'Inter, sans-serif'
    }}>
        Housing, banking, and work, unified by one verified identity.
      </motion.p>

      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 1.25,
      duration: 0.8
    }} style={{
      display: 'flex',
      gap: 10,
      justifyContent: 'center',
      flexWrap: 'wrap',
      pointerEvents: 'auto'
    }}>
        <a href="#/spaces" style={{
        background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`,
        color: '#03060D',
        fontSize: 11,
        fontWeight: 800,
        padding: '12px 30px',
        borderRadius: 5,
        cursor: 'pointer',
        letterSpacing: '0.12em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        textDecoration: 'none',
        fontFamily: 'monospace',
        boxShadow: `0 0 24px ${C.cyan}35`
      }}>
          EXPLORE SPACES
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="#03060D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
        <a href="#/register" style={{
        backgroundColor: 'transparent',
        border: `1px solid rgba(91,192,235,0.25)`,
        color: C.text,
        fontSize: 11,
        fontWeight: 600,
        padding: '12px 30px',
        borderRadius: 5,
        cursor: 'pointer',
        letterSpacing: '0.1em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        textDecoration: 'none',
        transition: 'all 0.25s',
        fontFamily: 'monospace'
      }} onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = C.cyan;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${C.cyan}20`;
      }} onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,192,235,0.25)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}>
          REGISTER NOW
        </a>
      </motion.div>
    </motion.div>

    {/* Scroll indicator */}
    <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: visible ? 1 : 0
  }} transition={{
    delay: 2.8,
    duration: 1
  }} style={{
    position: 'absolute',
    bottom: 28,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 7,
    pointerEvents: 'none'
  }}>
      <span style={{
      color: C.dim,
      fontSize: 7.5,
      letterSpacing: '0.3em',
      textTransform: 'uppercase' as const,
      fontFamily: 'monospace'
    }}>SCROLL_TO_FLY</span>
      <motion.div animate={{
      y: [0, 9, 0]
    }} transition={{
      repeat: Infinity,
      duration: 1.9,
      ease: 'easeInOut'
    }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 4l5 6 5-6" stroke={C.dim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </motion.div>
    </motion.div>
  </div>;

// ─── SECTION INFO PANEL ────────────────────────────────────────────────────────
const SectionPanel: React.FC<{
  visible: boolean;
  space: SpaceItem;
  side: 'left' | 'right';
}> = ({
  visible,
  space,
  side
}) => <AnimatePresence>
    {visible && <motion.div key={space.id} initial={{
    opacity: 0,
    x: side === 'left' ? -70 : 70
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: side === 'left' ? -70 : 70
  }} transition={{
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1]
  }} style={{
    position: 'absolute',
    [side]: 32,
    bottom: 28,
    width: 'min(400px, calc(100vw - 48px))',
    // Don't set maxHeight + overflowY here -- it traps wheel scrolling
    // inside the panel and makes the page feel laggy when the cursor is
    // over it. Panel content is short enough to fit on a normal viewport.
    zIndex: 10,
    padding: '26px 26px',
    backgroundColor: 'rgba(0,6,15,0.68)',
    backdropFilter: 'blur(32px)',
    border: `1px solid ${space.color}22`,
    borderRadius: 8,
    boxShadow: `0 0 50px ${space.color}0A`,
    overscrollBehavior: 'none'
  }}>
        {/* Code + divider */}
        <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 18
    }}>
          <span style={{
        width: 24,
        height: 1,
        backgroundColor: space.color,
        display: 'inline-block'
      }} />
          <span style={{
        color: space.color,
        fontSize: 7.5,
        fontWeight: 700,
        letterSpacing: '0.28em',
        fontFamily: 'monospace',
        textTransform: 'uppercase' as const
      }}>{space.code}</span>
        </div>
        <p style={{
      color: space.color,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase' as const,
      marginBottom: 9,
      fontFamily: 'monospace'
    }}>
          {space.tagline}
        </p>
        <h2 style={{
      fontFamily: 'Comfortaa, Inter, sans-serif',
      fontSize: 'var(--section-title-size)',
      fontWeight: 700,
      color: C.text,
      lineHeight: 1.12,
      marginBottom: 14
    }}>
          {space.label === 'Spaces' ? 'VYN Space access map' : `VYN ${space.label}`}
        </h2>
        <p style={{
      color: C.muted,
      fontSize: 13,
      lineHeight: 1.82
    }}>{space.desc}</p>

        <p style={{
      color: 'rgba(232,244,255,0.78)',
      fontSize: 12,
      lineHeight: 1.72,
      marginTop: 14,
      fontFamily: 'Inter, sans-serif'
    }}>{space.detail}</p>

        <div className="mobile-content-blocks" style={{
      display: 'grid',
      gap: 12,
      marginTop: 20
    }}>
          {space.contentBlocks.map(block => <div key={block.title} style={{
        padding: '12px 12px 10px',
        borderRadius: 8,
        border: `1px solid ${space.color}18`,
        backgroundColor: 'rgba(10,15,28,0.58)'
      }}>
              <div style={{
          color: space.color,
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          marginBottom: 8,
          fontFamily: 'monospace'
        }}>{block.title}</div>
              <ul style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 6
        }}>
                {block.items.map(item => <li key={item} style={{
            display: 'grid',
            gridTemplateColumns: '10px 1fr',
            gap: 8,
            color: C.muted,
            fontSize: 11.2,
            lineHeight: 1.55,
            fontFamily: 'Inter, sans-serif'
          }}>
                    <span style={{
              width: 5,
              height: 5,
              marginTop: 7,
              borderRadius: '50%',
              backgroundColor: space.color,
              boxShadow: `0 0 8px ${space.color}`
            }} />
                    <span>{item}</span>
                  </li>)}
              </ul>
            </div>)}
        </div>

        {/* Mini stat bars */}
        <div style={{
      marginTop: 22,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
          {space.bullets.slice(0, 4).map((stat, i) => <div key={stat}>
              <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 3
        }}>
                <span style={{
            color: C.dim,
            fontSize: 7.5,
            fontFamily: 'monospace',
            letterSpacing: '0.16em'
          }}>{stat.toUpperCase()}</span>
                <span style={{
            color: space.color,
            fontSize: 7.5,
            fontFamily: 'monospace'
          }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div style={{
          height: 2,
          backgroundColor: C.dim,
          borderRadius: 1
        }}>
                <motion.div initial={{
            width: 0
          }} animate={{
            width: `${[96, 88, 80, 72][i] ?? 70}%`
          }} transition={{
            delay: 0.3 + i * 0.1,
            duration: 0.8
          }} style={{
            height: '100%',
            backgroundColor: space.color,
            borderRadius: 1,
            boxShadow: `0 0 6px ${space.color}`
          }} />
              </div>
            </div>)}
        </div>

        <a href={`#/${space.id}`} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      marginTop: 22,
      background: `linear-gradient(135deg, ${space.color}, ${space.color}BB)`,
      color: '#03060D',
      fontSize: 9.5,
      fontWeight: 800,
      padding: '10px 20px',
      borderRadius: 5,
      cursor: 'pointer',
      letterSpacing: '0.12em',
      textDecoration: 'none',
      fontFamily: 'monospace'
    }}>
          {space.id === 'register' ? 'START VERIFICATION' : 'LEARN MORE'}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M6 3l3 3-3 3" stroke="#03060D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </motion.div>}
  </AnimatePresence>;

const DetailDeck: React.FC<{
  visible: boolean;
  space: SpaceItem;
  side: 'left' | 'right';
}> = ({
  visible,
  space,
  side
}) => <AnimatePresence>
    {visible && <motion.aside className={`detail-deck detail-deck-${side}`} initial={{
    opacity: 0,
    y: 28
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: 28
  }} transition={{
    duration: 0.32,
    ease: [0.16, 1, 0.3, 1]
  }} style={{
    borderColor: `${space.color}24`,
    boxShadow: `0 26px 90px rgba(0,0,0,0.28), 0 0 70px ${space.color}10`
  }}>
        <div className="detail-deck-heading">
          <span style={{
        backgroundColor: space.color,
        boxShadow: `0 0 16px ${space.color}`
      }} />
          <strong style={{
        color: space.color
      }}>{space.label.toUpperCase()} DETAILS</strong>
        </div>
        <div className="detail-deck-grid">
          {space.contentBlocks.map(block => <article className="detail-card" key={block.title} style={{
        borderColor: `${space.color}1F`
      }}>
              <h3 style={{
          color: space.color
        }}>{block.title}</h3>
              <ul>
                {block.items.map(item => <li key={item}>
                    <span style={{
              backgroundColor: space.color,
              boxShadow: `0 0 10px ${space.color}`
            }} />
                    <p>{item}</p>
                  </li>)}
              </ul>
            </article>)}
        </div>
      </motion.aside>}
  </AnimatePresence>;

// ─── REGISTER OVERLAY ──────────────────────────────────────────────────────────
const RegisterOverlay: React.FC<{
  visible: boolean;
}> = ({
  visible
}) => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActive(a => (a + 1) % VERIFY_STEPS.length), 2800);
    return () => clearInterval(t);
  }, [visible]);
  return <AnimatePresence>
      {visible && <motion.div initial={{
      opacity: 0,
      y: 60
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: 60
    }} transition={{
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1]
    }} style={{
      position: 'absolute',
      bottom: 28,
      left: 0,
      right: 0,
      margin: '0 auto',
      width: '90%',
      maxWidth: 920,
      maxHeight: 'calc(100vh - 116px)',
      overflowY: 'auto',
      zIndex: 10
    }}>
          <div style={{
        textAlign: 'center',
        marginBottom: 28
      }}>
            <p style={{
          color: C.violet,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: '0.3em',
          textTransform: 'uppercase' as const,
          marginBottom: 12,
          fontFamily: 'monospace'
        }}>
              ACCESS MODEL
            </p>
            <h2 style={{
          fontFamily: 'Comfortaa, Inter, sans-serif',
          fontSize: 'var(--register-title-size)',
          fontWeight: 700,
          color: C.text,
          lineHeight: 1.1
        }}>
              Register once. Verify once. Unlock everything.
            </h2>
          </div>
          <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: 10
      }}>
            {VERIFY_STEPS.map((step, i) => <div key={step.num} onClick={() => setActive(i)} style={{
          backgroundColor: active === i ? `${step.color}0E` : 'rgba(0,6,15,0.74)',
          backdropFilter: 'blur(22px)',
          border: `1px solid ${active === i ? step.color + '40' : C.border}`,
          borderRadius: 8,
          padding: '20px 16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
                {active === i && <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1.5,
            backgroundColor: step.color,
            boxShadow: `0 0 10px ${step.color}`
          }} />}
                <span style={{
            color: active === i ? step.color : C.dim,
            fontSize: 28,
            fontWeight: 800,
            fontFamily: 'monospace',
            display: 'block',
            marginBottom: 8
          }}>
                  {step.num}
                </span>
                <h3 style={{
            color: C.text,
            fontSize: 13.5,
            fontWeight: 700,
            fontFamily: 'monospace',
            marginBottom: 7
          }}>{step.label}</h3>
                <p style={{
            color: C.muted,
            fontSize: 12,
            lineHeight: 1.64
          }}>{step.desc}</p>
              </div>)}
          </div>
        </motion.div>}
    </AnimatePresence>;
};

// ─── FAQ OVERLAY ───────────────────────────────────────────────────────────────
const FaqOverlay: React.FC<{
  visible: boolean;
}> = ({
  visible
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return <AnimatePresence>
      {visible && <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} exit={{
      opacity: 0,
      scale: 0.95
    }} transition={{
      duration: 0.7
    }} style={{
      position: 'absolute',
      top: '12vh',
      left: 0,
      right: 0,
      margin: '0 auto',
      width: '88%',
      maxWidth: 700,
      maxHeight: '76vh',
      overflowY: 'auto',
      zIndex: 10,
      backgroundColor: 'rgba(0,6,15,0.84)',
      backdropFilter: 'blur(36px)',
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '38px 34px'
    }}>
          <p style={{
        color: C.cyan,
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: '0.28em',
        textTransform: 'uppercase' as const,
        marginBottom: 12,
        fontFamily: 'monospace'
      }}>
            FAQ.TXT
          </p>
          <h2 style={{
        fontFamily: 'Comfortaa, Inter, sans-serif',
        fontSize: 'var(--faq-title-size)',
        fontWeight: 700,
        color: C.text,
        lineHeight: 1.14,
        marginBottom: 26
      }}>
            Plain answers.
          </h2>
          {FAQ.map((item, i) => <div key={item.q} style={{
        borderBottom: `1px solid ${C.border}`,
        overflow: 'hidden'
      }}>
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '16px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 14
        }}>
                <span style={{
            color: C.text,
            fontSize: 13.5,
            fontWeight: 600,
            lineHeight: 1.4,
            fontFamily: 'Inter, sans-serif'
          }}>{item.q}</span>
                <motion.div animate={{
            rotate: openIdx === i ? 45 : 0
          }} transition={{
            duration: 0.2
          }} style={{
            flexShrink: 0
          }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <line x1="7" y1="1" x2="7" y2="13" stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="1" y1="7" x2="13" y2="7" stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              </button>
              <AnimatePresence>
                {openIdx === i && <motion.div initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: 'auto',
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} transition={{
            duration: 0.22
          }} style={{
            overflow: 'hidden'
          }}>
                    <p style={{
              color: C.muted,
              fontSize: 13,
              lineHeight: 1.82,
              paddingBottom: 16,
              margin: 0,
              fontFamily: 'Inter, sans-serif'
            }}>{item.a}</p>
                  </motion.div>}
              </AnimatePresence>
            </div>)}
        </motion.div>}
    </AnimatePresence>;
};

// ─── CTA OVERLAY ───────────────────────────────────────────────────────────────
const CtaOverlay: React.FC<{
  visible: boolean;
}> = ({
  visible
}) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return <AnimatePresence>
      {visible && <motion.div initial={{
      opacity: 0,
      y: 50
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: 50
    }} transition={{
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1]
    }} style={{
      position: 'absolute',
      top: '18vh',
      left: 0,
      right: 0,
      margin: '0 auto',
      width: '90%',
      maxWidth: 700,
      zIndex: 10,
      textAlign: 'center',
      pointerEvents: 'auto'
    }}>
          <motion.div animate={{
        opacity: [1, 0.3, 1]
      }} transition={{
        repeat: Infinity,
        duration: 2.2
      }} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 34,
        padding: '5px 14px',
        borderRadius: 40,
        border: `1px solid ${C.border}`,
        backgroundColor: 'rgba(91,192,235,0.04)',
        fontFamily: 'monospace'
      }}>
            <span style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: C.cyan,
          boxShadow: `0 0 8px ${C.cyan}`,
          display: 'inline-block'
        }} />
            <span style={{
          color: C.cyan,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: '0.26em',
          textTransform: 'uppercase' as const
        }}>
              REGISTER TO UNLOCK APT · JOBS · FINANCE
            </span>
          </motion.div>

          <h2 style={{
        fontFamily: 'Comfortaa, Inter, sans-serif',
        fontSize: 'var(--cta-title-size)',
        fontWeight: 700,
        color: C.text,
        lineHeight: 1.02,
        letterSpacing: 0,
        marginBottom: 18
      }}>
            Ready to enter{' '}
            <span style={{
          background: `linear-gradient(90deg, ${C.cyan}, ${C.green})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
              Germany?
            </span>
          </h2>

          <p style={{
        color: C.muted,
        fontSize: 15,
        lineHeight: 1.78,
        marginBottom: 38,
        fontFamily: 'Inter, sans-serif'
      }}>
            Create one verified profile, complete document and identity checks, then enter the protected service spaces.
          </p>

          <form onSubmit={e => {
        e.preventDefault();
        if (email.trim()) setSent(true);
      }} style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 44
      }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={{
          flex: '1 1 200px',
          backgroundColor: 'rgba(0,6,15,0.85)',
          border: `1px solid rgba(91,192,235,0.24)`,
          borderRadius: 5,
          padding: '12px 16px',
          color: C.text,
          fontSize: 13,
          outline: 'none',
          fontFamily: 'monospace'
        }} />
            <button type="submit" style={{
          background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`,
          border: 'none',
          color: '#03060D',
          fontSize: 10.5,
          fontWeight: 800,
          padding: '12px 24px',
          borderRadius: 5,
          cursor: 'pointer',
          letterSpacing: '0.14em',
          fontFamily: 'monospace',
          boxShadow: sent ? 'none' : `0 0 20px ${C.cyan}30`
        }}>
              {sent ? '✓ RECEIVED' : 'REGISTER INTEREST'}
            </button>
          </form>

          <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 44,
        flexWrap: 'wrap'
      }}>
            {CTA_STATS.map(s => <div key={s.label} style={{
          textAlign: 'center'
        }}>
                <div style={{
            color: s.color,
            fontFamily: 'monospace',
            fontSize: 'var(--stat-size)',
            fontWeight: 700,
            textShadow: `0 0 16px ${s.color}55`
          }}>{s.val}</div>
                <div style={{
            color: C.dim,
            fontSize: 7.5,
            letterSpacing: '0.18em',
            marginTop: 4,
            textTransform: 'uppercase' as const,
            fontFamily: 'monospace'
          }}>{s.label}</div>
              </div>)}
          </div>
        </motion.div>}
    </AnimatePresence>;
};

const PageView: React.FC<{
  page: PageData;
}> = ({
  page
}) => <main className="page-view" style={{
  '--page-color': page.color
} as React.CSSProperties}>
    <section className="page-hero">
      <a href="#hero" className="page-back">Back home</a>
      <div className="page-kicker">
        <span style={{
        backgroundColor: page.color,
        boxShadow: `0 0 16px ${page.color}`
      }} />
        {page.eyebrow}
      </div>
      <h1>{page.title}</h1>
      <p>{page.intro}</p>
      {page.cta && <a className="page-cta" href={page.cta.href}>{page.cta.label}</a>}
    </section>

    {page.stats && <section className="page-stats" aria-label={`${page.title} facts`}>
        {page.stats.map(stat => <article key={`${stat.value}-${stat.label}`}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>)}
      </section>}

    <section className="page-grid">
      {page.blocks.map(block => <article key={block.title} className="page-card">
          <h2>{block.title}</h2>
          {block.body && <p>{block.body}</p>}
          {block.items && <ul>
              {block.items.map(item => <li key={item}>
                  <span />
                  <p>{item}</p>
                </li>)}
            </ul>}
        </article>)}
    </section>

    {page.key === 'apt' && <section className="listing-section" aria-label="Apartment listings">
        <div className="listing-heading">
          <span>Listing previews</span>
          <h2>Apartment ads</h2>
          <p>Housing ads showing how VYN APT presents verified inventory, eligibility signals, and viewing requests once landlord data is connected.</p>
        </div>
        <div className="listing-grid listing-grid-apt">
          {APT_LISTINGS.map(listing => <article className="listing-ad listing-ad-apt" key={listing.title}>
              <div className="listing-ad-media" style={{
            backgroundImage: `linear-gradient(180deg, rgba(3,6,13,0.05), rgba(3,6,13,0.82)), url(${listing.image})`,
            backgroundPosition: 'center'
          }}>
                <span className="listing-pill">For rent</span>
                <span className="listing-status">{listing.status}</span>
              </div>
              <div className="listing-ad-body">
                <div className="listing-ad-topline">
                  <span>{listing.city}</span>
                  <strong>{listing.status}</strong>
                </div>
                <h3>{listing.title}</h3>
                <p>{listing.availability}</p>
                <div className="listing-price">
                  <strong>{listing.price}</strong>
                  <span>{listing.priceNote}</span>
                </div>
                <div className="listing-facts">
                  <span><strong>{listing.size}</strong><small>Size</small></span>
                  <span><strong>{listing.rooms}</strong><small>Rooms</small></span>
                  <span><strong>{listing.furnished}</strong><small>Furnished</small></span>
                </div>
                <div className="listing-tags">
                  {[listing.layout, `Energy: ${listing.energy}`, `WiFi: ${listing.wifi}`, ...listing.extras].map(tag => <span key={tag}>{tag}</span>)}
                </div>
                <div className="listing-requirements">
                  <h4>Verified applicant criteria</h4>
                  <ul>{listing.criteria.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
                <a href="#/register">Request viewing</a>
              </div>
            </article>)}
        </div>
      </section>}

    {page.key === 'jobs' && <section className="listing-section" aria-label="Job listings">
        <div className="listing-heading">
          <span>Listing previews</span>
          <h2>Job and training ads</h2>
          <p>Job ads showing how VYN Jobs presents roles, training routes, profile signals, and placement actions for verified users.</p>
        </div>
        <div className="listing-grid">
          {JOB_LISTINGS.map(listing => <article className="listing-ad listing-ad-job" key={listing.title}>
              <div className="listing-ad-media" style={{
            backgroundImage: `linear-gradient(180deg, rgba(3,6,13,0.05), rgba(3,6,13,0.84)), url(${listing.image})`,
            backgroundPosition: 'center'
          }}>
                <span className="listing-pill">Now hiring</span>
                <span className="listing-status">{listing.status}</span>
              </div>
              <div className="listing-ad-body">
                <div className="listing-ad-topline">
                  <span>{listing.city}</span>
                  <strong>{listing.status}</strong>
                </div>
                <h3>{listing.title}</h3>
                <p>{listing.company}</p>
                <div className="listing-price">
                  <strong>{listing.salary}</strong>
                  <span>{listing.type}</span>
                </div>
                <div className="listing-facts listing-facts-job">
                  <span><strong>{listing.language}</strong><small>Language</small></span>
                  <span><strong>{listing.type}</strong><small>Contract</small></span>
                </div>
                <div className="listing-tags">
                  {[listing.training, listing.fit, ...listing.strengths].map(tag => <span key={tag}>{tag}</span>)}
                </div>
                <div className="listing-requirements">
                  <h4>Profile signals</h4>
                  <ul>{listing.strengths.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
                <a href="#/register">Apply with profile</a>
              </div>
            </article>)}
        </div>
      </section>}

    {page.key === 'contact' && <section className="page-form" aria-label="Contact form preview">
        <h2>Contact Us</h2>
        <div className="page-form-grid">
          <input placeholder="First name" aria-label="First name" />
          <input placeholder="Last name" aria-label="Last name" />
          <input placeholder="Email" aria-label="Email" />
          <input placeholder="Subject" aria-label="Subject" />
          <textarea placeholder="Message" aria-label="Message" />
        </div>
        <a href="mailto:info@vyn-space.com" className="page-cta">Send message</a>
      </section>}
  </main>;

// ─── FOOTER ────────────────────────────────────────────────────────────────────
const FOOTER_COLS = [{
  title: 'Platform',
  links: ['Spaces', 'APT', 'Jobs', 'Finance', 'Register']
}, {
  title: 'Company',
  links: ['About', 'Team', 'Blog', 'Appointments', 'Contact']
}, {
  title: 'Trust',
  links: ['Verification', 'FAQ']
}];
const footerTarget = (label: string) => {
  const map: Record<string, string> = {
    Spaces: 'spaces',
    APT: 'apt',
    Jobs: 'jobs',
    Finance: 'finance',
    Register: 'register',
    About: 'about',
    Team: 'about',
    Blog: 'blog',
    Appointments: 'contact',
    Contact: 'contact',
    Verification: 'register',
    FAQ: 'faq'
  };
  return map[label] ?? 'hero';
};
const Footer: React.FC = () => <footer style={{
  backgroundColor: '#03060D',
  borderTop: `1px solid ${C.border}`,
  padding: '56px 0 28px',
  position: 'relative',
  zIndex: 10
}}>
    <div style={{
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 28px'
  }}>
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 44,
      marginBottom: 44
    }}>
        <div>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          marginBottom: 12
        }}>
            <VynMark size={26} />
            <span style={{
            color: C.text,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '0.07em'
          }}>VYN<span style={{
              color: C.cyan
            }}>·</span>SPACE</span>
          </div>
          <p style={{
          color: C.muted,
          fontSize: 12,
          lineHeight: 1.78,
          maxWidth: 185,
          margin: '0 0 14px',
          fontFamily: 'Inter, sans-serif'
        }}>
            The trust layer for building your life in Germany. One verified identity. Every service.
          </p>
          {/* Footer terminal line */}
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
            <span style={{
            color: C.dim,
            fontSize: 10,
            fontFamily: 'monospace'
          }}>{'>'}</span>
            <motion.span animate={{
            opacity: [1, 0, 1]
          }} transition={{
            repeat: Infinity,
            duration: 1.2
          }} style={{
            width: 6,
            height: 12,
            backgroundColor: C.cyan,
            display: 'inline-block'
          }} />
          </div>
        </div>
        {FOOTER_COLS.map(col => <div key={col.title}>
            <h4 style={{
          color: C.text,
          fontSize: 7.5,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase' as const,
          marginBottom: 14,
          fontFamily: 'monospace'
        }}>
              {col.title}
            </h4>
            <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
              {col.links.map(l => <li key={l}>
                  <a href={`#/${footerTarget(l)}`} style={{
              color: C.muted,
              fontSize: 12.5,
              textDecoration: 'none',
              transition: 'color 0.2s',
              fontFamily: 'Inter, sans-serif'
            }} onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = C.text;
            }} onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = C.muted;
            }}>
                    {l}
                  </a>
                </li>)}
            </ul>
          </div>)}
      </div>
      <div style={{
      borderTop: `1px solid ${C.border}`,
      paddingTop: 18,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8
    }}>
        <span style={{
        color: C.dim,
        fontSize: 11,
        fontFamily: 'monospace'
      }}>© 2026 VYN Space · Built for people building new lives in Germany.</span>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }}>
          <motion.div animate={{
          opacity: [1, 0.3, 1],
          boxShadow: [`0 0 4px ${C.green}`, `0 0 10px ${C.green}`, `0 0 4px ${C.green}`]
        }} transition={{
          repeat: Infinity,
          duration: 2
        }} style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: C.green
        }} />
          <span style={{
          color: C.green,
          fontSize: 10.5,
          fontWeight: 600,
          fontFamily: 'monospace'
        }}>SYS_ONLINE</span>
        </div>
      </div>
    </div>
  </footer>;

// ─── SECTION DEFINITIONS ───────────────────────────────────────────────────────
type SectionDef = {
  id: string;
  scrollStart: number;
  scrollEnd: number;
  type: 'hero' | 'space' | 'register' | 'faq' | 'cta';
  spaceIndex?: number;
  panelSide?: 'left' | 'right';
};
// Each card's band runs until the camera reaches the *midpoint* with the next
// card -- that's exactly when the next card becomes the closest one in front,
// and the popup naturally hands off. With cards uniformly 32 apart, midpoints
// land every 0.082 of prog (32/390). Hero gets a short opening, then SPACES
// gets a wide ~2.5x band (hero-end -> spaces/apt midpoint), so it has plenty
// of time to land before the first 3D card transitions.
const SECTIONS: SectionDef[] = [{
  id: 'hero',
  scrollStart: 0,
  scrollEnd: 0.075,
  type: 'hero'
}, {
  id: 'spaces',
  scrollStart: 0.075,
  scrollEnd: 0.283,
  type: 'space',
  spaceIndex: 0,
  panelSide: 'left'
}, {
  id: 'apt',
  scrollStart: 0.283,
  scrollEnd: 0.365,
  type: 'space',
  spaceIndex: 1,
  panelSide: 'right'
}, {
  id: 'jobs',
  scrollStart: 0.365,
  scrollEnd: 0.447,
  type: 'space',
  spaceIndex: 2,
  panelSide: 'left'
}, {
  id: 'finance',
  scrollStart: 0.447,
  scrollEnd: 0.529,
  type: 'space',
  spaceIndex: 3,
  panelSide: 'right'
}, {
  id: 'register',
  scrollStart: 0.529,
  scrollEnd: 0.611,
  type: 'register'
}, {
  id: 'about',
  scrollStart: 0.611,
  scrollEnd: 0.693,
  type: 'space',
  spaceIndex: 5,
  panelSide: 'left'
}, {
  id: 'blog',
  scrollStart: 0.693,
  scrollEnd: 0.775,
  type: 'space',
  spaceIndex: 6,
  panelSide: 'right'
}, {
  id: 'contact',
  scrollStart: 0.775,
  scrollEnd: 0.857,
  type: 'space',
  spaceIndex: 7,
  panelSide: 'left'
}, {
  id: 'faq',
  scrollStart: 0.865,
  scrollEnd: 0.92,
  type: 'faq'
}, {
  id: 'cta',
  scrollStart: 0.93,
  scrollEnd: 1.0,
  type: 'cta'
}];

// ─── ROOT COMPONENT ────────────────────────────────────────────────────────────
export const VynSpaceLanding: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProg, setScrollProg] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [activePageKey, setActivePageKey] = useState<string | null>(() => getRouteKey());
  useEffect(() => {
    // Inject fonts
    if (!document.getElementById('vyn-fonts')) {
      const link = document.createElement('link');
      link.id = 'vyn-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    document.body.style.backgroundColor = C.bg;
    document.body.style.overflowX = 'hidden';
    const onScroll = () => {
      const sy = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      setScrollY(sy);
      setScrollProg(total > 0 ? Math.min(1, sy / total) : 0);
    };
    const onMouse = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * 2);
      setMouseY(-(e.clientY / window.innerHeight - 0.5) * 2);
    };
    const onHash = () => {
      const routeKey = getRouteKey();
      setActivePageKey(routeKey);
      if (routeKey) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }
      const id = window.location.hash.replace('#', '') || 'hero';
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({
        block: 'start'
      });
    };
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('mousemove', onMouse, {
      passive: true
    });
    window.addEventListener('hashchange', onHash);
    window.setTimeout(() => {
      onScroll();
      onHash();
    }, 80);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('hashchange', onHash);
      document.body.style.backgroundColor = '';
      document.body.style.overflowX = '';
    };
  }, []);
  const activePage = activePageKey ? PAGE_DATA[activePageKey] : null;
  const sceneProgress = activePage?.progress ?? scrollProg;
  const activeSection = useMemo(() => !activePage && (SECTIONS.find(s => sceneProgress >= s.scrollStart && sceneProgress <= s.scrollEnd) ?? null), [activePage, sceneProgress]);
  const activeSpaceSection = useMemo(() => !activePage && (SECTIONS.find(s => s.type === 'space' && sceneProgress >= s.scrollStart && sceneProgress <= s.scrollEnd) ?? null), [activePage, sceneProgress]);
  return <div className="vyn-shell" style={{
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: 'Inter, sans-serif'
  }}>
      <NavBar scrolled={scrollY > 55} />

      {/* ── Sticky 3D viewport ── */}
      <div style={{
      position: activePage ? 'fixed' : 'sticky',
      top: 0,
      width: '100%',
      height: '100vh',
      zIndex: 1,
      pointerEvents: activePage ? 'none' : 'auto'
    }}>
        <Canvas camera={{
        position: [0, 3, 24],
        fov: 58
      }} style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%'
      }} gl={{
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance'
      }} dpr={[1, 1.6]}>
          <color attach="background" args={[C.bg]} />
          <Suspense fallback={null}>
            <VynScene scrollProgress={sceneProgress} mouseX={mouseX} mouseY={mouseY} />
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.42} luminanceThreshold={0.18} luminanceSmoothing={0.72} mipmapBlur />
              <Vignette offset={0.38} darkness={0.64} />
            </EffectComposer>
          </Suspense>
        </Canvas>

        {/* HTML overlays */}
        {!activePage && <HeroOverlay visible={activeSection?.type === 'hero'} />}

        {activeSpaceSection && activeSpaceSection.spaceIndex !== undefined && <>
          <SectionPanel key={`${activeSpaceSection.id}-panel`} visible space={SPACES[activeSpaceSection.spaceIndex]} side={activeSpaceSection.panelSide ?? (activeSpaceSection.spaceIndex % 2 === 0 ? 'left' : 'right')} />
          <DetailDeck key={`${activeSpaceSection.id}-details`} visible space={SPACES[activeSpaceSection.spaceIndex]} side={(activeSpaceSection.panelSide ?? (activeSpaceSection.spaceIndex % 2 === 0 ? 'left' : 'right')) === 'left' ? 'right' : 'left'} />
        </>}

        {!activePage && <RegisterOverlay visible={activeSection?.type === 'register'} />}
        {!activePage && <FaqOverlay visible={activeSection?.type === 'faq'} />}
        {!activePage && <CtaOverlay visible={activeSection?.type === 'cta'} />}
        {!activePage && <ScrollIndicator progress={sceneProgress} />}

        {/* HUD corner brackets */}
        {([{
        top: 78,
        left: 26,
        borderTop: `1px solid ${C.cyan}28`,
        borderLeft: `1px solid ${C.cyan}28`
      }, {
        top: 78,
        right: 26,
        borderTop: `1px solid ${C.cyan}28`,
        borderRight: `1px solid ${C.cyan}28`
      }, {
        bottom: 26,
        left: 26,
        borderBottom: `1px solid ${C.cyan}28`,
        borderLeft: `1px solid ${C.cyan}28`
      }, {
        bottom: 26,
        right: 26,
        borderBottom: `1px solid ${C.cyan}28`,
        borderRight: `1px solid ${C.cyan}28`
      }] as React.CSSProperties[]).map((style, i) => <div key={i} style={{
        position: 'absolute',
        width: 20,
        height: 20,
        pointerEvents: 'none',
        zIndex: 5,
        ...style
      }} />)}

        {/* HUD telemetry readout */}
        <div className="hud-readout" style={{
        position: 'absolute',
        bottom: 28,
        left: 28,
        pointerEvents: 'none',
        zIndex: 5
      }}>
          <div style={{
          color: C.dim,
          fontSize: 7.5,
          fontFamily: 'monospace',
          lineHeight: 2,
          letterSpacing: '0.12em'
        }}>
            <div>DEPTH: {Math.round(sceneProgress * 600).toString().padStart(4, '0')}m</div>
            <div>PROGRESS: {Math.round(sceneProgress * 100).toString().padStart(3, '0')}%</div>
            <div>NODE: {activePage?.key?.toUpperCase() ?? activeSection?.id?.toUpperCase() ?? 'STANDBY'}</div>
          </div>
        </div>

        {/* Scan line */}
        <motion.div animate={{
        y: ['-100%', '100vh']
      }} transition={{
        repeat: Infinity,
        duration: 7.2,
        ease: 'linear',
        repeatDelay: 9
      }} style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        pointerEvents: 'none',
        zIndex: 4,
        background: `linear-gradient(90deg, transparent, ${C.cyan}18, ${C.cyan}34, ${C.cyan}18, transparent)`
      }} />

        {/* Vignette */}
        <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 66%, rgba(0,6,15,0.58) 100%)'
      }} />

        {/* Bottom fade */}
        <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 140,
        pointerEvents: 'none',
        background: `linear-gradient(to bottom, transparent, ${C.bg})`,
        zIndex: 3
      }} />
      </div>

      {activePage && <PageView page={activePage} />}

      {/* Scroll spacer and hash anchors for the immersive homepage */}
      {!activePage && <div style={{
      height: '780vh',
      marginTop: '-100vh',
      position: 'relative',
      zIndex: 0
    }}>
        {SECTIONS.map(section => <div key={section.id} id={section.id} aria-hidden="true" style={{
        position: 'absolute',
        top: `calc(${section.scrollStart * 780}vh + 1px)`,
        width: 1,
        height: 1,
        pointerEvents: 'none'
      }} />)}
      </div>}

      <Footer />
    </div>;
};
