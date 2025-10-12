# AI Song Builder - Deployment Checklist

## Pre-Deployment Requirements

### 1. API Keys & Credentials

- [ ] **Loudly API**
  - Get API key from https://loudly.com/developers
  - Set `VITE_LOUDLY_API_KEY` in environment
  - Verify `VITE_LOUDLY_BASE_URL=https://api.loudly.com/v1`

- [ ] **Beatoven API**
  - Get API key from https://beatoven.ai/api
  - Set `VITE_BEATOVEN_API_KEY` in environment
  - Verify `VITE_BEATOVEN_BASE_URL=https://api.beatoven.ai`

- [ ] **Eleven Music (Optional - Wave 2)**
  - Request API access from ElevenLabs
  - Set `VITE_ELEVEN_MUSIC_API_KEY` when available
  - Set `VITE_ELEVEN_MUSIC_ENABLED=1` to enable

- [ ] **Stripe**
  - Create Stripe account
  - Get publishable key from dashboard
  - Set `VITE_STRIPE_PUBLISHABLE_KEY`

- [ ] **S3-Compatible Storage**
  - Use Backblaze B2, Cloudflare R2, or AWS S3
  - Set `VITE_S3_ENDPOINT`, `VITE_S3_BUCKET`
  - Set `VITE_S3_ACCESS_KEY`, `VITE_S3_SECRET_KEY`

- [ ] **Supabase**
  - Already configured: `emtjhzeueqraqqejwdvw.supabase.co`
  - Database migrations applied ✅
  - RLS policies enabled ✅

### 2. Database Verification

Run this SQL to verify setup:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected tables: `users`, `tracks`, `jobs`, `credit_ledger`

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

**Required for Production:**
```env
VITE_SUPABASE_URL=https://emtjhzeueqraqqejwdvw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_LOUDLY_API_KEY=loudly_key_here
VITE_BEATOVEN_API_KEY=beatoven_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_S3_ENDPOINT=https://s3.us-west-002.backblazeb2.com
VITE_S3_BUCKET=ai-song-builder-prod
VITE_S3_ACCESS_KEY=...
VITE_S3_SECRET_KEY=...
```

---

## Deployment Options

### Option A: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Create `netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "18.20.3"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Set Environment Variables**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add all `VITE_*` variables from `.env.example`
   - Redeploy after adding variables

### Option B: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Create `vercel.json`**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all `VITE_*` variables
   - Redeploy

### Option C: Static Host (Cloudflare Pages, GitHub Pages)

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your hosting provider

3. **Configure SPA routing** (redirect all routes to `/index.html`)

---

## Post-Deployment Testing

### 1. Smoke Test the Live App

**Builder Page:**
- [ ] Form loads with all controls
- [ ] Genre/mood/duration selectors work
- [ ] Credit estimate updates correctly
- [ ] Form validation works (required fields)

**Guardrails:**
- [ ] Test blocked prompt: "Make it sound like Taylor Swift"
- [ ] Should show error: "Artist-style prompts are not allowed"
- [ ] Test profanity in lyrics (if explicit disabled)
- [ ] Should show error: "Lyrics contain explicit language"

**Library Page:**
- [ ] Loads without errors (may be empty)
- [ ] Shows "No tracks yet" message

**Credits Page:**
- [ ] Credit bundles display correctly
- [ ] Purchase buttons show (will fail without Stripe)

### 2. Test Provider Integration (Once Keys Added)

**Instrumental Generation (Loudly):**
```bash
curl -X POST https://your-app.netlify.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSTRUMENTAL",
    "brief": {
      "genre": "Country",
      "mood": "upbeat",
      "durationSec": 30,
      "vocals": "NONE"
    }
  }'
```

Expected: Returns `{ "trackId": "uuid" }`

**Jingle Generation (Beatoven):**
```bash
curl -X POST https://your-app.netlify.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "JINGLE",
    "brief": {
      "genre": "Pop",
      "mood": "energetic",
      "durationSec": 15,
      "vocals": "NONE"
    }
  }'
```

Expected: Returns `{ "trackId": "uuid" }`

### 3. Database Verification

```sql
-- Check if tracks are being created
SELECT id, title, type, status, provider, created_at
FROM tracks
ORDER BY created_at DESC
LIMIT 10;

-- Check jobs
SELECT id, provider, state, created_at
FROM jobs
ORDER BY created_at DESC
LIMIT 10;

-- Verify credits
SELECT email, credits FROM users;
```

---

## Troubleshooting

### Build Fails

**Error: "Missing environment variables"**
- Ensure all `VITE_*` variables are set in hosting platform
- Rebuild after adding variables

**Error: "Module not found"**
- Run `npm install` locally
- Commit `package-lock.json`
- Redeploy

### Runtime Errors

**"Supabase client error"**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase dashboard for service status

**"Provider API key not configured"**
- Add `VITE_LOUDLY_API_KEY` or `VITE_BEATOVEN_API_KEY`
- Restart/redeploy app

**"CORS error"**
- Check provider API allows your domain
- Verify API keys are valid

### Database Issues

**"RLS policy violation"**
- Ensure user is authenticated
- Check `auth.uid()` matches `user_id` in queries

**"Foreign key violation"**
- Verify `user_id` exists in `users` table before creating tracks
- Use `getOrCreateUser()` helper function

---

## Monitoring & Maintenance

### Regular Checks

- [ ] Monitor Supabase dashboard for database usage
- [ ] Check S3 bucket storage limits
- [ ] Review Stripe transaction logs
- [ ] Monitor provider API quota usage

### Logs to Watch

- Browser console for client-side errors
- Netlify/Vercel function logs for backend errors
- Supabase logs for database queries
- Provider API response codes

### Scaling Considerations

- **Database:** Supabase free tier has limits; upgrade if needed
- **Storage:** Monitor S3 bucket size and costs
- **API Quotas:** Track provider API usage; implement rate limiting
- **Credits:** Monitor credit purchases and usage patterns

---

## Security Checklist

- [x] RLS enabled on all tables ✅
- [x] Auth policies restrict data access ✅
- [x] Content moderation blocks harmful prompts ✅
- [x] API keys never exposed to client ✅
- [ ] HTTPS enabled on production domain
- [ ] CSP headers configured (optional)
- [ ] Rate limiting on API endpoints (future)

---

## Go-Live Checklist

- [ ] All environment variables configured
- [ ] API keys tested and working
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Smoke tests passed
- [ ] Production build successful
- [ ] Domain/DNS configured
- [ ] SSL certificate active
- [ ] Error monitoring set up (Sentry, LogRocket)
- [ ] Analytics configured (PostHog, Plausible)

---

## Support & Documentation

- **PRD:** See main project document for full specifications
- **Smoke Tests:** Run `npx tsx src/lib/test-runner.ts`
- **API Docs:** Provider documentation links in code comments
- **Database Schema:** Check `supabase/migrations/` folder

**Ready to deploy? Start with the API keys section and work through each checklist item.**
