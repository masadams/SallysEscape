# Sally's Escape for Android

One app for phones, tablets and Android TV (it shows on the NVIDIA Shield's home screen). It is the
web game in `public/`, shown full screen.

## How it plays and updates

- The app opens the game at `https://savesally.masonrobert.com/`, so progress is saved in one place,
  online or not. Every game file comes from the copy on the device; only `/api/` calls (community
  levels, play data) go to the server.
- On each launch it reads the server's `version.json`. If the version is new it downloads every file
  it lists into a staging folder in the background and, once all have arrived, uses that version from
  the next launch ("Sally's Escape has updated. Restart the app to play the new version."). A download
  that fails part-way is thrown away.
- Offline it plays the newest version it has downloaded; on a device that has never been online, the
  copy built into the APK.
- So a new APK is only needed when the app itself changes, not for every game update.
- Back on a remote, phone or controller goes back one step in the game (as Escape does); at the main
  menu it asks once, and a second Back closes the app. The title also has a Quit button. A controller's
  buttons reach the game as a gamepad.
- A page may only start sound after a press, and controller buttons don't count as one, so the app
  turns the first controller press on a page into a key press the game ignores (F12). That is what
  lets sound play on a TV played with only a controller.
- On a TV the game draws at 1× and uses the big-screen layout; Extras → Credits shows the version,
  whether sound is running, the screen size and the frame rate, to help when something is off.

## Safety

HTTPS only (no plain-HTTP traffic), only `savesally.masonrobert.com` is fetched or served, links to
anywhere else open in the browser, the page has no bridge into Android, no file access, and the app
asks only for internet access. File names from the server are checked before anything is written.

## Releases

A signed APK is built only for a release. On GitHub open **Actions → Android app → Run workflow**,
pick `main`, enter a version such as `1.0` and run it (or push a tag: `git tag v1.0 && git push origin v1.0`).
The workflow builds the APK, tags main `v1.0` and attaches `SallysEscape-1.0.apk` to a GitHub release.
Pull requests that touch `android/` get an unsigned test build (downloadable from the run's
artifacts) so the app is known to compile.

### The signing key (one-time setup)

Android only installs an update over an existing install when both are signed with the same key, so
the key must be kept and backed up: if it is lost, the app has to be uninstalled (losing that
device's saves) before a newly signed one installs. Store these repository secrets
(Settings → Secrets and variables → Actions):

- `ANDROID_KEYSTORE_BASE64`: the keystore file, base64 encoded (`base64 -w0 sallysescape.jks`)
- `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`

To make a key: `keytool -genkeypair -v -keystore sallysescape.jks -alias sally -keyalg RSA -keysize 4096 -validity 10000`

## Installing on the Shield

Open the release on the Shield (or a phone) with the free **Downloader** app, or send the APK with
**Send Files to TV**, then allow installing from that app when Android asks. Updates install over the
top and keep your progress.
