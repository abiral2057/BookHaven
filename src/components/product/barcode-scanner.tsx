
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
import { Camera } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const getCameraPermission = async () => {
      // Only run if the dialog is open
      if (!isOpen) {
        setHasCameraPermission(null);
        return;
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
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
    };

    getCameraPermission();
    
    // Cleanup function to stop the video stream when the component unmounts or dialog closes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
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
     console.log("Barcode reader error:", err);
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
          {hasCameraPermission === null && (
             <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Camera className="h-12 w-12 mb-2" />
                <p>Requesting camera permission...</p>
            </div>
          )}
          {hasCameraPermission === true && (
            <div className="relative">
               {/* BarcodeReader is not visible, but provides the scanning logic */}
               <BarcodeReader
                  onError={handleError}
                  onScan={handleScan}
                  onFind={() => {}}
               />
               <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
               <div className="absolute inset-0 border-4 border-primary/50 rounded-md pointer-events-none" />
               <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/70 animate-pulse" />
            </div>
          )}
           {hasCameraPermission === false && (
            <Alert variant="destructive">
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
