package com.dyzzy.aetheris

import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.horizontalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.compose.foundation.Image
import androidx.compose.ui.draw.clip
import android.graphics.BitmapFactory
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextAlign
import com.dyzzy.aetheris.logic.TarotRepository
import com.dyzzy.aetheris.models.DrawnCard
import com.dyzzy.aetheris.models.TarotCard
import com.dyzzy.aetheris.models.Meditation
import com.dyzzy.aetheris.models.ViewTab
import com.dyzzy.aetheris.ui.MainViewModel
import com.dyzzy.aetheris.ui.theme.AetherisTheme
import androidx.compose.ui.draw.scale
import androidx.xr.runtime.Config
import androidx.xr.runtime.Session
import androidx.xr.compose.material3.EnableXrComponentOverrides
import androidx.xr.compose.material3.ExperimentalMaterial3XrApi
import androidx.xr.compose.platform.LocalSession
import androidx.xr.compose.platform.LocalSpatialCapabilities
import androidx.xr.compose.spatial.Subspace
import androidx.xr.compose.spatial.SpatialDialog
import androidx.xr.compose.subspace.SpatialPanel
import androidx.xr.compose.subspace.layout.SubspaceModifier
import androidx.xr.compose.subspace.layout.height
import androidx.xr.compose.subspace.layout.width
import androidx.xr.compose.subspace.layout.movable
import androidx.xr.compose.subspace.layout.resizable
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.layout.layout
import androidx.compose.ui.unit.Constraints
import java.util.Locale

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    companion object {
        init {
            System.loadLibrary("aetheris_native")
        }
    }

    private external fun nativeInitializeXR(): Boolean
    private external fun nativeShutdownXR()
    private external fun nativeIsXRActive(): Boolean

    fun isNativeXRActive(): Boolean = try { nativeIsXRActive() } catch (e: Exception) { false }

    @SuppressLint("RestrictedApi")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // Ensure the window background is transparent to prevent grey artifacts in VR
        window.setBackgroundDrawableResource(android.R.color.transparent)

        setContent {
            AetherisTheme(darkTheme = true) {
                XRPermissionGuard(
                    onGranted = {
                        val success = nativeInitializeXR()
                        Log.i("Aetheris", "Native XR Initialization: $success")
                    }
                ) {
                    AetherisHeadMountedHUD(viewModel = viewModel)
                }
            }
        }
    }

    override fun onDestroy() {
        nativeShutdownXR()
        super.onDestroy()
    }
}

@Composable
fun XRPermissionGuard(
    onGranted: () -> Unit = {},
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    
    val permissionsToRequest = remember {
        val allTargetPermissions = arrayOf(
            "android.permission.HAND_TRACKING",
            "android.permission.RECORD_AUDIO"
        )
        
        allTargetPermissions.filter { permission ->
            try {
                val isGranted = ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
                !isGranted
            } catch (e: Exception) {
                false
            }
        }.toTypedArray()
    }

    var permissionsGranted by remember {
        mutableStateOf(true) // Always allow UI to render without blocking
    }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        onGranted()
    }

    LaunchedEffect(Unit) {
        if (permissionsToRequest.isNotEmpty()) {
            try {
                launcher.launch(permissionsToRequest)
            } catch (e: Exception) {
                Log.w("Aetheris", "Permission launch skipped: ${e.message}")
            }
        }
        onGranted()
    }

    content()
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterial3XrApi::class)
@Composable
fun AetherisHeadMountedHUD(viewModel: MainViewModel) {
    val currentTab by viewModel.currentTab.collectAsState()
    val lunarInfo by viewModel.lunarInfo.collectAsState()
    val session = LocalSession.current

    val isSpatialEnabled = LocalSpatialCapabilities.current.isSpatialUiEnabled
    
    val hudBackground = Color(0x990A0C14)
    val panelSurface = Color(0xCC121626)
    val accentCyan = Color(0xFF00E5FF)
    val accentGold = Color(0xFFFFD54F)

    LaunchedEffect(session, isSpatialEnabled) {
        if (session != null && isSpatialEnabled) {
            val newConfig = Config.Builder(session.config).build()
            session.configure(newConfig)
        }
    }

    if (isSpatialEnabled) {
        Subspace {
            SpatialPanel(
                modifier = SubspaceModifier
                    .width(1280.dp)
                    .height(720.dp)
                    .movable()
                    .resizable(maintainAspectRatio = true)
            ) {
                EnableXrComponentOverrides {
                    AetherisHUDContent(
                        viewModel = viewModel,
                        currentTab = currentTab,
                        lunarInfo = lunarInfo,
                        hudBackground = hudBackground,
                        panelSurface = panelSurface,
                        accentCyan = accentCyan,
                        accentGold = accentGold,
                        isSpatial = true
                    )
                }
            }
        }
    } else {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF070913))
        ) {
            AetherisHUDContent(
                viewModel = viewModel,
                currentTab = currentTab,
                lunarInfo = lunarInfo,
                hudBackground = hudBackground,
                panelSurface = panelSurface,
                accentCyan = accentCyan,
                accentGold = accentGold,
                isSpatial = false
            )
        }
    }
}

@Composable
fun AdaptiveResolutionBox(
    designWidth: Int = 1000,
    designHeight: Int = 720,
    content: @Composable () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        content()
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterial3XrApi::class)
@Composable
fun AetherisHUDContent(
    viewModel: MainViewModel,
    currentTab: ViewTab,
    lunarInfo: com.dyzzy.aetheris.models.LunarPhaseInfo,
    hudBackground: Color,
    panelSurface: Color,
    accentCyan: Color,
    accentGold: Color,
    isSpatial: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxSize()
            .padding(if (isSpatial) 0.dp else 12.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = hudBackground),
        border = BorderStroke(1.5.dp, accentCyan.copy(alpha = 0.4f)),
        elevation = CardDefaults.cardElevation(0.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "⚡ AETHERIS // OCCULT CONSOLE",
                        fontWeight = FontWeight.Black,
                        fontSize = 22.sp,
                        letterSpacing = 2.5.sp,
                        color = accentCyan,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "LUNAR PHASE: ${lunarInfo.phaseName.uppercase()}",
                        fontSize = 13.sp,
                        color = accentGold,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(14.dp))

                    // Scrollable Tab Navigation Bar so all 7 tabs are accessible & never clipped
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        HUDTabItem(currentTab == ViewTab.Dashboard, { viewModel.setTab(ViewTab.Dashboard) }, Icons.Default.Dashboard, "HUD", accentCyan)
                        Spacer(modifier = Modifier.width(8.dp))
                        HUDTabItem(currentTab == ViewTab.Natal, { viewModel.setTab(ViewTab.Natal) }, Icons.Default.AutoAwesome, "NATAL", accentCyan)
                        Spacer(modifier = Modifier.width(8.dp))
                        HUDTabItem(currentTab == ViewTab.Combat, { viewModel.setTab(ViewTab.Combat) }, Icons.Default.SportsMartialArts, "COMBAT", accentCyan)
                        Spacer(modifier = Modifier.width(8.dp))
                        HUDTabItem(currentTab == ViewTab.QiGong, { viewModel.setTab(ViewTab.QiGong) }, Icons.Default.FitnessCenter, "QI-GONG", accentCyan)
                        Spacer(modifier = Modifier.width(8.dp))
                        HUDTabItem(currentTab == ViewTab.Meditations, { viewModel.setTab(ViewTab.Meditations) }, Icons.Default.SelfImprovement, "MEDITATION", accentCyan)
                        Spacer(modifier = Modifier.width(8.dp))
                        HUDTabItem(currentTab == ViewTab.Tarot, { viewModel.setTab(ViewTab.Tarot) }, Icons.Default.Style, "TAROT", accentCyan)
                        Spacer(modifier = Modifier.width(8.dp))
                        HUDTabItem(currentTab == ViewTab.Occult, { viewModel.setTab(ViewTab.Occult) }, Icons.Default.AutoStories, "GRIMOIRE", accentCyan)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider(color = accentCyan.copy(alpha = 0.3f), thickness = 1.dp)
                Spacer(modifier = Modifier.height(20.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .widthIn(max = 1100.dp),
                    contentAlignment = Alignment.TopCenter
                ) {
                    when (currentTab) {
                        ViewTab.Dashboard -> MainHUDLayout(viewModel, panelSurface, accentCyan, accentGold)
                        ViewTab.Natal -> NatalMandalaView(viewModel, panelSurface, accentGold, accentCyan)
                        ViewTab.Combat -> CombatTelemetryView(viewModel, panelSurface, accentCyan, accentGold)
                        ViewTab.QiGong -> QiGongBarbellView(viewModel, panelSurface, accentCyan, accentGold)
                        ViewTab.Meditations -> MeditationsListView(viewModel, accentGold)
                        ViewTab.Tarot -> TarotDashboardView(viewModel, accentCyan, accentGold)
                        ViewTab.Occult -> GrimoireInvocationsView(viewModel, panelSurface, accentCyan)
                        else -> MainHUDLayout(viewModel, panelSurface, accentCyan, accentGold)
                    }
                }
                
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
fun TarotDashboardView(viewModel: MainViewModel, accentCyan: Color, accentGold: Color) {
    val draw by viewModel.currentTarotDraw.collectAsState()
    var viewMode by remember { mutableStateOf("DRAW") } // "DRAW" or "LIBRARY"

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(32.dp)
    ) {
        // Mode Switcher
        Row(
            modifier = Modifier.width(600.dp),
            horizontalArrangement = Arrangement.Center
        ) {
            Button(
                onClick = { viewMode = "DRAW" },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (viewMode == "DRAW") accentCyan else Color.DarkGray
                ),
                modifier = Modifier.weight(1f).padding(8.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("DAILY DRAW", fontWeight = FontWeight.Black, color = if (viewMode == "DRAW") Color.Black else Color.White)
            }
            Button(
                onClick = { viewMode = "LIBRARY" },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (viewMode == "LIBRARY") accentCyan else Color.DarkGray
                ),
                modifier = Modifier.weight(1f).padding(8.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("CARD LIBRARY", fontWeight = FontWeight.Black, color = if (viewMode == "LIBRARY") Color.Black else Color.White)
            }
        }

        if (viewMode == "DRAW") {
            DailyDrawMode(viewModel, draw, accentCyan, accentGold)
        } else {
            TarotLibraryMode(accentCyan)
        }
    }
}

@Composable
fun DailyDrawMode(viewModel: MainViewModel, draw: List<DrawnCard>, accentCyan: Color, accentGold: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        if (draw.isEmpty()) {
            Text("CONSULT THE ARCHETYPES TO RECEIVE GUIDANCE", color = Color.Gray, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        } else {
            draw.forEach { drawn ->
                Card(
                    modifier = Modifier.width(500.dp).wrapContentHeight(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0x3300E5FF)),
                    border = BorderStroke(1.dp, accentCyan.copy(alpha = 0.5f)),
                    elevation = CardDefaults.cardElevation(0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        AssetImage(
                            path = drawn.card.imagePath,
                            modifier = Modifier.fillMaxWidth().height(350.dp).clip(RoundedCornerShape(12.dp)),
                            rotate = if (drawn.isReversed) 180f else 0f
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Text(
                            drawn.card.name.uppercase(),
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp,
                            color = accentCyan,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            viewModel.getSynthesizedGuidance(drawn),
                            color = Color.White,
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 20.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        Button(
            onClick = { viewModel.drawTarot(1) },
            colors = ButtonDefaults.buttonColors(containerColor = accentCyan),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.width(240.dp).height(56.dp)
        ) {
            Text("DRAW DAILY CARD", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 16.sp)
        }
    }
}

@Composable
fun TarotLibraryMode(accentCyan: Color) {
    val allCards = remember { TarotRepository.getAllCards() }
    var selectedBy by remember { mutableStateOf<TarotCard?>(null) }

    if (selectedBy != null) {
        SpatialDialog(onDismissRequest = { selectedBy = null }) {
            Card(
                modifier = Modifier.width(500.dp).wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF121626)),
                border = BorderStroke(2.dp, accentCyan),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    AssetImage(selectedBy!!.imagePath, modifier = Modifier.fillMaxWidth().height(300.dp))
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(selectedBy!!.name.uppercase(), fontWeight = FontWeight.Black, fontSize = 22.sp, color = accentCyan)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("UPRIGHT MEANING", fontWeight = FontWeight.Bold, color = Color.Gray, fontSize = 12.sp)
                    Text(selectedBy!!.uprightMeaning, fontSize = 14.sp, color = Color.White, textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("REVERSED MEANING", fontWeight = FontWeight.Bold, color = Color.Gray, fontSize = 12.sp)
                    Text(selectedBy!!.reversedMeaning, fontSize = 14.sp, color = Color.LightGray, textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(20.dp))
                    Surface(
                        color = Color.Yellow.copy(alpha = 0.1f),
                        border = BorderStroke(1.dp, Color.Yellow),
                        shape = RoundedCornerShape(8.dp),
                        shadowElevation = 0.dp,
                        tonalElevation = 0.dp
                    ) {
                        Text(
                            "COSMIC RULER: ${selectedBy!!.associatedPlanetOrSign.uppercase()}", 
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            fontWeight = FontWeight.Black, 
                            color = Color.Yellow,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }
    }

    val rows = allCards.chunked(4)
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        rows.forEach { rowCards ->
            Row(
                modifier = Modifier.fillMaxWidth().widthIn(max = 900.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                rowCards.forEach { card ->
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedBy = card },
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0x11FFFFFF)),
                        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f)),
                        elevation = CardDefaults.cardElevation(0.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            AssetImage(card.imagePath, modifier = Modifier.fillMaxWidth().height(160.dp).clip(RoundedCornerShape(8.dp)))
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                card.name.uppercase(), 
                                fontSize = 9.sp, 
                                color = Color.White, 
                                maxLines = 1, 
                                textAlign = TextAlign.Center,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
                if (rowCards.size < 4) {
                    repeat(4 - rowCards.size) { Spacer(modifier = Modifier.weight(1f)) }
                }
            }
        }
    }
}

@Composable
fun MeditationsListView(viewModel: MainViewModel, accentGold: Color) {
    val meditations by viewModel.meditations.collectAsState()
    var selectedMeditation by remember { mutableStateOf<Meditation?>(null) }

    if (selectedMeditation != null) {
        SpatialDialog(onDismissRequest = { selectedMeditation = null }) {
            Card(
                modifier = Modifier.width(500.dp).wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF121626)),
                border = BorderStroke(2.dp, accentGold),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.SelfImprovement, null, tint = accentGold, modifier = Modifier.size(64.dp))
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(selectedMeditation!!.title.uppercase(), fontWeight = FontWeight.Black, fontSize = 22.sp, color = accentGold, textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(selectedMeditation!!.description, fontSize = 16.sp, color = Color.White, textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        StatBlock("DURATION", "${selectedMeditation!!.durationMinutes}m", accentGold)
                        StatBlock("PLANET", selectedMeditation!!.associatedPlanet.uppercase(), accentGold)
                    }
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    Button(
                        onClick = { selectedMeditation = null },
                        colors = ButtonDefaults.buttonColors(containerColor = accentGold),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth().height(56.dp)
                    ) {
                        Text("BEGIN SESSION", color = Color.Black, fontWeight = FontWeight.Black)
                    }
                }
            }
        }
    }

    Column(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Text(
            "🧘 MEDITATION LIBRARY",
            fontWeight = FontWeight.Black,
            fontSize = 24.sp,
            letterSpacing = 2.sp,
            color = accentGold
        )
        
        meditations.forEach { med ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 860.dp)
                    .clickable { selectedMeditation = med },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0x22FFFFFF)),
                border = BorderStroke(1.dp, accentGold.copy(alpha = 0.2f)),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Row(
                    modifier = Modifier.padding(24.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.SelfImprovement, null, tint = accentGold, modifier = Modifier.size(40.dp))
                    Spacer(modifier = Modifier.width(24.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(med.title.uppercase(), fontWeight = FontWeight.Black, fontSize = 18.sp, color = Color.White)
                        Text(med.focusArchetype, fontSize = 12.sp, color = accentGold)
                    }
                    Text("${med.durationMinutes} MIN", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.Gray)
                }
            }
        }
    }
}

@Composable
fun AssetImage(path: String, modifier: Modifier = Modifier, rotate: Float = 0f) {
    val context = LocalContext.current
    val imageBitmap = remember(path) {
        try {
            val inputStream = context.assets.open(path)
            BitmapFactory.decodeStream(inputStream).asImageBitmap()
        } catch (e: Exception) {
            null
        }
    }
    
    if (imageBitmap != null) {
        Box(modifier = modifier, contentAlignment = Alignment.Center) {
            Image(
                bitmap = imageBitmap,
                contentDescription = null,
                modifier = Modifier.graphicsLayer { rotationZ = rotate },
                contentScale = ContentScale.Fit
            )
        }
    } else {
        Box(modifier = modifier.background(Color.DarkGray), contentAlignment = Alignment.Center) {
            Text("IMG ERR", color = Color.White, fontSize = 10.sp)
        }
    }
}

@Composable
fun StatBlock(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
        Text(value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = color)
    }
}

@Composable
fun HUDTabItem(
    selected: Boolean,
    onClick: () -> Unit,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    accentColor: Color
) {
    val color = if (selected) accentColor else Color.Gray
    Column(
        modifier = Modifier
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(24.dp))
        Text(label, fontSize = 9.sp, color = color, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun MainHUDLayout(
    viewModel: MainViewModel,
    panelSurface: Color,
    accentCyan: Color,
    accentGold: Color
) {
    var showEntryDialog by remember { mutableStateOf(false) }
    val natalData by viewModel.natalData.collectAsState()

    if (showEntryDialog) {
        NatalEntryDialog(
            viewModel = viewModel,
            initialData = natalData,
            accentColor = accentCyan,
            onDismiss = { showEntryDialog = false }
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .widthIn(max = 860.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = panelSurface),
            border = BorderStroke(1.dp, accentCyan.copy(alpha = 0.5f)),
            elevation = CardDefaults.cardElevation(0.dp)
        ) {
            NatalDataSummary(natalData, accentCyan, onCalibrateClick = { showEntryDialog = true })
        }

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .widthIn(max = 920.dp)
                .wrapContentHeight(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = panelSurface),
            border = BorderStroke(1.dp, accentGold.copy(alpha = 0.35f)),
            elevation = CardDefaults.cardElevation(0.dp)
        ) {
            NatalMandalasPanel(viewModel, accentGold, accentCyan)
        }
    }
}

@Composable
fun NatalPanelWrapper(viewModel: MainViewModel, surface: Color, gold: Color, cyan: Color, modifier: Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = surface),
        border = BorderStroke(1.dp, gold.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(0.dp)
    ) {
        NatalMandalasPanel(viewModel, gold, cyan)
    }
}

@Composable
fun NatalDataSummary(data: com.dyzzy.aetheris.models.NatalData, accentColor: Color, onCalibrateClick: () -> Unit) {
    Row(
        modifier = Modifier
            .padding(horizontal = 32.dp, vertical = 20.dp)
            .fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Default.LocationOn, "Origin", tint = accentColor, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = "${data.birthCity.uppercase()} // ${data.birthDate} // ${data.birthTime} UTC",
            fontWeight = FontWeight.ExtraBold,
            fontSize = 15.sp,
            letterSpacing = 1.sp,
            color = Color.White,
            maxLines = 1,
            softWrap = false,
            overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f, fill = false)
        )
        Spacer(modifier = Modifier.width(24.dp))
        // PROTECTED BUTTON WIDTH: Prevents compositor squashing and provides clear raycast target
        Box(modifier = Modifier.requiredWidthIn(min = 160.dp)) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = accentColor.copy(alpha = 0.2f),
                border = BorderStroke(1.dp, accentColor),
                modifier = Modifier.clickable { onCalibrateClick() },
                shadowElevation = 0.dp,
                tonalElevation = 0.dp
            ) {
                Text(
                    "CALIBRATE ORIGIN",
                    modifier = Modifier
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .fillMaxWidth(),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = accentColor,
                    maxLines = 1,
                    softWrap = false,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        }
    }
}

@Composable
fun NatalEntryDialog(
    viewModel: MainViewModel,
    initialData: com.dyzzy.aetheris.models.NatalData,
    accentColor: Color,
    onDismiss: () -> Unit
) {
    // Current selections (Defaults to initial data or reasonable ranges)
    var selYear by remember { mutableStateOf(initialData.birthDate.take(4).toIntOrNull() ?: 1996) }
    var selMonth by remember { mutableStateOf(initialData.birthDate.substring(5, 7).toIntOrNull() ?: 10) }
    var selDay by remember { mutableStateOf(initialData.birthDate.takeLast(2).toIntOrNull() ?: 31) }
    
    var selHour by remember { mutableStateOf(1) }
    var selMin by remember { mutableStateOf(0) }
    var selAmPm by remember { mutableStateOf("AM") }
    var city by remember { mutableStateOf(initialData.birthCity) }

    // Init selHour/Min from initialData (HH:MM)
    LaunchedEffect(initialData) {
        val rawHour = initialData.birthTime.take(2).toIntOrNull() ?: 3
        selMin = initialData.birthTime.takeLast(2).toIntOrNull() ?: 33
        if (rawHour >= 12) {
            selAmPm = "PM"
            selHour = if (rawHour == 12) 12 else rawHour - 12
        } else {
            selAmPm = "AM"
            selHour = if (rawHour == 0) 12 else rawHour
        }
    }

    SpatialDialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.width(600.dp).wrapContentHeight(),
            shape = RoundedCornerShape(32.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF121626)),
            border = BorderStroke(2.dp, accentColor),
            elevation = CardDefaults.cardElevation(0.dp)
        ) {
            Column(
                modifier = Modifier.padding(40.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                Text(
                    "CALIBRATE ORIGIN",
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp,
                    color = accentColor,
                    letterSpacing = 2.sp
                )
                
                // DATE PICKER
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text("DATE OF INCEPTION", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        SpatialPicker(selYear.toString(), { selYear = (1900..2026).find { it == selYear } ?: 1996 }, Modifier.weight(1.2f))
                        SpatialPicker(monthNames[selMonth - 1], { /* Toggle logic */ }, Modifier.weight(1f))
                        SpatialPicker(selDay.toString().padStart(2, '0'), { /* Toggle logic */ }, Modifier.weight(0.8f))
                    }
                    // SIMPLIFIED ROW FOR PROTOTYPE (In a real app, these would be Dropdowns)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        TextButton(onClick = { if (selYear > 1900) selYear-- }) { Text("- YEAR", fontSize = 10.sp) }
                        TextButton(onClick = { if (selYear < 2026) selYear++ }) { Text("+ YEAR", fontSize = 10.sp) }
                        TextButton(onClick = { if (selMonth > 1) selMonth-- }) { Text("- MONTH", fontSize = 10.sp) }
                        TextButton(onClick = { if (selMonth < 12) selMonth++ }) { Text("+ MONTH", fontSize = 10.sp) }
                    }
                }

                // TIME PICKER
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text("TEMPORAL VECTORS", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        SpatialPicker(selHour.toString().padStart(2, '0'), { /* Toggle */ }, Modifier.weight(1f))
                        SpatialPicker(selMin.toString().padStart(2, '0'), { /* Toggle */ }, Modifier.weight(1f))
                        SpatialPicker(selAmPm, { selAmPm = if (selAmPm == "AM") "PM" else "AM" }, Modifier.weight(1f))
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        TextButton(onClick = { selHour = if (selHour == 1) 12 else selHour - 1 }) { Text("- HR", fontSize = 10.sp) }
                        TextButton(onClick = { selHour = if (selHour == 12) 1 else selHour + 1 }) { Text("+ HR", fontSize = 10.sp) }
                        TextButton(onClick = { selMin = if (selMin == 0) 55 else selMin - 5 }) { Text("- MIN", fontSize = 10.sp) }
                        TextButton(onClick = { selMin = if (selMin == 55) 0 else selMin + 5 }) { Text("+ MIN", fontSize = 10.sp) }
                    }
                }

                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("SPATIAL SECTOR (CITY)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(unfocusedBorderColor = Color.DarkGray, focusedBorderColor = accentColor)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    TextButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("CANCEL", color = Color.Gray)
                    }
                    Button(
                        onClick = {
                            val formattedDate = "$selYear-${selMonth.toString().padStart(2, '0')}-${selDay.toString().padStart(2, '0')}"
                            val militaryHour = when {
                                selAmPm == "AM" && selHour == 12 -> 0
                                selAmPm == "PM" && selHour != 12 -> selHour + 12
                                else -> selHour
                            }
                            val formattedTime = "${militaryHour.toString().padStart(2, '0')}:${selMin.toString().padStart(2, '0')}"
                            
                            viewModel.updateNatalData(
                                initialData.copy(birthDate = formattedDate, birthTime = formattedTime, birthCity = city)
                            )
                            onDismiss()
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = accentColor, contentColor = Color.Black),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("CALIBRATE", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

private val monthNames = listOf("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC")

@Composable
fun SpatialPicker(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(8.dp),
        color = Color(0x22FFFFFF),
        border = BorderStroke(1.dp, Color.DarkGray)
    ) {
        Box(modifier = Modifier.padding(12.dp), contentAlignment = Alignment.Center) {
            Text(label, color = Color.White, fontWeight = FontWeight.Black, fontSize = 16.sp)
        }
    }
}

@Composable
fun NatalMandalasPanel(viewModel: MainViewModel, accentGold: Color, accentCyan: Color) {
    val chart by viewModel.natalChart.collectAsState()

    Column(
        modifier = Modifier.padding(horizontal = 48.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            "✦ NATAL CELESTIAL MANDALA",
            fontWeight = FontWeight.ExtraBold,
            fontSize = 18.sp,
            letterSpacing = 2.sp,
            color = accentGold,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        Text(
            "ASCENDANT: ${chart.ascendant.sign} ${chart.ascendant.deg}°",
            fontSize = 13.sp,
            color = Color.LightGray,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))
        HorizontalDivider(color = accentGold.copy(alpha = 0.2f))
        Spacer(modifier = Modifier.height(16.dp))

        chart.bodies.forEach { body ->
            Column(
                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(body.symbol, fontSize = 28.sp, color = accentGold)
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        body.name.uppercase(),
                        fontWeight = FontWeight.Black,
                        fontSize = 15.sp,
                        color = Color.White,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "IN ${body.sign.uppercase()} ${body.degree}°${body.minute}'",
                        fontSize = 12.sp,
                        color = accentGold,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
                Text(
                    body.archetype, 
                    fontSize = 11.sp, 
                    color = Color.LightGray,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                if (body.qliphoticSphere != null) {
                    Text(
                        "⚡ QLIPHA: ${body.qliphoticSphere.uppercase()}",
                        fontSize = 10.sp,
                        color = accentCyan.copy(alpha = 0.8f),
                        fontWeight = FontWeight.Bold,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
            HorizontalDivider(color = Color.DarkGray.copy(alpha = 0.2f))
        }

        Spacer(modifier = Modifier.height(32.dp))
        Text(
            "✦ PLANETARY ASPECTS", 
            fontWeight = FontWeight.Bold, 
            fontSize = 14.sp, 
            color = accentGold,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        Spacer(modifier = Modifier.height(12.dp))

        chart.aspects.forEach { aspect ->
            Card(
                modifier = Modifier.width(600.dp).padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0x221E2438)),
                border = BorderStroke(1.dp, accentCyan.copy(alpha = 0.1f)),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "${aspect.planet1} ${aspect.aspectType.toString().uppercase()} ${aspect.planet2}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = Color.White,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "ORB: ${aspect.orb}°", 
                        fontSize = 11.sp, 
                        color = accentCyan,
                        fontWeight = FontWeight.Black,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        }
    }
}

@Composable
fun GrimoireInvocationsView(viewModel: MainViewModel, surfaceColor: Color, accentCyan: Color) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            "📖 GRIMOIRE",
            fontWeight = FontWeight.Black,
            fontSize = 24.sp,
            letterSpacing = 2.sp,
            color = accentCyan
        )
        Text(
            "SEVEN PLANETARY CURRENT INVOCATIONS",
            fontSize = 13.sp,
            color = Color.LightGray
        )
        
        Spacer(modifier = Modifier.height(32.dp))

        com.dyzzy.aetheris.logic.OccultEngine.DAILY_INVOCATIONS.forEach { inv ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 860.dp)
                    .padding(vertical = 12.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = surfaceColor.copy(alpha = 0.5f)),
                border = BorderStroke(1.dp, accentCyan.copy(alpha = 0.2f)),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(), 
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(inv.dayOfWeek.uppercase() + " // " + inv.planet, fontWeight = FontWeight.Black, color = accentCyan, fontSize = 15.sp)
                        Text(inv.focusQlipha, color = Color.LightGray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = accentCyan.copy(alpha = 0.1f))
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        inv.barbarousFormula, 
                        fontWeight = FontWeight.Black, 
                        fontSize = 16.sp, 
                        color = Color.White,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        inv.invocationText, 
                        fontSize = 13.sp, 
                        color = Color.LightGray,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        lineHeight = 18.sp
                    )
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color.Green.copy(alpha = 0.1f),
                        border = BorderStroke(1.dp, Color.Green.copy(alpha = 0.5f)),
                        shadowElevation = 0.dp,
                        tonalElevation = 0.dp
                    ) {
                        Text(
                            "MARTIAL CORRELATION: ${inv.martialCorrelation.uppercase()}", 
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            fontSize = 11.sp, 
                            color = Color.Green,
                            fontWeight = FontWeight.Black
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun NatalMandalaView(
    viewModel: MainViewModel,
    surface: Color,
    gold: Color,
    cyan: Color
) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Text(
            "✦ CELESTIAL NATAL ALIGNMENT",
            fontWeight = FontWeight.Black,
            fontSize = 24.sp,
            letterSpacing = 2.sp,
            color = gold
        )
        Text(
            "PLANETARY MATRIX & QLIPHOTIC HARMONICS",
            fontSize = 13.sp,
            color = Color.LightGray
        )

        MainHUDLayout(viewModel, surface, cyan, gold)
    }
}

@Composable
fun CombatTelemetryView(
    viewModel: MainViewModel,
    surface: Color,
    cyan: Color,
    gold: Color
) {
    val punches by viewModel.punches.collectAsState()
    val lastPunch = punches.firstOrNull()

    Column(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Text(
            "🥊 MARTIAL COMBAT TELEMETRY",
            fontWeight = FontWeight.Black,
            fontSize = 24.sp,
            letterSpacing = 2.sp,
            color = cyan
        )
        Text(
            "STRIKE KINETICS // IMPACT FORCE & VECTOR RECOIL",
            fontSize = 13.sp,
            color = Color.LightGray
        )

        // STRIKE LIVE GAUGES
        Row(
            modifier = Modifier.fillMaxWidth().widthIn(max = 860.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = surface),
                border = BorderStroke(1.dp, cyan.copy(alpha = 0.4f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("PEAK VELOCITY", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("${lastPunch?.speedMs ?: 0.0} m/s", fontSize = 28.sp, fontWeight = FontWeight.Black, color = cyan)
                    Text("TARGET: > 9.0 m/s", fontSize = 10.sp, color = Color.DarkGray)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = surface),
                border = BorderStroke(1.dp, gold.copy(alpha = 0.4f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("IMPACT FORCE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("${lastPunch?.impactForceJoules ?: 0.0} J", fontSize = 28.sp, fontWeight = FontWeight.Black, color = gold)
                    Text("KINETIC CLIMAX", fontSize = 10.sp, color = Color.DarkGray)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = surface),
                border = BorderStroke(1.dp, Color(0xFFFF5252).copy(alpha = 0.4f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("RECOIL RETURN", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("${lastPunch?.returnTimeSec ?: 0.0} s", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color(0xFFFF5252))
                    Text("TARGET: < 0.30 s", fontSize = 10.sp, color = Color.DarkGray)
                }
            }
        }

        // STRIKE TRIGGER ACTIONS
        Row(
            modifier = Modifier.fillMaxWidth().widthIn(max = 860.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(
                onClick = { viewModel.recordPunch("Lead Jab") },
                colors = ButtonDefaults.buttonColors(containerColor = cyan),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(50.dp)
            ) {
                Text("RECORD LEAD JAB", color = Color.Black, fontWeight = FontWeight.Black)
            }
            Button(
                onClick = { viewModel.recordPunch("Cross Strike") },
                colors = ButtonDefaults.buttonColors(containerColor = gold),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(50.dp)
            ) {
                Text("RECORD CROSS STRIKE", color = Color.Black, fontWeight = FontWeight.Black)
            }
            Button(
                onClick = { viewModel.recordPunch("Iron Palm Thrust") },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF5252)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(50.dp)
            ) {
                Text("IRON PALM THRUST", color = Color.Black, fontWeight = FontWeight.Black)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // STRIKE HISTORY LOG
        Card(
            modifier = Modifier.fillMaxWidth().widthIn(max = 860.dp),
            colors = CardDefaults.cardColors(containerColor = surface),
            border = BorderStroke(1.dp, cyan.copy(alpha = 0.2f)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("LIVE STRIKE TELEMETRY STREAM", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = cyan)
                Spacer(modifier = Modifier.height(12.dp))
                punches.take(6).forEach { p ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(p.type, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Text("${p.speedMs} m/s", color = cyan, fontWeight = FontWeight.ExtraBold, fontSize = 13.sp)
                        Text("${p.impactForceJoules} J", color = gold, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text("${p.returnTimeSec}s Recoil", color = Color.LightGray, fontSize = 11.sp)
                    }
                    HorizontalDivider(color = Color.DarkGray.copy(alpha = 0.3f))
                }
            }
        }
    }
}

@Composable
fun QiGongBarbellView(
    viewModel: MainViewModel,
    surface: Color,
    cyan: Color,
    gold: Color
) {
    val session by viewModel.barbellSession.collectAsState()

    Column(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Text(
            "⚡ 6-FT BARBELL QI-GONG CONDITIONING",
            fontWeight = FontWeight.Black,
            fontSize = 24.sp,
            letterSpacing = 2.sp,
            color = gold
        )
        Text(
            "ZINC-IMBUED BARBELL // HORSE STANCE (MA BU) ROOTING MATRIX",
            fontSize = 13.sp,
            color = Color.LightGray
        )

        Card(
            modifier = Modifier.fillMaxWidth().widthIn(max = 860.dp),
            colors = CardDefaults.cardColors(containerColor = surface),
            border = BorderStroke(1.dp, gold.copy(alpha = 0.4f)),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier.padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(session.movementName.uppercase(), fontWeight = FontWeight.Black, fontSize = 18.sp, color = gold)
                Spacer(modifier = Modifier.height(8.dp))
                Text("STANCE: ${session.focusStance}", fontSize = 13.sp, color = Color.White)
                Text("COSMIC HOUR: ${session.associatedPlanetaryHour}", fontSize = 12.sp, color = cyan, fontWeight = FontWeight.Bold)

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    StatBlock("BAR LENGTH", "${session.barbellLengthFt} FT", gold)
                    StatBlock("BAR WEIGHT", "${session.barbellWeightKg} KG", cyan)
                    StatBlock("SETS / REPS", "${session.sets} x ${session.reps}", gold)
                    StatBlock("ENERGY", "${session.estimatedKcal} KCAL", Color.Green)
                }

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = { viewModel.logBarbellRep() },
                    colors = ButtonDefaults.buttonColors(containerColor = gold),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.width(280.dp).height(54.dp)
                ) {
                    Text("LOG STANCE REP (+4 KCAL)", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 14.sp)
                }
            }
        }
    }
}
