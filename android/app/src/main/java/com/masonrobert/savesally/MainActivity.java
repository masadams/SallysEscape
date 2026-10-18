package com.masonrobert.savesally;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/**
 * The whole app: one full-screen WebView showing the game at its real address, so saves live in one
 * place whether or not the server can be reached. Every game file is served from the copy on the
 * device (the newest one downloaded, or the one built into the APK); only /api/ calls go to the
 * server. The page gets no bridge into Android, and links to anywhere else open in the browser.
 */
public class MainActivity extends Activity {
    static final String HOST = "savesally.masonrobert.com";
    static final String HOME = "https://" + HOST + "/";

    private WebView web;
    private GameFiles files;
    /** Whether this page has had a press that lets it start sound (see dispatchKeyEvent). */
    private boolean pressed;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        files = new GameFiles(this);

        web = new WebView(this);
        web.setBackgroundColor(0xff102c2d);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportMultipleWindows(false);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) { pressed = false; }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if ("https".equals(url.getScheme()) && HOST.equals(url.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, url)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (!"https".equals(url.getScheme()) || !HOST.equals(url.getHost())) return null;
                if (!"GET".equals(request.getMethod())) return null;
                return files.serve(url.getPath());
            }
        });
        setContentView(web);
        hideSystemBars();
        if (state == null) web.loadUrl(HOME); else web.restoreState(state);

        // Look for a newer version in the background; it is used from the next launch.
        files.checkForUpdate(() -> runOnUiThread(() ->
            Toast.makeText(this, "Sally's Escape has updated. Restart the app to play the new version.", Toast.LENGTH_LONG).show()));
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onWindowFocusChanged(boolean focus) {
        super.onWindowFocusChanged(focus);
        if (focus) hideSystemBars();
    }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onDestroy() { web.destroy(); super.onDestroy(); }

    // The page may only start sound after a press, and a controller's buttons reach it as a gamepad,
    // which does not count. So the first controller press on a page also sends the page one key (F12,
    // which the game ignores) as a real press; from then on the game's sound can play.
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        boolean pad = (event.getSource() & (InputDevice.SOURCE_GAMEPAD | InputDevice.SOURCE_JOYSTICK)) != 0;
        if (pad && !pressed && event.getAction() == KeyEvent.ACTION_DOWN) {
            pressed = true;
            long now = android.os.SystemClock.uptimeMillis();
            web.dispatchKeyEvent(new KeyEvent(now, now, KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_F12, 0));
            web.dispatchKeyEvent(new KeyEvent(now, now, KeyEvent.ACTION_UP, KeyEvent.KEYCODE_F12, 0));
        }
        return super.dispatchKeyEvent(event);
    }

    // Back on a TV remote or phone acts like Escape in the game (pause, close a menu, go back) rather
    // than closing the app. A controller's B button already reaches the game as a gamepad button.
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            boolean pad = (event.getSource() & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD;
            if (!pad && event.getRepeatCount() == 0) {
                web.evaluateJavascript("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',keyCode:27,bubbles:true}));"
                    + "document.dispatchEvent(new KeyboardEvent('keyup',{key:'Escape',code:'Escape',keyCode:27,bubbles:true}));", null);
            }
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }
}
