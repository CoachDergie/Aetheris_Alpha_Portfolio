package com.dyzzy.aetheris.logic

import com.dyzzy.aetheris.models.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlin.math.*

object OccultEngine {

    val ZODIAC_SIGNS = listOf(
        "Aries", "Taurus", "Gemini", "Cancer",
        "Leo", "Virgo", "Libra", "Scorpio",
        "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    )

    data class QliphoticData(
        val sphere: String,
        val ruler: String,
        val signature: String,
        val element: String
    )

    val QLIPHOTIC_SPHERES = mapOf(
        "Sun" to QliphoticData("Thagirion (The Disputers)", "Belphegor", "Black Sun / Solar Will", "Fire"),
        "Moon" to QliphoticData("Gamaliel (The Obscene Ones)", "Lilith", "Lunar Abyss & Astral Tide", "Water"),
        "Mars" to QliphoticData("Golachab (The Burning Ones)", "Asmodeus", "Martial Fury & Iron Might", "Fire"),
        "Mercury" to QliphoticData("Samael (The Poison of God)", "Adrammelech", "Venomous Intellect & Cunning", "Air"),
        "Jupiter" to QliphoticData("Gha'agsheblah (The Smiters)", "Astaroth", "Devouring Expansion & Tyranny", "Water"),
        "Venus" to QliphoticData("A'arab Zaraq (The Ravens of Dispersion)", "Baal", "Carnal Passion & Strife", "Earth"),
        "Saturn" to QliphoticData("Satariel (The Concealers)", "Lucifuge Rofocale", "Cosmic Entropy & Deep Silence", "Earth"),
        "Uranus" to QliphoticData("Ghagiel (The Hinderers)", "Beelzebub", "Chaotic Lightning & Disruption", "Air"),
        "Neptune" to QliphoticData("Thaumiel (The Twin Gods)", "Satan & Moloch", "Primordial Dual Void", "Water"),
        "Pluto" to QliphoticData("Daath / The Abyss (Choronzon)", "Choronzon", "Trans-dimensional Metamorphosis", "Ether")
    )

    fun calculateLunarPhase(dateMillis: Long = System.currentTimeMillis()): LunarPhaseInfo {
        // Known new moon: Jan 6, 2000 18:14 UTC
        val epoch = LocalDateTime.parse("2000-01-06T18:14:00").toInstant(ZoneOffset.UTC).toEpochMilli()
        val synodicMonth = 29.53058867 * 86400 * 1000
        val diff = dateMillis - epoch
        val phaseDecimal = ((diff % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth
        val ageDays = phaseDecimal * 29.53058867
        val illumination = (0.5 * (1 - cos(2 * PI * phaseDecimal)) * 100).toInt()

        val (phaseName, esotericAffinity) = when {
            phaseDecimal < 0.03 || phaseDecimal > 0.97 -> 
                "New Moon (Dark Moon)" to "Hecate / Lilith Gateways & Deep Subconscious Channeling"
            phaseDecimal < 0.22 -> 
                "Waxing Crescent" to "Initiation of Dark Will & Barbell Iron Imbuing"
            phaseDecimal < 0.28 -> 
                "First Quarter" to "Breakthrough Force & Strike Velocity Conditioning"
            phaseDecimal < 0.47 -> 
                "Waxing Gibbous" to "Amplified Qi Cultivation & Muscle Hyper-density"
            phaseDecimal < 0.53 -> 
                "Full Moon" to "Peak Astral Surge & Absolute Martial Climax"
            phaseDecimal < 0.72 -> 
                "Waning Gibbous (Disseminating)" to "Transmutation of Residual Fatigue to Spirit Power"
            phaseDecimal < 0.78 -> 
                "Last Quarter" to "Decisive Severing of Weakness & Skeletal Alignment"
            else -> 
                "Waning Crescent (Balsamic)" to "Balsamic Dissolution into Primordial Qi Void"
        }

        val daysToNextNew = (1 - phaseDecimal) * 29.53
        val daysToNextFull = if (phaseDecimal < 0.5) (0.5 - phaseDecimal) * 29.53 else (1.5 - phaseDecimal) * 29.53

        val nextNewDate = LocalDateTime.ofEpochSecond((dateMillis / 1000 + daysToNextNew * 86400).toLong(), 0, ZoneOffset.UTC)
        val nextFullDate = LocalDateTime.ofEpochSecond((dateMillis / 1000 + daysToNextFull * 86400).toLong(), 0, ZoneOffset.UTC)

        val calendar = java.util.Calendar.getInstance().apply { timeInMillis = dateMillis }
        val dayOfYear = calendar.get(java.util.Calendar.DAY_OF_YEAR)
        val signIndex = (((dayOfYear + ageDays * 12) % 365) / 30.4).toInt() % 12

        return LunarPhaseInfo(
            phaseName = phaseName,
            illumination = illumination,
            ageDays = round(ageDays * 10) / 10.0,
            nextFullMoon = nextFullDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
            nextNewMoon = nextNewDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
            currentSign = ZODIAC_SIGNS.getOrElse(signIndex) { "Scorpio" },
            esotericAffinity = esotericAffinity
        )
    }

    fun calculateNatalChart(birthDateStr: String, birthTimeStr: String, lat: Double = 40.71, lon: Double = -74.00): NatalChartResult {
        val dateTimeStr = if (birthTimeStr.isEmpty()) "${birthDateStr}T12:00:00" else "${birthDateStr}T${birthTimeStr}:00"
        val date = LocalDateTime.parse(dateTimeStr)
        val year = date.year
        val month = date.monthValue
        val day = date.dayOfMonth
        val hour = date.hour + date.minute / 60.0

        val seed = (year * 365.25 + month * 30.6 + day + hour / 24.0 + lat * 0.05 + lon * 0.02)

        val planetConfigs = listOf(
            PlanetConfig("Sun", "☉", 0.9856, 280, "Radiant Solar Center / Inner Daemon"),
            PlanetConfig("Moon", "☽", 13.176, 40, "Subconscious Abyss / Nocturnal Currents"),
            PlanetConfig("Mars", "♂", 0.524, 120, "Martial Strike Vector / Raw Kinetic Drive"),
            PlanetConfig("Mercury", "☿", 1.6, 200, "Cunning Intelligence / Neural Transmission"),
            PlanetConfig("Jupiter", "♃", 0.083, 310, "Devouring Expansion / Astral Dominance"),
            PlanetConfig("Venus", "♀", 1.2, 15, "Sensual Magnetism / Alchemical Binding"),
            PlanetConfig("Saturn", "♄", 0.033, 180, "Iron Discipline / Heavy Skeletal Boundary"),
            PlanetConfig("Uranus", "♅", 0.011, 45, "Lightning Blast / Sudden Biomechanical Shift"),
            PlanetConfig("Neptune", "♆", 0.006, 290, "Dissolving Mist / Limitless Astral Tide"),
            PlanetConfig("Pluto", "♇", 0.004, 215, "Chthonic Transmutation / Kundalini Undercurrent")
        )

        val bodies = planetConfigs.mapIndexed { idx, p ->
            val rawDeg = ((p.offset + seed * p.speed + idx * 29.3) % 360 + 360) % 360
            val signIndex = (rawDeg / 30).toInt()
            val degreeInSign = (rawDeg % 30).toInt()
            val minute = ((rawDeg % 30 - degreeInSign) * 60).toInt()
            val house = ((signIndex + 1 + idx) % 12) + 1
            val qlData = QLIPHOTIC_SPHERES[p.name]

            CelestialBody(
                name = p.name,
                symbol = p.symbol,
                sign = ZODIAC_SIGNS[signIndex],
                degree = degreeInSign,
                minute = minute,
                house = house,
                archetype = p.archetype,
                qliphoticSphere = qlData?.sphere,
                darkSignature = qlData?.signature,
                isRetrograde = (idx % 3 == 0 && p.name != "Sun" && p.name != "Moon")
            )
        }

        val ascDeg = ((seed * 1.05 + lat + hour * 15) % 360 + 360) % 360
        val mcDeg = ((seed * 0.98 + lon + hour * 15 + 90) % 360 + 360) % 360

        val ascSignIdx = (ascDeg / 30).toInt()
        val ascendant = Point(ZODIAC_SIGNS[ascSignIdx], (ascDeg % 30).toInt(), ((ascDeg % 1) * 60).toInt())

        val mcSignIdx = (mcDeg / 30).toInt()
        val midheaven = Point(ZODIAC_SIGNS[mcSignIdx], (mcDeg % 30).toInt(), ((mcDeg % 1) * 60).toInt())

        val aspects = mutableListOf<PlanetaryAspect>()
        for (i in bodies.indices) {
            for (j in i + 1 until bodies.size) {
                val b1 = bodies[i]
                val b2 = bodies[j]
                val deg1 = (ZODIAC_SIGNS.indexOf(b1.sign) * 30.0) + b1.degree
                val deg2 = (ZODIAC_SIGNS.indexOf(b2.sign) * 30.0) + b2.degree
                var diff = abs(deg1 - deg2)
                if (diff > 180) diff = 360.0 - diff

                when {
                    abs(diff - 0.0) <= 8.0 -> aspects.add(PlanetaryAspect(b1.name, b2.name, AspectType.Conjunction, round(abs(diff - 0.0) * 10.0) / 10.0, "Extreme", "${b1.name} fused with ${b2.name}: Concentrated occult kinetic vortex."))
                    abs(diff - 90.0) <= 7.0 -> aspects.add(PlanetaryAspect(b1.name, b2.name, AspectType.Square, round(abs(diff - 90.0) * 10.0) / 10.0, "High", "${b1.name} Square ${b2.name}: High tension frictional friction powering raw martial strike leverage."))
                    abs(diff - 180.0) <= 8.0 -> aspects.add(PlanetaryAspect(b1.name, b2.name, AspectType.Opposition, round(abs(diff - 180.0) * 10.0) / 10.0, "High", "${b1.name} Opposing ${b2.name}: Polarized dual current demanding iron discipline to balance."))
                    abs(diff - 120.0) <= 6.0 -> aspects.add(PlanetaryAspect(b1.name, b2.name, AspectType.Trine, round(abs(diff - 120.0) * 10.0) / 10.0, "Moderate", "${b1.name} Trine ${b2.name}: Unhindered flow of internal Qi and instinctual timing."))
                    abs(diff - 60.0) <= 4.0 -> aspects.add(PlanetaryAspect(b1.name, b2.name, AspectType.Sextile, round(abs(diff - 60.0) * 10.0) / 10.0, "Subtle", "${b1.name} Sextile ${b2.name}: Tactical opportunity and neuromuscular synchronization."))
                }
            }
        }

        return NatalChartResult(bodies, aspects, ascendant, midheaven)
    }

    private data class PlanetConfig(val name: String, val symbol: String, val speed: Double, val offset: Int, val archetype: String)
    data class Point(val sign: String, val deg: Int, val min: Int)
    data class NatalChartResult(val bodies: List<CelestialBody>, val aspects: List<PlanetaryAspect>, val ascendant: Point, val midheaven: Point)

    val DAILY_INVOCATIONS = listOf(
        DailyInvocation("Sunday", "Sun / Sorath / Belphegor", "IAO SABAO ARBATHIAO PHEKRO THERION", "I invoke the Black Sun within the solar plexus. Let iron will ignite the sinews and harden the bone core.", "Thagirion (Beauty of the Abyss)", "Solar Iron Palm & Concentrated Centerline Strike"),
        DailyInvocation("Monday", "Moon / Lilith / Gamaliel", "LILITH ABISHA NAAMAH GAMALIEL TULPHAT", "O Nocturnal Tide of the Silver Horn, wash over the nervous system. Transform instinctual perception into razor fluidity.", "Gamaliel (Astral Dream Weaver)", "Fluid Evasion, Baguazhang Circle Walking & Rooting"),
        DailyInvocation("Tuesday", "Mars / Asmodeus / Golachab", "ZAZAS ZAZAS NASATANADA ZAZAS GOLACHAB BARBARON", "Wrath of the Red Sphere, charge the 6-foot zinc bar with crushing explosive drive. No obstacle shall withstand this momentum.", "Golachab (Flaming Destruction)", "Explosive Thrusts, Heavy Barbell Cleans & Penetrating Punches"),
        DailyInvocation("Wednesday", "Mercury / Samael / Adrammelech", "TAPHATHARATH SAMAEL OROBAS THEUT BARUCH", "Mercurial venom and rapid neural fire, sharpen hand trajectory and accelerate recovery return speed.", "Samael (Poison of Cunning Insight)", "Lightning Chain Punches & Instant Telemetric Recoil"),
        DailyInvocation("Thursday", "Jupiter / Astaroth / Gha'agsheblah", "GHAAGSHEBLAH ASTAROTH BELIAL CHESED-TZADKIK", "Sovereign majesty and unstoppable mass, enlarge the structural kinetic envelope. My posture commands the cardinal quarters.", "Gha'agsheblah (Devourer of Boundaries)", "Heavy Horse Stance (Ma Bu) & Barbell Overhead Holds"),
        DailyInvocation("Friday", "Venus / Baal / A'arab Zaraq", "ASTARTE BAAL-ZEPHON AARAB ZARAQ NEHESCH", "Primal harmony and serpentine sinew tension, weave the fascia into unbreakable organic armor.", "A'arab Zaraq (Ravens of Dispersion)", "Silk Reeling Qi-Gong (Chan Si Gong) & Joint Fortification"),
        DailyInvocation("Saturday", "Saturn / Lucifuge / Satariel", "AGIOS O KAPH SATARIEL CASSIEL MORTE ZODAC", "Ancient stone of the abyss and solemn threshold, temper the skeletal structure like carbonized titanium.", "Satariel (The Deep Concealer)", "Iron Shirt (Tie Bu Shan) & 6-ft Barbell Slow Isometric Lockouts")
    )
}
