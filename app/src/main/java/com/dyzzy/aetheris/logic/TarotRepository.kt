package com.dyzzy.aetheris.logic

import com.dyzzy.aetheris.models.DrawnCard
import com.dyzzy.aetheris.models.TarotCard
import kotlin.random.Random

object TarotRepository {
    private val deck = mutableListOf<TarotCard>()

    init {
        initializeLibrary()
    }

    private fun initializeLibrary() {
        // MAJOR ARCANA
        addMajor(0, "The Fool", "00-TheFool.png", "New beginnings, innocence, spontaneity.", "Recklessness, risk-taking, inconsideration.", "Uranus")
        addMajor(1, "The Magician", "01-TheMagician.png", "Manifestation, resourcefulness, power.", "Manipulation, poor planning, untapped talents.", "Mercury")
        addMajor(2, "The High Priestess", "02-TheHighPriestess.png", "Intuition, sacred knowledge, subconscious mind.", "Secrets, disconnected from intuition, withdrawal.", "Moon")
        addMajor(3, "The Empress", "03-TheEmpress.png", "Femininity, beauty, nature, nurturing.", "Creative block, dependence on others.", "Venus")
        addMajor(4, "The Emperor", "04-TheEmperor.png", "Authority, establishment, structure.", "Tyranny, rigidity, coldness.", "Aries")
        addMajor(5, "The Hierophant", "05-TheHierophant.png", "Spiritual wisdom, religious beliefs, conformity.", "Personal beliefs, freedom, challenging the status quo.", "Taurus")
        addMajor(6, "The Lovers", "06-TheLovers.png", "Love, harmony, relationships, choices.", "Self-love, disharmony, imbalance.", "Gemini")
        addMajor(7, "The Chariot", "07-TheChariot.png", "Control, willpower, success, action.", "Self-discipline, opposition, lack of direction.", "Cancer")
        addMajor(8, "Strength", "08-Strength.png", "Strength, courage, persuasion, influence.", "Inner strength, self-doubt, low energy.", "Leo")
        addMajor(9, "The Hermit", "09-TheHermit.png", "Soul-searching, introspection, being alone.", "Isolation, loneliness, withdrawal.", "Virgo")
        addMajor(10, "Wheel of Fortune", "10-WheelOfFortune.png", "Good luck, karma, life cycles, turning point.", "Bad luck, resistance to change, breaking cycles.", "Jupiter")
        addMajor(11, "Justice", "11-Justice.png", "Justice, fairness, truth, law.", "Unfairness, lack of accountability, dishonesty.", "Libra")
        addMajor(12, "The Hanged Man", "12-TheHangedMan.png", "Pause, surrender, letting go, new perspectives.", "Delays, resistance, stalling, indecision.", "Neptune")
        addMajor(13, "Death", "13-Death.png", "Endings, change, transformation, transition.", "Resistance to change, personal purging, inner purging.", "Scorpio")
        addMajor(14, "Temperance", "14-Temperance.png", "Balance, moderation, patience, purpose.", "Imbalance, excess, self-healing, re-alignment.", "Sagittarius")
        addMajor(15, "The Devil", "15-TheDevil.png", "Shadow self, attachment, addiction, restriction.", "Releasing limiting beliefs, exploring dark thoughts.", "Capricorn")
        addMajor(16, "The Tower", "16-TheTower.png", "Sudden change, upheaval, awakening.", "Personal transformation, fear of change, averting disaster.", "Mars")
        addMajor(17, "The Star", "17-TheStar.png", "Hope, faith, purpose, renewal.", "Lack of faith, despair, self-trust, disconnection.", "Aquarius")
        addMajor(18, "The Moon", "18-TheMoon.png", "Illusion, fear, anxiety, subconscious.", "Release of fear, repressed emotion, confusion.", "Pisces")
        addMajor(19, "The Sun", "19-TheSun.png", "Positivity, fun, warmth, success, vitality.", "Inner child, feeling down, overly optimistic.", "Sun")
        addMajor(20, "Judgement", "20-Judgement.png", "Judgement, rebirth, inner calling, absolution.", "Self-doubt, inner-critic, ignoring the call.", "Pluto")
        addMajor(21, "The World", "21-TheWorld.png", "Completion, integration, accomplishment, travel.", "Seeking personal closure, short-cuts, delays.", "Saturn")

        // MINOR ARCANA - CUPS (Water / Emotions)
        addSuit("Cups", "Water", "Neptune")
        // MINOR ARCANA - WANDS (Fire / Action)
        addSuit("Wands", "Fire", "Mars")
        // MINOR ARCANA - SWORDS (Air / Intellect)
        addSuit("Swords", "Air", "Mercury")
        // MINOR ARCANA - PENTACLES (Earth / Physical)
        addSuit("Pentacles", "Earth", "Saturn")
    }

    private fun addMajor(num: Int, name: String, file: String, upright: String, reversed: String, astro: String) {
        deck.add(TarotCard("MAJOR_$num", name, "Tarot/$file", upright, reversed, astro))
    }

    private fun addSuit(suit: String, element: String, astro: String) {
        val names = listOf("Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King")
        for (i in 1..14) {
            val numStr = i.toString().padStart(2, '0')
            val name = "${names[i-1]} of $suit"
            val file = "${suit}${numStr}.png"
            deck.add(TarotCard("${suit.uppercase()}_$i", name, "Tarot/$file", 
                "Meaning for $name ($element).", 
                "Reversed meaning for $name.", 
                astro))
        }
    }

    fun getAllCards(): List<TarotCard> = deck

    fun getRandomCards(count: Int): List<DrawnCard> {
        return deck.shuffled().take(count).map { 
            DrawnCard(it, Random.nextBoolean())
        }
    }
}
