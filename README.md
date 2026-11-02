# Tickety

Tickety shows coffee order numbers on a screen, so nobody has to shout them.

The barista types the order number on a keypad and presses **Enter**. The number appears on the screen. That's it.

## How it works

- Type a number on the keypad and press **Enter**. It appears under **Now serving**.
- Only the first number is shown big, with a countdown. The others wait their turn.
- When the countdown ends, the number moves to **Past orders**.
- Typed a wrong number? Type the same number again and press **Enter**. It disappears.

---

## Install on a Raspberry Pi

You need a Raspberry Pi 3, 4 or 5 running the **64-bit** Raspberry Pi OS (with the desktop).

> **Check it's 64-bit:** open **Terminal** and type `uname -m`. If it says `aarch64`, you're good.

### 1. Download

1. On the Pi, open the web browser and go to
   **https://github.com/hercobezuidenhout/tickety/releases/latest**
2. Under **Assets**, click the file that ends in **`linux-arm64.deb`**. It looks like `Tickety-0.2.0-linux-arm64.deb`.
3. Wait for it to finish. It is saved in the **Downloads** folder.

### 2. Install

Open **Terminal** and paste this, then press **Enter**:

```
sudo apt install ./Downloads/Tickety-*-linux-arm64.deb
```

It asks for your password and installs everything it needs. This can take a minute or two.

### 3. Open it

Open the menu and look for **Tickety** (usually under **Accessories**). Or type this in Terminal:

```
tickety
```

It opens full screen. Plug in the keypad and try a number.

To close it, press **Alt + F4**.

---

## Install on a Linux laptop or PC (Intel / AMD)

This is for a normal Linux computer, such as Linux Mint or Ubuntu.

> **Which file do I need?** Open **Terminal** and type `uname -m`.
> - `x86_64` means an Intel or AMD computer. Use the file ending in **`linux-amd64.deb`**.
> - `aarch64` means a Raspberry Pi. Use the Raspberry Pi steps above.

1. Go to **https://github.com/hercobezuidenhout/tickety/releases/latest** and click the **`linux-amd64.deb`** file under **Assets**.
2. Open **Terminal** and paste:

```
sudo apt install ./Downloads/Tickety-*-linux-amd64.deb
```

3. Open **Tickety** from the menu, or type `tickety` in Terminal. Press **Alt + F4** to close it.

---

## Make it start by itself (kiosk mode)

This makes Tickety open full screen every time the Pi turns on. Nobody has to click anything.

### 1. Start Tickety automatically

Open **Terminal**, paste all of this at once, and press **Enter**:

```
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/tickety.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Tickety
Exec=/opt/Tickety/tickety
EOF
```

### 2. Stop the screen from going to sleep

The Pi turns the screen off after a while by default. To stop that:

1. In Terminal, type `sudo raspi-config` and press **Enter**.
2. Go to **Display Options**, then **Screen Blanking**.
3. Choose **No**.
4. Select **Finish**.

### 3. Restart

```
sudo reboot
```

After it restarts, Tickety should open on its own.

---

## Updating to a new version

1. Delete the old `.deb` file from the **Downloads** folder, so only the new one is left.
2. Do steps 1 and 2 of the install again with the new file for your computer. It replaces the old version.
3. Restart the Pi.

## If something isn't working

| Problem | Try this |
|---|---|
| Numbers don't show when I type | Press **Num Lock** on the keypad. Make sure the keypad is plugged in. |
| I can't close it | Press **Alt + F4**. |
| The screen goes black after a while | Do "Stop the screen from going to sleep" above. |
| It doesn't start after a restart | Do the "Start Tickety automatically" step again, then restart. |

---

## Mac

A Mac version is published too (`mac-arm64.dmg`, for Apple Silicon Macs). Open the file and drag Tickety into **Applications**.

The first time, macOS will say it can't verify the app. This is normal. Go to **System Settings → Privacy & Security**, scroll down, and click **Open Anyway**.

If macOS says the app is "damaged", paste this in Terminal and try again:

```
xattr -cr /Applications/Tickety.app
```

---

## For developers

### Settings

Edit `src/config.json`, then build again. The settings are built into the app.

| Setting | What it does |
|---|---|
| `stageSeconds` | How long each number stays on the big tile |
| `maxPastOrders` | How many numbers to keep under Past orders |
| `servingColumns` | How many small tiles fit in a row |
| `servingLabel`, `pastLabel` | The two headings |
| `showTimer` | Show the countdown (`true` or `false`) |
| `showInput` | Show the box where the typed number appears. The keypad still works if it's hidden. |
| `colors` | `background`, `text`, `accent`, `accentText`, `border` (any CSS colour) |

### Run it on your computer

```
npm install
npm run dev        # opens in the browser
npm run desktop    # builds, then opens it as a desktop app
```

### Make a new release

1. Push your changes to GitHub.
2. Go to **Actions → Release → Run workflow**.

Each run adds one to the minor version (`0.1.0`, `0.2.0`, `0.3.0`, ...), builds the Raspberry Pi and Mac apps, and publishes them as a GitHub Release. The version in `package.json` is updated to match.

The release workflow builds for the Raspberry Pi (64-bit ARM), Linux PCs (Intel / AMD) and Apple Silicon Macs.
