// Monetization Configuration for Gaming Coins Hub
// This file handles all monetization integrations

export const monetizationConfig = {
  // Google Analytics 4
  googleAnalytics: {
    trackingId: 'G-XXXXXXXXXX', // Replace with your GA4 ID
    enabled: true,
  },

  // Google AdSense
  googleAdSense: {
    publisherId: 'ca-pub-xxxxxxxxxxxxxxxx', // Replace with your AdSense publisher ID
    enabled: true,
    autoAds: true,
  },

  // Email Capture (Substack/Convertkit)
  emailCapture: {
    provider: 'substack', // 'substack', 'convertkit', 'mailchimp'
    listId: 'gaming-coins-hub',
    endpoint: 'https://gaming-coins-hub.substack.com/api/subscribe',
    enabled: true,
  },

  // Affiliate Programs
  affiliate: {
    // Amazon Associates
    amazon: {
      trackingId: 'gamingcoinshub-20', // Replace with your tracking ID
      enabled: true,
    },

    // Game-specific affiliate links (coming soon)
    roblox: {
      type: 'direct-link', // Roblox doesn't have affiliate program
      enabled: false,
    },

    // Ads network alternatives
    google: {
      enabled: true,
    },
  },

  // Link Tracking
  tracking: {
    // Add UTM parameters automatically
    utmSource: 'gamingcoinshub',
    utmCampaign: 'guides',
    enabled: true,
  },

  // Monetization Consent
  gdpr: {
    consentEnabled: true,
    privacyPolicyUrl: '/docs/privacy',
  },
};

// Helper function to inject GA4
export function injectGoogleAnalytics(trackingId: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', trackingId);
}

// Helper function to inject AdSense
export function injectGoogleAdSense(publisherId: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

// Add UTM parameters to external links
export function addUTMParameters() {
  const links = document.querySelectorAll('a[href^="http"]');
  links.forEach((link) => {
    const url = new URL(link.href);
    url.searchParams.set('utm_source', 'gamingcoinshub');
    url.searchParams.set('utm_campaign', 'content');
    url.searchParams.set('utm_content', 'guide');
    link.href = url.toString();
  });
}
