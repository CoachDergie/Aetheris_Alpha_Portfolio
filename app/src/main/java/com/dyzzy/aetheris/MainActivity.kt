package com.dyzzy.aetheris

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.dyzzy.aetheris.logic.SolarSystemLogic
import com.dyzzy.aetheris.ui.components.NativeXRBridge
import com.dyzzy.aetheris.ui.components.GrimoireWebView

/**
 * Primary entry point.
 * Reverted to ComponentActivity to ensure visibility within the Meta Horizon Home "Loft" environment.
 * The app now renders as a neat dual-panel window (HUD + Space Window).
 */
class MainActivity : ComponentActivity() {
    private lateinit var xrBridge: NativeXRBridge

    // Modern Activity Result API for permissions
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
        val daysSinceEpoch = remember { mutableStateOf(SolarSystemLogic.getDaysSinceJ2000()) }
        
        LaunchedEffect(Unit) {
            while (true) {
                withFrameNanos {
                    // Slow drift: Real-time update
                    daysSinceEpoch.value = SolarSystemLogic.getDaysSinceJ2000()
                }
            }
        }

        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFF070913).copy(alpha = 0.95f),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(modifier = Modifier.fillMaxSize()) {
                // LEFT PANEL: The Grimoire HUD (WebView)
                Box(
                    modifier = Modifier
                        .weight(1.5f)
                        .fillMaxHeight()
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
                        .background(Color.Black)
                ) {
                    CelestialPortal(daysSinceEpoch.value)
                }
            }
        }
    }

    @Composable
    fun CelestialPortal(days: Double) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val center = Offset(size.width / 2, size.height / 2)
                
                // systemScale: Compressed AU scale for the window
                // 1 AU = ~80 pixels in a 720p height window
                val systemScale = size.minDimension / 8f 
                
                // Draw Orbits
                SolarSystemLogic.PLANET_DATA.keys.forEach { name ->
                    if (name == "sun" || name == "earth_moon") return@forEach
                    val elements = SolarSystemLogic.PLANET_DATA[name] ?: return@forEach
                    
                    drawCircle(
                        color = Color.White.copy(alpha = 0.15f),
                        radius = (elements.semiMajorAxisAU * systemScale).toFloat(),
                        center = center,
                        style = Stroke(width = 1f)
                    )
                }

                // Draw Sun
                drawCircle(
                    color = Color(0xFFFFCC33),
                    radius = 12f,
                    center = center
                )

                // Draw Planets using Kepler Math
                SolarSystemLogic.PLANET_DATA.keys.forEach { name ->
                    if (name == "sun" || name == "earth_moon") return@forEach
                    
                    val pos = SolarSystemLogic.calculatePosition(name, days, systemScale.toFloat())
                    
                    // We map pos.x and pos.z to our 2D portal coordinates (Top-down view)
                    drawCircle(
                        color = Color.White,
                        radius = 4f,
                        center = Offset(center.x + pos.x, center.y + pos.z)
                    )
                    
                    // Optional: Label
                    // (Draw logic for text in Canvas is omitted for brevity, 
                    // but we can add small dot markers)
                }
            }
            
            Text(
                text = "WINDOW INTO SPACE",
                color = Color.White.copy(alpha = 0.3f),
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
