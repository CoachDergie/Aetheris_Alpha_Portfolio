package com.dyzzy.aetheris.logic

import kotlin.math.*

/**
 * Procedural UV Sphere generator for celestial bodies.
 * Pure math implementation to replace external glTF meshes.
 * Generates positions, tangents (encoded TBN frame), and UVs.
 */
object SphereMeshBuilder {
    data class SphereMesh(
        val positions: FloatArray,   // x,y,z per vertex
        val tangents: FloatArray,    // x,y,z,w per vertex (Filament quaternion encoding)
        val uvs: FloatArray,         // u,v per vertex
        val indices: ShortArray
    )

    fun build(radius: Float, stacks: Int, slices: Int): SphereMesh {
        val vertexCount = (stacks + 1) * (slices + 1)
        val indexCount = stacks * slices * 6
        
        val positions = FloatArray(vertexCount * 3)
        val tangents = FloatArray(vertexCount * 4)
        val uvs = FloatArray(vertexCount * 2)
        val indices = ShortArray(indexCount)
        
        var vIndex = 0
        for (i in 0..stacks) {
            val v = i.toFloat() / stacks
            val phi = v * PI.toFloat()
            val sinPhi = sin(phi)
            val cosPhi = cos(phi)
            
            for (j in 0..slices) {
                val u = j.toFloat() / slices
                val theta = u * 2.0f * PI.toFloat()
                val sinTheta = sin(theta)
                val cosTheta = cos(theta)
                
                // Normal
                val nx = sinPhi * cosTheta
                val ny = cosPhi
                val nz = sinPhi * sinTheta
                
                positions[vIndex * 3] = nx * radius
                positions[vIndex * 3 + 1] = ny * radius
                positions[vIndex * 3 + 2] = nz * radius
                
                // Tangent
                val tx = -sinTheta
                val ty = 0f
                val tz = cosTheta
                
                // Bitangent B = N x T
                val bx = ny * tz - nz * ty
                val by = nz * tx - nx * tz
                val bz = nx * ty - ny * tx
                
                val q = packTangentFrame(tx, ty, tz, bx, by, bz, nx, ny, nz)
                tangents[vIndex * 4] = q[0]
                tangents[vIndex * 4 + 1] = q[1]
                tangents[vIndex * 4 + 2] = q[2]
                tangents[vIndex * 4 + 3] = q[3]
                
                uvs[vIndex * 2] = 1.0f - u
                uvs[vIndex * 2 + 1] = v
                
                vIndex++
            }
        }
        
        var iIndex = 0
        for (i in 0 until stacks) {
            for (j in 0 until slices) {
                val first = (i * (slices + 1) + j).toShort()
                val second = (first + slices + 1).toShort()
                
                indices[iIndex++] = first
                indices[iIndex++] = (first + 1).toShort()
                indices[iIndex++] = second
                
                indices[iIndex++] = second
                indices[iIndex++] = (first + 1).toShort()
                indices[iIndex++] = (second + 1).toShort()
            }
        }
        
        return SphereMesh(positions, tangents, uvs, indices)
    }

    /**
     * Packs an orthonormal basis (tangent, bitangent, normal) into a quaternion.
     */
    private fun packTangentFrame(tx: Float, ty: Float, tz: Float, bx: Float, by: Float, bz: Float, nx: Float, ny: Float, nz: Float): FloatArray {
        // Matrix columns are T, B, N
        val m00 = tx; val m01 = bx; val m02 = nx
        val m10 = ty; val m11 = by; val m12 = ny
        val m20 = tz; val m21 = bz; val m22 = nz
        
        val trace = m00 + m11 + m22
        val q = FloatArray(4)
        if (trace > 0) {
            val s = 0.5f / sqrt(trace + 1.0f)
            q[0] = (m21 - m12) * s
            q[1] = (m02 - m20) * s
            q[2] = (m10 - m01) * s
            q[3] = 0.25f / s
        } else {
            if (m00 > m11 && m00 > m22) {
                val s = 2.0f * sqrt(1.0f + m00 - m11 - m22)
                q[0] = 0.25f * s
                q[1] = (m01 + m10) / s
                q[2] = (m02 + m20) / s
                q[3] = (m21 - m12) / s
            } else if (m11 > m22) {
                val s = 2.0f * sqrt(1.0f + m11 - m00 - m22)
                q[0] = (m01 + m10) / s
                q[1] = 0.25f * s
                q[2] = (m12 + m21) / s
                q[3] = (m02 - m20) / s
            } else {
                val s = 2.0f * sqrt(1.0f + m22 - m00 - m11)
                q[0] = (m02 + m20) / s
                q[1] = (m12 + m21) / s
                q[2] = 0.25f * s
                q[3] = (m10 - m01) / s
            }
        }
        
        val len = sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3])
        return floatArrayOf(q[0]/len, q[1]/len, q[2]/len, q[3]/len)
    }
}
