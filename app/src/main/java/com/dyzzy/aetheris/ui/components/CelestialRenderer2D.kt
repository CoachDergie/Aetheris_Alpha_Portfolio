package com.dyzzy.aetheris.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import com.dyzzy.aetheris.logic.SolarSystemLogic
import kotlin.math.*

/**
 * A simplified 2D Solar System renderer (Orrery).
 * Provides a stable, high-performance alternative to the 3D renderer for Alpha launch.
 */
@Composable
fun CelestialRenderer2D(days: Double, modifier: Modifier = Modifier) {
    val planetColors = mapOf(
        "sun" to Color(0xFFFFD700),
        "mercury" to Color(0xFFA5A5A5),
        "venus" to Color(0xFFE3BB76),
        "earth" to Color(0xFF2271B3),
        "mars" to Color(0xFFE27B58),
        "jupiter" to Color(0xFFD39C7E),
        "saturn" to Color(0xFFC5AB6E),
        "uranus" to Color(0xFFBBE1E4),
        "neptune" to Color(0xFF6081FF),
        "pluto" to Color(0xFF7B6150),
        "earth_moon" to Color(0xFFFFFFFF)
    )

    Canvas(modifier = modifier.fillMaxSize()) {
        val center = Offset(size.width / 2f, size.height / 2f)
        val maxDim = min(size.width, size.height)
        
        // We use a scale that makes Neptune (the furthest planet) fit with padding.
        // SolarSystemLogic.orbitalDistanceScale(30.0) is approx 9.2 units.
        val baseScale = (maxDim / 22f) 

        // 1. Draw Orbits
        SolarSystemLogic.PLANET_DATA.forEach { (name, data) ->
            if (name == "sun" || name == "earth_moon") return@forEach
            
            val segments = 128
            val points = mutableListOf<Offset>()
            for (i in 0..segments) {
                val theta = 2.0 * PI * i / segments
                // True Keplerian Ellipse: r = a(1-e^2) / (1 + e*cos(theta))
                val r = (data.semiMajorAxisAU * (1.0 - data.eccentricity * data.eccentricity)) / (1.0 + data.eccentricity * cos(theta))
                val compressedR = SolarSystemLogic.orbitalDistanceScale(r)
                
                val x = compressedR * cos(theta) * baseScale
                val y = compressedR * sin(theta) * baseScale
                points.add(center + Offset(x.toFloat(), y.toFloat()))
            }
            
            for (i in 0 until points.size - 1) {
                drawLine(
                    color = Color.White.copy(alpha = 0.1f),
                    start = points[i],
                    end = points[i+1],
                    strokeWidth = 1f
                )
            }
        }

        // 2. Draw Sun
        drawCircle(
            color = planetColors["sun"]!!,
            radius = SolarSystemLogic.planetRadiusScale("sun") * baseScale * 4f,
            center = center
        )

        // 3. Draw Planets
        SolarSystemLogic.PLANET_DATA.keys.forEach { name ->
            if (name == "sun") return@forEach
            
            // calculatePosition returns (x, height, z) - we use x and z for 2D
            val pos = SolarSystemLogic.calculatePosition(name, days, 1.0f)
            val x = pos.x * baseScale
            val y = pos.z * baseScale
            
            val color = planetColors[name] ?: Color.Gray
            val radius = SolarSystemLogic.planetRadiusScale(name) * baseScale * 4f
            
            // Draw planet body
            drawCircle(
                color = color,
                radius = radius,
                center = center + Offset(x.toFloat(), y.toFloat())
            )

            // Optional: Subtle glow/indicator for active selection or name could be added here
        }
    }
}
