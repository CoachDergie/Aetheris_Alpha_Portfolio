package com.dyzzy.aetheris.ui.components

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.DownloadListener
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.util.Base64
import java.io.File
import java.io.FileOutputStream
import android.widget.Toast
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

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
                    loadWithOverviewMode = true
                    useWideViewPort = true
                }
                
                setDownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
                    try {
                        if (url.startsWith("data:")) {
                            val base64 = url.substring(url.indexOf(",") + 1)
                            val fileData = Base64.decode(base64, Base64.DEFAULT)
                            val path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                            val file = File(path, "Aetheris_Dossier_" + System.currentTimeMillis() + ".pdf")
                            val os = FileOutputStream(file)
                            os.write(fileData)
                            os.close()
                            Toast.makeText(context, "Dossier exported to Downloads", Toast.LENGTH_LONG).show()
                        } else {
                            val i = Intent(Intent.ACTION_VIEW)
                            i.data = Uri.parse(url)
                            context.startActivity(i)
                        }
                    } catch (e: Exception) {
                        Toast.makeText(context, "Export failed: " + e.message, Toast.LENGTH_SHORT).show()
                    }
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
