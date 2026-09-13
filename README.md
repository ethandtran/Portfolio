# Ethan Tran — Portfolio

A single-page portfolio site built with plain HTML, CSS, and JavaScript (no build step, no dependencies).

## Viewing it locally

Because the site loads videos and background audio from relative file paths, opening `index.html` directly by double-clicking it works in most browsers, but some browsers restrict video/audio playback over the `file://` protocol. For the most reliable local preview, serve the folder over a tiny local web server instead:

**Using VS Code:** install the "Live Server" extension, right-click `index.html`, and choose "Open with Live Server."

**Using Python (already on most machines):**
```
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Using Node:**
```
npx serve .
```

## Project structure

```
site/
  index.html        the entire site (markup, styles, and script)
  assets/
    home/            hero photo, tile cover images, background music
    solar-car/       UCI Solar Car project media
    sharkninja/      SharkNinja co-op project media
    keyak-lab/       Keyak Lab research project media
    autonomous-rover/
    rc-drone/
    rc-rover/
    cad-projects/    Zekrom and other personal CAD work
```

Each project's photos and videos live in their own folder under `assets/`, referenced from `index.html` by relative path.

## Making changes

Everything — layout, styles, and behavior — lives in `index.html`. Open it in VS Code, edit, save, and refresh your browser (or let Live Server auto-refresh for you). To swap out a photo or video, replace the file in its `assets/<project>/` folder with a new one of the same name, or add a new file and update the matching `src="assets/..."` reference in `index.html`.

## Deploying

Any static hosting provider works since there's no build step. A few good free options:

**GitHub Pages**
1. Push this repo to GitHub.
2. In the repo's Settings → Pages, set the source to your main branch, root folder.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.

**Netlify**
1. Sign in at netlify.com with GitHub.
2. "Add new site" → "Import an existing project" → pick this repo.
3. Leave the build command blank and the publish directory as `/` (repo root, or wherever `index.html` lives).
4. Deploy — Netlify gives you a live URL immediately and redeploys automatically on every push.

**Vercel**
1. Sign in at vercel.com with GitHub.
2. "Add New" → "Project" → pick this repo.
3. Framework preset: "Other" (no build step needed).
4. Deploy.

## Notes

- `assets/sharkninja/live-filter-indicator.mp4` is the largest file in the project (~47MB). It's under GitHub's 100MB hard limit and pushes fine as a normal file, but if you ever add many more large videos, consider [Git LFS](https://git-lfs.com/) to keep the repo lightweight.
- Background music and video files are muted/autoplay-disabled by default per browser autoplay policies — visitors interact with the play controls directly.
