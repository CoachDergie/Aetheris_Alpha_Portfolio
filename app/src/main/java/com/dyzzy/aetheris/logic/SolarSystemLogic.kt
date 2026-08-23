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

    /**
     * Solve Kepler's Equation: M = E - e * sin(E)
     * using Newton's method.
     */
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
     * Calculate 3D position of a planet at a given time.
     * 
     * @param planetName Name of the planet (lowercase)
     * @param daysSinceEpoch Number of days since J2000 epoch
     * @param scale Overall distance scale for rendering
     */
    fun calculatePosition(planetName: String, daysSinceEpoch: Double, scale: Float = 100f): Vector3 {
        val elements = PLANET_DATA[planetName] ?: return Vector3(0f, 0f, 0f)
        if (planetName == "sun") return Vector3(0f, 0f, 0f)

        // 1. Mean Anomaly
        val M = Math.toRadians((elements.meanLongitudeDeg + elements.dailyMotionDeg * daysSinceEpoch) % 360)
        
        // 2. Eccentric Anomaly
        val E = solveKepler(M, elements.eccentricity)
        
        // 3. Rectangular coordinates in the orbital plane
        val x_orb = elements.semiMajorAxisAU * (cos(E) - elements.eccentricity)
        val y_orb = elements.semiMajorAxisAU * sqrt(1 - elements.eccentricity * elements.eccentricity) * sin(E)
        
        // 4. Rotate to ecliptic coordinates
        val i = Math.toRadians(elements.inclinationDeg)
        val Omega = Math.toRadians(elements.longitudeOfAscendingNodeDeg)
        val omega = Math.toRadians(elements.argumentOfPerihelionDeg - elements.longitudeOfAscendingNodeDeg) // Arg of periapsis

        // Rotations
        val cosOmega = cos(Omega)
        val sinOmega = sin(Omega)
        val cos_i = cos(i)
        val sin_i = sin(i)
        val cos_omega = cos(omega)
        val sin_omega = sin(omega)

        // 3D Rotation Matrix apply
        val x = (cosOmega * cos_omega - sinOmega * sin_omega * cos_i) * x_orb + (-cosOmega * sin_omega - sinOmega * cos_omega * cos_i) * y_orb
        val y = (sinOmega * cos_omega + cosOmega * sin_omega * cos_i) * x_orb + (-sinOmega * sin_omega + cosOmega * cos_omega * cos_i) * y_orb
        val z = (sin_omega * sin_i) * x_orb + (cos_omega * sin_i) * y_orb

        return Vector3(x.toFloat() * scale, z.toFloat() * scale, y.toFloat() * scale) // Swap y/z for XR coordinate system (y up)
    }

    /**
     * Get days since J2000 epoch (January 1.5, 2000)
     */
    fun getDaysSinceJ2000(): Double {
        val now = System.currentTimeMillis()
        val j2000 = 946728000000L // 2000-01-01 12:00:00 UTC
        return (now - j2000).toDouble() / (1000 * 60 * 60 * 24)
    }
}
