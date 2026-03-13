# 🚀 Deployment Guide — Gaming Coins Hub

## Pre-Deployment Checklist

- [ ] All guides content written
- [ ] Monetization IDs added (GA4, AdSense)
- [ ] Email capture configured (Substack)
- [ ] Domain registered
- [ ] Git repository initialized
- [ ] Environment variables set

---

## 1. Deploy to Vercel (Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Gaming Coins Hub MVP"
git branch -M main
git remote add origin https://github.com/gaming-coins-hub/gaming-coins-site.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Build settings:
   - Framework: **Docusaurus 3**
   - Build command: `npm run build`
   - Output directory: `build`

### Step 3: Add Environment Variables
In Vercel project settings, add:
```
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
SUBSTACK_API_KEY=your_key_here
```

### Step 4: Deploy
- Vercel auto-deploys on push to `main`
- First deploy: ~2-3 minutes
- Subsequent deploys: ~30-60 seconds

---

## 2. Connect Custom Domain

### Option A: Using Vercel Registrar
1. In Vercel project → Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., gamingcoinshub.com)
4. Approve purchase (~$15/year)
5. Done! No DNS config needed.

### Option B: External Registrar
1. Buy domain from GoDaddy, Namecheap, etc.
2. In Vercel project → Settings → Domains
3. Add custom domain
4. Update DNS records (Vercel provides them)
5. Wait 24-48 hours for propagation

---

## 3. Setup SEO & Analytics

### Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: **URL prefix** → Enter your domain
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `yoursite.com/sitemap.xml` (auto-generated)

### Google Analytics 4
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create new property
3. Copy Tracking ID (G-XXXXXXXXXX)
4. Add to environment variables

### Google AdSense
1. Go to [adsense.google.com](https://adsense.google.com)
2. Sign up
3. Add your domain
4. Wait 24-48 hours for approval
5. Get Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
6. Add to environment variables

---

## 4. Monthly Maintenance

- [ ] Update promo codes (every week)
- [ ] Publish 2-3 new guides (every month)
- [ ] Check analytics for top-performing content
- [ ] Respond to comments on guides
- [ ] Add new blog posts about scams/updates
- [ ] Analyze keyword rankings

---

## 5. Revenue Streams

### Immediate (Week 1)
- Google AdSense: $0-10/month (ramping up)

### Short-term (Month 1-2)
- AdSense: $50-200/month
- Affiliate (Amazon): $0-50/month
- Email list building: 0-500 subscribers

### Mid-term (Month 3-6)
- AdSense: $200-1000+/month
- Affiliate: $50-200/month
- Email sponsorships: $300-1000/month
- Sponsored guides: $500-2000/month

### Long-term (Month 6+)
- AdSense: $1000-5000+/month
- Affiliate network: $200-1000+/month
- Direct sponsorships: $1000-5000+/month

---

## 6. Growth Strategy

### Month 1: Foundation
- Publish 12 core guides ✓ (done)
- Setup SEO & analytics
- Create Reddit posts (organic)
- 0-1000 monthly visitors

### Month 2-3: Acceleration
- Publish 8 more guides
- Reddit growth + TikTok shorts
- Email list: 500-2000 subscribers
- 1000-5000 monthly visitors

### Month 4-6: Scaling
- Publish 12 more guides
- YouTube channel launch
- Twitch partnerships
- 5000-20000 monthly visitors

### Month 6+: Monetization
- Multiple revenue streams active
- $1000+/month revenue
- Sponsor partnerships
- Job offers (content author)

---

## 7. Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run start

# Build for production
npm run build

# Test production build locally
npm run serve
```

Site runs at: http://localhost:3000

---

## 8. Troubleshooting

### Build fails
- Check Node version: `node -v` (need 16+)
- Clear cache: `rm -rf node_modules && npm install`
- Check for broken links: `npm run build will error`

### Domain not working
- Wait 48 hours for DNS propagation
- Clear browser cache
- Check DNS: `dig gamingcoinshub.com`

### AdSense not showing
- Verify publisher ID in config
- Wait 24-48 hours after adding domain
- Check browser privacy settings

---

## Next Steps

1. [ ] Deploy to Vercel today
2. [ ] Setup Google Search Console
3. [ ] Add Google Analytics ID
4. [ ] Setup email capture
5. [ ] Start posting on Reddit (r/roblox, r/FortniteCompetitive)
6. [ ] Monitor analytics for first 2 weeks
7. [ ] Iterate on top-performing content

**Estimated time to $1000/month:** 4-8 months (with consistent effort)

**Good luck! 🚀**
