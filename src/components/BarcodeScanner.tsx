import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose?: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('barcode-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {}
      );

      setScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Camera access denied or not available. Please use manual entry.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!scanning && e.key === 'Enter' && manualBarcode.trim()) {
        onScan(manualBarcode.trim());
        setManualBarcode('');
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [manualBarcode, scanning, onScan]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Barcode Scanner</CardTitle>
            <CardDescription>Scan barcode with camera or enter manually</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">{error}</div>
        )}

        <div>
          {!scanning ? (
            <Button onClick={startScanning} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="w-full">
              Stop Scanning
            </Button>
          )}
        </div>

        <div id="barcode-reader" className={scanning ? 'w-full' : 'hidden'}></div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
          </div>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-2">
          <Label htmlFor="manual-barcode">Barcode</Label>
          <Input
            id="manual-barcode"
            placeholder="Type or scan barcode..."
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            autoFocus={!scanning}
          />
          <Button type="submit" className="w-full" disabled={!manualBarcode.trim()}>
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
