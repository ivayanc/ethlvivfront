# Image Assets Guide for Base Mini App

## Required Images (Minimum):

### Option 1: Quick Launch (Use logo.png for everything)
Just add your **logo.png** (512x512px) to `/public/` and we'll use it for:
- App icon
- Splash screen
- Social preview
- All other image requirements

### Option 2: Full Professional Setup

1. **logo.png** - 512x512px (square)
   - Your app icon

2. **splash.png** - 1080x1920px (portrait) or 1080x1080px (square)
   - Loading screen
   - Should have dark background (#0f172a)

3. **og-image.png** - 1200x630px (landscape)
   - Social media preview
   - Include app name and tagline

## After Adding Images:

Once you add logo.png to `/public/logo.png`, I'll update:
- `/public/.well-known/farcaster.json`
- `app/layout.tsx`

to use your actual logo instead of placeholders.

## Current Status:

- [ ] logo.png added to /public/
- [ ] splash.png added to /public/ (optional - can reuse logo.png)
- [ ] og-image.png added to /public/ (optional - can reuse logo.png)

## Quick Command to Check:

```bash
ls -la /Users/ivanyanchenko/farcaster/frontend/public/*.png
```
