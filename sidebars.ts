import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

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
        'fortnite/battle-pass-roi',
      ],
    },
    {
      type: 'category',
      label: '📱 Mobile Legends',
      items: [
        'mobile-legends/free-diamonds-guide',
        'mobile-legends/working-codes',
        'mobile-legends/event-farming',
      ],
    },
    {
      type: 'category',
      label: '🏰 Clash of Clans',
      items: [
        'clash-of-clans/achievements-gems-guide',
        'clash-of-clans/gem-mine',
        'clash-of-clans/working-codes',
      ],
    },
    'faq',
    'privacy',
    'about',
  ],
};

export default sidebars;
