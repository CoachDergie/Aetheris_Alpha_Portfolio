plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.jetbrains.kotlin.android)
    alias(libs.plugins.meta.spatial.plugin)
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.node)
}

configure<com.github.gradle.node.NodeExtension> {
    download.set(true)
    version.set("22.12.0")
    nodeProjectDir.set(project.rootDir)
}

android {
    namespace = "com.dyzzy.aetheris"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.dyzzy.aetheris"
        minSdk = 34
        targetSdk = 35
        versionCode = 16
        versionName = "2.5"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        externalNativeBuild {
            cmake {
                cppFlags("-std=c++20")
                arguments("-DANDROID_STL=c++_shared")
            }
        }
    }

    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.22.1"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
    }
    ndkVersion = "28.2.13676358"
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        freeCompilerArgs.add("-opt-in=androidx.compose.foundation.style.ExperimentalFoundationStyleApi")
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.meta.spatial.sdk.base)
    implementation(libs.meta.spatial.sdk.toolkit)
    implementation(libs.meta.spatial.sdk.compose)
    implementation(libs.meta.spatial.sdk.vr)
    implementation(libs.filament.android)
    implementation(libs.gltfio.android)
    implementation(libs.filament.utils.android)
    implementation(libs.filamat.android)
    implementation(libs.androidx.compose.runtime)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    testImplementation(libs.junit)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
val webAppDir = project.rootDir 

val buildReactApp = tasks.register<com.github.gradle.node.npm.task.NpmTask>("buildReactApp") {
    group = "build"
    description = "Compiles React UI and injects output into Android assets."
    
    npmCommand.set(listOf("run", "build"))
    dependsOn("npmInstall")
}

val copySolarSystemModels = tasks.register<Copy>("copySolarSystemModels") {
    group = "build"
    description = "Copies 3D planet models from public/solarsystem to assets."
    from("${project.rootDir}/public/solarsystem")
    into("src/main/assets/models")
    include("*.glb")
}

// Hook into the Android build lifecycle before resources are merged
project.afterEvaluate {
    tasks.findByName("preBuild")?.dependsOn(buildReactApp, copySolarSystemModels)
}
