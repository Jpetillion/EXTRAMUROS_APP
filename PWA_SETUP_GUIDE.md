# PWA Setup & User Guide

## For Developers: Making the PWA Work

### 1. Generate PWA Icons

The student app needs app icons in multiple sizes. You have two options:

#### Option A: Use an Icon Generator (Recommended)
1. Create a 512x512px PNG logo
2. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
3. Upload your logo
4. Download the generated icons
5. Place them in `student/public/icons/`

Required sizes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

#### Option B: Manual Creation
Use ImageMagick or Photoshop to resize:

```bash
# Install ImageMagick
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux

# Create all sizes from a 512x512 source
cd student/public/icons
convert your-logo-512.png -resize 72x72 icon-72x72.png
convert your-logo-512.png -resize 96x96 icon-96x96.png
convert your-logo-512.png -resize 128x128 icon-128x128.png
convert your-logo-512.png -resize 144x144 icon-144x144.png
convert your-logo-512.png -resize 152x152 icon-152x152.png
convert your-logo-512.png -resize 192x192 icon-192x192.png
convert your-logo-512.png -resize 384x384 icon-384x384.png
convert your-logo-512.png -resize 512x512 icon-512x512.png
```

### 2. Configure PWA Settings

Edit `student/public/manifest.json`:

```json
{
  "name": "Extra Muros - Your School Name",
  "short_name": "Extra Muros",
  "description": "Offline school trip guide",
  "theme_color": "#2563eb",  // Your school colors
  "background_color": "#ffffff",
  "start_url": "/"
}
```

### 3. Test PWA Locally

```bash
cd student
npm run build
npm run preview
```

Then:
1. Open Chrome DevTools
2. Go to "Application" tab
3. Check "Manifest" - should show no errors
4. Check "Service Workers" - should be registered
5. Try "Offline" checkbox - app should still work

### 4. Test PWA Installation

**On Desktop (Chrome/Edge):**
1. Visit the site
2. Look for install icon in address bar
3. Click to install
4. App opens in standalone window

**On Mobile:**
1. Visit the site in Safari (iOS) or Chrome (Android)
2. Should see "Add to Home Screen" prompt
3. Or use browser menu → "Add to Home Screen"

### 5. Verify Offline Mode

1. Install the PWA
2. Download a trip
3. Turn on Airplane Mode
4. Open the PWA
5. Everything should work!

### 6. HTTPS Requirement

⚠️ **PWAs ONLY work over HTTPS** (except localhost)

- Development: `http://localhost:5174` ✅ Works
- Production: Must use `https://` ✅ Vercel provides this automatically

### 7. Update the Service Worker

When you deploy updates:

1. The service worker will automatically update
2. Users will see an "Update Available" notification
3. They click "Update" and the new version installs
4. This is handled automatically by Vite PWA plugin

### 8. Debug Service Worker Issues

```bash
# Clear service worker and start fresh
# In Chrome DevTools:
Application → Service Workers → Unregister
Application → Clear Storage → Clear site data
```

---

## For Teachers: No Setup Needed

The admin website is a regular website. Teachers just:
1. Go to `https://admin.yourschool.com`
2. Login with their credentials
3. Start creating content

No installation needed!

---

## For Students: Installation Guide

### iOS (iPhone/iPad)

#### Initial Setup
1. **Open Safari** (must use Safari, not Chrome)
2. Go to `https://app.yourschool.com`
3. Tap the **Share** button (square with arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it "Extra Muros" (or your school name)
6. Tap **"Add"**

The app icon now appears on your home screen like any other app!

#### Using the App
1. **Tap the app icon** on your home screen
2. First time: Browse available trips
3. **Download a trip**: Tap "Download" button on a trip
4. Wait for download to complete (shows progress)
5. **Use offline**: Once downloaded, works without internet!

#### Tips for iOS
- ✅ Works offline after downloading
- ✅ Can delete and reinstall anytime
- ✅ Updates automatically when connected to WiFi
- ⚠️ Storage limit: ~50MB per app (plenty for most trips)
- 💡 Download trips on WiFi before traveling

---

### Android (Samsung, Google Pixel, etc.)

#### Initial Setup - Method 1 (Automatic Prompt)
1. Open **Chrome** browser
2. Go to `https://app.yourschool.com`
3. You'll see a banner: "Add Extra Muros to Home screen"
4. Tap **"Install"** or **"Add"**

#### Initial Setup - Method 2 (Manual)
1. Open **Chrome** browser
2. Go to `https://app.yourschool.com`
3. Tap the **three dots** (⋮) in top right
4. Tap **"Add to Home screen"** or **"Install app"**
5. Name it "Extra Muros"
6. Tap **"Add"**

The app icon now appears like any other app!

#### Using the App
1. **Tap the app icon** (looks like any other app)
2. First time: Browse available trips
3. **Download a trip**: Tap "Download" button
4. Wait for download (shows progress bar)
5. **Use offline**: Works completely offline once downloaded!

#### Tips for Android
- ✅ Works exactly like a native app
- ✅ Appears in app drawer
- ✅ Can uninstall like any app
- ✅ Updates automatically in background
- 💡 Download on WiFi to save mobile data

---

## Student Quick Start Guide

### 📥 First Time Setup (5 minutes)

1. **Install the App**
   - iOS: Safari → Share → Add to Home Screen
   - Android: Chrome → Menu → Install app

2. **Open the App**
   - Tap the Extra Muros icon on your home screen

3. **Browse Trips**
   - See all available trips from your teacher
   - Find the trip you're going on

4. **Download for Offline**
   - Tap the "Download" button on your trip
   - Wait for progress bar to complete (~5-50MB)
   - ✅ "Ready for Offline Use" appears

### 📱 During Your Trip

**Everything works WITHOUT internet!**

✅ Read text descriptions
✅ View images and photos
✅ Listen to audio guides
✅ See locations on maps
✅ Check your schedule
✅ Play activities/games
✅ Mark items as complete

**No roaming charges!** No internet needed!

### 🔄 Getting Updates

When you're back on WiFi:
- App automatically syncs new content
- You'll see "Update Available" notification
- Tap "Update" to get latest version
- Your progress is saved

### 📊 Managing Storage

**Check Storage:**
- Open app → Settings → Storage
- See which trips are downloaded
- See how much space they use

**Delete Downloads:**
- Settings → Manage Downloads
- Tap "Delete" on trips you don't need
- Frees up space immediately

**Re-download:**
- You can always download again later
- Your progress is saved in the cloud

### 💡 Pro Tips

1. **Download on WiFi** before your trip (uses less battery)
2. **Download at home/school** to save mobile data
3. **Check for updates** before leaving (Settings → Check for Updates)
4. **Keep app installed** between trips (takes no space without downloads)
5. **Share with classmates** (send them the URL)

### ❓ Troubleshooting

**App won't install?**
- iOS: Make sure you're using Safari (not Chrome)
- Android: Make sure you're using Chrome (not other browsers)
- Both: Make sure you're on `https://` (secure URL)

**Download stuck?**
- Check your internet connection
- Try closing and reopening the app
- Make sure you have enough storage space

**App shows "No internet"?**
- That's normal if you haven't downloaded the trip yet
- Download a trip first, then it works offline

**Can't find the app icon?**
- iOS: Check all home screens and App Library
- Android: Check app drawer (swipe up from home screen)

**Need to reinstall?**
- iOS: Long press icon → Remove → Add again from Safari
- Android: Uninstall like any app → Install again from Chrome

### 🆘 Need Help?

- Contact your teacher
- Email: support@yourschool.com
- Or ask IT support at school

---

## For IT Support / School Administrators

### Pre-Trip Checklist

1. **Test the PWA**
   - [ ] Install on iOS device
   - [ ] Install on Android device
   - [ ] Download a test trip
   - [ ] Verify offline mode works
   - [ ] Test on school WiFi

2. **Prepare Students**
   - [ ] Send installation guide
   - [ ] Create video tutorial (optional)
   - [ ] Do a class demo
   - [ ] Have backup plan (PDF?) for students without phones

3. **Teacher Training**
   - [ ] Show how to create content
   - [ ] Explain publish workflow
   - [ ] Test uploading images/audio
   - [ ] Generate manifest for students

4. **Technical Prep**
   - [ ] Ensure school WiFi allows the domain
   - [ ] Test with school firewalls
   - [ ] Check storage limits
   - [ ] Have support contact ready

### Day Before Trip

- [ ] Teacher publishes final content
- [ ] Send reminder to students: "Download today!"
- [ ] Test that downloads work
- [ ] Check server is up

### During Trip

- Monitor (optional):
  - Server status
  - Student app usage
  - Error reports

### After Trip

- [ ] Collect feedback
- [ ] Check download statistics
- [ ] Archive trip content
- [ ] Prepare for next trip

---

## Technical FAQ

### How much data does a download use?
- Text-only trip: ~1-2 MB
- With images: ~10-30 MB
- With audio guides: ~20-50 MB
- **Students should download on WiFi**

### How much storage does it need on the phone?
- App itself: ~5 MB
- Per trip: 1-50 MB depending on content
- Total: Usually less than 50-100 MB for multiple trips

### Does it use data when offline?
- **NO!** Once downloaded, zero data usage
- Perfect for international trips (no roaming)

### What happens if they delete the app?
- Progress is saved on our server
- Can reinstall anytime
- Re-download trips if needed

### Can they use it without installing?
- Yes! Can browse on website
- But can't download for offline
- Installation is recommended for trips

### Will it work on old phones?
- iOS 11.3+ (iPhone 6 and newer)
- Android 5.0+ (most phones from 2015+)
- Very compatible!

### What if the school blocks it?
- Contact IT to whitelist the domain
- Explain it's for educational trips
- Show that it works offline (no constant connection needed)

---

## For Developers: Advanced PWA Features

### Custom Splash Screen
Edit `vite.config.js` to customize:
```javascript
{
  theme_color: '#2563eb',  // Your brand color
  background_color: '#ffffff'
}
```

### Push Notifications (Future)
Infrastructure is ready for:
- Trip reminders
- Schedule notifications
- Update alerts

To enable, implement in `src/utils/notifications.js`

### Background Sync
Already configured! When back online:
- Automatically syncs new content
- Updates manifest version
- Downloads new assets

### Offline Analytics (Future)
Consider adding:
- Which content is most viewed
- How long students spend on each item
- Completion rates

---

## Summary

### For Developers
✅ Generate icons
✅ Test locally
✅ Deploy to HTTPS
✅ Verify service worker

### For Teachers
✅ No setup needed
✅ Just login and create

### For Students
✅ Install from browser
✅ Download trips
✅ Use offline
✅ That's it!

The PWA is designed to be **as simple as possible** while being **as powerful as needed**. Students install once, download before trips, and everything just works offline!
