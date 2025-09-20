import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Download, Calendar } from "lucide-react";
import QRCode from "qrcode";

export function QRGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [currentCode, setCurrentCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const codeValue = `JASAKULA_${today}_${Date.now()}`;
      
      // First, deactivate old QR codes for today
      await supabase
        .from("qr_codes")
        .update({ is_active: false })
        .eq("date", today);

      // Create new QR code record
      const { data, error } = await supabase
        .from("qr_codes")
        .insert({
          code: codeValue,
          date: today,
          is_active: true,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })
        .select()
        .single();

      if (error) throw error;

      // Generate QR code image
      const qrUrl = await QRCode.toDataURL(codeValue, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af', // Primary color
          light: '#ffffff'
        }
      });

      setQrCodeUrl(qrUrl);
      setCurrentCode(codeValue);

      toast({
        title: "QR Code Berhasil Dibuat",
        description: `QR Code untuk tanggal ${today} telah dihasilkan`,
        className: "toast-success",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat QR Code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `QR_Absensi_${new Date().toISOString().split('T')[0]}.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: "QR Code Diunduh",
      description: "QR Code telah diunduh ke perangkat Anda",
      className: "toast-success",
    });
  };

  const loadTodayQRCode = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("date", today)
        .eq("is_active", true)
        .single();

      if (data && !error) {
        const qrUrl = await QRCode.toDataURL(data.code, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1e40af',
            light: '#ffffff'
          }
        });
        
        setQrCodeUrl(qrUrl);
        setCurrentCode(data.code);
      }
    } catch (error) {
      // No QR code exists for today, which is fine
    }
  };

  useEffect(() => {
    loadTodayQRCode();
  }, []);

  return (
    <Card className="card-corporate">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate QR Code harian untuk absensi karyawan
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {qrCodeUrl ? (
          <div className="qr-container space-y-4">
            <img
              src={qrCodeUrl}
              alt="QR Code Absensi"
              className="mx-auto rounded-lg shadow-card"
            />
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                QR Code Aktif
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {currentCode}
              </p>
              <div className="status-online w-fit mx-auto">
                <div className="w-2 h-2 bg-accent-foreground rounded-full"></div>
                Aktif Hari Ini
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generateQRCode}
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Regenerate
              </Button>
              
              <Button
                onClick={downloadQRCode}
                variant="corporate"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center">
              <Calendar className="w-12 h-12 text-muted-foreground" />
            </div>
            
            <div>
              <p className="text-muted-foreground">
                Belum ada QR Code untuk hari ini
              </p>
            </div>

            <Button
              onClick={generateQRCode}
              disabled={isGenerating}
              variant="corporate"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate QR Code Hari Ini
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          <p>QR Code akan otomatis expire dalam 24 jam</p>
          <p>Pastikan untuk men-download QR Code sebelum memulai absensi</p>
        </div>
      </CardContent>
    </Card>
  );
}