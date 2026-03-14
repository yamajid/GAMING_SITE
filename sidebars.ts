import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Gaming Coins Hub Sidebar Structure
 * Organized by game with guides, codes, and FAQs
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: '🎮 Roblox',
      items: [
        'roblox/earn-free-robux-2026',
      ],
    },
    {
      type: 'category',
      label: '⚡ Fortnite',
      items: [
        'fortnite/free-vbucks-guide',
      ],
    },
    {
      type: 'category',
      label: '📱 Mobile Legends',
      items: [
        'mobile-legends/free-diamonds-guide',
      ],
    },
    {
      type: 'category',
      label: '🏰 Clash of Clans',
      items: [
        'clash-of-clans/achievements-gems-guide',
      ],
    },
  ],
};

export default sidebars;
