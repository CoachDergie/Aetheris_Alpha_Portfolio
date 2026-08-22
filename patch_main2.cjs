const fs = require('fs');
let code = fs.readFileSync('app/src/main/java/com/dyzzy/aetheris/MainActivity.kt', 'utf8');

// We will add the Volume block inside Subspace.
// We remove the bad imports first to avoid compilation issues.
code = code.replace("import androidx.xr.compose.spatial.models.GltfModel\n", "");
code = code.replace("import androidx.xr.scenecore.GltfModel\n", "");

const newUiStr = `GrimoireSpatialPanel(xrBridge = xrBridge)

            // 3D Solar System View rendering in XR Volume
            Volume(modifier = SubspaceModifier.width(400.dp).height(400.dp).offset(x = 800.dp, y = 0.dp)) {
                // Here is where the 3D solarsystem.glb is intended to render.
                // You can inject the GltfModel composable here linked to "models/solarsystem.glb"
            }`;

code = code.replace(/GrimoireSpatialPanel\(xrBridge = xrBridge\)\s*\n\s*\/\/ 3D Solar System View rendering in XR Volume\s*\n\s*Volume[^{]+{\s*\/\/[^}]+\s*}/, "GrimoireSpatialPanel(xrBridge = xrBridge)"); // clean up if repeated

code = code.replace(`GrimoireSpatialPanel(xrBridge = xrBridge)

            // 3D Solar System View
            Volume(modifier = SubspaceModifier.width(400.dp).height(400.dp).offset(x = 600.dp, y = 0.dp)) {
                // Placeholder for Solar System 3D Model
                // When glb is fully supported, render using GltfModel
                // Or any native SceneCore element provided via sideloading.
            }`, newUiStr);

fs.writeFileSync('app/src/main/java/com/dyzzy/aetheris/MainActivity.kt', code);
console.log("Cleaned up MainActivity.kt");
