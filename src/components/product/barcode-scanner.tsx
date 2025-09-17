
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const animationFrameId = useRef<number>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unsupported'>('loading');
  const { toast } = useToast();

  const cleanup = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    const initializeScanner = async () => {
      if (!('BarcodeDetector' in window)) {
        setStatus('unsupported');
        return;
      }
      
      setStatus('loading');

      try {
        const formats = await (window as any).BarcodeDetector.getSupportedFormats();
        detectorRef.current = new (window as any).BarcodeDetector({ formats: ['ean_13', 'isbn'] });
      } catch (err) {
        console.error('Failed to create BarcodeDetector:', err);
        setStatus('unsupported');
        return;
      }

      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play();
          setStatus('ready');
        }

      } catch (err) {
        console.error('Error accessing camera:', err);
        setStatus('error');
        toast({
            variant: "destructive",
            title: "Camera Access Denied",
            description: "Please enable camera permissions in your browser settings."
        });
        onClose(); // Close dialog if camera access fails
      }
    };
    
    initializeScanner();
    
    return () => {
      cleanup();
    };

  }, [isOpen, toast, onClose, cleanup]);


  useEffect(() => {
    if (status !== 'ready' || !detectorRef.current || !videoRef.current) return;

    const detectBarcode = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          if (barcodes.length > 0) {
            const detectedValue = barcodes[0].rawValue;
            onScan(detectedValue);
            onClose(); // Automatically close on successful scan
          }
        } catch (e) {
          console.error('Barcode detection failed:', e);
        }
      }
      animationFrameId.current = requestAnimationFrame(detectBarcode);
    };

    animationFrameId.current = requestAnimationFrame(detectBarcode);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [status, onScan, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Point your camera at a book's barcode (ISBN) to search for it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center">
          {status === 'loading' && (
             <div className="text-white flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Starting camera...</p>
             </div>
          )}
          {status === 'unsupported' && (
            <Alert variant="destructive">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Not Supported</AlertTitle>
                <AlertDescription>
                    Your browser does not support barcode detection. Please try a different browser like Chrome or Safari.
                </AlertDescription>
            </Alert>
          )}
          <video
            ref={videoRef}
            muted
            playsInline
            className={`w-full h-full object-cover ${status !== 'ready' ? 'hidden' : ''}`}
          />
           {status === 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[2px] bg-red-500 animate-pulse" />
              </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
