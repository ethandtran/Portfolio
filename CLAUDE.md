# Ethan Tran — Portfolio Site

Context for Claude Code when working in this folder. This project has history from an earlier Claude Cowork session that isn't visible here, so read this before making changes.

## What this is

A single-page portfolio site for Ethan Tran (UC Irvine, mechanical engineering). Plain HTML/CSS/JS, no framework, no build step, no dependencies.

## Structure

- `index.html` — the entire site: markup, `<style>`, and `<script>` all inline in one file.
- `assets/<project>/` — photos and videos, one folder per project: `home/`, `solar-car/`, `sharkninja/`, `keyak-lab/`, `autonomous-rover/`, `rc-drone/`, `rc-rover/`, `cad-projects/`.
- `README.md` — local preview and deployment instructions (Live Server, GitHub Pages, Netlify, Vercel).

## Conventions to preserve when editing

- No bullet points or lists anywhere in visible site copy. Write lists as natural prose (e.g. "worked with X, Y, and Z"), never `<ul>`/`<li>`.
- No em dashes in copy.
- Videos are muted by default, no autoplay, `playsinline`, `preload="metadata"`, with manual play controls (the native controls bar includes the mute/unmute toggle). Every video's `.mp4` file in the SharkNinja, UCI Solar Car, RC Drone, and RC Rover sections carries a real AAC audio track (re-muxed in from the raw source in September 2026 — the original web-compressed exports had silently dropped audio), so unmuting them actually produces sound. Other projects' videos (Autonomous Rover, etc.) haven't been checked/fixed the same way — don't assume they have audio without checking the raw source first. When re-exporting/replacing any video asset in a project that's supposed to have audio, make sure to keep or re-mux in the audio track from the raw source — it's easy to silently drop during compression.
- Typography: `"Figtree"` (Google Fonts, free) for general UI/body text, `"Exposure Trial VAR"` (serif display) specifically for section and subsection titles (`.po-section-title`, `.po-subsection-title`, `.serif` utility class). Keep this split when adding new headings. Fonts were matched to a reference portfolio (ruocanpeng.com) in September 2026, replacing the original `"Inter"`/`"Newsreader"` pairing.
- **Font licensing caveat:** `"Exposure Trial VAR"` (self-hosted at `assets/home/ExposureTrialVAR.ttf`, loaded via `@font-face`) is a free *trial* build of a commercial variable typeface by type foundry 205TF (205.tf), designed by Federico Parra Barrios. 205TF's trial license is explicitly for private evaluation only, not production/commercial site use — the user was told this and chose to use the trial file on the live site anyway. If this ever needs to be legitimate, either buy a proper webfont license from 205.tf or swap in a free alternative.
- Projects covered: SharkNinja (co-op), UCI Solar Car, UCI Keyak Lab, Autonomous Rover (ENGR 7B), RC Drone, RC Rover / PIXAE Rover (ENGR 7A), CAD Projects (a hub overlay, `id="projectOverlayCadProjects"`, linking to two sub-project overlays: Zekrom, a MAE 52 coursework model, and the Ice Cream Cow Robot, a personal reverse-engineering project — both filled in with real media as of September 2026).

## Known incomplete spots

None currently open.

## Current deployment state

- Git repo initialized, pushed to GitHub at `github.com/ethandtran/Portfolio` (branch: `main`).
- Deployed on Vercel at `portfolio-ethan-tran.vercel.app`; every push to `main` auto-redeploys within about a minute.
- No custom domain yet — deliberately deferred, not an oversight.

## Workflow

Edit `index.html` and/or add or replace files under `assets/<project>/`, then:

```
git add -A
git commit -m "describe the change"
git push
```

Vercel picks up the push automatically; no manual deploy step needed.

**Standing authorization:** the user wants every change made in this project committed and pushed to `main` automatically, without asking for confirmation first, so it shows up on the live Vercel URL right away. This overrides the general default of confirming before `git push`. Still use judgment: stage only the files actually related to the requested change (never blind `git add -A` if unrelated modifications are sitting in the tree), and skip auto-push for changes explicitly marked as work-in-progress or not-ready.

## History note

This site was originally built and iterated on entirely inside a Claude Cowork session as a single ~16MB HTML file with every photo/video embedded as base64 (to fit within the Artifact publishing tool's file-size ceiling). In September 2026 it was migrated to this real, file-based project structure — actual asset files under `assets/`, referenced by relative path — specifically so it could move to git, GitHub, and Claude Code without that size ceiling. If something looks like a workaround for a constraint that no longer applies (odd compression choices, awkward structure), it may be a holdover from that phase worth revisiting rather than a deliberate design choice.
