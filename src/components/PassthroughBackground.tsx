import React, { useEffect, useRef, useState } from 'react';

interface PassthroughBackgroundProps {
  passthroughActive: boolean;
  anchorType: 'loft' | 'room' | 'celestial_zenith';
  handTrackingSimActive: boolean;
}

export const PassthroughBackground: React.FC<PassthroughBackgroundProps> = ({
  passthroughActive,
  anchorType,
  handTrackingSimActive,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    if (passthroughActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then((stream) => {
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setCameraActive(true);
            setStreamError(null);
          }
        })
        .catch((err) => {
          console.warn('Camera passthrough fallback to simulated AR feed:', err);
          setStreamError('Passthrough camera simulated (Meta Quest / WebXR feed standby)');
          setCameraActive(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      setStreamError(null);
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [passthroughActive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Real Camera Feed or Simulated AR Environment */}
      {passthroughActive ? (
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              cameraActive ? 'opacity-40 filter contrast-125 brightness-75' : 'opacity-0'
            }`}
          />

          {(!cameraActive || streamError) && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0514]/90 via-[#120722]/80 to-[#05020a]/95 flex items-center justify-center">
              <div className="text-center font-mono space-y-2 opacity-70">
                <div className="w-16 h-16 mx-auto rounded-full border border-orange-500/40 animate-ping"></div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-400">
                  OpenXR Passthrough Mode Active
                </p>
                <p className="text-[10px] text-gray-400">
                  Physical environment mapped • Spatial Anchor: [{anchorType.toUpperCase()}]
                </p>
              </div>
            </div>
          )}

          {/* AR Wireframe Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ff4500_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
      ) : (
        /* Dark Immersive Sci-Fi Canvas matching Design HTML */
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #1a0b2e 0%, #000000 85%)',
              opacity: 0.95,
            }}
          />
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 20% 30%, rgba(255, 69, 0, 0.15) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(75, 0, 130, 0.25) 0%, transparent 45%)',
            }}
          />
          {/* Subtle esoteric sacred geometry watermark */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </>
      )}

      {/* Hand tracking visual reticles indicator */}
      {handTrackingSimActive && (
        <div className="absolute bottom-6 left-6 z-10 font-mono text-[9px] text-orange-400/80 uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full border border-orange-500/30 backdrop-blur-md flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
          OpenXR Hand Tracking: Left/Right Skeletal Mesh Locked
        </div>
      )}
    </div>
  );
};
