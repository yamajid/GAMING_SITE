import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Gaming Coins Hub',
  tagline: 'Honest guides to earn free in-game currency. No scams, no generators.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://gamingcoinshub.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'gaming-coins-hub', // Usually your GitHub org/user name.
  projectName: 'gaming-coins-hub', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // SEO Sitemap Plugin - Generate XML sitemap for search engines
    [
      '@docusaurus/plugin-sitemap',
      {
        changefreq: 'weekly',
        priority: 0.5,
        ignorePatterns: ['/tags/**', '/docs/tutorial-*/**'],
        filename: 'sitemap.xml',
      },
    ],
    // Google Analytics - Track user behavior for SEO insights
    [
      '@docusaurus/plugin-google-analytics',
      {
        trackingID: process.env.GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX',
        anonymizeIP: true,
      },
    ],
    // Google Tag Manager - Enhanced tracking & conversion monitoring
    [
      '@docusaurus/plugin-google-tag-manager',
      {
        containerId: process.env.GTM_CONTAINER_ID || 'GTM-XXXXXX',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/yamajid/GAMING_SITE/tree/main/',
          // SEO: Enable better link checking
          routeBasePath: 'docs',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/yamajid/GAMING_SITE/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          // SEO: Show publication dates
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Enhanced metadata for SEO - used for Open Graph, Twitter Cards
    metadata: [
      {
        name: 'description',
        content: 'Ultimate guides to earn free in-game currency (Robux, V-Bucks, Diamonds, Gems). Legitimate methods only - no scams, no generators. Updated daily with fresh codes and strategies.',
      },
      {
        name: 'keywords',
        content: 'free robux, free v-bucks, free diamonds, free gems, how to earn, no scam, working codes 2026',
      },
      {
        name: 'author',
        content: 'Gaming Coins Hub',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
      },
      {
        httpEquiv: 'x-ua-compatible',
        content: 'IE=edge',
      },
      // Open Graph - Social Media Sharing
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://gamingcoinshub.com',
      },
      {
        property: 'og:title',
        content: 'Gaming Coins Hub - Free In-Game Currency Guides',
      },
      {
        property: 'og:description',
        content: 'Earn free Robux, V-Bucks, Diamonds, Gems. No scams. Guides updated daily with fresh codes.',
      },
      {
        property: 'og:image',
        content: 'https://gamingcoinshub.com/img/og-image.jpg',
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      },
      {
        property: 'og:locale',
        content: 'en_US',
      },
      // Twitter Card - Tweet Optimization
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:site',
        content: '@GamingCoinsHub',
      },
      {
        name: 'twitter:creator',
        content: '@GamingCoinsHub',
      },
      {
        name: 'twitter:title',
        content: 'Gaming Coins Hub - Free In-Game Currency',
      },
      {
        name: 'twitter:description',
        content: 'Legit ways to earn free Robux, V-Bucks, Diamonds & Gems. Updated daily.',
      },
      {
        name: 'twitter:image',
        content: 'https://gamingcoinshub.com/img/twitter-card.jpg',
      },
      // Mobile Optimization
      {
        name: 'theme-color',
        content: '#667eea',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Gaming Coins Hub',
      },
      // Canonical URL - Prevent duplicate content issues
      {
        rel: 'canonical',
        href: 'https://gamingcoinshub.com',
      },
    ],
    // Replace with your project's social card
    image: 'img/og-image.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: 'light',
      disableSwitch: false,
    },
    navbar: {
      title: '🎮 Gaming Coins Hub',
      logo: {
        alt: 'Gaming Coins Hub Logo',
        src: 'img/logo.png',
        srcDark: 'img/logo-dark.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Guides',
        },
        {to: '/blog', label: 'Latest Codes', position: 'left'},
        {
          href: 'https://github.com/yamajid/GAMING_SITE',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Games',
          items: [
            {
              label: 'Roblox Guides',
              to: '/docs/roblox',
            },
            {
              label: 'Fortnite Guides',
              to: '/docs/fortnite',
            },
            {
              label: 'Mobile Legends Guides',
              to: '/docs/mobile-legends',
            },
            {
              label: 'Clash of Clans Guides',
              to: '/docs/clash-of-clans',
            },
          ],
        },
        {
          title: 'Educational',
          items: [
            {
              label: 'How to Stay Safe',
              to: '/docs/roblox/earn-free-robux-2026#-whats-not-real',
            },
            {
              label: 'Scam Analysis',
              to: '/blog',
            },
            {
              label: 'FAQ',
              to: '/docs/faq',
            },
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/GamingCoinsHub',
            },
            {
              label: 'Privacy Policy',
              to: '/docs/privacy',
            },
          ],
        },
      ],
      copyright: `Built with ❤️ for gamers. © ${new Date().getFullYear()} Gaming Coins Hub. All rights reserved. | Made to be the most trusted gaming currency guide online.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
