'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Quote, Star } from 'lucide-react';
import React from 'react';

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'AI Artist',
      company: 'Freelance',
      avatar: '/avatar/1.png',
      content:
        'im2Prompt transformed my workflow. I can now understand and recreate any style I see. The prompt extraction is incredibly accurate!',
      rating: 5,
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      role: 'Creative Director',
      company: 'Design Studio',
      avatar: '/avatar/2.png',
      content:
        'We use im2Prompt daily for our client campaigns. The ability to extract and modify prompts saves us hours of experimentation.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Emma Watson',
      role: 'Content Creator',
      company: 'YouTube',
      avatar: '/avatar/3.png',
      content:
        'Game changer for thumbnail creation! I analyze trending thumbnails and generate variations that match my brand perfectly.',
      rating: 5,
    },
    {
      id: 4,
      name: 'Alex Kim',
      role: 'Marketing Manager',
      company: 'Tech Startup',
      avatar: '/avatar/4.png',
      content:
        'The batch processing feature is amazing. We can analyze competitor creatives and generate our own versions in minutes.',
      rating: 5,
    },
    {
      id: 5,
      name: 'Lisa Zhang',
      role: 'Product Designer',
      company: 'SaaS Company',
      avatar: '/avatar/5.png',
      content:
        'im2Prompt is essential for our design system. We maintain consistency across all AI-generated assets effortlessly.',
      rating: 5,
    },
    {
      id: 6,
      name: 'David Park',
      role: 'Developer',
      company: 'AI Startup',
      avatar: '/avatar/1.png',
      content:
        'The API is well-documented and easy to integrate. We built our entire image generation pipeline around im2Prompt.',
      rating: 5,
    },
  ];

  return (
    <section className="bg-muted/30 py-24">
      <div className="container">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="fade-in slide-in-from-bottom-4 mb-4 animate-in font-bold text-4xl duration-700 sm:text-5xl">
            Loved by Creators Worldwide
          </h2>
          <p className="fade-in slide-in-from-bottom-4 animate-in text-muted-foreground text-xl delay-100 duration-700">
            Join thousands of professionals using im2Prompt to enhance their creative workflow
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="fade-in slide-in-from-bottom-4 relative animate-in p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                animationDelay: `${index * 100 + 200}ms`,
                animationDuration: '700ms',
              }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 h-8 w-8 text-muted-foreground/10" />

              {/* Rating */}
              <div className="mb-4 flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="relative z-10 mb-6 text-muted-foreground">"{testimonial.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '2M+', label: 'Prompts Extracted' },
            { value: '4.9/5', label: 'Average Rating' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="fade-in slide-in-from-bottom-4 animate-in text-center"
              style={{
                animationDelay: `${index * 100 + 800}ms`,
                animationDuration: '700ms',
              }}
            >
              <p className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text font-bold text-3xl text-transparent">
                {stat.value}
              </p>
              <p className="mt-1 text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
