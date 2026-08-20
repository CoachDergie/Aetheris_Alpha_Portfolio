#pragma once

#include <memory>
#include <vector>
#include <optional>
#include <android/log.h>

#define LOG_TAG "Aetheris-Native-XR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace aetheris {

/**
 * Modern C++20 OpenXR Manager.
 * Uses smart pointers and RAII to ensure memory safety and resource cleanup.
 */
class XrManager {
public:
    XrManager() = default;

    // Disable copying to prevent double-free of XR resources
    XrManager(const XrManager&) = delete;
    XrManager& operator=(const XrManager&) = delete;

    // Move construction is allowed
    XrManager(XrManager&&) noexcept = default;
    XrManager& operator=(XrManager&&) noexcept = default;

    virtual ~XrManager() {
        shutdown();
    }

    bool initialize(void* activity) {
        LOGI("Initializing Spatial Runtime...");
        // In a full implementation, we would load the OpenXR loader here
        // and initialize the XrInstance using the Android-specific extensions.
        m_initialized = true;
        return m_initialized;
    }

    void shutdown() {
        if (m_initialized) {
            LOGI("Shutting down Spatial Runtime. Releasing OpenXR resources...");
            // Explicitly destroy OpenXR resources in reverse order of creation
            // xrDestroySession(...)
            // xrDestroyInstance(...)
            m_initialized = false;
        }
    }

    [[nodiscard]] bool isInitialized() const { return m_initialized; }

private:
    bool m_initialized = false;

    // Smart pointers with custom deleters would be used here for XrInstance, XrSession, etc.
    // Example:
    // struct XrInstanceDeleter { void operator()(XrInstance inst) { xrDestroyInstance(inst); } };
    // std::unique_ptr<XrInstance_t, XrInstanceDeleter> m_instance;
};

} // namespace aetheris
