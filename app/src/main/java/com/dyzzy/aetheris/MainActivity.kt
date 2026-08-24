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
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.dyzzy.aetheris.logic.SolarSystemLogic
import com.dyzzy.aetheris.ui.components.NativeXRBridge
import com.dyzzy.aetheris.ui.components.GrimoireWebView
import com.dyzzy.aetheris.ui.components.CelestialRenderer
import com.google.android.filament.utils.Utils

/**
 * Primary entry point.
 * Reverted to ComponentActivity to ensure visibility within the Meta Horizon Home "Loft" environment.
 */
class MainActivity : ComponentActivity() {
    private lateinit var xrBridge: NativeXRBridge

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            permissions.entries.forEach {
                Log.d("Aetheris", "${it.key} granted: ${it.value}")
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Filament once
        Utils.init()
        
        requestPermissions()

        xrBridge = NativeXRBridge(
            context = this,
            onAnchorToLoftRequested = {
                Log.d("Aetheris", "Spatial Anchor Requested in Panel Mode")
            },
            onAnchorModeChanged = { mode ->
                Log.d("Aetheris", "Anchor Mode Changed to: $mode")
            }
        )

        setContent {
            AetherisTheme {
                MainHUD(xrBridge)
            }
        }
    }

    @Composable
    fun MainHUD(xrBridge: NativeXRBridge) {
        val daysSinceEpoch = remember { mutableDoubleStateOf(SolarSystemLogic.getDaysSinceJ2000()) }
        
        LaunchedEffect(Unit) {
            while (true) {
                withFrameNanos {
                    daysSinceEpoch.doubleValue = SolarSystemLogic.getDaysSinceJ2000()
                }
            }
        }

        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFF070913),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(modifier = Modifier.fillMaxSize()) {
                // LEFT PANEL: The Grimoire HUD (WebView)
                Box(
                    modifier = Modifier
                        .weight(1.5f)
                        .fillMaxHeight()
                        .background(Color(0xFF0A0D18))
                ) {
                    GrimoireWebView(
                        xrBridge = xrBridge,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                // RIGHT PANEL: The "Space Window" (Portal into the void)
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .padding(16.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.Transparent) // Make background transparent to show the SurfaceView
                ) {
                    CelestialPortal(daysSinceEpoch.doubleValue)
                }
            }
        }
    }

    @Composable
    fun CelestialPortal(days: Double) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            AndroidView(
                factory = { ctx ->
                    CelestialRenderer(ctx)
                },
                update = { view ->
                    view.days = days
                },
                modifier = Modifier.fillMaxSize()
            )
            
            Text(
                text = "WINDOW INTO SPACE",
                color = Color.White.copy(alpha = 0.4f),
                style = MaterialTheme.typography.labelSmall,
                fontSize = 10.sp,
                modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 8.dp)
            )
        }
    }

    @Composable
    fun AetherisTheme(content: @Composable () -> Unit) {
        MaterialTheme(
            colorScheme = MaterialTheme.colorScheme.copy(
                background = Color(0xFF070913),
                surface = Color(0xFF10121D)
            ),
            content = content
        )
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
