# Connecting gijayi.com (Hostinger) to Vercel - Step-by-Step Guide

## Your Setup
- **Domain**: gijayi.com
- **Registrar**: Hostinger
- **Hosting**: Vercel (Next.js)
- **Project**: gijayi-store

---

## Method 1: Using Vercel Nameservers (Recommended - Easiest)

### Step 1: Get Nameservers from Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your project: **gijayi-store**
3. Go to **Settings** → **Domains**
4. Click **Add** button
5. Enter your domain: `gijayi.com`
6. Vercel will show you **4 nameservers** (they look like):
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```
   **Copy these nameservers** (you'll need them in next step)

### Step 2: Update Nameservers in Hostinger

1. Log in to **Hostinger Dashboard**: https://www.hostinger.com/
2. Go to **Hosting** → Your domain **gijayi.com**
3. Click **Manage** or **Domain Settings**
4. Look for **Nameservers** or **DNS** section
5. Click **Edit Nameservers** or **Change Nameservers**
6. You'll see 3 default nameservers:
   ```
   ns1.hostinger.com
   ns2.hostinger.com
   ns3.hostinger.com
   ```
7. **Delete all three** Hostinger nameservers
8. **Add the 4 Vercel nameservers** from Step 1:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```
9. Click **Save** or **Confirm**

### Step 3: Verify Domain in Vercel

1. Go back to **Vercel Dashboard**
2. In the **Domains** section, you should see **gijayi.com**
3. It may show **pending** or **waiting for nameserver update**
4. **Wait 24-48 hours** for DNS propagation
5. Once verified, it will show as **Connected** ✅

---

## Method 2: Using CNAME Records (If you want to keep Hostinger DNS)

### Step 1: Add CNAME Records in Hostinger

1. Log in to **Hostinger Dashboard**
2. Go to **Domain** → **gijayi.com** → **DNS**
3. Look for **DNS Records** section
4. **Add New Record** for each:

   **Record 1 (for www subdomain):**
   - Type: `CNAME`
   - Name/Host: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `3600` (default is fine)
   - Click **Add**

   **Record 2 (for root domain):**
   - Type: `A` (or ALIAS if available)
   - Name/Host: `@` (or leave blank)
   - Value: `76.76.19.165`
   - TTL: `3600`
   - Click **Add**

5. Click **Save**

### Step 2: Configure in Vercel

1. Go to **Vercel Dashboard** → **gijayi-store** → **Settings** → **Domains**
2. Click **Add** → Enter `gijayi.com`
3. Vercel will ask for DNS configuration
4. Select **Using external DNS provider**
5. It should auto-detect your CNAME records
6. Click **Continue** and then **Verify**
7. Wait 24-48 hours for verification

---

## ✅ Verification Checklist

After DNS propagates (24-48 hours):

- [ ] Visit https://gijayi.com (should load your store)
- [ ] Visit https://www.gijayi.com (should redirect to gijayi.com)
- [ ] Check SSL certificate: Click the lock icon in browser
- [ ] Run DNS check: https://dnschecker.org/ - enter gijayi.com
- [ ] Check from multiple browsers (clear cache first)

---

## 🔒 SSL Certificate Setup

**No action needed!** Vercel automatically:
- ✅ Issues FREE SSL certificate from Let's Encrypt
- ✅ Auto-renews before expiration
- ✅ Covers both `gijayi.com` and `www.gijayi.com`
- ✅ Takes effect 24-48 hours after DNS propagation

---

## 📱 Testing DNS Propagation

### While waiting for DNS to propagate:

**Check DNS status:**
```bash
# In PowerShell/Terminal
nslookup gijayi.com

# Or use online tool:
# https://dnschecker.org/
# https://mxtoolbox.com/
```

**Expected result after propagation:**
```
Name:    gijayi.com
Address: 76.76.19.165
```

---

## Common Issues & Solutions

### Issue 1: Domain still shows "Pending" after 24 hours
**Solution:**
1. Verify nameservers in Hostinger are correct
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try from different device/network
4. Wait additional 24 hours (DNS propagation can be slow)

### Issue 2: "SSL Certificate Pending" or "ERROR"
**Solution:**
1. Ensure DNS records are correct
2. Wait 24-48 hours after DNS propagation
3. Go to Vercel: Settings → Domains → Refresh
4. If still failing, remove and re-add domain

### Issue 3: www.gijayi.com not redirecting
**Solution:**
1. In Vercel domain settings, enable redirect
2. Or add both APEXdomain and www as separate domains
3. Vercel will auto-redirect www to root

### Issue 4: Getting "This site can't provide a secure connection"
**Solution:**
1. Wait 24-48 hours for SSL certificate
2. Clear browser SSL cache
3. Don't use localhost or IP directly
4. Try in Incognito/Private window

---

## After Domain is Live

### Configure in Next.js (Optional)

Update `next.config.ts` to recognize your domain:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  domains: ['gijayi.com', 'www.gijayi.com'],
};

export default nextConfig;
```

### Environment Variables

Your `.env.local` already has all variables configured ✅
No changes needed (Vercel uses the same env vars)

### Testing Commands

```bash
# Test your domain DNS
nslookup gijayi.com

# Test SSL certificate
curl -I https://gijayi.com

# Test from different regions
# Use: https://dnschecker.org/
```

---

## Timeline

| Time | Status | Action |
|------|--------|--------|
| Now | Start | Change nameservers/add CNAME |
| 15 mins - 2 hours | Propagating | Monitor DNS |
| 2 - 24 hours | Syncing | Vercel detects DNS |
| 24 - 48 hours | Verifying | SSL certificate issued |
| 48+ hours | Live ✅ | Domain fully active |

---

## Quick Reference

**Your Project Details:**
- Vercel Project: gijayi-store
- Domain: gijayi.com
- Registrar: Hostinger
- DNS Method: Nameservers (recommended)

**Next Steps:**
1. ✅ Go to Hostinger dashboard
2. ✅ Update nameservers to Vercel
3. ✅ Add domain to Vercel
4. ✅ Wait 24-48 hours
5. ✅ Test gijayi.com
6. ✅ Done! 🚀

---

## Need Help?

If you encounter any issues:
1. Check DNS propagation: https://dnschecker.org/
2. Verify nameservers are correct in Hostinger
3. Check Vercel domain settings aren't in error state
4. Clear browser cache (Ctrl+Shift+Delete)
5. Wait minimum 24 hours before troubleshooting

**Estimated time to go live: 24-48 hours from now**
