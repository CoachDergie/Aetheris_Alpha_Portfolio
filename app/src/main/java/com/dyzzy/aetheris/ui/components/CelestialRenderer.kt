package com.dyzzy.aetheris.ui.components

import android.content.Context
import android.graphics.PixelFormat
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.SurfaceHolder
import android.view.SurfaceView
import com.dyzzy.aetheris.logic.SolarSystemLogic
import com.google.android.filament.*
import com.google.android.filament.gltfio.AssetLoader
import com.google.android.filament.gltfio.FilamentAsset
import com.google.android.filament.gltfio.ResourceLoader
import com.google.android.filament.gltfio.UbershaderProvider
import com.google.android.filament.utils.*
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.thread
import kotlin.math.*

/**
 * Filament-based 3D renderer for the solar system "Window into space".
 * Optimized for Meta Quest 2D panel mode (Loft environment) with Analytic Depth.
 * Current State: Stability Rollback (Planets Only) for scale verification.
 */
class CelestialRenderer(context: Context) : SurfaceView(context), SurfaceHolder.Callback, SensorEventListener {

    private val mainHandler = Handler(Looper.getMainLooper())
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    
    private val filamentLock = ReentrantLock()
    @Volatile private var isDestroyed = false

    private var headOffsetX = 0f
    private var headOffsetY = 0f
    
    @Volatile
    var days: Double = SolarSystemLogic.getDaysSinceJ2000()

    private var engine: Engine? = null
    private var renderer: Renderer? = null
    private var scene: Scene? = null
    private var view: View? = null
    private var filamentCamera: Camera? = null
    private var assetLoader: AssetLoader? = null
    private var resourceLoader: ResourceLoader? = null
    
    private val planetAssets = ConcurrentHashMap<String, FilamentAsset>()
    private val orbitRings = ConcurrentHashMap<String, OrbitRing>()
    private var sunAsset: FilamentAsset? = null

    private var swapChain: SwapChain? = null
    
    private var frameCallback = object : android.view.Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (!isDestroyed) {
                render(frameTimeNanos)
                android.view.Choreographer.getInstance().postFrameCallback(this)
            }
        }
    }

    init {
        holder.addCallback(this)
        setZOrderMediaOverlay(true)
        holder.setFormat(PixelFormat.TRANSLUCENT)
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        Log.d("Aetheris", "CelestialRenderer: Surface created")
        filamentLock.lock()
        try {
            isDestroyed = false
            val engine = Engine.create()
            this.engine = engine
            
            renderer = engine.createRenderer()
            scene = engine.createScene()
            view = engine.createView()
            filamentCamera = engine.createCamera(engine.entityManager.create())
            
            view!!.scene = scene
            view!!.camera = filamentCamera
            
            assetLoader = AssetLoader(engine, UbershaderProvider(engine), engine.entityManager)
            resourceLoader = ResourceLoader(engine)

            swapChain = engine.createSwapChain(holder.surface)
            
            rotationSensor?.let {
                sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            }
            
            setupInitialScene()
            android.view.Choreographer.getInstance().postFrameCallback(frameCallback)
        } catch (e: Exception) {
            Log.e("Aetheris", "CelestialRenderer: Initialization failed", e)
        } finally {
            filamentLock.unlock()
        }
    }

    private fun setupInitialScene() {
        val engine = engine ?: return
        val scene = scene ?: return

        // Space Skybox - Dark Cosmic Navy
        val skybox = Skybox.Builder().color(0.001f, 0.001f, 0.005f, 1.0f).build(engine)
        scene.skybox = skybox

        // Lighting
        val light1 = engine.entityManager.create()
        LightManager.Builder(LightManager.Type.DIRECTIONAL)
            .color(1.0f, 1.0f, 1.0f)
            .intensity(250000.0f)
            .direction(0.5f, -0.5f, -1.0f)
            .castShadows(true)
            .build(engine, light1)
        scene.addEntity(light1)

        val ibl = IndirectLight.Builder().intensity(40000.0f).build(engine)
        scene.indirectLight = ibl

        startBackgroundAssetLoad()
        updateCamera(0f, 0f)
    }

    private fun startBackgroundAssetLoad() {
        thread {
            try {
                val names = SolarSystemLogic.PLANET_DATA.keys.toList()
                for (name in names) {
                    if (isDestroyed) break
                    val path = "models/$name.glb"
                    val bytes = try { context.assets.open(path).use { it.readBytes() } } catch (e: Exception) { null }
                    if (bytes == null) continue
                    val buffer = ByteBuffer.allocateDirect(bytes.size).put(bytes).flip() as ByteBuffer
                    mainHandler.post {
                        filamentLock.lock()
                        try {
                            if (!isDestroyed && engine != null && assetLoader != null) {
                                val asset = assetLoader!!.createAsset(buffer)
                                if (asset != null) {
                                    resourceLoader?.loadResources(asset)
                                    scene?.addEntities(asset.entities)
                                    if (name == "sun") {
                                        sunAsset = asset
                                    } else {
                                        planetAssets[name] = asset
                                        val ring = OrbitRing(engine, name, 18.0f)
                                        orbitRings[name] = ring
                                        scene?.addEntity(ring.entity)
                                    }
                                    Log.d("Aetheris", "CelestialRenderer: Added $name")
                                }
                            }
                        } finally { filamentLock.unlock() }
                    }
                    Thread.sleep(300)
                }
            } catch (e: Exception) {}
        }
    }

    private fun render(frameTimeNanos: Long) {
        if (!filamentLock.tryLock()) return 
        try {
            val engine = engine ?: return
            val renderer = renderer ?: return
            val swapChain = swapChain ?: return
            val view = view ?: return
            val camera = filamentCamera ?: return

            updateCamera(headOffsetX, headOffsetY)

            val daysLocal = days
            val orbitalScale = 18.0f 
            val baseMeshScale = 0.002f 
            val sunScale = 0.015f // Sharp solar disc     
            
            val tm = engine.transformManager

            // Lean the entire system (Planets)
            val systemTransform = FloatArray(16).apply {
                android.opengl.Matrix.setIdentityM(this, 0)
                android.opengl.Matrix.translateM(this, 0, 0f, 1.5f, 0f)
                android.opengl.Matrix.rotateM(this, 0, -45f, 1f, 0f, 0f)
            }

            // Update Sun
            sunAsset?.let { asset ->
                val instance = tm.getInstance(asset.root)
                if (instance != 0) {
                    tm.setTransform(instance, FloatArray(16).apply { 
                        System.arraycopy(systemTransform, 0, this, 0, 16)
                        android.opengl.Matrix.scaleM(this, 0, sunScale, sunScale, sunScale)
                    })
                }
            }

            // Update Planets and Rings
            planetAssets.forEach { (name, asset) ->
                val posRaw = SolarSystemLogic.calculatePosition(name, daysLocal, orbitalScale)
                var finalMeshScale = baseMeshScale
                var yOffset = 0f
                
                when(name) {
                    "earth" -> {
                        finalMeshScale = baseMeshScale * 6.0f 
                        yOffset = 4.0f // Elevated significantly for visibility
                    }
                    "jupiter", "saturn" -> finalMeshScale = baseMeshScale * 1.5f
                    else -> finalMeshScale = baseMeshScale * 3.0f
                }

                val instance = tm.getInstance(asset.root)
                if (instance != 0) {
                    tm.setTransform(instance, FloatArray(16).apply {
                        android.opengl.Matrix.setIdentityM(this, 0)
                        System.arraycopy(systemTransform, 0, this, 0, 16)
                        android.opengl.Matrix.translateM(this, 0, posRaw.x, posRaw.y + yOffset, posRaw.z)
                        android.opengl.Matrix.scaleM(this, 0, finalMeshScale, finalMeshScale, finalMeshScale)
                    })
                }

                orbitRings[name]?.let { ring ->
                    val ringInstance = tm.getInstance(ring.entity)
                    if (ringInstance != 0) {
                        tm.setTransform(ringInstance, systemTransform)
                    }
                }
            }

            if (renderer.beginFrame(swapChain, frameTimeNanos)) {
                renderer.render(view)
                renderer.endFrame()
            }
        } finally { filamentLock.unlock() }
    }

    private fun updateCamera(headOffsetX: Float, headOffsetY: Float) {
        val cam = filamentCamera ?: return
        // Baseline eye distance at 20 meters for strong parallax
        val eyeX = headOffsetX * 15.0f
        val eyeY = 25.0f + headOffsetY * 10.0f
        val eyeZ = 20.0f
        
        cam.lookAt(eyeX.toDouble(), eyeY.toDouble(), eyeZ.toDouble(), 0.0, 1.5, 0.0, 0.0, 1.0, 0.0)
        val aspect = if (width > 0 && height > 0) width.toDouble() / height.toDouble() else 1.0
        cam.setProjection(65.0, aspect, 0.1, 10000.0, Camera.Fov.VERTICAL)
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        filamentLock.lock()
        try { view?.viewport = Viewport(0, 0, width, height) } finally { filamentLock.unlock() }
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        filamentLock.lock()
        try {
            isDestroyed = true
            android.view.Choreographer.getInstance().removeFrameCallback(frameCallback)
            sensorManager.unregisterListener(this)
            val engine = engine ?: return
            assetLoader?.destroy()
            resourceLoader?.destroy()
            orbitRings.values.forEach { it.destroy(engine) }
            orbitRings.clear()
            filamentCamera?.let { engine.destroyEntity(it.entity) }
            view?.let { engine.destroyView(it) }
            scene?.let {
                it.skybox?.let { sky -> engine.destroySkybox(sky) }
                it.indirectLight?.let { ibl -> engine.destroyIndirectLight(ibl) }
                engine.destroyScene(it)
            }
            renderer?.let { engine.destroyRenderer(it) }
            swapChain?.let { engine.destroySwapChain(it) }
            engine.destroy()
        } finally { filamentLock.unlock() }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_ROTATION_VECTOR) {
            val rotationMatrix = FloatArray(16)
            SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
            val orientations = FloatArray(3)
            SensorManager.getOrientation(rotationMatrix, orientations)
            headOffsetX = orientations[0] 
            headOffsetY = orientations[1]
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
