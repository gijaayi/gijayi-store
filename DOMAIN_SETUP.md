# Domain Setup Guide for Gijayi Store on Vercel

## Current Project Info
- **Project Name**: gijayi-store
- **Vercel URL**: https://gijayi-store.vercel.app (or similar)
- **Framework**: Next.js
- **Current Domain**: (To be configured)

## Steps to Add Custom Domain

### Option 1: Add Domain via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click on your project: "gijayi-store"

2. **Add Custom Domain**
   - Click "Settings"
   - Go to "Domains" tab
   - Click "Add"
   - Enter your domain (e.g., gijayi.com or store.gijayi.com)

3. **Configure DNS**
   Choose one of the following:
   
   **Option A: Vercel Nameservers (Recommended)**
   - Use Vercel as DNS provider
   - Copy the nameservers provided
   - Go to your domain registrar
   - Update nameservers to point to Vercel
   - Wait 24-48 hours for propagation
   
   **Option B: CNAME Records (If keeping current DNS)**
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add CNAME record: `@` (root) → `cname.vercel-dns.com`
   - Or use A record: `@` → `76.76.19.165`

4. **Verify Domain**
   - Once DNS propagates, Vercel will auto-verify
   - Domain will show as "Connected"

### Option 2: Command Line Setup

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to your Vercel account
vercel login

# Navigate to project
cd path/to/gijayi-store

# Add domain
vercel domains add yourdomain.com
```

## Domain Registrar Instructions

### If using GoDaddy:
1. Log in to GoDaddy account
2. Go to "My Products" > "Domains"
3. Click your domain > "DNS"
4. Update nameservers or add CNAME records

### If using Namecheap:
1. Log in to Namecheap
2. Go to "Domain List"
3. Click "Manage" on your domain
4. Go to "Nameservers" tab
5. Update to Vercel nameservers

### If using Cloudflare:
1. Log in to Cloudflare
2. Select your domain
3. Go to "DNS" tab
4. Add CNAME records for Vercel
5. Set SSL/TLS to "Full"

## Environment Variables Check
✅ All required environment variables are set in your .env.local:
- MongoDB credentials
- Cloudinary API keys
- Admin credentials
- Payment gateway keys (Razorpay, PayPal)
- Email service (Resend)

## SSL Certificate
✅ Automatic:
- Vercel provides FREE SSL/TLS certificate
- Auto-renews every 30 days
- Covers root domain and www subdomain

## Last Steps

1. **Test the Domain**
   ```bash
   # Once domain is verified
   curl https://yourdomain.com
   ```

2. **Redirect www to non-www (or vice versa)**
   - Configure in Vercel domain settings
   - Automatic 308 redirects

3. **Add to website code** (optional)
   Update `next.config.ts` if you want domain-specific features:
   ```typescript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     domains: ['yourdomain.com', 'www.yourdomain.com'],
   };
   ```

## Troubleshooting

**Domain shows error after pointing:**
- Wait 24-48 hours for DNS propagation
- Use online tools to check: https://dnschecker.org/
- Clear browser cache (Ctrl+Shift+Delete)

**SSL certificate not auto-provisioning:**
- Ensure DNS is correctly configured
- Verify domain resolves in Vercel dashboard
- May take up to 24 hours

**Need to redirect old domain:**
- Use URL redirects at domain registrar
- Or configure in Vercel environment

## Next Steps
1. Decide which domain you want to use
2. Confirm domain registrar location
3. Choose DNS configuration method (Vercel or CNAME)
4. Follow corresponding setup steps above
5. Test domain after propagation

**Need help?** Reply with:
- Your desired domain name
- Current domain registrar (if you have one)
- Whether you already own the domain
