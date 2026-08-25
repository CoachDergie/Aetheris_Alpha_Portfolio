package com.dyzzy.aetheris.ui.components

import com.google.android.filament.Engine
import com.google.android.filament.IndexBuffer
import com.google.android.filament.RenderableManager
import com.google.android.filament.VertexBuffer
import com.google.android.filament.Box
import com.dyzzy.aetheris.logic.SolarSystemLogic
import java.nio.ByteBuffer
import java.nio.ByteOrder

class OrbitRing(engine: Engine, planetName: String, orbitalScale: Float) {
    val entity: Int = engine.entityManager.create()
    private val vertexBuffer: VertexBuffer
    private val indexBuffer: IndexBuffer
    private val segments = 128

    init {
        val vertices = FloatArray((segments + 1) * 3)
        val indices = ShortArray(segments + 1)
        
        val data = SolarSystemLogic.PLANET_DATA[planetName]
        val dailyMotion = data?.dailyMotionDeg ?: 1.0
        val period = 360.0 / dailyMotion
        
        for (i in 0..segments) {
            val fraction = i.toDouble() / segments.toDouble()
            val day = fraction * period
            val pos = SolarSystemLogic.calculatePosition(planetName, day, orbitalScale)
            vertices[i * 3] = pos.x
            vertices[i * 3 + 1] = pos.y
            vertices[i * 3 + 2] = pos.z
            indices[i] = i.toShort()
        }

        val vertexData = ByteBuffer.allocateDirect(vertices.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
        vertexData.put(vertices).flip()

        vertexBuffer = VertexBuffer.Builder()
            .bufferCount(1)
            .vertexCount(segments + 1)
            .attribute(VertexBuffer.VertexAttribute.POSITION, 0, VertexBuffer.AttributeType.FLOAT3, 0, 12)
            .build(engine)
        vertexBuffer.setBufferAt(engine, 0, vertexData)

        val indexData = ByteBuffer.allocateDirect(indices.size * 2).order(ByteOrder.nativeOrder()).asShortBuffer()
        indexData.put(indices).flip()

        indexBuffer = IndexBuffer.Builder()
            .indexCount(segments + 1)
            .bufferType(IndexBuffer.Builder.IndexType.USHORT)
            .build(engine)
        indexBuffer.setBuffer(engine, indexData)

        val materialInstance = OrbitLineMaterial.getMaterialInstance()
        
        RenderableManager.Builder(1)
            .boundingBox(Box(0f, 0f, 0f, 1000f, 1000f, 1000f))
            .geometry(0, RenderableManager.PrimitiveType.LINE_STRIP, vertexBuffer, indexBuffer)
            .material(0, materialInstance)
            .culling(false)
            .build(engine, entity)
    }

    fun destroy(engine: Engine) {
        engine.destroyEntity(entity)
        engine.destroyVertexBuffer(vertexBuffer)
        engine.destroyIndexBuffer(indexBuffer)
    }
}
