package com.dyzzy.aetheris.ui.components

import android.content.Context
import android.webkit.JavascriptInterface
import org.json.JSONObject

class NativeXRBridge(
    private val context: Context,
    private val onAnchorToLoftRequested: () -> Unit
) {

    @JavascriptInterface
    fun requestLoftAnchor() {
        // Trigger spatial anchor lock via Jetpack XR Anchor APIs
        onAnchorToLoftRequested()
    }

    @JavascriptInterface
    fun getHandTelemetry(): String {
        // Expose high-frequency hand/joint vectors if requested by WebGL layer
        val telemetry = JSONObject().apply {
            put("leftHandActive", true)
            put("rightHandActive", true)
            put("timestamp", System.currentTimeMillis())
        }
        return telemetry.toString()
    }

    @JavascriptInterface
    fun logNative(message: String) {
        android.util.Log.d("GrimoireJSBridge", message)
    }
}
