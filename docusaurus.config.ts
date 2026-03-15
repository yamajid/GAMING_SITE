import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Gaming Coins Hub',
  tagline: 'Honest guides to earn free in-game currency. No scams, no generators.',
  favicon: 'img/favicon.ico',

  url: 'https://farmcoins.netlify.app',
  baseUrl: '/',

  organizationName: 'yamajid',
  projectName: 'GAMING_SITE',

  // Throw on broken links so Netlify build fails loudly instead of silently shipping 404s
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // No separate GA plugin needed — gtag is built into preset-classic below
  plugins: [],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'Gaming Codes & Updates',
          blogDescription: 'Latest promo codes, scam alerts, and gaming currency updates.',
          postsPerPage: 10,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'Gaming Coins Hub - Latest Codes & Updates',
            description: 'Fresh promo codes and gaming currency guides, updated weekly.',
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'warn',
          showLastUpdateTime: true,
        },
        // Google Analytics 4 via gtag (correct way in Docusaurus 3)
        gtag: {
          trackingID: process.env.GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX',
          anonymizeIP: true,
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.7,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      {
        name: 'google-site-verification',
        content: '8bmU6s5zjTFydusZd9LW5rOZe7yDjRkeqsojZBy8F6Q',
      },
      {
        name: 'description',
        content: 'Free in-game currency guides for Roblox, Fortnite, Mobile Legends & Clash of Clans. Legitimate methods only — no scams, no generators. Updated weekly.',
      },
      {
        name: 'keywords',
        content: 'free robux 2026, free v-bucks, free diamonds mobile legends, free gems clash of clans, working promo codes, no scam gaming guide',
      },
      {
        name: 'author',
        content: 'Gaming Coins Hub',
      },
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://farmcoins.netlify.app'},
      {property: 'og:title', content: 'Free In-Game Currency Guides | Gaming Coins Hub'},
      {property: 'og:description', content: 'Earn free Robux, V-Bucks, Diamonds & Gems — legitimate methods only. No scams. Updated weekly.'},
      {property: 'og:image', content: 'https://farmcoins.netlify.app/img/og-image.svg'},
      {property: 'og:locale', content: 'en_US'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@GamingCoinsHub'},
      {name: 'twitter:title', content: 'Free In-Game Currency Guides | Gaming Coins Hub'},
      {name: 'twitter:description', content: 'Legit ways to earn free Robux, V-Bucks, Diamonds & Gems. Updated weekly.'},
      {name: 'twitter:image', content: 'https://farmcoins.netlify.app/img/og-image.svg'},
      {name: 'theme-color', content: '#667eea'},
    ],
    // Replace with your project's social card
    image: 'img/og-image.svg',
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: 'light',
      disableSwitch: false,
    },
    breadcrumbs: true,
    navbar: {
      title: '🎮 Gaming Coins Hub',
      logo: {
        alt: 'Gaming Coins Hub Logo',
        src: 'img/logo.png',
        srcDark: 'img/logo-dark.svg',
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
            { label: 'Roblox — Free Robux', to: '/docs/roblox/earn-free-robux-2026' },
            { label: 'Fortnite — Free V-Bucks', to: '/docs/fortnite/free-vbucks-guide' },
            { label: 'Mobile Legends — Free Diamonds', to: '/docs/mobile-legends/free-diamonds-guide' },
            { label: 'Clash of Clans — Free Gems', to: '/docs/clash-of-clans/achievements-gems-guide' },
            { label: 'Genshin Impact — Free Primogems', to: '/docs/genshin-impact/free-primogems-guide' },
            { label: 'Genshin Impact — Spiral Abyss Guide', to: '/docs/genshin-impact/spiral-abyss-guide' },
            { label: 'PUBG Mobile — Free UC', to: '/docs/pubg-mobile/free-uc-guide' },
            { label: 'Minecraft — Free Minecoins', to: '/docs/minecraft/free-minecoins-guide' },
            { label: 'EA FC 25 — Free Coins', to: '/docs/fifa-fc25/free-fc-points-guide' },
          ],
        },
        {
          title: 'Educational',
          items: [
            {
              label: 'How to Stay Safe',
              to: '/docs/roblox/earn-free-robux-2026#%EF%B8%8F-whats-not-real',
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
