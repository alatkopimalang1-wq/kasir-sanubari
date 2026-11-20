package id.co.sanubari.pos;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.Settings;
import android.util.Base64;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private static final String POS_URL = "https://sanubariroastery.co.id/pos";
    private static final String PREFS_NAME = "SanubariPosBluetoothPrefs";
    private static final String PREF_BT_ADDRESS = "saved_bt_address";
    private static final String PREF_BT_NAME = "saved_bt_name";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private static final int REQ_BT_PERMISSIONS = 2001;

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ValueCallback<Uri[]> fileUploadCallback;

    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket activeSocket;
    private String activeConnectedAddress = null;
    private boolean pendingScanAfterPermission = false;
    private boolean receiverRegistered = false;
    private final Map<String, BluetoothDevice> discoveredDevices = new LinkedHashMap<>();
    private final ExecutorService btExecutor = Executors.newSingleThreadExecutor();

    private final ActivityResultLauncher<Intent> fileChooserLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                if (fileUploadCallback == null) return;
                Uri[] results = null;
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    if (result.getData().getClipData() != null) {
                        int count = result.getData().getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = result.getData().getClipData().getItemAt(i).getUri();
                        }
                    } else if (result.getData().getData() != null) {
                        results = new Uri[]{result.getData().getData()};
                    }
                }
                fileUploadCallback.onReceiveValue(results);
                fileUploadCallback = null;
            });

    private final ActivityResultLauncher<Intent> enableBluetoothLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                boolean enabled = bluetoothAdapter != null && bluetoothAdapter.isEnabled();
                try {
                    JSONObject obj = new JSONObject();
                    obj.put("enabled", enabled);
                    dispatchJsEvent("sanubari-bt-state-changed", obj.toString());
                } catch (Exception ignored) {
                }
                if (enabled && pendingScanAfterPermission) {
                    pendingScanAfterPermission = false;
                    startBluetoothDiscoveryInternal();
                }
            });

    private final BroadcastReceiver bluetoothReceiver = new BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent == null || intent.getAction() == null) return;
            String action = intent.getAction();

            try {
                if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                    BluetoothDevice device;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice.class);
                    } else {
                        device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                    }
                    if (device != null && device.getAddress() != null) {
                        synchronized (discoveredDevices) {
                            discoveredDevices.put(device.getAddress(), device);
                        }
                        JSONObject devJson = deviceToJson(device);
                        if (devJson != null) {
                            dispatchJsEvent("sanubari-bt-device-found", devJson.toString());
                        }
                    }
                } else if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
                    JSONObject obj = new JSONObject();
                    obj.put("discovering", true);
                    dispatchJsEvent("sanubari-bt-discovery-state", obj.toString());
                } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                    JSONObject obj = new JSONObject();
                    obj.put("discovering", false);
                    dispatchJsEvent("sanubari-bt-discovery-state", obj.toString());
                } else if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
                    BluetoothDevice device;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice.class);
                    } else {
                        device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                    }
                    if (device != null) {
                        JSONObject devJson = deviceToJson(device);
                        if (devJson != null) {
                            dispatchJsEvent("sanubari-bt-bond-changed", devJson.toString());
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }
    };

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        if (cm == null) return false;
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnected();
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        BluetoothManager btManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        if (btManager != null) {
            bluetoothAdapter = btManager.getAdapter();
        } else {
            bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        }

        registerBluetoothReceiver();

        swipeRefresh = findViewById(R.id.swipe_refresh);
        webView = findViewById(R.id.web_view);

        // Hardware Acceleration & Smooth Scroll Optimization
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setOverScrollMode(View.OVER_SCROLL_IF_CONTENT_SCROLLS);

        // Cookies management across sessions (persistent storage)
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Aggressive Caching for Instant Startup & Offline Resilience
        if (isNetworkAvailable()) {
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        } else {
            settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        // Custom User-Agent identifying modern Sanubari POS Android v2.0 with Native Bluetooth
        String customUA = settings.getUserAgentString() + " SanubariPOS-Android/2.0";
        settings.setUserAgentString(customUA);

        // Expose Native Android Bluetooth & Print Bridge to JavaScript
        webView.addJavascriptInterface(new PosBluetoothBridge(), "SanubariAndroidBluetooth");

        // WebChromeClient with File Chooser Support
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    fileChooserLauncher.launch(intent);
                } catch (Exception e) {
                    fileUploadCallback = null;
                    return false;
                }
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri == null) return false;
                String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase(Locale.ROOT) : "";
                String host = uri.getHost() != null ? uri.getHost().toLowerCase(Locale.ROOT) : "";

                // Handle WhatsApp, RawBT, Tel, Mailto, Intent links natively
                if ("whatsapp".equals(scheme)
                        || "rawbt".equals(scheme)
                        || "tel".equals(scheme)
                        || "mailto".equals(scheme)
                        || "intent".equals(scheme)
                        || host.contains("wa.me")
                        || host.contains("api.whatsapp.com")) {
                    try {
                        Intent externalIntent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(externalIntent);
                    } catch (Exception ignored) {
                    }
                    return true;
                }

                // Open direct APK download links in system browser/downloader
                if (uri.getPath() != null && uri.getPath().contains("/pos/download-apk")) {
                    try {
                        Intent downloadIntent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(downloadIntent);
                        return true;
                    } catch (Exception ignored) {
                    }
                }

                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefresh.setRefreshing(false);
                CookieManager.getInstance().flush();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                swipeRefresh.setRefreshing(false);
                if (request.isForMainFrame()) {
                    view.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
                    view.loadUrl(request.getUrl().toString());
                }
            }
        });

        // Disable pull-to-refresh gesture so scrolling inside POS never hijacks touch or reloads the app.
        swipeRefresh.setEnabled(false);
        swipeRefresh.setOnChildScrollUpCallback((parent, child) -> true);
        swipeRefresh.setColorSchemeResources(R.color.brand_amber);

        if (savedInstanceState == null) {
            webView.loadUrl(POS_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void registerBluetoothReceiver() {
        if (receiverRegistered) return;
        try {
            IntentFilter filter = new IntentFilter();
            filter.addAction(BluetoothDevice.ACTION_FOUND);
            filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
            filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
            filter.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(bluetoothReceiver, filter, Context.RECEIVER_EXPORTED);
            } else {
                registerReceiver(bluetoothReceiver, filter);
            }
            receiverRegistered = true;
        } catch (Exception ignored) {
        }
    }

    private boolean hasBluetoothPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
                    && ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED;
        } else {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        }
    }

    private void requestBluetoothPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{
                            Manifest.permission.BLUETOOTH_CONNECT,
                            Manifest.permission.BLUETOOTH_SCAN
                    },
                    REQ_BT_PERMISSIONS
            );
        } else {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    },
                    REQ_BT_PERMISSIONS
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_BT_PERMISSIONS) {
            boolean granted = hasBluetoothPermissions();
            try {
                JSONObject obj = new JSONObject();
                obj.put("granted", granted);
                dispatchJsEvent("sanubari-bt-permission-changed", obj.toString());
            } catch (Exception ignored) {
            }
            if (granted && pendingScanAfterPermission) {
                pendingScanAfterPermission = false;
                startBluetoothDiscoveryInternal();
            }
        }
    }

    @SuppressLint("MissingPermission")
    private void startBluetoothDiscoveryInternal() {
        if (bluetoothAdapter == null) return;
        if (!hasBluetoothPermissions()) {
            pendingScanAfterPermission = true;
            requestBluetoothPermissions();
            return;
        }
        if (!bluetoothAdapter.isEnabled()) {
            pendingScanAfterPermission = true;
            try {
                Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                enableBluetoothLauncher.launch(enableBtIntent);
            } catch (Exception ignored) {
            }
            return;
        }
        try {
            if (bluetoothAdapter.isDiscovering()) {
                bluetoothAdapter.cancelDiscovery();
            }
            bluetoothAdapter.startDiscovery();
        } catch (Exception ignored) {
        }
    }

    @SuppressLint("MissingPermission")
    private JSONObject deviceToJson(BluetoothDevice device) {
        if (device == null) return null;
        try {
            String address = device.getAddress();
            if (address == null) return null;

            String name = null;
            try {
                name = device.getName();
            } catch (SecurityException ignored) {
            }
            if (name == null || name.trim().isEmpty()) {
                name = "Perangkat Bluetooth (" + address + ")";
            }

            boolean bonded = false;
            try {
                bonded = device.getBondState() == BluetoothDevice.BOND_BONDED;
            } catch (SecurityException ignored) {
            }

            boolean isPrinter = isLikelyPrinter(device, name);
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String savedAddr = prefs.getString(PREF_BT_ADDRESS, "");
            boolean isConnected = address.equalsIgnoreCase(activeConnectedAddress)
                    || (!savedAddr.isEmpty() && address.equalsIgnoreCase(savedAddr));

            JSONObject obj = new JSONObject();
            obj.put("name", name);
            obj.put("address", address);
            obj.put("bonded", bonded);
            obj.put("isPrinter", isPrinter);
            obj.put("connected", isConnected);
            obj.put("source", "android-native");
            return obj;
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressLint("MissingPermission")
    private boolean isLikelyPrinter(BluetoothDevice device, String name) {
        try {
            BluetoothClass btClass = device.getBluetoothClass();
            if (btClass != null) {
                int major = btClass.getMajorDeviceClass();
                if (major == BluetoothClass.Device.Major.IMAGING
                        || major == BluetoothClass.Device.Major.UNCATEGORIZED) {
                    return true;
                }
            }
        } catch (Exception ignored) {
        }
        String lower = (name != null ? name : "").toLowerCase(Locale.ROOT);
        return lower.contains("print")
                || lower.contains("pos")
                || lower.contains("rpp")
                || lower.contains("mtp")
                || lower.contains("mpt")
                || lower.contains("thermal")
                || lower.contains("eppos")
                || lower.contains("vsc")
                || lower.contains("panda")
                || lower.contains("blueprint")
                || lower.contains("xprinter")
                || lower.contains("iware")
                || lower.contains("codesoft")
                || lower.contains("58")
                || lower.contains("80")
                || lower.contains("bt-")
                || lower.contains("spp")
                || lower.contains("zj-")
                || lower.contains("xp-")
                || lower.contains("gp-")
                || lower.contains("pt-")
                || lower.contains("tm-");
    }

    @SuppressLint("MissingPermission")
    private BluetoothSocket openRfcommSocketWithFallback(BluetoothDevice device) throws IOException {
        IOException lastException;
        // 1. Standard Secure RFCOMM SPP
        try {
            BluetoothSocket socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            socket.connect();
            return socket;
        } catch (IOException e1) {
            lastException = e1;
        }

        // 2. Insecure RFCOMM SPP (common on portable thermal printers)
        try {
            BluetoothSocket socket = device.createInsecureRfcommSocketToServiceRecord(SPP_UUID);
            socket.connect();
            return socket;
        } catch (IOException e2) {
            lastException = e2;
        }

        // 3. Reflection RFCOMM Channel 1 Fallback
        try {
            Method m = device.getClass().getMethod("createRfcommSocket", int.class);
            BluetoothSocket socket = (BluetoothSocket) m.invoke(device, 1);
            if (socket != null) {
                socket.connect();
                return socket;
            }
        } catch (Exception e3) {
            if (e3 instanceof IOException) {
                lastException = (IOException) e3;
            }
        }

        throw lastException;
    }

    private void closeActiveSocket() {
        if (activeSocket != null) {
            try {
                activeSocket.close();
            } catch (Exception ignored) {
            }
            activeSocket = null;
        }
        activeConnectedAddress = null;
    }

    private void dispatchJsEvent(final String eventName, final String jsonDetail) {
        runOnUiThread(() -> {
            if (webView == null) return;
            String safeDetail = (jsonDetail != null && !jsonDetail.isEmpty()) ? jsonDetail : "{}";
            String js = "window.dispatchEvent(new CustomEvent('" + eventName + "', { detail: " + safeDetail + " }));";
            webView.evaluateJavascript(js, null);
        });
    }

    public class PosBluetoothBridge {

        @JavascriptInterface
        public boolean isNativeAvailable() {
            return true;
        }

        @JavascriptInterface
        public String getStatus() {
            try {
                SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                String savedAddr = prefs.getString(PREF_BT_ADDRESS, "");
                String savedName = prefs.getString(PREF_BT_NAME, "");
                boolean hasPerm = hasBluetoothPermissions();
                boolean supported = bluetoothAdapter != null;
                boolean enabled = false;
                boolean discovering = false;
                if (supported && hasPerm) {
                    try {
                        enabled = bluetoothAdapter.isEnabled();
                        discovering = bluetoothAdapter.isDiscovering();
                    } catch (SecurityException ignored) {
                    }
                }

                JSONObject obj = new JSONObject();
                obj.put("available", true);
                obj.put("supported", supported);
                obj.put("enabled", enabled);
                obj.put("hasPermission", hasPerm);
                obj.put("discovering", discovering);
                obj.put("savedAddress", savedAddr);
                obj.put("savedName", savedName);
                obj.put("connectedAddress", activeConnectedAddress != null ? activeConnectedAddress : savedAddr);
                return obj.toString();
            } catch (Exception e) {
                return "{\"available\":true,\"supported\":false}";
            }
        }

        @SuppressLint("MissingPermission")
        @JavascriptInterface
        public String getDevices() {
            JSONArray array = new JSONArray();
            if (bluetoothAdapter == null) return array.toString();

            if (!hasBluetoothPermissions()) {
                runOnUiThread(MainActivity.this::requestBluetoothPermissions);
                return array.toString();
            }

            if (!bluetoothAdapter.isEnabled()) {
                runOnUiThread(() -> {
                    try {
                        Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                        enableBluetoothLauncher.launch(enableBtIntent);
                    } catch (Exception ignored) {
                    }
                });
                return array.toString();
            }

            Map<String, BluetoothDevice> allDevices = new LinkedHashMap<>();
            try {
                Set<BluetoothDevice> bonded = bluetoothAdapter.getBondedDevices();
                if (bonded != null) {
                    for (BluetoothDevice d : bonded) {
                        if (d != null && d.getAddress() != null) {
                            allDevices.put(d.getAddress(), d);
                        }
                    }
                }
            } catch (SecurityException ignored) {
            }

            synchronized (discoveredDevices) {
                for (Map.Entry<String, BluetoothDevice> entry : discoveredDevices.entrySet()) {
                    if (!allDevices.containsKey(entry.getKey())) {
                        allDevices.put(entry.getKey(), entry.getValue());
                    }
                }
            }

            for (BluetoothDevice device : allDevices.values()) {
                JSONObject devObj = deviceToJson(device);
                if (devObj != null) {
                    array.put(devObj);
                }
            }

            return array.toString();
        }

        @JavascriptInterface
        public String startScan() {
            runOnUiThread(MainActivity.this::startBluetoothDiscoveryInternal);
            return "{\"started\":true}";
        }

        @SuppressLint("MissingPermission")
        @JavascriptInterface
        public void stopScan() {
            runOnUiThread(() -> {
                try {
                    if (bluetoothAdapter != null && hasBluetoothPermissions() && bluetoothAdapter.isDiscovering()) {
                        bluetoothAdapter.cancelDiscovery();
                    }
                } catch (Exception ignored) {
                }
            });
        }

        @SuppressLint("MissingPermission")
        @JavascriptInterface
        public void connectDevice(final String address) {
            btExecutor.execute(() -> {
                try {
                    if (bluetoothAdapter == null) {
                        JSONObject err = new JSONObject();
                        err.put("success", false);
                        err.put("message", "Perangkat Android ini tidak memiliki modul Bluetooth.");
                        dispatchJsEvent("sanubari-bt-connect-result", err.toString());
                        return;
                    }

                    if (!hasBluetoothPermissions()) {
                        runOnUiThread(MainActivity.this::requestBluetoothPermissions);
                        JSONObject err = new JSONObject();
                        err.put("success", false);
                        err.put("message", "Izin Bluetooth diperlukan. Silakan klik Izinkan pada pop-up Android.");
                        dispatchJsEvent("sanubari-bt-connect-result", err.toString());
                        return;
                    }

                    if (bluetoothAdapter.isDiscovering()) {
                        bluetoothAdapter.cancelDiscovery();
                    }

                    BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
                    String deviceName = device.getName();
                    if (deviceName == null || deviceName.trim().isEmpty()) {
                        deviceName = "Printer Bluetooth (" + address + ")";
                    }

                    if (device.getBondState() == BluetoothDevice.BOND_NONE) {
                        try {
                            device.createBond();
                            // Wait briefly for bonding prompt if needed
                            Thread.sleep(1500);
                        } catch (Exception ignored) {
                        }
                    }

                    closeActiveSocket();
                    BluetoothSocket socket = openRfcommSocketWithFallback(device);
                    activeSocket = socket;
                    activeConnectedAddress = address;

                    SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                    prefs.edit()
                            .putString(PREF_BT_ADDRESS, address)
                            .putString(PREF_BT_NAME, deviceName)
                            .apply();

                    JSONObject res = new JSONObject();
                    res.put("success", true);
                    res.put("address", address);
                    res.put("name", deviceName);
                    res.put("message", "Berhasil terhubung ke " + deviceName);
                    dispatchJsEvent("sanubari-bt-connect-result", res.toString());
                } catch (Exception e) {
                    try {
                        JSONObject err = new JSONObject();
                        err.put("success", false);
                        err.put("address", address);
                        err.put("message", "Gagal menghubungkan ke printer (" + (e.getMessage() != null ? e.getMessage() : "Koneksi ditolak") + "). Pastikan printer Bluetooth menyala, kertas terpasang, dan tidak sedang terhubung ke HP lain.");
                        dispatchJsEvent("sanubari-bt-connect-result", err.toString());
                    } catch (Exception ignored) {
                    }
                }
            });
        }

        @JavascriptInterface
        public void disconnectDevice() {
            btExecutor.execute(() -> {
                closeActiveSocket();
                SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                prefs.edit().remove(PREF_BT_ADDRESS).remove(PREF_BT_NAME).apply();
                try {
                    JSONObject res = new JSONObject();
                    res.put("success", true);
                    res.put("disconnected", true);
                    res.put("message", "Koneksi printer Bluetooth diputuskan.");
                    dispatchJsEvent("sanubari-bt-connect-result", res.toString());
                } catch (Exception ignored) {
                }
            });
        }

        @SuppressLint("MissingPermission")
        @JavascriptInterface
        public void printEscPosBase64(final String base64Data, final String targetAddress, final int copies) {
            btExecutor.execute(() -> {
                try {
                    if (bluetoothAdapter == null) {
                        JSONObject err = new JSONObject();
                        err.put("success", false);
                        err.put("message", "Bluetooth tidak tersedia di perangkat ini.");
                        dispatchJsEvent("sanubari-bt-print-result", err.toString());
                        return;
                    }

                    if (!hasBluetoothPermissions()) {
                        runOnUiThread(MainActivity.this::requestBluetoothPermissions);
                        JSONObject err = new JSONObject();
                        err.put("success", false);
                        err.put("message", "Izin Bluetooth belum diberikan.");
                        dispatchJsEvent("sanubari-bt-print-result", err.toString());
                        return;
                    }

                    SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                    String address = (targetAddress != null && !targetAddress.trim().isEmpty())
                            ? targetAddress.trim()
                            : prefs.getString(PREF_BT_ADDRESS, "");

                    if (address.isEmpty()) {
                        JSONObject err = new JSONObject();
                        err.put("success", false);
                        err.put("needSelectPrinter", true);
                        err.put("message", "Belum ada printer Bluetooth yang dipilih.");
                        dispatchJsEvent("sanubari-bt-print-result", err.toString());
                        return;
                    }

                    if (bluetoothAdapter.isDiscovering()) {
                        bluetoothAdapter.cancelDiscovery();
                    }

                    BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
                    String deviceName = device.getName();
                    if (deviceName == null || deviceName.trim().isEmpty()) {
                        deviceName = prefs.getString(PREF_BT_NAME, "Printer Bluetooth");
                    }

                    byte[] payload = Base64.decode(base64Data, Base64.DEFAULT);
                    int printCopies = Math.max(1, copies);

                    // Ensure active socket is connected to this printer
                    if (activeSocket == null || !activeSocket.isConnected() || !address.equalsIgnoreCase(activeConnectedAddress)) {
                        closeActiveSocket();
                        activeSocket = openRfcommSocketWithFallback(device);
                        activeConnectedAddress = address;
                    }

                    OutputStream out;
                    try {
                        out = activeSocket.getOutputStream();
                        // Test write 2-byte init command to verify socket is alive
                        out.write(new byte[]{0x1B, 0x40});
                        out.flush();
                    } catch (IOException staleSocketErr) {
                        // Reconnect if socket went stale while printer was idle
                        closeActiveSocket();
                        activeSocket = openRfcommSocketWithFallback(device);
                        activeConnectedAddress = address;
                        out = activeSocket.getOutputStream();
                    }

                    int chunkSize = 256;
                    for (int c = 0; c < printCopies; c++) {
                        for (int i = 0; i < payload.length; i += chunkSize) {
                            int len = Math.min(chunkSize, payload.length - i);
                            out.write(payload, i, len);
                            out.flush();
                            Thread.sleep(15);
                        }
                        if (c < printCopies - 1) {
                            Thread.sleep(450);
                        }
                    }

                    Thread.sleep(250);

                    prefs.edit()
                            .putString(PREF_BT_ADDRESS, address)
                            .putString(PREF_BT_NAME, deviceName)
                            .apply();

                    JSONObject res = new JSONObject();
                    res.put("success", true);
                    res.put("address", address);
                    res.put("name", deviceName);
                    res.put("message", "Struk berhasil dicetak ke " + deviceName);
                    dispatchJsEvent("sanubari-bt-print-result", res.toString());
                } catch (Exception e) {
                    closeActiveSocket();
                    try {
                        JSONObject err = new JSONObject();
                        err.put("success", false);
                        err.put("message", "Gagal mencetak ke printer Bluetooth: " + (e.getMessage() != null ? e.getMessage() : "Koneksi terputus"));
                        dispatchJsEvent("sanubari-bt-print-result", err.toString());
                    } catch (Exception ignored) {
                    }
                }
            });
        }

        @JavascriptInterface
        public void openBluetoothSettings() {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
                    startActivity(intent);
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void printSystemWebView(final String jobName) {
            runOnUiThread(() -> {
                try {
                    PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (printManager != null && webView != null) {
                        String name = (jobName != null && !jobName.isEmpty()) ? jobName : "Sanubari_POS_Receipt";
                        PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(name);
                        printManager.print(name, adapter, new PrintAttributes.Builder().build());
                    }
                } catch (Exception ignored) {
                }
            });
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (receiverRegistered) {
            try {
                unregisterReceiver(bluetoothReceiver);
            } catch (Exception ignored) {
            }
            receiverRegistered = false;
        }
        closeActiveSocket();
        btExecutor.shutdownNow();
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
