# Petal & Page

A pink reading journal for a home library. It runs as an app on the phone, works offline, and keeps every book, note and quote on the phone only.

## Put it on GitHub (one time, about 5 minutes)

1. Create a new repository on GitHub, for example `petal-and-page`. It can be public or private (private Pages needs a paid plan).
2. Upload everything in this folder, keeping the folders as they are: `site/`, `scripts/`, `.github/` and this README.
   On github.com: **Add file → Upload files**, drag the contents of the folder in, and commit to `main`.
   (If the `.github` folder doesn't upload by drag and drop, create the file `.github/workflows/pages.yml` with **Add file → Create new file** and paste its contents.)
3. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Open the **Actions** tab. The "Deploy to GitHub Pages" run takes about a minute. When it's green, the site is live at
   `https://<your-username>.github.io/petal-and-page/`

The workflow downloads the barcode scanner and the text reader into the site, so nothing is loaded from other websites once it is installed.

## Install it on her phone

1. Open the link once **with internet**, and leave it open for about 10 seconds so it can save itself and the text reader.
2. Add it to the home screen:
   - **iPhone (Safari):** Share button → **Add to Home Screen**.
   - **Android (Chrome):** menu ⋮ → **Install app** (or **Add to Home screen**).
3. From now on, open it from the home-screen icon. It works in airplane mode.

The Backup tab shows whether the app and the text reader are ready offline.

## What works offline

| Feature | Offline |
|---|---|
| Live barcode / QR scanning, scanning from a photo | Yes |
| Adding and editing books, bookmarks, dates, calendar, notes | Yes |
| Photographing a page and reading its text, highlighting quotes | Yes, after the first online open |
| Filling in the title from an ISBN | Needs internet. Offline, the ISBN is saved and she types the title |

## Keeping her data safe

Everything lives in the phone's browser storage for this site. On iPhone, the home-screen app has its own storage, separate from Safari, so always use the icon.

Deleting the app, or clearing website data for the site, erases the library. Use **Backup → Save backup file** every few weeks, and keep the file in Files, iCloud Drive or Google Drive. **Restore** brings it back on any phone.

## Updating the app

Edit `site/index.html` and commit. The workflow redeploys, and the phone picks up the new version the next time the app is opened online. Her data is not touched by updates.
