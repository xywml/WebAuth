import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, X, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<number | null>(null);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          if (code.data) {
             onScan(code.data);
             return; // Stop scanning
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(scanFrame);
  }, [onScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
              setLoading(false);
              videoRef.current?.play();
              requestRef.current = requestAnimationFrame(scanFrame);
          };
        }
      } catch (err) {
        console.error(err);
        setError('Unable to access camera. Please ensure permissions are granted.');
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [scanFrame]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-md px-4 relative">
        <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-slate-400">
               <Camera className="animate-pulse" size={48} />
               <p>Initializing Camera...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-red-400 p-6 text-center">
               <AlertCircle size={48} />
               <p>{error}</p>
            </div>
          )}

          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            playsInline 
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scanning Overlay */}
          {!loading && !error && (
            <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none">
              <div className="absolute inset-0 border-2 border-blue-500 opacity-50 animate-pulse"></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          )}
        </div>
        <p className="text-center text-slate-400 mt-6 font-medium">Point your camera at a QR Code</p>
      </div>
    </div>
  );
};