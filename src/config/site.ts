export const siteConfig = {
  name: "TalentHub",
  description:
    "AI-powered tech job board that streamlines your search with intelligent role compatibility matches, direct applying, and career insight metrics.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  creator: "TalentHub Team",
  keywords: [
    "job board",
    "tech jobs",
    "developer jobs",
    "design jobs",
    "AI job board",
    "software engineer positions",
    "remote work",
  ],
  links: {
    github: "https://github.com/talenthub",
    twitter: "https://twitter.com/talenthub",
    linkedin: "https://linkedin.com/company/talenthub",
  },
} as const;

export type SiteConfig = typeof siteConfig;
