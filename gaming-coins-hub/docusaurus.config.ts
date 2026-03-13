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

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '🎮 Gaming Coins Hub',
      logo: {
        alt: 'Gaming Coins Hub Logo',
        src: 'img/logo.png',
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
          href: 'https://github.com/gaming-coins-hub/gaming-coins-site',
          label: 'GitHub',
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
              label: 'Roblox',
              to: '/docs/roblox',
            },
            {
              label: 'Fortnite',
              to: '/docs/fortnite',
            },
            {
              label: 'Mobile Legends',
              to: '/docs/mobile-legends',
            },
            {
              label: 'Clash of Clans',
              to: '/docs/clash-of-clans',
            },
          ],
        },
        {
          title: 'Learn',
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
              label: 'Community Reddit',
              href: 'https://reddit.com/r/gaming',
            },
          ],
        },
        {
          title: 'Meta',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Contact',
              href: 'https://twitter.com/gamingcoinshub',
            },
            {
              label: 'Privacy Policy',
              to: '/docs/privacy',
            },
          ],
        },
      ],
      copyright: `Built with ❤️ for gamers. © ${new Date().getFullYear()} Gaming Coins Hub. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
