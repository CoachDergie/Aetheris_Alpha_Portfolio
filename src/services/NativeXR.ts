// src/services/NativeXR.ts

interface AndroidXRInterface {
  requestLoftAnchor(): void;
  setAnchorMode(mode: string): void;
  getHandTelemetry(): string;
  logNative(message: string): void;
}

declare global {
  interface Window {
    AndroidXR?: AndroidXRInterface;
  }
}

export const setNativeAnchorMode = (mode: 'loft' | 'room' | 'celestial_zenith'): void => {
  if (window.AndroidXR && typeof window.AndroidXR.setAnchorMode === 'function') {
    window.AndroidXR.setAnchorMode(mode);
  } else {
    console.warn('Native AndroidXR.setAnchorMode unavailable (Mode: ' + mode + ')');
  }
};

export const anchorPanelToLoft = (): void => {
  if (window.AndroidXR) {
    window.AndroidXR.requestLoftAnchor();
  } else {
    console.warn('Native AndroidXR interface unavailable (Running outside XR Shell)');
  }
};
