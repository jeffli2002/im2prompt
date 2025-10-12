import Image from 'next/image';
import { LogoImage } from '@/components/ui/logo-image';
import {
  Github as IconBrandGithub,
  Instagram as IconBrandInstagram,
  Linkedin as IconBrandLinkedin,
  Twitter as IconBrandTwitter,
  Mail as IconMail,
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
    links: Array<{ name: string; href: string; highlight?: boolean }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
}

const defaultSections = [
  {
    title: 'Product',
    links: [
      { name: 'Image to Prompt', href: '/image-to-prompt' },
      { name: 'Text to Prompt', href: '/text-to-prompt' },
      { name: 'Text to Image', href: '/text-to-image' },
      { name: '🎥 Text to Video (Sora 2)', href: '/text-to-video', highlight: true },
      { name: '🎬 Image to Video (Sora 2)', href: '/text-to-video?mode=image', highlight: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Templates', href: '/prompt-library' },
      { name: 'Blog', href: '/blog' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Contact Us', href: 'mailto:support@im2prompt.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Refund Policy', href: '/refund' },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <IconBrandTwitter strokeWidth={1} className="size-5" />, href: 'https://x.com/jeffli2002', label: 'Twitter' },
  { icon: <IconMail strokeWidth={1} className="size-5" />, href: 'mailto:jefflee2002@gmail.com', label: 'Email' },
];


export const Footer = ({
  logo = {
    url: '/',
    src: '/images/logo3.png',
    alt: 'im2prompt logo',
    title: 'im2prompt',
  },
  sections = defaultSections,
  description = 'Transform images into AI prompts and generate stunning visuals with our powerful AI platform. Support for Sora2, Stable Diffusion, Flux, and more.',
  socialLinks = defaultSocialLinks,
  copyright = '© 2025 im2Prompt. All rights reserved.',
}: FooterProps) => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url} className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <LogoImage 
                    src={logo.src} 
                    alt={logo.alt}
                    title={logo.title}
                    width={32}
                    height={32}
                    className="rounded-lg object-contain"
                    priority
                    unoptimized
                  />
                </div>
                <h2 className="font-semibold text-xl">{logo.title}</h2>
              </a>
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
                    <li key={link.name} className={`font-medium hover:text-primary ${link.highlight ? 'relative' : ''}`}>
                      <a 
                        href={link.href}
                        className={link.highlight ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-bold' : ''}
                      >
                        {link.name}
                      </a>
                      {link.highlight && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t py-8">
          <p className="text-muted-foreground font-medium text-xs text-center md:text-left">{copyright}</p>
        </div>
        <div className="mt-4 pt-4">
          <div className="border-t mb-4"></div>
          <p className="text-muted-foreground text-xs text-center md:text-left leading-relaxed">
            * This platform is an independent product and is not affiliated with, endorsed by, or sponsored by Google or OpenAI or other AI model companies. We provide access to the AI models through our custom interface.
          </p>
        </div>
      </div>
    </section>
  );
};
