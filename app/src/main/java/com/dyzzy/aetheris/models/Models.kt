package com.dyzzy.aetheris.models

data class NatalData(
    val birthDate: String,
    val birthTime: String,
    val birthCity: String,
    val birthCountry: String,
    val latitude: Double,
    val longitude: Double
)

data class CelestialBody(
    val name: String,
    val symbol: String,
    val sign: String,
    val degree: Int,
    val minute: Int,
    val house: Int,
    val archetype: String,
    val qliphoticSphere: String? = null,
    val darkSignature: String? = null,
    val isRetrograde: Boolean = false
)

enum class AspectType {
    Conjunction, Opposition, Trine, Square, Sextile
}

data class PlanetaryAspect(
    val planet1: String,
    val planet2: String,
    val aspectType: AspectType,
    val orb: Double,
    val intensity: String,
    val esotericMeaning: String
)

data class LunarPhaseInfo(
    val phaseName: String,
    val illumination: Int,
    val ageDays: Double,
    val nextFullMoon: String,
    val nextNewMoon: String,
    val currentSign: String,
    val esotericAffinity: String
)

data class DailyInvocation(
    val dayOfWeek: String,
    val planet: String,
    val barbarousFormula: String,
    val invocationText: String,
    val focusQlipha: String,
    val martialCorrelation: String
)

data class DiscoveredIncantation(
    val id: String,
    val dayOfWeek: String,
    val planet: String,
    val barbarousFormula: String,
    val invocationText: String,
    val focusQlipha: String,
    val martialCorrelation: String,
    val source: String,
    val element: String,
    val vibrationalToneHz: Double,
    val tags: List<String>,
    val dateDiscovered: String,
    val isCustom: Boolean = false,
    val notes: String? = null
)

data class TarotCard(
    val id: String,
    val name: String,
    val imagePath: String,
    val uprightMeaning: String,
    val reversedMeaning: String,
    val associatedPlanetOrSign: String
)

data class DrawnCard(
    val card: TarotCard,
    val isReversed: Boolean
)

data class Meditation(
    val id: String,
    val title: String,
    val description: String,
    val durationMinutes: Int,
    val associatedPlanet: String,
    val focusArchetype: String
)

data class PunchTelemetry(
    val id: String,
    val timestamp: Long,
    val type: String,
    val speedMs: Double,
    val anglePitchDeg: Double,
    val angleYawDeg: Double,
    val returnTimeSec: Double,
    val impactForceJoules: Double,
    val energyKcal: Double
)

data class QiGongBarbellSession(
    val userBodyWeightKg: Double,
    val barbellWeightKg: Double,
    val barbellLengthFt: Double,
    val durationMinutes: Int,
    val movementName: String,
    val sets: Int,
    val reps: Int,
    val estimatedKcal: Int,
    val associatedPlanetaryHour: String,
    val focusStance: String
)

enum class ViewTab {
    Dashboard, Natal, Combat, QiGong, Meditations, Transits, Occult, Tarot
}
