import React from 'react';
import { useTranslations } from 'next-intl';

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
    <section className="py-16 border-y bg-muted/30">
      <div className="container">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8 animate-in fade-in duration-700">
          Trusted by creative teams at leading companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 animate-in fade-in duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Placeholder for company logos */}
              <div className="h-8 w-24 bg-muted-foreground/20 rounded flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">{company.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}