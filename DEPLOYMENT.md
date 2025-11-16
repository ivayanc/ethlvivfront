# Base Mini App Deployment Guide

## What We've Done ✅

1. ✅ Installed `@farcaster/miniapp-sdk`
2. ✅ Integrated `sdk.actions.ready()` in providers
3. ✅ Created manifest file at `/public/.well-known/farcaster.json`
4. ✅ Added embed metadata to `layout.tsx`

## Next Steps 🚀

### Step 1: Create Required Assets

Before deploying, you need to create these image assets in the `/public` folder:

1. **icon.png** (512x512px, square)
   - App icon that appears in Base app

2. **splash.png** (1080x1920px, portrait)
   - Loading screen shown while app initializes

3. **embed-image.png** (1200x630px, landscape)
   - Preview image shown when your app is shared

4. **hero.png** (1200x630px, landscape)
   - Hero image for featured placements

5. **og-image.png** (1200x630px, landscape)
   - Open Graph image for social sharing

6. **screenshot1.png, screenshot2.png, screenshot3.png** (1080x1920px, portrait)
   - Screenshots showing key features of your app

### Step 2: Deploy to Vercel

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure as Base Mini App"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy the `frontend` directory
   - Wait for deployment to complete
   - Note your Vercel URL (e.g., `your-app.vercel.app`)

3. **Disable Vercel Deployment Protection:**
   - Go to Vercel dashboard → Your project
   - Settings → Deployment Protection
   - Toggle "Vercel Authentication" to OFF
   - Click Save

### Step 3: Update URLs in Config Files

Replace `https://your-app.vercel.app` with your actual Vercel URL in these files:

1. **`/public/.well-known/farcaster.json`**
   - Update all occurrences of `your-app.vercel.app`

2. **`app/layout.tsx`**
   - Update the `imageUrl` and `url` in the `fc:miniapp` metadata

### Step 4: Generate Account Association Credentials

1. **Navigate to Base Build:**
   - Go to [https://base.dev/preview?tab=account](https://base.dev/preview?tab=account)

2. **Generate Credentials:**
   - Paste your Vercel domain (e.g., `your-app.vercel.app`)
   - Click "Submit"
   - Click "Verify" and follow the instructions
   - Connect your wallet and sign the message

3. **Copy the Credentials:**
   - Copy the `accountAssociation` object provided

4. **Update Manifest:**
   - Open `/public/.well-known/farcaster.json`
   - Replace the empty `accountAssociation` fields with your credentials:
     ```json
     {
       "accountAssociation": {
         "header": "eyJ...",
         "payload": "eyJ...",
         "signature": "MHh..."
       },
       "miniapp": {
         ...
       }
     }
     ```

5. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Add account association credentials"
   git push origin main
   ```

### Step 5: Test Your Mini App

1. **Preview Tool:**
   - Go to [https://base.dev/preview](https://base.dev/preview)
   - Enter your app URL
   - Test the following:
     - ✅ Embeds display correctly
     - ✅ Launch button works
     - ✅ Account association verified
     - ✅ All metadata fields correct

2. **Verify Manifest:**
   - Check `https://your-app.vercel.app/.well-known/farcaster.json` loads correctly
   - Verify all fields are populated

### Step 6: Prepare for Production

1. **Update noindex flag:**
   - In `/public/.well-known/farcaster.json`
   - Change `"noindex": true` to `"noindex": false`
   - Commit and push

2. **Final verification:**
   - Test wallet connection works on Base Sepolia
   - Test making predictions
   - Test creating and joining duels
   - Verify leaderboard displays correctly

### Step 7: Publish Your App

1. **Post in Base App:**
   - Open the Base app (Farcaster client)
   - Create a new post
   - Include your app URL: `https://your-app.vercel.app`
   - Add description and hashtags
   - Publish the post

2. **Share on Social Media:**
   - Share on Twitter/X with Base community
   - Post in Base Discord server
   - Engage with early users

## Smart Contract Information

Your app is connected to these deployed contracts on Base Sepolia:

```
PriceOracle:    0x7bA9f7D7B3eFE92317996f8CF4BD0917e2499d88
PredictionGame: 0xCE8160D4151f1B328feb58FdC8A590bBf003bb65
DuelManager:    0x1F8493adf1776990FF7584036bbA173F9eac0863
```

Network: Base Sepolia (Chain ID: 84532)

## Troubleshooting

### App doesn't load
- Verify `sdk.actions.ready()` is called (already done in `providers.tsx`)
- Check browser console for errors
- Ensure manifest file is accessible

### Embeds don't show
- Verify `fc:miniapp` metadata in `layout.tsx`
- Check image URLs are accessible
- Ensure proper JSON formatting

### Wallet connection fails
- Ensure user is on Base Sepolia network (Chain ID: 84532)
- Check contract addresses in `/lib/contracts.ts`
- Verify user has test ETH for gas

## Resources

- [Base Mini Apps Docs](https://docs.base.org/mini-apps/quickstart/)
- [Base Build Preview Tool](https://base.dev/preview)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [Discord Support](https://discord.com/invite/buildonbase)

## Need Help?

If you encounter issues:
1. Check the [Common Issues](https://docs.base.org/mini-apps/quickstart/#common-issues) section
2. Ask in [Build on Base Discord](https://discord.com/invite/buildonbase)
3. Review your browser console for errors
4. Verify all URLs and credentials are correct
