import type { Organization, WebSite, BreadcrumbList, WebPage, SoftwareApplication, FAQPage } from 'schema-dts';

export function getOrganizationSchema(): Organization {
  return {
    '@type': 'Organization',
    '@id': 'https://www.im2prompt.com/#organization',
    name: 'im2Prompt',
    url: 'https://www.im2prompt.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.im2prompt.com/logo.png',
      width: '512',
      height: '512',
    },
    sameAs: [
      'https://twitter.com/im2prompt',
    ],
    description: 'AI-powered image to prompt extraction and generation tools for artists, designers, and creative professionals',
  };
}

export function getWebsiteSchema(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': 'https://www.im2prompt.com/#website',
    url: 'https://www.im2prompt.com',
    name: 'im2Prompt',
    description: 'Extract AI prompts from images, refine them, and generate new visuals. Support for Midjourney, Stable Diffusion, and FLUX.',
    publisher: {
      '@id': 'https://www.im2prompt.com/#organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.im2prompt.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getSoftwareApplicationSchema(): SoftwareApplication {
  return {
    '@type': 'SoftwareApplication',
    name: 'im2Prompt',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description: 'AI-powered image to prompt extraction tool supporting Midjourney, Stable Diffusion, FLUX, and more',
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getWebPageSchema(props: {
  url: string;
  name: string;
  description: string;
  breadcrumb?: BreadcrumbList;
}): WebPage {
  return {
    '@type': 'WebPage',
    '@id': `${props.url}#webpage`,
    url: props.url,
    name: props.name,
    description: props.description,
    isPartOf: {
      '@id': 'https://www.im2prompt.com/#website',
    },
    about: {
      '@id': 'https://www.im2prompt.com/#organization',
    },
    ...(props.breadcrumb && { breadcrumb: props.breadcrumb }),
  };
}

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQPage {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateStructuredData(schemas: unknown[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemas,
  });
}
