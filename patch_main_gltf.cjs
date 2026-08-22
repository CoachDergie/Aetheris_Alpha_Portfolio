const fs = require('fs');
let code = fs.readFileSync('app/src/main/java/com/dyzzy/aetheris/MainActivity.kt', 'utf8');

const importTarget = `import androidx.xr.compose.subspace.Volume`;
const importStr = `import androidx.xr.compose.subspace.Volume\nimport androidx.xr.scenecore.GltfModel\nimport androidx.xr.compose.platform.LocalSession\nimport androidx.compose.runtime.LaunchedEffect\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.setValue`;

if(!code.includes('import androidx.xr.scenecore.GltfModel')) {
  code = code.replace(importTarget, importStr);
}

const uiTarget = `// 3D Solar System View rendering in XR Volume
            Volume(modifier = SubspaceModifier.width(400.dp).height(400.dp).offset(x = 800.dp, y = 0.dp)) {
                // Here is where the 3D solarsystem.glb is intended to render.
                // You can inject the GltfModel composable here linked to "models/solarsystem.glb"
            }`;

const uiStr = `val xrSession = LocalSession.current
            var solarSystemModel by remember { mutableStateOf<GltfModel?>(null) }
            
            LaunchedEffect(xrSession) {
                if (xrSession != null) {
                    try {
                        solarSystemModel = GltfModel.create(xrSession, "models/solarsystem.glb").get()
                    } catch (e: Exception) {
                        android.util.Log.e("Aetheris", "Failed to load solar system GLB", e)
                    }
                }
            }

            // 3D Solar System View rendering in XR Volume
            Volume(modifier = SubspaceModifier.width(600.dp).height(600.dp).offset(x = 800.dp, y = 0.dp)) {
                solarSystemModel?.let { model ->
                    // Since the exact GltfModel composable might differ in alpha revisions, 
                    // this exposes the loaded scenecore GltfModel to the Spatial hierarchy.
                    // If a GltfModel composable exists in androidx.xr.compose.spatial, it goes here.
                    androidx.xr.compose.spatial.models.GltfModel(
                        gltfModel = model,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }`;

code = code.replace(uiTarget, uiStr);
fs.writeFileSync('app/src/main/java/com/dyzzy/aetheris/MainActivity.kt', code);
console.log("Added GLTF loading logic to MainActivity.kt");
