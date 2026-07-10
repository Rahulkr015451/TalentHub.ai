import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/shared/container";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { ExternalLink } from "lucide-react";

const footerLinks = {
  Product: [
    { title: "Features", href: "/#features" },
    { title: "Integrations", href: "/integrations" },
    { title: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { title: "Documentation", href: "/docs" },
    { title: "Blog", href: "/blog" },
    { title: "Help Center", href: "/help" },
    { title: "API Reference", href: "/docs/api" },
  ],
  Company: [
    { title: "About", href: "/about" },
    { title: "Careers", href: "/careers" },
    { title: "Contact", href: "/contact" },
    { title: "Press", href: "/press" },
  ],
  Legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Cookie Policy", href: "/cookies" },
    { title: "Security", href: "/security" },
  ],
};

const socialLinks = [
  { icon: ExternalLink, href: siteConfig.links.github, label: "GitHub" },
  { icon: ExternalLink, href: siteConfig.links.twitter, label: "Twitter" },
  { icon: ExternalLink, href: siteConfig.links.linkedin, label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <Container>
        <div className="py-12 lg:py-16">
          {/* Main Grid */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              <Logo size="md" />
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                AI-powered tech job board that helps you find, apply, and land
                your next dream role — faster.
              </p>
              {/* Social Links */}
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center size-9 rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <social.icon className="size-4" />
                    <span className="sr-only">{social.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-foreground mb-4">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Built with
            <span className="mx-0.5 inline-block animate-pulse text-primary">
              ♥
            </span>
            by the {siteConfig.name} team
          </div>
        </div>
      </Container>
    </footer>
  );
}
