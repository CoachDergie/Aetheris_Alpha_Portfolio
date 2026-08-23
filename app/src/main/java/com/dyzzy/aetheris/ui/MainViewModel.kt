package com.dyzzy.aetheris.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import kotlin.math.abs
import com.dyzzy.aetheris.logic.SolarSystemLogic
import com.dyzzy.aetheris.logic.OccultEngine
import com.dyzzy.aetheris.logic.TarotRepository
import com.dyzzy.aetheris.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.random.Random

class MainViewModel : ViewModel() {

    private val _currentTab = MutableStateFlow(ViewTab.Dashboard)
    val currentTab: StateFlow<ViewTab> = _currentTab.asStateFlow()

    private val _natalData = MutableStateFlow(
        NatalData("1996-10-31", "03:33", "Alexandria", "Occult Coordinates", 31.2001, 29.9187)
    )
    val natalData: StateFlow<NatalData> = _natalData.asStateFlow()

    private val _natalChart = MutableStateFlow(
        OccultEngine.calculateNatalChart("1996-10-31", "03:33", 31.2001, 29.9187)
    )
    val natalChart: StateFlow<OccultEngine.NatalChartResult> = _natalChart.asStateFlow()

    private val _lunarInfo = MutableStateFlow(OccultEngine.calculateLunarPhase())
    val lunarInfo: StateFlow<LunarPhaseInfo> = _lunarInfo.asStateFlow()

    private val _passthroughEnabled = MutableStateFlow(false)
    val passthroughEnabled: StateFlow<Boolean> = _passthroughEnabled.asStateFlow()

    private val _currentTarotDraw = MutableStateFlow<List<DrawnCard>>(emptyList())
    val currentTarotDraw: StateFlow<List<DrawnCard>> = _currentTarotDraw.asStateFlow()

    private val _meditations = MutableStateFlow(
        listOf(
            Meditation("SOL_01", "Radiant Solar Stillness", "Focus on the inner daemon and the radiant center. Breathe into the solar current.", 15, "Sun", "The Inner Daemon"),
            Meditation("LUNA_01", "Subconscious Lunar Void", "Dive into the nocturnal abyss and silence the mental noise. Align with the subconscious tides.", 20, "Moon", "Nocturnal Currents"),
            Meditation("MARS_01", "Kinetic Force Focus", "Channel the martial vector. Turn internal friction into deliberate strength and grounding.", 10, "Mars", "Heavy Rooted Strength"),
            Meditation("SATURN_01", "Skeletal Discipline Rite", "Build internal structure through rigid focus. Solidify the karmic boundaries.", 30, "Saturn", "Iron Discipline")
        )
    )
    val meditations: StateFlow<List<Meditation>> = _meditations.asStateFlow()

    private val _punches = MutableStateFlow<List<PunchTelemetry>>(
        listOf(
            PunchTelemetry("p_1", System.currentTimeMillis() - 4000, "Lead Jab", 8.4, 12.0, 2.1, 0.28, 52.4, 0.31),
            PunchTelemetry("p_2", System.currentTimeMillis() - 10000, "Cross Strike", 10.2, 14.5, -1.2, 0.26, 84.6, 0.42)
        )
    )
    val punches: StateFlow<List<PunchTelemetry>> = _punches.asStateFlow()

    private val _barbellSession = MutableStateFlow(
        QiGongBarbellSession(
            userBodyWeightKg = 82.0,
            barbellWeightKg = 20.0,
            barbellLengthFt = 6.0,
            durationMinutes = 25,
            movementName = "Six-Foot Barbell Horse Stance Press (Ma Bu Tui)",
            sets = 5,
            reps = 12,
            estimatedKcal = 198,
            associatedPlanetaryHour = "Mars / Golachab",
            focusStance = "Ma Bu (Rooted Horse Stance)"
        )
    )
    val barbellSession: StateFlow<QiGongBarbellSession> = _barbellSession.asStateFlow()

    
    private val _targetDaysSinceEpoch = MutableStateFlow(SolarSystemLogic.getDaysSinceJ2000())
    
    private val _currentDaysSinceEpoch = MutableStateFlow(SolarSystemLogic.getDaysSinceJ2000())
    val currentDaysSinceEpoch: StateFlow<Double> = _currentDaysSinceEpoch.asStateFlow()

    private val _planetPositions = MutableStateFlow(emptyMap<String, SolarSystemLogic.PlanetPosition>())
    val planetPositions: StateFlow<Map<String, SolarSystemLogic.PlanetPosition>> = _planetPositions.asStateFlow()

    private val _aspectLines = MutableStateFlow(emptyList<SolarSystemLogic.AspectLine>())
    val aspectLines: StateFlow<List<SolarSystemLogic.AspectLine>> = _aspectLines.asStateFlow()

    init {
        viewModelScope.launch {
            while(true) {
                val target = _targetDaysSinceEpoch.value
                var current = _currentDaysSinceEpoch.value
                
                val baseDrift = 0.016 // 1 simulated day per real second (at 60fps)
                
                if (abs(target - current) > 0.1) {
                    // Ease towards target if big jump requested
                    current += (target - current) * 0.05
                } else {
                    // Continuous time drift
                    _targetDaysSinceEpoch.value = target + baseDrift
                    current = _targetDaysSinceEpoch.value
                }
                
                _currentDaysSinceEpoch.value = current
                
                val positions = SolarSystemLogic.PLANET_DATA.keys.map { planet ->
                    val scale = if (planet == "earth_moon") 0.1f else 1.0f
                    SolarSystemLogic.calculatePositionInfo(planet, current, scale)
                }
                
                _planetPositions.value = positions.associateBy { it.name }
                _aspectLines.value = SolarSystemLogic.calculateAspects(positions)
                
                delay(16L)
            }
        }
    }

    fun recalculateZenith(dateStr: String) {
        // Dummy target logic for now to demonstrate drifting
        // In real app, calculate days since J2000 from dateStr
        _targetDaysSinceEpoch.value += 365.0 // Jump 1 year
    }


    fun setTab(tab: ViewTab) {
        _currentTab.value = tab
    }

    fun drawTarot(count: Int = 1) {
        _currentTarotDraw.value = TarotRepository.getRandomCards(count)
    }

    fun getSynthesizedGuidance(drawnCard: DrawnCard): String {
        val chart = _natalChart.value
        val lunar = _lunarInfo.value
        val card = drawnCard.card
        val meaning = if (drawnCard.isReversed) card.reversedMeaning else card.uprightMeaning
        val orientation = if (drawnCard.isReversed) "Reversed" else "Upright"

        var guidance = "CARD: ${card.name.uppercase()} ($orientation)\n"
        guidance += "ARCHETYPE: $meaning\n\n"

        // Check for direct resonance (Planet or Sign)
        val matchingBody = chart.bodies.find { 
            it.name.equals(card.associatedPlanetOrSign, ignoreCase = true) || 
            it.sign.equals(card.associatedPlanetOrSign, ignoreCase = true) 
        }
        
        if (matchingBody != null) {
            guidance += "⚡ COSMIC RESONANCE: This card aligns with your ${matchingBody.name} in ${matchingBody.sign}. Its influence is personally amplified in your life stream today."
        } else {
            guidance += "✦ LUNAR GUIDANCE: Under the ${lunar.phaseName.uppercase()}, align your internal intent with the ${card.associatedPlanetOrSign.uppercase()} energy of this card."
        }

        return guidance
    }

    fun togglePassthrough() {
        _passthroughEnabled.value = !_passthroughEnabled.value
    }

    fun updateNatalData(newData: NatalData) {
        _natalData.value = newData
        _natalChart.value = OccultEngine.calculateNatalChart(newData.birthDate, newData.birthTime, newData.latitude, newData.longitude)
    }

    fun recordPunch(type: String = "Lead Jab") {
        val speed = 7.0 + Random.nextDouble(1.0, 5.5)
        val impact = (speed * speed * 0.9) + Random.nextDouble(5.0, 25.0)
        val recoil = 0.22 + Random.nextDouble(0.02, 0.15)
        val newPunch = PunchTelemetry(
            id = "p_${System.currentTimeMillis()}",
            timestamp = System.currentTimeMillis(),
            type = type,
            speedMs = (speed * 10).toInt() / 10.0,
            anglePitchDeg = (10.0 + Random.nextDouble(-4.0, 8.0) * 10).toInt() / 10.0,
            angleYawDeg = (Random.nextDouble(-3.0, 3.0) * 10).toInt() / 10.0,
            returnTimeSec = (recoil * 100).toInt() / 100.0,
            impactForceJoules = (impact * 10).toInt() / 10.0,
            energyKcal = 0.25 + (speed * 0.02)
        )
        _punches.value = (listOf(newPunch) + _punches.value).take(20)
    }

    fun logBarbellRep() {
        val cur = _barbellSession.value
        _barbellSession.value = cur.copy(
            reps = cur.reps + 1,
            estimatedKcal = cur.estimatedKcal + 4
        )
    }
}
