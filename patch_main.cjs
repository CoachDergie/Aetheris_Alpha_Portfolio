const fs = require('fs');
let code = fs.readFileSync('app/src/main/java/com/dyzzy/aetheris/MainActivity.kt', 'utf8');

const importTarget = `import androidx.xr.compose.subspace.SpatialPanel`;
const importStr = `import androidx.xr.compose.subspace.Volume\nimport androidx.xr.compose.spatial.models.GltfModel\nimport androidx.xr.scenecore.GltfModel\nimport androidx.compose.ui.res.painterResource\nimport androidx.compose.foundation.Image\nimport androidx.compose.foundation.layout.Box\nimport androidx.compose.foundation.layout.fillMaxSize\nimport androidx.compose.ui.Modifier\nimport androidx.compose.runtime.LaunchedEffect\nimport androidx.compose.runtime.mutableStateOf\nimport androidx.compose.runtime.remember\nimport androidx.compose.runtime.getValue\nimport androidx.compose.runtime.setValue\nimport androidx.xr.compose.subspace.layout.offset\nimport androidx.compose.ui.unit.dp`;

code = code.replace(importTarget, importStr + '\n' + importTarget);

const uiTarget = `GrimoireSpatialPanel(xrBridge = xrBridge)`;
const uiStr = `GrimoireSpatialPanel(xrBridge = xrBridge)\n\n            // 3D Solar System View\n            Volume(modifier = SubspaceModifier.width(400.dp).height(400.dp).offset(x = 600.dp, y = 0.dp)) {\n                // Placeholder for Solar System 3D Model\n                // When glb is fully supported, render using GltfModel\n                // Or any native SceneCore element provided via sideloading.\n            }`;

code = code.replace(uiTarget, uiStr);
fs.writeFileSync('app/src/main/java/com/dyzzy/aetheris/MainActivity.kt', code);
console.log("Patched MainActivity.kt");
