package com.dyzzy.aetheris.logic

import kotlin.math.*

/**
 * Logic for calculating planet positions using Keplerian orbital elements.
 * 
 * Orbital elements are approximated for J2000.
 */
object SolarSystemLogic {

    data class OrbitalElements(
        val semiMajorAxisAU: Double,
        val eccentricity: Double,
        val inclinationDeg: Double,
        val longitudeOfAscendingNodeDeg: Double,
        val argumentOfPerihelionDeg: Double,
        val meanLongitudeDeg: Double,
        val dailyMotionDeg: Double // Approximate degrees moved per day
    )

    data class Vector3(val x: Float, val y: Float, val z: Float)
    
    enum class AspectType { CONJUNCTION, SEXTILE, SQUARE, TRINE, OPPOSITION }

    data class AspectLine(
        val planet1: String, 
        val planet2: String, 
        val type: AspectType, 
        val p1: Vector3, 
        val p2: Vector3
    )

    data class PlanetPosition(
        val name: String,
        val position: Vector3,
        val eclipticLongitudeDeg: Double
    )

    val PLANET_DATA = mapOf(
        "sun" to OrbitalElements(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0),
        "mercury" to OrbitalElements(0.3871, 0.2056, 7.005, 48.331, 77.456, 252.25, 4.092),
        "venus" to OrbitalElements(0.7233, 0.0068, 3.3947, 76.680, 131.53, 181.98, 1.602),
        "earth" to OrbitalElements(1.0000, 0.0167, 0.000, 0.0, 102.947, 100.46, 0.9856),
        "mars" to OrbitalElements(1.5237, 0.0934, 1.850, 49.558, 336.04, 355.45, 0.524),
        "jupiter" to OrbitalElements(5.2028, 0.0484, 1.303, 100.464, 14.753, 34.40, 0.0831),
        "saturn" to OrbitalElements(9.5388, 0.0541, 2.489, 113.665, 92.431, 49.94, 0.0335),
        "uranus" to OrbitalElements(19.1819, 0.0472, 0.773, 74.006, 170.96, 313.23, 0.0117),
        "neptune" to OrbitalElements(30.0589, 0.0086, 1.770, 131.784, 44.971, 304.88, 0.0060),
        "pluto" to OrbitalElements(39.482, 0.2488, 17.141, 110.303, 224.06, 238.93, 0.0040),
        "earth_moon" to OrbitalElements(0.00257, 0.0549, 5.145, 125.122, 318.15, 135.27, 13.176) // Relative to Earth
    )

    private fun solveKepler(M: Double, e: Double): Double {
        var E = M
        val epsilon = 1e-6
        for (i in 0..10) {
            val delta = (E - e * sin(E) - M) / (1 - e * cos(E))
            E -= delta
            if (abs(delta) < epsilon) break
        }
        return E
    }

    /**
     * Compresses real AU distances so inner planets remain distinct,
     * but gas giants fall within a 2-3 meter radius in VR.
     */
    private fun compressDistance(au: Double): Double {
        return if (au <= 1.55) {
            au // Leave inner planets up to Mars mostly linear
        } else {
            // Logarithmic compression for outer planets
            // Math.log10(Jupiter's 5.2 - 1.55 + 1) * 1.5 = ~2.5 AU (scaled down)
            1.55 + log10(au - 1.55 + 1.0) * 1.5
        }
    }

    fun calculatePositionInfo(planetName: String, daysSinceEpoch: Double, scale: Float = 1.0f): PlanetPosition {
        val elements = PLANET_DATA[planetName] ?: return PlanetPosition(planetName, Vector3(0f, 0f, 0f), 0.0)
        if (planetName == "sun") return PlanetPosition(planetName, Vector3(0f, 0f, 0f), 0.0)

        val M = Math.toRadians((elements.meanLongitudeDeg + elements.dailyMotionDeg * daysSinceEpoch) % 360)
        val E = solveKepler(M, elements.eccentricity)
        
        val x_orb = elements.semiMajorAxisAU * (cos(E) - elements.eccentricity)
        val y_orb = elements.semiMajorAxisAU * sqrt(1 - elements.eccentricity * elements.eccentricity) * sin(E)
        
        val i = Math.toRadians(elements.inclinationDeg)
        val Omega = Math.toRadians(elements.longitudeOfAscendingNodeDeg)
        val omega = Math.toRadians(elements.argumentOfPerihelionDeg - elements.longitudeOfAscendingNodeDeg)

        val cosOmega = cos(Omega)
        val sinOmega = sin(Omega)
        val cos_i = cos(i)
        val sin_i = sin(i)
        val cos_omega = cos(omega)
        val sin_omega = sin(omega)

        val x = (cosOmega * cos_omega - sinOmega * sin_omega * cos_i) * x_orb + (-cosOmega * sin_omega - sinOmega * cos_omega * cos_i) * y_orb
        val y = (sinOmega * cos_omega + cosOmega * sin_omega * cos_i) * x_orb + (-sinOmega * sin_omega + cosOmega * cos_omega * cos_i) * y_orb
        val z = (sin_omega * sin_i) * x_orb + (cos_omega * sin_i) * y_orb

        val eclipticLongitudeDeg = (Math.toDegrees(atan2(y, x)) + 360.0) % 360.0

        // Apply spatial compression
        val trueDistanceAU = sqrt(x * x + y * y + z * z)
        val compressedDistance = compressDistance(trueDistanceAU)
        val compressionRatio = if (trueDistanceAU > 0) compressedDistance / trueDistanceAU else 0.0
        
        val cx = x * compressionRatio * scale
        val cy = y * compressionRatio * scale
        val cz = z * compressionRatio * scale

        // y/z swapped for Y-up XR rendering.
        return PlanetPosition(planetName, Vector3(cx.toFloat(), cz.toFloat(), cy.toFloat()), eclipticLongitudeDeg)
    }

    fun calculatePosition(planetName: String, daysSinceEpoch: Double, scale: Float = 1.0f): Vector3 {
        return calculatePositionInfo(planetName, daysSinceEpoch, scale).position
    }

    /**
     * Determine aspect relationships between celestial bodies.
     */
    fun calculateAspects(positions: List<PlanetPosition>): List<AspectLine> {
        val aspectLines = mutableListOf<AspectLine>()
        val tolerance = 8.0 // 8 degree orb
        
        val validPlanets = positions.filter { it.name != "earth_moon" && it.name != "sun" } // Exclude moon & sun for now

        for (i in validPlanets.indices) {
            for (j in i + 1 until validPlanets.size) {
                val p1 = validPlanets[i]
                val p2 = validPlanets[j]
                
                var diff = abs(p1.eclipticLongitudeDeg - p2.eclipticLongitudeDeg)
                if (diff > 180) diff = 360 - diff

                val type = when {
                    abs(diff - 0) <= tolerance -> AspectType.CONJUNCTION
                    abs(diff - 60) <= tolerance -> AspectType.SEXTILE
                    abs(diff - 90) <= tolerance -> AspectType.SQUARE
                    abs(diff - 120) <= tolerance -> AspectType.TRINE
                    abs(diff - 180) <= tolerance -> AspectType.OPPOSITION
                    else -> null
                }
                
                if (type != null && type != AspectType.CONJUNCTION) {
                    aspectLines.add(AspectLine(p1.name, p2.name, type, p1.position, p2.position))
                }
            }
        }
        return aspectLines
    }

    fun getDaysSinceJ2000(): Double {
        val now = System.currentTimeMillis()
        val j2000 = 946728000000L // 2000-01-01 12:00:00 UTC
        return (now - j2000).toDouble() / (1000 * 60 * 60 * 24)
    }
}
