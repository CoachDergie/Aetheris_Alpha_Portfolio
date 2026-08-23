package com.dyzzy.aetheris

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import com.dyzzy.aetheris.ui.components.NativeXRBridge
import com.dyzzy.aetheris.ui.components.GrimoireWebView

/**
 * Primary entry point.
 * We have pivoted from Jetpack XR to the Meta Spatial SDK (or baseline 2D panel as a fallback).
 */
class MainActivity : ComponentActivity() {
    private lateinit var xrBridge: NativeXRBridge

    // Request necessary permissions including location for Zenith math.
    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            permissions.entries.forEach {
                Log.d("Aetheris", "${it.key} granted: ${it.value}")
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        requestPermissions()

        xrBridge = NativeXRBridge(
            context = this,
            onAnchorToLoftRequested = {
                Log.d("Aetheris", "Spatial Anchor Requested via Meta SDK")
                // Phase 3 TODO: Call Meta's Passthrough/Anchor APIs here
            },
            onAnchorModeChanged = { mode ->
                Log.d("Aetheris", "Changing Meta Anchor Mode to: $mode")
                when (mode) {
                    "room" -> {
                        // Phase 3 TODO: Enable Meta Passthrough Utility
                        Log.d("Aetheris", "Enabling physical room passthrough via Meta SDK")
                    }
                    "loft" -> {
                        // Phase 3 TODO: Disable Passthrough, load standard Meta Home environment
                        Log.d("Aetheris", "Reverting to default Meta environment")
                    }
                    "celestial_zenith" -> {
                        // Phase 3 TODO: Spawn 3D Skybox / Space Environment using Scene APIs
                        Log.d("Aetheris", "Loading 3D space skybox environment")
                    }
                }
            }
        )

        setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF070913))
            ) {
                // The main 2D UI Panel.
                // In a full Meta Spatial SDK setup, this is registered as a Panel and spawned in 3D space.
                GrimoireWebView(
                    xrBridge = xrBridge,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }

    private fun requestPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
        }
        
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }

        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }
}
