#include <jni.h>
#include <memory>
#include "xr_manager.hpp"

// Global manager instance using unique_ptr for automatic cleanup
static std::unique_ptr<aetheris::XrManager> g_xrManager = nullptr;

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_dyzzy_aetheris_MainActivity_nativeInitializeXR(JNIEnv* env, jobject activity) {
    if (!g_xrManager) {
        g_xrManager = std::make_unique<aetheris::XrManager>();
    }

    return static_cast<jboolean>(g_xrManager->initialize(activity));
}

extern "C"
JNIEXPORT void JNICALL
Java_com_dyzzy_aetheris_MainActivity_nativeShutdownXR(JNIEnv* env, jobject activity) {
    if (g_xrManager) {
        g_xrManager->shutdown();
        g_xrManager.reset(); // Explicitly destroy the manager
    }
}

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_dyzzy_aetheris_MainActivity_nativeIsXRActive(JNIEnv* env, jobject /* this */) {
    return static_cast<jboolean>(g_xrManager && g_xrManager->isInitialized());
}
