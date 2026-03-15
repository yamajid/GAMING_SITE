import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const games = [
  {
    title: '🎮 Roblox',
    icon: '🎮',
    description: 'Earn free Robux legitimately. 200M+ players, biggest demand.',
    links: [
      { label: 'How to Earn Robux', href: '/docs/roblox/earn-free-robux-2026' },
      { label: 'Working Codes (Weekly)', href: '/docs/roblox/working-codes' },
      { label: 'Premium Worth It?', href: '/docs/roblox/premium-worth-it' },
    ],
    stats: { users: '200M+', guides: '4' },
    color: 'var(--ifm-color-primary)',
  },
  {
    title: '⚡ Fortnite',
    icon: '⚡',
    description: 'Get free V-Bucks without spending. Save the World, Battle Pass strategy.',
    links: [
      { label: 'Free V-Bucks Guide', href: '/docs/fortnite/free-vbucks-guide' },
      { label: 'Working Codes', href: '/docs/fortnite/working-codes' },
      { label: 'Battle Pass ROI', href: '/docs/fortnite/battle-pass-roi' },
    ],
    stats: { users: '500M+', guides: '4' },
    color: '#7B68EE',
  },
  {
    title: '📱 Mobile Legends',
    icon: '📱',
    description: 'Free diamonds without surveys. Events, passes, farming.',
    links: [
      { label: 'Free Diamonds Guide', href: '/docs/mobile-legends/free-diamonds-guide' },
      { label: 'Working Codes', href: '/docs/mobile-legends/working-codes' },
      { label: 'Event Farming', href: '/docs/mobile-legends/event-farming' },
    ],
    stats: { users: '100M+', guides: '3' },
    color: '#FF6B9D',
  },
  {
    title: '🏰 Clash of Clans',
    icon: '🏰',
    description: 'Get free gems fast. Achievement guide, Gem Mine tactics.',
    links: [
      { label: 'Gem Achievements', href: '/docs/clash-of-clans/achievements-gems-guide' },
      { label: 'Gem Mine Guide', href: '/docs/clash-of-clans/gem-mine' },
      { label: 'Working Codes', href: '/docs/clash-of-clans/working-codes' },
    ],
    stats: { users: '50M+', guides: '3' },
    color: '#FF8C00',
  },
];

const features = [
  {
    title: '✅ No Scams, No Generators',
    description: 'We expose 100% fake "free currency" sites and teach legitimate methods only.',
  },
  {
    title: '📅 Updated Every Week',
    description: 'Guides, codes, and strategies updated constantly. Old info = no traffic.',
  },
  {
    title: '⚡ Fast to Implement',
    description: 'Each guide shows exact time-to-earn. No BS "follow 50 steps" guides.',
  },
  {
    title: '🎯 Game-Specific Strategies',
    description: '4 games, 4 different methods. Not generic – tailored to each game.',
  },
  {
    title: '💰 Monetization Hooks Built-in',
    description: 'Affiliate links, email signups, and ad-friendly content structure.',
  },
  {
    title: '📈 SEO Optimized',
    description: 'Keyword research, meta tags, and structure built for Google ranking.',
  },
];

function GameCard({ title, description, links, stats, color, icon }) {
  return (
    <div className={clsx(styles.gameCard)} style={{ borderColor: color }}>
      <div className={styles.gameHeader}>
        <span className={styles.gameIcon}>{icon}</span>
        <h3>{title}</h3>
      </div>
      <p className={styles.gameDescription}>{description}</p>
      <div className={styles.gameStats}>
        <span>👥 {stats.users}</span>
        <span>📚 {stats.guides}</span>
      </div>
      <div className={styles.gameLinks}>
        {links.map((link, idx) => (
          <Link key={idx} to={link.href} className={styles.gameLink}>
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div className={clsx(styles.featureItem)}>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

function Homepage() {
  return (
    <Layout
      title="Free In-Game Currency Guides for Roblox, Fortnite & More"
      description="Legitimate ways to earn free Robux, V-Bucks, Diamonds, and Gems in 2026. No scams, no generators. Guides updated weekly."
    >
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Free In-Game Currency Guides — No Scams, No Generators</h1>
            <p>
              Honest, updated, <strong>legit ways</strong> to earn free Robux, V-Bucks, Diamonds & Gems <br />
              <span className={styles.heroSub}>Roblox · Fortnite · Mobile Legends · Clash of Clans</span>
            </p>
            <div className={styles.heroButtons}>
              <Link
                className={clsx(styles.primaryButton)}
                to="/docs/roblox/earn-free-robux-2026"
              >
                Start with Roblox →
              </Link>
              <Link
                className={clsx(styles.secondaryButton)}
                to="/docs/fortnite/free-vbucks-guide"
              >
                Or Fortnite
              </Link>
            </div>
            <div className={styles.heroStats}>
              <span>4 Games</span>
              <span>12+ Guides</span>
              <span>Updated Weekly</span>
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className={styles.games}>
          <h2>Pick Your Game</h2>
          <div className={styles.gameGrid}>
            {games.map((game, idx) => (
              <GameCard key={idx} {...game} />
            ))}
          </div>
        </section>

        {/* Why Us Section */}
        <section className={styles.whyUs}>
          <h2>Why Gaming Coins Hub is Different</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, idx) => (
              <Feature key={idx} {...feature} />
            ))}
          </div>
        </section>

        {/* Research Stats */}
        <section className={styles.stats}>
          <h2>The Problem We Solve</h2>
          <div className={styles.statsList}>
            <div className={styles.stat}>
              <p className={styles.statNumber}>50M+</p>
              <p>Monthly searches for free currency</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statNumber}>99%</p>
              <p>Of results are clickbait or scams</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statNumber}>1:500K</p>
              <p>Ratio of legit to fake guides</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <h2>Ready to Earn Free Currency?</h2>
          <p>
            Pick a game and start earning today. Most guides show results in 24-48 hours.
          </p>
          <div className={styles.ctaButtons}>
            <Link className={clsx(styles.primaryButton)} to="/docs/roblox/earn-free-robux-2026">
              Browse Roblox Guides
            </Link>
            <Link className={clsx(styles.secondaryButton)} to="/blog">
              Latest Updates
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Homepage;
