package com.dyzzy.aetheris

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.dyzzy.aetheris.ui.components.NativeXRBridge
import com.dyzzy.aetheris.ui.components.GrimoireWebView
import com.meta.spatial.core.Pose
import com.meta.spatial.core.Vector3
import com.meta.spatial.core.Entity
import com.meta.spatial.core.SpatialFeature
import com.meta.spatial.runtime.ReferenceSpace
import com.meta.spatial.toolkit.AppSystemActivity
import com.meta.spatial.toolkit.Mesh
import com.meta.spatial.toolkit.Sphere
import com.meta.spatial.toolkit.Transform
import com.meta.spatial.toolkit.PanelRegistration
import com.meta.spatial.toolkit.UIPanelSettings
import com.meta.spatial.compose.ComposeViewPanelRegistration
import com.meta.spatial.compose.ComposeFeature

/**
 * Primary entry point.
 * We have pivoted from Jetpack XR to the Meta Spatial SDK.
 */
class MainActivity : AppSystemActivity() {
    private lateinit var xrBridge: NativeXRBridge
    private val PERMISSION_REQUEST_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        requestPermissions()

        xrBridge = NativeXRBridge(
            context = this,
            onAnchorToLoftRequested = {
                Log.d("Aetheris", "Spatial Anchor Requested via Meta SDK")
            },
            onAnchorModeChanged = { mode ->
                Log.d("Aetheris", "Changing Meta Anchor Mode to: $mode")
                when (mode) {
                    "room" -> Log.d("Aetheris", "Enabling physical room passthrough via Meta SDK")
                    "loft" -> Log.d("Aetheris", "Reverting to default Meta environment")
                    "celestial_zenith" -> Log.d("Aetheris", "Loading 3D space skybox environment")
                }
            }
        )
    }

    override fun registerFeatures(): List<SpatialFeature> {
        return listOf(ComposeFeature())
    }

    override fun registerPanels(): List<PanelRegistration> {
        return listOf(
            ComposeViewPanelRegistration(
                registrationId = 1,
                composeViewCreator = { _, context ->
                    ComposeView(context).apply {
                        setContent {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(Color(0xFF070913))
                            ) {
                                GrimoireWebView(
                                    xrBridge = xrBridge,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }
                        }
                    }
                },
                settingsCreator = { UIPanelSettings() }
            )
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
            ActivityCompat.requestPermissions(this, permissionsToRequest.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            permissions.forEachIndexed { index, permission ->
                val granted = grantResults[index] == PackageManager.PERMISSION_GRANTED
                Log.d("Aetheris", "$permission granted: $granted")
            }
        }
    }

    override fun onSceneReady() {
        super.onSceneReady() // must be called first
        scene.setReferenceSpace(ReferenceSpace.LOCAL_FLOOR)
        Entity.create(
            listOf(
                Transform(Pose(Vector3(0f, 1.2f, -1.5f))),
                Mesh(Uri.parse("mesh://sphere")),
                Sphere(0.2f)
            )
        )
    }
}
