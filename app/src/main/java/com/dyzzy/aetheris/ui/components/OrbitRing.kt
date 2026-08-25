package com.dyzzy.aetheris.ui.components

import com.google.android.filament.*
import com.dyzzy.aetheris.logic.SolarSystemLogic
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.*

/**
 * Renders an orbital path as a true Keplerian ellipse with inclination.
 * Uses adaptive segment counts for smoothness on outer/eccentric orbits.
 */
class OrbitRing(engine: Engine, planetName: String, orbitalScale: Float) {
    val entity: Int = engine.entityManager.create()
    private val vertexBuffer: VertexBuffer
    private val indexBuffer: IndexBuffer

    init {
        val data = SolarSystemLogic.PLANET_DATA[planetName] ?: throw IllegalArgumentException("Unknown planet: $planetName")
        
        // Adaptive segment count based on orbital scale and eccentricity
        val baseSegments = 128
        val sizeMultiplier = (1.0 + data.semiMajorAxisAU * 0.5).coerceAtMost(3.0)
        val eccentricityMultiplier = (1.0 + data.eccentricity * 4.0)
        val segments = (baseSegments * sizeMultiplier * eccentricityMultiplier).toInt().coerceIn(64, 512)
        
        val vertices = FloatArray((segments + 1) * 3)
        val indices = ShortArray(segments + 1)
        
        for (i in 0..segments) {
            val theta = 2.0 * PI * i / segments
            
            // Polar form of ellipse: r = a(1-e^2) / (1 + e*cos(theta))
            val r = (data.semiMajorAxisAU * (1.0 - data.eccentricity * data.eccentricity)) / (1.0 + data.eccentricity * cos(theta))
            
            // Spatial compression applied to r to match planet positions
            val compressedR = SolarSystemLogic.orbitalDistanceScale(r)
            
            // Orientation in orbital plane
            val x_orb = compressedR * cos(theta)
            val y_orb = compressedR * sin(theta)
            
            // Apply Inclination, LAN, and Argument of Perihelion
            val inc = Math.toRadians(data.inclinationDeg)
            val lan = Math.toRadians(data.longitudeOfAscendingNodeDeg)
            val arg = Math.toRadians(data.argumentOfPerihelionDeg - data.longitudeOfAscendingNodeDeg)

            val cosLAN = cos(lan)
            val sinLAN = sin(lan)
            val cosI = cos(inc)
            val sinI = sin(inc)
            val cosArg = cos(arg)
            val sinArg = sin(arg)

            val x = (cosLAN * cosArg - sinLAN * sinArg * cosI) * x_orb + (-cosLAN * sinArg - sinLAN * cosArg * cosI) * y_orb
            val y = (sinLAN * cosArg + cosLAN * sinArg * cosI) * x_orb + (-sinLAN * sinArg + cosLAN * cosArg * cosI) * y_orb
            val z = (sinArg * sinI) * x_orb + (cosArg * sinI) * y_orb

            // Swapped Y/Z for Y-up XR rendering
            vertices[i * 3] = (x * orbitalScale).toFloat()
            vertices[i * 3 + 1] = (z * orbitalScale).toFloat()
            vertices[i * 3 + 2] = (y * orbitalScale).toFloat()
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
