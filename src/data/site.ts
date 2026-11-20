import generated from "./generated.json";

/* ------------------------------------------------------------------ *
 *  Everything you'd want to edit lives in this file.                  *
 * ------------------------------------------------------------------ */

export const site = {
  name: "Bano",
  email: "shahzinabano@gmail.com",
  role: "Designer · Developer · Marketer",
  location: "Gujrat, Pakistan — working worldwide",
  available: "Available for '27",
  socials: [
    { label: "Behance", href: "https://www.behance.net/shahzinabano" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shahzina1218" },
    { label: "Figma", href: "https://www.figma.com/@designsbybano" },
    { label: "Drive Portfolio", href: "https://drive.google.com/drive/folders/1ooMhxyg9Mx7Aoo9d7Rm3iUdmFHwFk2SJ?usp=sharing" },
  ],
};

type Gen = {
  caseStudies: Record<string, { pages: { w: number; h: number; slice?: boolean }[]; thumb: { w: number; h: number } | null }>;
  work: { src: string; w: number; h: number }[];
  hero: { src: string; w: number; h: number } | null;
  about?: { src: string; w: number; h: number } | null;
};
const gen = generated as Gen;

export const heroImage = gen.hero ?? { src: "/hero/bano.webp", w: 1200, h: 1400 };
export const aboutImage = gen.about ?? heroImage;

/* ---------------- Recent work (the 3D sphere) ---------------- */
const workMeta: Record<string, { title: string; tag: string }> = {
  "1": { title: "Belleza — Toque Joven", tag: "Social Media Campaign" },
  "2": { title: "Elavea Skincare", tag: "Email Design" },
  "3": { title: "Mony — Pay Like a Local", tag: "Fintech Emailers" },
  "4": { title: "Runway Influence", tag: "Email Design" },
  "5": { title: "Design Team X", tag: "Transactional Email" },
};

export type WorkItem = { src: string; w: number; h: number; title: string; tag: string };
export const work: WorkItem[] = gen.work.map((w) => {
  const key = w.src.split("/").pop()!.replace(/\.\w+$/, "");
  return { ...w, ...(workMeta[key] ?? { title: key, tag: "Design" }) };
});

/* ---------------- Case studies ---------------- */
export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  deliverable: string;
  year: string;
  summary: string;
  accent: string;
  thumb: string | null;
  pages: { src: string; w: number; h: number; slice?: boolean }[];
};

const caseMeta: Omit<CaseStudy, "thumb" | "pages">[] = [
  {
    slug: "oralease",
    title: "OralEase",
    client: "OralEase",
    industry: "Dental SaaS",
    deliverable: "Website Design",
    year: "2026",
    summary:
      "A landing experience for a dental practice platform — turning appointments, patient records and everyday admin into one calm, trustworthy story.",
    accent: "#c8102e",
  },
  {
    slug: "tech-canvas",
    title: "Tech Canvas",
    client: "Tech Canvas",
    industry: "Technology",
    deliverable: "Case Study",
    year: "2026",
    summary: "The full case study is being prepared and lands here very soon.",
    accent: "#5b5bf0",
  },
  {
    slug: "marjan",
    title: "Marjan",
    client: "Marjan Technical Services",
    industry: "HVAC & MEP",
    deliverable: "Company Profile",
    year: "2026",
    summary:
      "A company profile for a Dubai-based technical services firm — HVAC, electrical and plumbing works laid out with clarity, warmth and a confident brand rhythm.",
    accent: "#a8433f",
  },
  {
    slug: "nomora",
    title: "Nomora",
    client: "Nomora Homes",
    industry: "Real Estate",
    deliverable: "Company Profile",
    year: "2026",
    summary:
      "An investor-facing profile for a real estate brand: bold typography, fresh greens and data that makes the case for buying in.",
    accent: "#4f9a1e",
  },
  {
    slug: "vertix",
    title: "Vertix",
    client: "Vertix",
    industry: "SaaS Startup",
    deliverable: "Company Profile",
    year: "2026",
    summary:
      "A pitch-ready company profile for a customer-support platform — problem, product, traction and business model in an electric blue system.",
    accent: "#1f3bff",
  },
];

// a folder uploaded without an entry above still shows up, with placeholder details
const titleCase = (slug: string) => slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const extraMeta: Omit<CaseStudy, "thumb" | "pages">[] = Object.keys(gen.caseStudies)
  .filter((slug) => !caseMeta.some((m) => m.slug === slug) && gen.caseStudies[slug].pages.length > 0)
  .map((slug) => ({
    slug,
    title: titleCase(slug),
    client: titleCase(slug),
    industry: "—",
    deliverable: "Case Study",
    year: String(new Date().getFullYear()),
    summary: "",
    accent: "#3a3a38",
  }));

export const caseStudies: CaseStudy[] = [...caseMeta, ...extraMeta].map((m) => {
  const g = gen.caseStudies[m.slug];
  return {
    ...m,
    thumb: g?.thumb ? `/case-studies/${m.slug}/thumb.webp` : null,
    pages: (g?.pages ?? []).map((p, i) => ({
      ...p,
      src: `/case-studies/${m.slug}/page-${String(i + 1).padStart(2, "0")}.webp`,
    })),
  };
});

/* ---------------- About ---------------- */
export const about = {
  statement:
    "I'm Bano — a creative designer, web developer and digital marketing specialist. For five years I've helped international brands look sharp, load fast and sell more: I design it, build it, then put it in front of the right people.",
  stats: [
    { value: "5", suffix: "yrs", label: "Professional experience" },
    { value: "5", suffix: "", label: "Countries of clients — UK, USA, AU, OM, PK" },
    { value: "2×", suffix: "", label: "Promoted to lead within months" },
  ],
  education: [
    { title: "BA English Literature", place: "University of Gujrat", when: "2019 — 2023", note: "CGPA 3.36" },
    { title: "Intermediate, Pre-Engineering", place: "BISE Gujranwala", when: "2017 — 2019", note: "Grade A" },
  ],
  languages: [
    { name: "English", level: "Fluent", value: 0.9 },
    { name: "Urdu", level: "Native", value: 1 },
  ],
};

/* ---------------- The three disciplines ---------------- */
export const disciplines = [
  {
    key: "design",
    no: "01",
    title: "Design",
    line: "Brands, interfaces and visuals people remember.",
    skills: ["UI/UX & Web Design", "Branding", "Graphic Design", "Packaging Design", "Motion Graphics", "Animation", "Prototyping", "Wireframing"],
  },
  {
    key: "develop",
    no: "02",
    title: "Develop",
    line: "Responsive sites that feel as good as they look.",
    skills: ["React.js", "Next.js", "TypeScript", "WordPress", "Elementor", "HTML Email", "Custom Web Dev"],
  },
  {
    key: "market",
    no: "03",
    title: "Market",
    line: "Campaigns that turn attention into results.",
    skills: ["Meta Ads", "Google Ads", "Social Media Management", "Email Campaigns", "Content Calendars", "Digital Media"],
  },
] as const;

export const tools = [
  "Figma", "Adobe CC", "Sketch", "Jitter", "Spline", "Canva", "Mailchimp", "Unlayer",
  "WordPress", "Elementor", "VS Code", "PyCharm", "Pixel", "Constant Contact",
];

/* ---------------- Experience ---------------- */
export const experience = [
  {
    role: "Team Manager",
    company: "Design Team X",
    where: "UK · Remote",
    when: "Jul 2024 — Present",
    tags: ["Leadership", "Branding", "Web", "UI/UX"],
    badge: "Promoted in 6 months",
    text: "Joined as a Graphic Designer and was promoted to Team Lead Manager within six months. I run multiple international clients at once, lead a team of junior designers, work hand in hand with developers, and own client communication and monthly content calendars — while staying hands-on in branding, web, UI/UX, print and social.",
  },
  {
    role: "Email Campaign Specialist",
    company: "Runway Influence",
    where: "California, USA · Remote",
    when: "Jan 2025 — Jul 2025",
    tags: ["Email", "HTML", "Mailchimp"],
    text: "Designed and developed newsletters and campaigns for Runway Influence and Runway Waiters — responsive HTML email development and campaign setup in Constant Contact and Mailchimp, keeping two brands consistent and engaging.",
  },
  {
    role: "Web Designer & Video Editor",
    company: "BTS Services",
    where: "Gujrat, Pakistan",
    when: "Aug 2024 — Sep 2025",
    tags: ["Web", "Meta Ads", "Video"],
    text: "Designed user-friendly websites and social visuals for Meta Ads campaigns, and edited short-form video ads built around marketing objectives — strengthening brand presence and engagement.",
  },
  {
    role: "Lead Designer",
    company: "Conpix",
    where: "Australia · Remote",
    when: "May 2024 — Nov 2024",
    tags: ["Leadership", "Branding", "Social"],
    badge: "Junior → Lead",
    text: "Started as a Junior Graphic Designer and was promoted to Lead Designer. Managed multiple clients, led junior designers, collaborated with developers and owned monthly content calendars across branding, web, UI/UX, print and social.",
  },
  {
    role: "Website Designer & Developer",
    company: "Milky Way Technologies",
    where: "Oman · Freelance",
    when: "Feb 2024 — Jun 2024",
    tags: ["UX Research", "WordPress", "Elementor"],
    text: "Led the website redesign — user research, wireframes, prototypes and mockups — then built it in WordPress with Elementor, responsive across every device.",
  },
  {
    role: "Designer & Front-End Developer",
    company: "GulzarSoft",
    where: "Gujrat, Pakistan",
    when: "Nov 2022 — Jul 2023",
    tags: ["UI/UX", "Front-End"],
    text: "Created intuitive digital experiences through user research, wireframing and prototyping with cross-functional teams — blending aesthetics with function.",
  },
  {
    role: "UI/UX Designer",
    company: "National Incubation Center",
    where: "Gujrat, Pakistan",
    when: "Sep 2021 — Mar 2022",
    tags: ["Startup", "App Design"],
    text: "Designed the user experience of a startup-program app that is now thriving in the market.",
  },
];
