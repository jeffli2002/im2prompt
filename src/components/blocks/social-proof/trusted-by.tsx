import { useTranslations } from 'next-intl';
import React from 'react';

export function TrustedBy() {
  const t = useTranslations('trustedBy');

  // Mock company logos - in production, these would be actual company logos
  const companies = [
    { name: 'Adobe', logo: '/logos/adobe.svg' },
    { name: 'Netflix', logo: '/logos/netflix.svg' },
    { name: 'Spotify', logo: '/logos/spotify.svg' },
    { name: 'Meta', logo: '/logos/meta.svg' },
    { name: 'Apple', logo: '/logos/apple.svg' },
    { name: 'Google', logo: '/logos/google.svg' },
  ];

  return (
    <section className="border-y bg-muted/30 py-16">
      <div className="container">
        <p className="fade-in mb-8 animate-in text-center font-medium text-muted-foreground text-sm duration-700">
          Trusted by creative teams at leading companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="fade-in animate-in opacity-60 grayscale transition-all duration-300 duration-700 hover:opacity-100 hover:grayscale-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Placeholder for company logos */}
              <div className="flex h-8 w-24 items-center justify-center rounded bg-muted-foreground/20">
                <span className="font-medium text-muted-foreground text-xs">{company.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
