// src/services/NativeXR.ts

interface AndroidXRInterface {
  requestLoftAnchor(): void;
  getHandTelemetry(): string;
  logNative(message: string): void;
}

declare global {
  interface Window {
    AndroidXR?: AndroidXRInterface;
  }
}

export const anchorPanelToLoft = (): void => {
  if (window.AndroidXR) {
    window.AndroidXR.requestLoftAnchor();
  } else {
    console.warn('Native AndroidXR interface unavailable (Running outside XR Shell)');
  }
};
