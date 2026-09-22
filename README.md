# Mirisik Event Website

A static, mobile-first event website for a Malay Mirisik ceremony. Host it for free with **GitHub Pages**. No backend server is required.

## What each file does

| File | Purpose |
| --- | --- |
| `index.html` | Page structure: hero, thank you, details, photo form, guestbook, gallery, footer |
| `style.css` | Layout, colours, animations, mobile navigation |
| `script.js` | **All custom details** live here in `siteConfig` |
| `assets/images/` | Hero photo and approved gallery photos |
| `assets/icons/` | Optional extra icons |
| `assets/fonts/` | Optional self-hosted fonts (Google Fonts are used by default) |

## Where to change event information

Open `script.js` and edit `siteConfig` at the top:

- Bride and groom names
- Date, time, location, address
- Google Maps link
- Hero image path
- Google Form URLs
- Google Sheet CSV URL for the guestbook
- Gallery image list
- Rai’s Contact Me link (Linktree)

Leave values like `[BRIDE NAME]` until you have the real information.

## Where to put images

1. Add photos to `assets/images/` (for example `hero.jpg`, `01.jpg`).
2. Set the hero in `script.js`:

```js
heroImage: "assets/images/hero.jpg",
```

3. List gallery photos:

```js
galleryImages: [
  { src: "assets/images/01.jpg", alt: "Family at the ceremony" },
  { src: "assets/images/02.jpg", alt: "Guests gathering" },
],
```

Guest POV uploads are **not** shown automatically. Review them, then add selected files to this gallery.

## Google Forms

### Photo form (Share Your POV)

Create a Google Form with:

1. **Name** (short answer, required)
2. **Upload your event photo** (file upload)
3. **Optional message** (paragraph, optional)

File upload may require guests to sign in to a Google account. That is a Google restriction, not something this website can bypass.

In the form: **Send → Embed HTML**. Copy only the `src="..."` URL.

Paste it in `script.js`:

```js
photoFormUrl: "https://docs.google.com/forms/d/e/XXXX/viewform?embedded=true",
```

Responses can be stored in Google Drive / a linked Sheet.

### Message form (guestbook)

Create a second Google Form with:

1. **Name** (required)
2. **Message for the bride & groom** (paragraph, required; placeholder: “Write your message here…”)

Embed it the same way:

```js
messageFormUrl: "https://docs.google.com/forms/d/e/YYYY/viewform?embedded=true",
```

### Connect forms to Google Sheets

In each form: **Responses → Link to Sheets**.

For the guestbook sheet, add a column:

```text
Name | Message | Approved
```

Type `YES` or `NO` in **Approved**. Only `YES` appears on the website.

## Guestbook display (no API keys)

Do **not** put Google passwords or private API keys in this repo.

1. Open the guestbook Google Sheet.
2. **File → Share → Publish to web**.
3. Publish the sheet (or the guestbook tab) as **CSV**.
4. Copy that CSV URL into:

```js
guestbookCsvUrl: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv",
```

The published CSV is public by design. Only put messages you are comfortable showing.

## Deploy to GitHub Pages

1. Create a GitHub account and a new repository (public is required for free Pages on a personal account unless you use a paid plan).
2. Upload these files to the repository (GitHub website **Add file → Upload**, or `git push`).
3. Open the repo **Settings → Pages**.
4. Under **Build and deployment**, set Source to **Deploy from a branch**.
5. Choose branch `main` (or `master`) and folder `/ (root)`.
6. Save. After a minute, GitHub will show a URL such as `https://YOUR_USERNAME.github.io/REPO_NAME/`.

### Update the website later

Change `script.js`, `index.html`, `style.css`, or images, then upload / push again. Pages rebuilds automatically.

### Contact Me in the footer

The footer uses one link: **Contact Me** → [https://linktr.ee/Rai0611](https://linktr.ee/Rai0611). Change it in `siteConfig.links.contact` in `script.js` if needed.

## Security

Never commit:

- Google account passwords
- Private API keys
- Service account JSON files

GitHub Pages is public.

## Local preview

Open `index.html` in a browser, or from this folder run:

```bash
npx --yes serve .
```

Then visit the local URL shown in the terminal.
