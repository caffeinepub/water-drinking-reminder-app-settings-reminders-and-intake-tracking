# Progressive Web App (PWA) Installation Guide

This app is a Progressive Web App (PWA), which means you can install it on your device and use it like a native app, even with limited connectivity.

## Features

- **Installable**: Add the app to your home screen or app drawer
- **Offline Support**: Continue using the app even when offline (with limited functionality)
- **Fast Loading**: Cached assets load instantly on repeat visits
- **Native Feel**: Runs in standalone mode without browser UI

## Installation Instructions

### Desktop (Chrome, Edge, Brave)

1. Open the app in your browser
2. Look for the install icon in the address bar (usually on the right side)
3. Click the icon and select "Install"
4. Alternatively, click the "Install App" button in the header (if available)
5. The app will open in its own window and be added to your applications

**Or via browser menu:**
- Chrome: Menu (⋮) → "Install Hydration Tracker..."
- Edge: Menu (⋯) → Apps → "Install this site as an app"

### Android (Chrome, Samsung Internet)

1. Open the app in your mobile browser
2. Tap the "Install App" button in the header (if available)
3. Or tap the browser menu (⋮) and select "Add to Home screen" or "Install app"
4. Follow the prompts to add the app to your home screen
5. The app icon will appear on your home screen like any other app

### iOS (Safari)

**Note:** iOS Safari doesn't support the standard PWA install prompt, but you can still add it to your home screen:

1. Open the app in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Edit the name if desired and tap "Add"
5. The app icon will appear on your home screen

**iOS Limitations:**
- Service worker support is limited
- Offline functionality may be reduced
- Push notifications are not supported

## Verifying Installation

### Check the Manifest

1. Open the app in your browser
2. Open Developer Tools (F12 or right-click → Inspect)
3. Go to the "Application" tab (Chrome/Edge) or "Storage" tab (Firefox)
4. Look for "Manifest" in the left sidebar
5. Verify that the manifest loads correctly with app name, icons, and theme colors

### Check the Service Worker

1. In Developer Tools, go to the "Application" tab
2. Look for "Service Workers" in the left sidebar
3. You should see a service worker registered for the app's origin
4. Status should show "activated and running"

### Test Offline Functionality

1. With the app open, go to Developer Tools
2. Go to the "Network" tab
3. Check the "Offline" checkbox to simulate offline mode
4. Refresh the page
5. The app should still load (showing cached content and an offline banner)
6. Uncheck "Offline" to restore connectivity

## Updating the App

When a new version is available:

1. The service worker will download the update in the background
2. The new version will activate on your next visit
3. Simply refresh the page or close and reopen the app to get the latest version

## Uninstalling

### Desktop
- Right-click the app icon and select "Uninstall"
- Or go to browser settings → Apps → find the app → Uninstall

### Android
- Long-press the app icon → "Uninstall" or "App info" → Uninstall

### iOS
- Long-press the app icon → "Remove App" → "Delete App"

## Troubleshooting

### Install button doesn't appear
- Make sure you're using a supported browser (Chrome, Edge, Safari on iOS)
- The app must be served over HTTPS (or localhost for development)
- You may have already installed the app

### Offline mode not working
- Check that the service worker is registered (see "Check the Service Worker" above)
- Clear your browser cache and reload
- On iOS, offline support is limited due to platform restrictions

### App doesn't update
- Close all instances of the app
- Clear the browser cache
- Reopen the app to trigger a fresh service worker registration

## Development Notes

For developers working on this app:

- Manifest is located at `frontend/public/manifest.webmanifest`
- Service worker is at `frontend/public/sw.js`
- Icons are in `frontend/public/assets/generated/`
- Service worker registration happens in `frontend/index.html`

To test locally:
