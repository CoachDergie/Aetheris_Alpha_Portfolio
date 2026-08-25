package com.dyzzy.aetheris.ui.components

import com.google.android.filament.Engine
import com.google.android.filament.Material
import com.google.android.filament.MaterialInstance
import com.google.android.filamat.MaterialBuilder
import java.nio.ByteBuffer

object OrbitLineMaterial {
    private var material: Material? = null

    fun getMaterialInstance(engine: Engine): MaterialInstance {
        if (material == null) {
            val materialBuilder = MaterialBuilder()
            materialBuilder.name("OrbitLineMaterial")
            materialBuilder.material("void material(inout MaterialInputs material) { prepareMaterial(material); material.baseColor.rgb = float3(0.5, 0.5, 0.6); material.baseColor.a = 0.3; }")
            materialBuilder.shading(MaterialBuilder.Shading.UNLIT)
            materialBuilder.blending(MaterialBuilder.BlendMode.TRANSPARENT)
            val buffer = materialBuilder.build(engine.jobSystem)
            val byteBuffer = ByteBuffer.allocateDirect(buffer.size).put(buffer)
            byteBuffer.flip()
            material = Material.Builder().payload(byteBuffer, byteBuffer.limit()).build(engine)
        }
        return material!!.createInstance()
    }
}
