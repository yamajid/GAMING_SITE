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
        'roblox/working-codes',
        'roblox/premium-worth-it',
      ],
    },
    {
      type: 'category',
      label: '⚡ Fortnite',
      items: [
        'fortnite/free-vbucks-guide',
        'fortnite/working-codes',
      ],
    },
    {
      type: 'category',
      label: '📱 Mobile Legends',
      items: [
        'mobile-legends/free-diamonds-guide',
        'mobile-legends/working-codes',
      ],
    },
    {
      type: 'category',
      label: '🏰 Clash of Clans',
      items: [
        'clash-of-clans/achievements-gems-guide',
        'clash-of-clans/working-codes',
      ],
    },
  ],
};

export default sidebars;
