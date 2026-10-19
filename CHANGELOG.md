# Changelog

## 2.1.0 (fork) — unreleased
Fork of [Forlarin/webos-tvos-launcher](https://github.com/Forlarin/webos-tvos-launcher) 2.0.0.

- Inputs-only home screen over the wallpaper; apps dock now optional (Settings → Show apps dock, off by default).
- Input cards: full-bleed card art with neutral bundled defaults; names come from the TV's own input labels; per-input art/label override via `src/config/inputArt.local.ts`.
- Only the focused input card scales; neighbours slide apart (42 px) to give it space. No card shadows; card names hidden on the card (shown in the big title).
- Profiles removed ("Who's Watching?" picker, profile pill, Kids mode); a single default profile is used.
- Wallpapers moved into Settings; Wi-Fi indicator removed from the top bar.
- Optional root Home-button / boot hook (`root-hook/`), with installer and uninstaller.
- New app id `io.github.ebattistini.tvos-launcher` so it installs alongside upstream.
