package com.dyzzy.aetheris.ui.components

import android.content.Context
import com.google.android.filament.Engine
import com.google.android.filament.Material
import com.google.android.filament.MaterialInstance
import java.nio.ByteBuffer

object OrbitLineMaterial {
    private var material: Material? = null

    /**
     * Loads the pre-compiled 'orbit.filamat' from assets.
     * This avoids native MaterialBuilder compilation issues during build.
     */
    fun init(context: Context, engine: Engine) {
        if (material != null) return
        try {
            val bytes = context.assets.open("materials/orbit.filamat").use { it.readBytes() }
            val byteBuffer = ByteBuffer.allocateDirect(bytes.size).put(bytes)
            byteBuffer.flip()
            material = Material.Builder().payload(byteBuffer, bytes.size).build(engine)
        } catch (e: Exception) {
            android.util.Log.e("Aetheris", "OrbitLineMaterial: Failed to load material", e)
        }
    }

    fun getMaterialInstance(): MaterialInstance {
        // Safe check in case init was skipped
        return material?.createInstance() ?: throw IllegalStateException("OrbitLineMaterial not initialized")
    }
}
