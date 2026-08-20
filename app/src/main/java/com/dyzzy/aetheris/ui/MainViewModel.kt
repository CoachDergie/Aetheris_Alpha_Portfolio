package com.dyzzy.aetheris.ui

import androidx.lifecycle.ViewModel
import com.dyzzy.aetheris.logic.OccultEngine
import com.dyzzy.aetheris.logic.TarotRepository
import com.dyzzy.aetheris.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

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
}
