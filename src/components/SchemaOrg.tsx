import React from 'react';
import Head from '@docusaurus/Head';

interface FAQItem {
  question: string;
  answer: string;
}

interface SchemaProps {
  type: 'faq' | 'article' | 'howto';
  title?: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  faqs?: FAQItem[];
  steps?: string[];
}

export default function SchemaOrg({ type, title, description, datePublished, dateModified, faqs, steps }: SchemaProps) {
  let schema: object = {};

  if (type === 'faq' && faqs) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
  }

  if (type === 'article') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      datePublished: datePublished || '2026-03-01',
      dateModified: dateModified || new Date().toISOString().split('T')[0],
      author: {
        '@type': 'Organization',
        name: 'Gaming Coins Hub',
        url: 'https://farmcoins.netlify.app',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Gaming Coins Hub',
        url: 'https://farmcoins.netlify.app',
      },
    };
  }

  if (type === 'howto' && steps) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: title,
      description: description,
      step: steps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        text: step,
      })),
    };
  }

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Head>
  );
}
