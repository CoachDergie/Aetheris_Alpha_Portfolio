package com.dyzzy.aetheris.ui.components

import android.content.Context
import com.google.android.filament.Engine
import com.google.android.filament.Material
import com.google.android.filament.MaterialInstance
import java.nio.ByteBuffer

object OrbitLineMaterial {
    private var material: Material? = null

    fun load(context: Context, engine: Engine) {
        if (material != null) return
        try {
            val bytes = context.assets.open("materials/orbit.filamat").use { it.readBytes() }
            val byteBuffer = ByteBuffer.allocateDirect(bytes.size).put(bytes)
            byteBuffer.flip()
            material = Material.Builder().payload(byteBuffer, bytes.size).build(engine)
        } catch (e: Exception) {
            // Fallback: If material fails to load, we'll just return null instances
        }
    }

    fun getMaterialInstance(): MaterialInstance? {
        return material?.createInstance()
    }
}
