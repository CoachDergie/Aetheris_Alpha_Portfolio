package com.dyzzy.aetheris

import android.os.Bundle
import android.graphics.PixelFormat
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import com.dyzzy.aetheris.logic.SolarSystemLogic
import com.dyzzy.aetheris.ui.components.CelestialRenderer
import com.dyzzy.aetheris.ui.components.CelestialRenderer2D
import com.google.android.filament.utils.Utils

class CelestialActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.setFormat(PixelFormat.OPAQUE)
        window.decorView.setBackgroundColor(android.graphics.Color.rgb(7, 9, 19))
        window.setBackgroundDrawable(
            android.graphics.drawable.ColorDrawable(android.graphics.Color.rgb(7, 9, 19))
        )
        window.decorView.addOnLayoutChangeListener { v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom ->
            val sizeChanged =
                (right - left != oldRight - oldLeft) ||
                    (bottom - top != oldBottom - oldTop)
            if (sizeChanged) {
                Log.d(
                    "AetherisResize",
                    "Celestial decor bounds changed: ${right - left}x${bottom - top} " +
                        "(was ${oldRight - oldLeft}x${oldBottom - oldTop})"
                )
                v.requestLayout()
                v.postInvalidateOnAnimation()
            }
        }
        Utils.init()
        setContent {
            AetherisTheme {
                CelestialHUD()
            }
        }

    }

    override fun onConfigurationChanged(newConfig: android.content.res.Configuration) {
        super.onConfigurationChanged(newConfig)
        Log.d(
            "AetherisResize",
            "Celestial configuration changed: orientation=${newConfig.orientation}, " +
                "screenLayout=${newConfig.screenLayout}, screenWidthDp=${newConfig.screenWidthDp}, " +
                "screenHeightDp=${newConfig.screenHeightDp}, densityDpi=${newConfig.densityDpi}"
        )
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        Log.d(
            "AetherisResize",
            "Celestial window focus=$hasFocus, decor=${window.decorView.width}x${window.decorView.height}"
        )
    }

    @Composable
    fun CelestialHUD() {
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
            color = Color(0xFF070913)
        ) {
            Box(
                modifier = Modifier.fillMaxSize()
            ) {
                // Alpha Launch Fix: Using 2D Renderer for stability
                CelestialRenderer2D(
                    days = daysSinceEpoch.doubleValue,
                    modifier = Modifier.fillMaxSize()
                )

                /* 3D Renderer disabled for Alpha pass
                AndroidView(
                    factory = { ctx ->
                        CelestialRenderer(ctx)
                    },
                    update = { view ->
                        view.days = daysSinceEpoch.doubleValue
                    },
                    modifier = Modifier.fillMaxSize()
                )
                */
                
                Text(
                    text = "WINDOW INTO SPACE (ALPHA 2D)",
                    color = Color.White.copy(alpha = 0.4f),
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 10.sp,
                    modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 8.dp)
                )
            }
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
}
