package com.dyzzy.aetheris.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dyzzy.aetheris.logic.SolarSystemLogic
import kotlin.math.*

/**
 * A simplified 2D Solar System renderer (Orrery).
 * Provides a stable, high-performance alternative to the 3D renderer for Alpha launch.
 * Now includes colored Aspect Lines (Sextile, Trine, Opposition, etc.) mapped to Natal logic,
 * a legend, and a dedicated low-profile marker for Earth.
 */
@Composable
fun CelestialRenderer2D(days: Double, modifier: Modifier = Modifier) {
    val textMeasurer = rememberTextMeasurer()
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
        val baseScale = (maxDim / 22f) 

        // 1. Draw Orbits
        SolarSystemLogic.PLANET_DATA.forEach { (name, data) ->
            if (name == "sun" || name == "earth_moon") return@forEach
            
            val segments = 128
            val points = mutableListOf<Offset>()
            for (i in 0..segments) {
                val theta = 2.0 * PI * i / segments
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

        // Collect positions for Aspect Logic
        val positions = SolarSystemLogic.PLANET_DATA.keys.map { name ->
            SolarSystemLogic.calculatePositionInfo(name, days, 1.0f)
        }

        // 2. Draw Aspect Lines (The "Tension & Harmony" logic from Natal tab)
        val aspects = SolarSystemLogic.calculateAspects(positions)
        aspects.forEach { aspect ->
            val p1 = center + Offset(aspect.p1.x * baseScale, aspect.p1.z * baseScale)
            val p2 = center + Offset(aspect.p2.x * baseScale, aspect.p2.z * baseScale)
            
            val color = when(aspect.type) {
                SolarSystemLogic.AspectType.SEXTILE -> Color(0xFF00E5FF)    // Cyan (Harmony)
                SolarSystemLogic.AspectType.TRINE -> Color(0xFF00E676)      // Emerald (Grace)
                SolarSystemLogic.AspectType.SQUARE -> Color(0xFFFF3D00)     // Red (Tension)
                SolarSystemLogic.AspectType.OPPOSITION -> Color(0xFFFF9100) // Orange (Balance)
                else -> Color.White.copy(alpha = 0.2f)
            }

            drawLine(
                color = color.copy(alpha = 0.4f),
                start = p1,
                end = p2,
                strokeWidth = 2f
            )
        }

        // 3. Draw Sun
        drawCircle(
            color = planetColors["sun"]!!,
            radius = SolarSystemLogic.planetRadiusScale("sun") * baseScale * 2f, // Half-size Sun for Alpha pass
            center = center
        )

        // 4. Draw Planets
        positions.forEach { pos ->
            if (pos.name == "sun") return@forEach
            
            val x = pos.position.x * baseScale
            val y = pos.position.z * baseScale
            val planetPos = center + Offset(x, y)
            
            val color = planetColors[pos.name] ?: Color.Gray
            val radius = SolarSystemLogic.planetRadiusScale(pos.name) * baseScale * 4f
            
            // Special marker for Earth: Low profile crosshair/blip
            if (pos.name == "earth") {
                val blipSize = radius * 2.5f
                drawLine(
                    color = Color.White.copy(alpha = 0.6f),
                    start = planetPos - Offset(blipSize, 0f),
                    end = planetPos + Offset(blipSize, 0f),
                    strokeWidth = 1.dp.toPx()
                )
                drawLine(
                    color = Color.White.copy(alpha = 0.6f),
                    start = planetPos - Offset(0f, blipSize),
                    end = planetPos + Offset(0f, blipSize),
                    strokeWidth = 1.dp.toPx()
                )
                drawCircle(
                    color = Color.White.copy(alpha = 0.3f),
                    radius = radius * 1.8f,
                    center = planetPos,
                    style = Stroke(width = 1.dp.toPx())
                )
            }

            // Draw planet body
            drawCircle(
                color = color,
                radius = radius,
                center = planetPos
            )
        }

        // 5. Draw Aspect Legend (Top-Left)
        val legendItems = listOf(
            "SEXTILE" to Color(0xFF00E5FF),
            "TRINE" to Color(0xFF00E676),
            "SQUARE" to Color(0xFFFF3D00),
            "OPPOSITION" to Color(0xFFFF9100)
        )

        var legendY = 20.dp.toPx()
        val legendX = 20.dp.toPx()

        legendItems.forEach { (label, color) ->
            drawCircle(
                color = color.copy(alpha = 0.6f),
                radius = 4.dp.toPx(),
                center = Offset(legendX, legendY + 6.dp.toPx())
            )
            drawText(
                textMeasurer = textMeasurer,
                text = label,
                topLeft = Offset(legendX + 12.dp.toPx(), legendY),
                style = TextStyle(
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
            )
            legendY += 16.dp.toPx()
        }
    }
}
