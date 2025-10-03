import {
  Github as IconBrandGithub,
  Instagram as IconBrandInstagram,
  Linkedin as IconBrandLinkedin,
  Twitter as IconBrandTwitter,
} from '@/lib/icons';
import type React from 'react';

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: 'Product',
    links: [
      { name: 'Image to Prompt', href: '/image-to-prompt' },
      { name: 'Text to Prompt', href: '/text-to-prompt' },
      { name: 'Text to Image', href: '/text-to-image' },
      { name: 'Blog', href: '/blog' },
      { name: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Contact Us', href: 'mailto:support@im2prompt.com' },
      { name: 'Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <IconBrandGithub strokeWidth={1} className="size-5" />, href: '#', label: 'Github' },
  { icon: <IconBrandInstagram strokeWidth={1} className="size-5" />, href: '#', label: 'Instagram' },
  { icon: <IconBrandTwitter strokeWidth={1} className="size-5" />, href: '#', label: 'Twitter' },
  { icon: <IconBrandLinkedin strokeWidth={1} className="size-5" />, href: '#', label: 'LinkedIn' },
];

const defaultLegalLinks = [
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
];

export const Footer = ({
  logo = {
    url: '/',
    src: '/icons/favicon-32x32.png',
    alt: 'logo',
    title: 'im2Prompt',
  },
  sections = defaultSections,
  description = 'Transform images into AI prompts and generate stunning visuals with our powerful AI platform. Support for Sora2, Veo3, Stable Diffusion, Flux, and more.',
  socialLinks = defaultSocialLinks,
  copyright = '© 2025 im2Prompt. All rights reserved.',
  legalLinks = defaultLegalLinks,
}: FooterProps) => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url}>
                <img src={logo.src} alt={logo.alt} title={logo.title} className="h-8" />
              </a>
              <h2 className="font-semibold text-xl">{logo.title}</h2>
            </div>
            <p className="max-w-[70%] text-muted-foreground text-sm">{description}</p>
            <ul className="flex items-center space-x-6 text-muted-foreground">
              {socialLinks.map((social) => (
                <li key={social.label} className="font-medium hover:text-primary">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={section.title}>
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li key={link.name} className="font-medium hover:text-primary">
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 font-medium text-muted-foreground text-xs md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={link.name} className="hover:text-primary">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
