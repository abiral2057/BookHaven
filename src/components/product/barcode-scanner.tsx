
"use client";

import { useState, useEffect, useRef } from "react";
import BarcodeReader from 'react-barcode-reader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, VideoOff } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (isOpen) {
        try {
          // Prefer the rear camera
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          streamRef.current = stream;
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use the scanner.',
          });
        }
      } else {
        // Cleanup when dialog is closed
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setHasCameraPermission(null);
      }
    };

    getCameraPermission();

    // The main cleanup function for when the component unmounts or isOpen changes to false
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, toast]);
  
  const handleScan = (data: string | null) => {
    if (data) {
      onScan(data);
    }
  };

  const handleError = (err: any) => {
     // This can fire for non-critical reasons, e.g. no barcode found in frame.
     // We can choose to log it silently or ignore it.
     console.warn("Barcode reader error:", err);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Point your camera at a book's barcode (ISBN) to search for it.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isOpen && hasCameraPermission === null && (
             <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-muted/50 rounded-lg">
                <Camera className="h-12 w-12 mb-2 animate-pulse" />
                <p>Requesting camera permission...</p>
            </div>
          )}
          
          <div className="relative">
              {/* This video element will be visible and play the camera stream */}
              <video 
                ref={videoRef} 
                className="w-full aspect-video rounded-md bg-black" 
                autoPlay 
                muted 
                playsInline 
                style={{ display: hasCameraPermission ? 'block' : 'none' }}
              />
              
              {/* The BarcodeReader is not visible but uses the video feed */}
              {hasCameraPermission && (
                  <div style={{ display: 'none' }}>
                    <BarcodeReader
                      onError={handleError}
                      onScan={handleScan}
                    />
                </div>
              )}

              {/* Visual overlay for aiming */}
              {hasCameraPermission && (
                <>
                  <div className="absolute inset-0 border-4 border-primary/50 rounded-md pointer-events-none" />
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/70 animate-pulse" />
                </>
              )}
          </div>
          
           {hasCameraPermission === false && (
            <Alert variant="destructive">
                <VideoOff className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
