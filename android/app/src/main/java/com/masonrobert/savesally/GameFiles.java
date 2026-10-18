package com.masonrobert.savesally;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.WebResourceResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * The game's files on the device. Each launch serves one version throughout: the newest one
 * downloaded, or the copy built into the APK. In the background it reads version.json from the
 * server and, when the version is new, downloads every file it lists into a staging folder, then
 * makes that folder the version for the next launch. A download that fails part-way is never used.
 */
final class GameFiles {
    private static final Pattern SAFE_NAME = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]*(/[A-Za-z0-9][A-Za-z0-9._-]*)*");
    private static final int MAX_FILES = 400;
    private static final long MAX_BYTES = 60L * 1024 * 1024;

    private final Context context;
    private final SharedPreferences prefs;
    private final File root;
    /** The downloaded version this launch serves, or null for the copy built into the APK. */
    private final File session;

    GameFiles(Context context) {
        this.context = context;
        this.prefs = context.getSharedPreferences("game", Context.MODE_PRIVATE);
        this.root = new File(context.getFilesDir(), "game");
        String current = prefs.getString("dir", null);
        File dir = current == null ? null : new File(root, current);
        this.session = dir != null && new File(dir, "index.html").isFile() ? dir : null;
        // Older versions are only removed at launch, never while a session might still read them.
        File[] old = root.listFiles();
        if (old != null) for (File f : old) if (session == null || !f.getName().equals(session.getName())) deleteTree(f);
    }

    /** The response for a game file, or null to let the request go to the server as usual. */
    WebResourceResponse serve(String path) {
        if (path == null || path.isEmpty() || path.equals("/")) path = "/index.html";
        if (path.startsWith("/api/") || path.equals("/healthz") || path.equals("/version.json")) return null;
        String name = path.substring(1);
        if (!SAFE_NAME.matcher(name).matches() || name.contains("..")) return null;
        InputStream in = null;
        try {
            if (session != null) {
                File f = new File(session, name);
                if (f.isFile()) in = new FileInputStream(f);
            }
            if (in == null) in = context.getAssets().open("www/" + name);
        } catch (IOException e) {
            return null;
        }
        String mime = mimeOf(name);
        return new WebResourceResponse(mime, mime.startsWith("text/") || mime.endsWith("javascript") || mime.endsWith("json") ? "utf-8" : null, in);
    }

    /** Checks the server for a newer version and downloads it; calls ready once it is in place. */
    void checkForUpdate(Runnable ready) {
        Thread t = new Thread(() -> {
            try {
                JSONObject latest = new JSONObject(new String(fetch("version.json"), StandardCharsets.UTF_8));
                String version = latest.getString("version");
                if (version.equals(currentVersion())) return;
                JSONArray list = latest.getJSONArray("files");
                if (list.length() == 0 || list.length() > MAX_FILES) return;
                for (int i = 0; i < list.length(); i++) {
                    String name = list.getString(i);
                    if (!SAFE_NAME.matcher(name).matches() || name.contains("..")) return;
                }
                File staging = new File(root, "staging");
                deleteTree(staging);
                long total = 0;
                for (int i = 0; i < list.length(); i++) {
                    String name = list.getString(i);
                    byte[] body = fetch(name);
                    total += body.length;
                    if (total > MAX_BYTES) { deleteTree(staging); return; }
                    write(new File(staging, name), body);
                }
                write(new File(staging, "version.json"), latest.toString().getBytes(StandardCharsets.UTF_8));
                if (!new File(staging, "index.html").isFile()) { deleteTree(staging); return; }
                String dirName = "v" + Integer.toHexString(version.hashCode()) + "-" + System.currentTimeMillis();
                File target = new File(root, dirName);
                if (!staging.renameTo(target)) { deleteTree(staging); return; }
                prefs.edit().putString("dir", dirName).putString("version", version).apply();
                ready.run();
            } catch (Exception ignored) {
                // Offline, or the server is down: keep playing the version already on the device.
            }
        }, "game-update");
        t.setDaemon(true);
        t.start();
    }

    /** The version this device will play next launch: the newest download, or the APK's own copy. */
    private String currentVersion() {
        String saved = prefs.getString("version", null);
        if (saved != null && prefs.getString("dir", null) != null && new File(root, prefs.getString("dir", "")).isDirectory()) return saved;
        try (InputStream in = context.getAssets().open("www/version.json")) {
            return new JSONObject(new String(readAll(in), StandardCharsets.UTF_8)).getString("version");
        } catch (Exception e) {
            return "";
        }
    }

    private static byte[] fetch(String name) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(MainActivity.HOME + name).openConnection();
        c.setConnectTimeout(8000);
        c.setReadTimeout(20000);
        c.setInstanceFollowRedirects(false);
        c.setUseCaches(false);
        c.setRequestProperty("Cache-Control", "no-cache");
        try {
            if (c.getResponseCode() != 200) throw new IOException("HTTP " + c.getResponseCode() + " for " + name);
            try (InputStream in = c.getInputStream()) { return readAll(in); }
        } finally {
            c.disconnect();
        }
    }

    private static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[16384];
        int n;
        while ((n = in.read(buf)) > 0) {
            out.write(buf, 0, n);
            if (out.size() > MAX_BYTES) throw new IOException("too large");
        }
        return out.toByteArray();
    }

    private static void write(File file, byte[] body) throws IOException {
        File parent = file.getParentFile();
        if (parent != null && !parent.isDirectory() && !parent.mkdirs()) throw new IOException("mkdir " + parent);
        try (OutputStream out = new FileOutputStream(file)) { out.write(body); }
    }

    private static void deleteTree(File f) {
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteTree(k);
        //noinspection ResultOfMethodCallIgnored
        f.delete();
    }

    private static String mimeOf(String name) {
        String n = name.toLowerCase();
        if (n.endsWith(".html")) return "text/html";
        if (n.endsWith(".js")) return "text/javascript";
        if (n.endsWith(".css")) return "text/css";
        if (n.endsWith(".json")) return "application/json";
        if (n.endsWith(".svg")) return "image/svg+xml";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
        if (n.endsWith(".webp")) return "image/webp";
        if (n.endsWith(".mp3")) return "audio/mpeg";
        if (n.endsWith(".ogg")) return "audio/ogg";
        if (n.endsWith(".wav")) return "audio/wav";
        if (n.endsWith(".txt") || n.endsWith(".md")) return "text/plain";
        return "application/octet-stream";
    }
}
