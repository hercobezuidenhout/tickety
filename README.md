# Tickety

A full-screen order number display for a coffee shop. The barista types an order number on a USB keypad and presses Enter. The number appears on the big "Now serving" tile. Typing a number that is already on screen removes it.

- Orders wait in line with no timer. Only the order on the big tile counts down (`stageSeconds`).
- When the countdown ends the order moves to "Past orders" (oldest dropped after `maxPastOrders`).

## Settings

Edit `src/config.json`, then rebuild. The values are baked in at build time.

| Key | Meaning |
|---|---|
| `stageSeconds` | How long each order stays on the big tile |
| `maxPastOrders` | Length of the past orders list |
| `servingColumns` | Columns of small tiles under the big tile |
| `servingLabel`, `pastLabel` | Column headings |
| `showTimer`, `showInput` | Show the countdown / the typed-number box (a hidden input still receives the keypad) |
| `colors` | `background`, `text`, `accent`, `accentText`, `border` (any CSS colour) |

## Develop

```
npm install
npm run dev        # in the browser, with hot reload
npm run desktop    # build, then open it in Electron
```

## Release

Releases are built by GitHub Actions. In the repo go to **Actions → Release → Run workflow**.

Each run bumps the minor version (first release is `0.1.0`), builds for Raspberry Pi (linux arm64: `.deb` and AppImage) and macOS (arm64 `.dmg`), commits the new version to `package.json`, tags it `vX.Y.0`, and attaches the installers to a GitHub Release.

## Install on the Raspberry Pi

Download the `.deb` from the latest release and install it:

```
gh release download --repo hercobezuidenhout/tickety --pattern '*.deb'
sudo apt install ./Tickety-*.deb
```

`apt install ./file.deb` installs a local package and pulls in any libraries it needs. Afterwards Tickety appears in the desktop applications menu.

The macOS build is ad-hoc signed, not signed with an Apple Developer ID, so macOS will say it can't verify the developer on first open. Allow it under **System Settings → Privacy & Security → Open Anyway**. If macOS instead says the app is "damaged", clear the download flag with `xattr -cr /Applications/Tickety.app`.
