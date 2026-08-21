package com.dyzzy.aetheris.ui.components

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.xr.compose.spatial.SpatialPanel
import androidx.xr.compose.subspace.layout.SubspaceModifier
import androidx.xr.compose.subspace.layout.height
import androidx.xr.compose.subspace.layout.width
import androidx.compose.ui.unit.dp

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GrimoireWebView(xrBridge: NativeXRBridge, modifier: Modifier = Modifier) {
    AndroidView(
        modifier = modifier,
        factory = { context ->
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true // Required for journal localStorage persistence
                    allowFileAccess = true
                    allowContentAccess = true
                    allowFileAccessFromFileURLs = true
                    allowUniversalAccessFromFileURLs = true
                    databaseEnabled = true
                    cacheMode = WebSettings.LOAD_NO_CACHE // Prevent stale UI caching during dev
                    mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                }

                // Register Native-to-JS Interface
                addJavascriptInterface(xrBridge, "AndroidXR")

                // Load compiled React entrypoint
                loadUrl("file:///android_asset/grimoire_ui/index.html")
            }
        },
        update = { webView ->
            // Live state updates pushed to JS execution context
        }
    )
}

@Composable
fun GrimoireSpatialPanel(
    modifier: SubspaceModifier = SubspaceModifier.width(1280.dp).height(720.dp),
    xrBridge: NativeXRBridge
) {
    SpatialPanel(modifier = modifier) {
        GrimoireWebView(xrBridge = xrBridge)
    }
}
