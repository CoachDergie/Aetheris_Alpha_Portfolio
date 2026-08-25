package com.dyzzy.aetheris

import android.os.Bundle
import com.meta.spatial.toolkit.AppSystemActivity
import com.dyzzy.aetheris.logic.SolarSystemLogic

class ImmersiveActivity : AppSystemActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Meta Spatial SDK initialization
    }

    override fun onSceneReady() {
        super.onSceneReady()
        // Scene setup
        val days = SolarSystemLogic.getDaysSinceJ2000()
        SolarSystemLogic.calculatePositionInfo("earth", days)
        enablePassthrough(true)
    }

    private fun enablePassthrough(enabled: Boolean) {
        // Platform API stub
    }
}
