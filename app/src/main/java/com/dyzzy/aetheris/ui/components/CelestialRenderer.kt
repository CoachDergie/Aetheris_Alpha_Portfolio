package com.dyzzy.aetheris.ui.components

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.SurfaceTexture
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Surface
import android.view.TextureView
import com.dyzzy.aetheris.logic.SolarSystemLogic
import com.dyzzy.aetheris.logic.SphereMeshBuilder
import com.google.android.filament.*
import com.google.android.filament.filamat.MaterialBuilder
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.thread

/**
 * Hand-built Orrery Renderer using procedurally generated geometry and astronomical data.
 * Replaces glTF imports with optimized UV spheres and Keplerian ellipses.
 */
class CelestialRenderer(context: Context) : TextureView(context), TextureView.SurfaceTextureListener, SensorEventListener {

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

    private val bodies = ConcurrentHashMap<String, BodyResources>()
    private val orbitRings = ConcurrentHashMap<String, OrbitRing>()
    
    private var planetMaterial: Material? = null
    private var sunMaterial: Material? = null
    private var swapChain: SwapChain? = null
    
    private var frameCallback = object : android.view.Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (!isDestroyed) {
                render(frameTimeNanos)
                android.view.Choreographer.getInstance().postFrameCallback(this)
            }
        }
    }

    private class BodyResources(
        val entity: Int,
        val vertexBuffer: VertexBuffer,
        val indexBuffer: IndexBuffer,
        val texture: Texture
    ) {
        fun destroy(engine: Engine) {
            engine.destroyEntity(entity)
            engine.destroyVertexBuffer(vertexBuffer)
            engine.destroyIndexBuffer(indexBuffer)
            engine.destroyTexture(texture)
        }
    }

    init {
        surfaceTextureListener = this
        isOpaque = true
    }

    override fun onSurfaceTextureAvailable(surfaceTexture: SurfaceTexture, width: Int, height: Int) {
        filamentLock.lock()
        try {
            isDestroyed = false
            val engine = Engine.create(Engine.Backend.OPENGL)
            this.engine = engine
            
            renderer = engine.createRenderer()
            scene = engine.createScene()
            view = engine.createView()
            filamentCamera = engine.createCamera(engine.entityManager.create())
            
            view!!.scene = scene
            view!!.camera = filamentCamera
            view!!.viewport = Viewport(0, 0, width, height)
            
            // Set basic clear color
            renderer!!.setClearOptions(Renderer.ClearOptions().apply {
                clearColor = doubleArrayOf(0.01, 0.01, 0.02, 1.0)
                clear = true
            })
            
            view!!.setShadowingEnabled(false)
            view!!.setPostProcessingEnabled(false)
            
            surfaceTexture.setDefaultBufferSize(width, height)
            swapChain = engine.createSwapChain(Surface(surfaceTexture))
            
            rotationSensor?.let {
                sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            }
            
            OrbitLineMaterial.init(context, engine)
            loadMaterials(engine)
            setupInitialScene()
            updateCamera(width, height, 0f, 0f)
            
            android.view.Choreographer.getInstance().postFrameCallback(frameCallback)
        } catch (e: Exception) {
            Log.e("Aetheris", "CelestialRenderer: Init failed", e)
        } finally {
            filamentLock.unlock()
        }
    }

    private fun loadMaterials(engine: Engine) {
        try {
            MaterialBuilder.init()
            
            // Planet Material: Simple Textured Lit
            val planetPkg = MaterialBuilder()
                .name("PlanetMaterial")
                .shading(MaterialBuilder.Shading.LIT)
                .samplerParameter(MaterialBuilder.SamplerType.SAMPLER_2D, MaterialBuilder.SamplerFormat.FLOAT, MaterialBuilder.ParameterPrecision.DEFAULT, "baseColorMap")
                .require(MaterialBuilder.VertexAttribute.UV0)
                .material("void material(inout MaterialInputs material) { prepareMaterial(material); material.baseColor = texture(materialParams_baseColorMap, getUV0()); }")
                .build()
            
            if (planetPkg.isValid) {
                val buffer = planetPkg.buffer
                planetMaterial = Material.Builder().payload(buffer, buffer.remaining()).build(engine)
                Log.d("Aetheris", "Planet material built successfully")
            }

            // Sun Material: Unlit
            val sunPkg = MaterialBuilder()
                .name("SunMaterial")
                .shading(MaterialBuilder.Shading.UNLIT)
                .samplerParameter(MaterialBuilder.SamplerType.SAMPLER_2D, MaterialBuilder.SamplerFormat.FLOAT, MaterialBuilder.ParameterPrecision.DEFAULT, "baseColorMap")
                .require(MaterialBuilder.VertexAttribute.UV0)
                .material("void material(inout MaterialInputs material) { prepareMaterial(material); material.baseColor = texture(materialParams_baseColorMap, getUV0()); }")
                .build()
            
            if (sunPkg.isValid) {
                val buffer = sunPkg.buffer
                sunMaterial = Material.Builder().payload(buffer, buffer.remaining()).build(engine)
                Log.d("Aetheris", "Sun material built successfully")
            }
        } catch (e: Exception) {
            Log.e("Aetheris", "Material creation failed", e)
        } finally {
            MaterialBuilder.shutdown()
        }
    }

    private fun setupInitialScene() {
        val engine = engine ?: return
        val scene = scene ?: return

        scene.skybox = Skybox.Builder().color(0.001f, 0.001f, 0.005f, 1.0f).build(engine)
        scene.indirectLight = IndirectLight.Builder().intensity(1000.0f).build(engine)
        
        // Sun Light: Central Point Source
        val sunLight = engine.entityManager.create()
        LightManager.Builder(LightManager.Type.POINT)
            .color(1.0f, 1.0f, 1.0f)
            .intensity(100000.0f) // Sane intensity for diagram scale
            .falloff(200.0f)
            .position(0f, 1.5f, 0f) 
            .build(engine, sunLight)
        scene.addEntity(sunLight)

        startProceduralAssetLoad()
    }

    private fun startProceduralAssetLoad() {
        thread {
            val engine = engine ?: return@thread
            val names = SolarSystemLogic.PLANET_DATA.keys.toList()
            
            for (name in names) {
                if (isDestroyed) break
                
                val tier = when (name) {
                    "sun", "earth", "saturn" -> 48
                    "jupiter", "venus", "mars" -> 32
                    else -> 20
                }
                
                val mesh = SphereMeshBuilder.build(1.0f, tier, tier)
                val texture = loadPlanetTexture(context, engine, name)
                
                mainHandler.post {
                    filamentLock.lock()
                    try {
                        if (!isDestroyed) {
                            val resources = createBodyResources(engine, name, mesh, texture)
                            bodies[name] = resources
                            scene?.addEntity(resources.entity)
                            
                            if (name != "sun" && name != "earth_moon") {
                                val ring = OrbitRing(engine, name, 18.0f)
                                orbitRings[name] = ring
                                scene?.addEntity(ring.entity)
                            }
                        }
                    } finally { filamentLock.unlock() }
                }
                Thread.sleep(100)
            }
        }
    }

    private fun loadPlanetTexture(context: Context, engine: Engine, name: String): Texture {
        return try {
            val path = "textures/${name}.jpg"
            val inputStream = context.assets.open(path)
            val bitmap = BitmapFactory.decodeStream(inputStream)
            val buffer = ByteBuffer.allocateDirect(bitmap.byteCount)
            bitmap.copyPixelsToBuffer(buffer)
            buffer.flip()
            
            val tex = Texture.Builder()
                .width(bitmap.width)
                .height(bitmap.height)
                .sampler(Texture.Sampler.SAMPLER_2D)
                .format(Texture.InternalFormat.SRGB8_A8)
                .build(engine)
            tex.setImage(engine, 0, Texture.PixelBufferDescriptor(buffer, Texture.Format.RGBA, Texture.Type.UBYTE))
            tex
        } catch (e: Exception) {
            createPlaceholderTexture(engine, name)
        }
    }

    private fun createPlaceholderTexture(engine: Engine, name: String): Texture {
        val color = when(name) {
            "sun" -> 0xFFFFFF00.toInt()
            "mars" -> 0xFFFF4400.toInt()
            "jupiter" -> 0xFFDDAA88.toInt()
            "earth" -> 0xFF2244FF.toInt()
            else -> 0xFF888888.toInt()
        }
        val bitmap = android.graphics.Bitmap.createBitmap(2, 2, android.graphics.Bitmap.Config.ARGB_8888)
        bitmap.eraseColor(color)
        val buffer = ByteBuffer.allocateDirect(bitmap.byteCount)
        bitmap.copyPixelsToBuffer(buffer)
        buffer.flip()
        val tex = Texture.Builder().width(2).height(2).format(Texture.InternalFormat.SRGB8_A8).build(engine)
        tex.setImage(engine, 0, Texture.PixelBufferDescriptor(buffer, Texture.Format.RGBA, Texture.Type.UBYTE))
        return tex
    }

    private fun createBodyResources(engine: Engine, name: String, mesh: SphereMeshBuilder.SphereMesh, texture: Texture): BodyResources {
        val vb = VertexBuffer.Builder()
            .bufferCount(3)
            .vertexCount(mesh.positions.size / 3)
            .attribute(VertexBuffer.VertexAttribute.POSITION, 0, VertexBuffer.AttributeType.FLOAT3)
            .attribute(VertexBuffer.VertexAttribute.TANGENTS, 1, VertexBuffer.AttributeType.FLOAT4)
            .attribute(VertexBuffer.VertexAttribute.UV0, 2, VertexBuffer.AttributeType.FLOAT2)
            .build(engine)
        
        val posBuffer = ByteBuffer.allocateDirect(mesh.positions.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().put(mesh.positions)
        posBuffer.flip()
        vb.setBufferAt(engine, 0, posBuffer)

        val tanBuffer = ByteBuffer.allocateDirect(mesh.tangents.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().put(mesh.tangents)
        tanBuffer.flip()
        vb.setBufferAt(engine, 1, tanBuffer)

        val uvBuffer = ByteBuffer.allocateDirect(mesh.uvs.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().put(mesh.uvs)
        uvBuffer.flip()
        vb.setBufferAt(engine, 2, uvBuffer)

        val ib = IndexBuffer.Builder()
            .indexCount(mesh.indices.size)
            .bufferType(IndexBuffer.Builder.IndexType.USHORT)
            .build(engine)
        val idxBuffer = ByteBuffer.allocateDirect(mesh.indices.size * 2).order(ByteOrder.nativeOrder()).asShortBuffer().put(mesh.indices)
        idxBuffer.flip()
        ib.setBuffer(engine, idxBuffer)

        val entity = engine.entityManager.create()
        val material = if (name == "sun") sunMaterial else planetMaterial
        val instance = material?.createInstance() ?: OrbitLineMaterial.getMaterialInstance()
        
        if (material != null) {
            instance.setParameter("baseColorMap", texture, TextureSampler())
        }

        RenderableManager.Builder(1)
            .boundingBox(Box(0f, 0f, 0f, 1f, 1f, 1f))
            .geometry(0, RenderableManager.PrimitiveType.TRIANGLES, vb, ib)
            .material(0, instance)
            .build(engine, entity)

        return BodyResources(entity, vb, ib, texture)
    }

    private fun render(frameTimeNanos: Long) {
        if (!filamentLock.tryLock()) return 
        try {
            val engine = engine ?: return
            val renderer = renderer ?: return
            val swapChain = swapChain ?: return
            val view = view ?: return

            updateCamera(width, height, headOffsetX, headOffsetY)

            val orbitalScale = 18.0f 
            val systemTransform = FloatArray(16).apply {
                android.opengl.Matrix.setIdentityM(this, 0)
                android.opengl.Matrix.translateM(this, 0, 0f, 1.5f, 0f)
                android.opengl.Matrix.rotateM(this, 0, -45f, 1f, 0f, 0f)
            }

            val tm = engine.transformManager
            
            orbitRings.forEach { (_, ring) ->
                val instance = tm.getInstance(ring.entity)
                if (instance != 0) tm.setTransform(instance, systemTransform)
            }

            bodies.forEach { (name, resources) ->
                val posRaw = SolarSystemLogic.calculatePosition(name, days, orbitalScale)
                val radius = SolarSystemLogic.planetRadiusScale(name)
                val data = SolarSystemLogic.PLANET_DATA[name]
                val rotationDeg = if (data != null) {
                    (days * 24.0 / data.rotationPeriodHours * 360.0).toFloat()
                } else 0f
                val tilt = data?.axialTiltDeg ?: 0f

                val instance = tm.getInstance(resources.entity)
                if (instance != 0) {
                    tm.setTransform(instance, FloatArray(16).apply {
                        System.arraycopy(systemTransform, 0, this, 0, 16)
                        android.opengl.Matrix.translateM(this, 0, posRaw.x, posRaw.y, posRaw.z)
                        android.opengl.Matrix.rotateM(this, 0, tilt, 0f, 0f, 1f)
                        android.opengl.Matrix.rotateM(this, 0, rotationDeg, 0f, 1f, 0f)
                        android.opengl.Matrix.scaleM(this, 0, radius, radius, radius)
                    })
                }
            }

            if (renderer.beginFrame(swapChain, frameTimeNanos)) {
                renderer.render(view)
                renderer.endFrame()
            }
        } finally { filamentLock.unlock() }
    }

    private fun updateCamera(w: Int, h: Int, headOffsetX: Float, headOffsetY: Float) {
        val cam = filamentCamera ?: return
        val eyeX = headOffsetX * 15.0f
        val eyeY = 25.0f + headOffsetY * 10.0f
        val eyeZ = 20.0f
        // target is (0, 1.5, 0) which is the system center / Sun position
        cam.lookAt(eyeX.toDouble(), eyeY.toDouble(), eyeZ.toDouble(), 0.0, 1.5, 0.0, 0.0, 1.0, 0.0)
        val aspect = if (w > 0 && h > 0) w.toDouble() / h.toDouble() else 1.0
        cam.setProjection(65.0, aspect, 0.1, 10000.0, Camera.Fov.VERTICAL)
        
        // Fix 1: Manual Exposure for stylized diagram view
        cam.setExposure(16.0f, 1.0f / 125.0f, 100.0f)
    }

    override fun onSurfaceTextureSizeChanged(surfaceTexture: SurfaceTexture, width: Int, height: Int) {
        filamentLock.lock()
        try {
            val e = engine ?: return
            surfaceTexture.setDefaultBufferSize(width, height)
            view?.viewport = Viewport(0, 0, width, height)
            swapChain?.let { e.destroySwapChain(it) }
            swapChain = e.createSwapChain(Surface(surfaceTexture))
            updateCamera(width, height, headOffsetX, headOffsetY)
        } finally { filamentLock.unlock() }
    }

    override fun onSurfaceTextureDestroyed(surfaceTexture: SurfaceTexture): Boolean {
        filamentLock.lock()
        try {
            isDestroyed = true
            android.view.Choreographer.getInstance().removeFrameCallback(frameCallback)
            sensorManager.unregisterListener(this)
            val e = engine ?: return true
            bodies.values.forEach { it.destroy(e) }
            bodies.clear()
            orbitRings.values.forEach { it.destroy(e) }
            orbitRings.clear()
            filamentCamera?.let { e.destroyEntity(it.entity) }
            view?.let { e.destroyView(it) }
            scene?.let {
                it.skybox?.let { s -> e.destroySkybox(s) }
                it.indirectLight?.let { ibl -> e.destroyIndirectLight(ibl) }
                e.destroyScene(it)
            }
            renderer?.let { e.destroyRenderer(it) }
            swapChain?.let { e.destroySwapChain(it) }
            e.destroy()
            engine = null
        } finally { filamentLock.unlock() }
        return true
    }

    override fun onSurfaceTextureUpdated(surfaceTexture: SurfaceTexture) {}

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
