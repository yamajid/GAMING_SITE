# Setting Up Google Analytics — 5 Minutes

Your site currently has a placeholder GA ID (`G-XXXXXXXXXX`). Here's how to replace it with your real ID.

## Step 1 — Create a GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com)
2. Sign in with your Google account
3. Click **Admin** (bottom left gear icon)
4. Under "Account", click **Create Account** (or use an existing one)
5. Under "Property", click **Create Property**
6. Enter property name: `Gaming Coins Hub`
7. Select your timezone and currency
8. Click **Next** → choose **Web** as your platform
9. Enter website URL: `https://farmcoins.netlify.app`
10. Click **Create Stream**

## Step 2 — Get Your Measurement ID

After creating the stream, you'll see a **Measurement ID** at the top right.  
It looks like: `G-ABC123DEF4`

Copy this ID.

## Step 3 — Add to Netlify Environment Variables

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click your site → **Site configuration** → **Environment variables**
3. Click **Add a variable**
4. Key: `GOOGLE_ANALYTICS_ID`
5. Value: paste your `G-XXXXXXXXXX` ID
6. Click **Save**

## Step 4 — Trigger a Redeploy

1. Go to **Deploys** in your Netlify dashboard
2. Click **Trigger deploy → Deploy site**
3. Wait ~60 seconds for the build to complete

## Step 5 — Verify It's Working

1. Open your site in a browser
2. In Google Analytics, go to **Reports → Realtime**
3. You should see 1 active user (yourself)

If you see yourself in Realtime, Analytics is working correctly. Data will start accumulating within 24–48 hours.

## What to Track in Analytics

Once set up, monitor these metrics weekly in GA4:

- **Users** → total unique visitors
- **Sessions by page** → which guides get the most traffic
- **Engagement rate** → how many visitors read vs. bounce
- **Traffic source** → where visitors come from (Google, Reddit, direct)
- **Search Console integration** → connect GA4 to Search Console for keyword data
