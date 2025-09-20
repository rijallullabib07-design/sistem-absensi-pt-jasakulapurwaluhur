import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Scan, User, Clock, CheckCircle2 } from "lucide-react";
import QrScanner from "qr-scanner";

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>("");
  const [employeeId, setEmployeeId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAttendance, setLastAttendance] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          setScannedResult(result.data);
          stopScanning();
          toast({
            title: "QR Code Terdeteksi",
            description: "QR Code berhasil dipindai!",
            className: "toast-success",
          });
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mengakses kamera: " + error.message,
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const processAttendance = async () => {
    if (!scannedResult || !employeeId) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Pastikan QR Code telah dipindai dan Employee ID telah diisi",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Verify employee exists
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("is_active", true)
        .single();

      if (employeeError || !employee) {
        throw new Error("Employee ID tidak ditemukan atau tidak aktif");
      }

      // Verify QR code is valid and active
      const { data: qrCode, error: qrError } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("code", scannedResult)
        .eq("is_active", true)
        .single();

      if (qrError || !qrCode) {
        throw new Error("QR Code tidak valid atau sudah expire");
      }

      // Check if already attended today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingAttendance } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employee.id)
        .eq("attendance_date", today)
        .single();

      const now = new Date().toISOString();
      let attendanceData: any = {
        employee_id: employee.id,
        qr_code_id: qrCode.id,
        attendance_date: today,
      };

      if (existingAttendance) {
        // This is check-out
        if (existingAttendance.check_out_time) {
          throw new Error("Anda sudah melakukan check-in dan check-out hari ini");
        }
        
        const { error: updateError } = await supabase
          .from("attendance")
          .update({ check_out_time: now })
          .eq("id", existingAttendance.id);

        if (updateError) throw updateError;

        setLastAttendance({
          ...existingAttendance,
          check_out_time: now,
          employee_name: employee.name,
          type: "check-out"
        });

        toast({
          title: "Check-out Berhasil",
          description: `${employee.name} telah check-out pada ${new Date().toLocaleTimeString()}`,
          className: "toast-success",
        });
      } else {
        // This is check-in
        attendanceData.check_in_time = now;
        
        // Determine if late
        const workStartTime = new Date();
        workStartTime.setHours(8, 15, 0, 0); // 08:15 with 15 min tolerance
        const currentTime = new Date();
        
        if (currentTime > workStartTime) {
          attendanceData.status = "late";
        } else {
          attendanceData.status = "present";
        }

        const { data: newAttendance, error: insertError } = await supabase
          .from("attendance")
          .insert(attendanceData)
          .select()
          .single();

        if (insertError) throw insertError;

        setLastAttendance({
          ...newAttendance,
          employee_name: employee.name,
          type: "check-in"
        });

        toast({
          title: "Check-in Berhasil",
          description: `${employee.name} telah check-in pada ${new Date().toLocaleTimeString()}`,
          className: attendanceData.status === "late" ? "toast-warning" : "toast-success",
        });
      }

      // Reset form
      setScannedResult("");
      setEmployeeId("");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memproses absensi",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card className="card-corporate">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Scan className="w-5 h-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan QR Code untuk absensi masuk/keluar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Camera Section */}
          <div className="qr-container">
            <video
              ref={videoRef}
              className="w-full h-64 bg-muted rounded-lg object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
            
            {!isScanning && (
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Klik tombol untuk mulai scan
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} variant="corporate" className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Mulai Scan
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline" className="flex-1">
                  <Scan className="w-4 h-4 mr-2" />
                  Stop Scan
                </Button>
              )}
            </div>
          </div>

          {/* Employee ID Input */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Masukkan Employee ID"
                className="pl-10"
              />
            </div>
          </div>

          {/* Scanned Result */}
          {scannedResult && (
            <div className="space-y-2">
              <Label>QR Code Result</Label>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-sm font-mono text-secondary-foreground">
                  {scannedResult}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={processAttendance}
            disabled={!scannedResult || !employeeId || isProcessing}
            variant="corporate"
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Proses Absensi
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Last Attendance Result */}
      {lastAttendance && (
        <Card className="card-corporate">
          <CardHeader>
            <CardTitle className="text-center text-accent">
              Absensi Berhasil!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-accent-foreground" />
              </div>
              
              <div>
                <p className="font-semibold text-lg">{lastAttendance.employee_name}</p>
                <p className="text-muted-foreground">
                  {lastAttendance.type === "check-in" ? "Check-in" : "Check-out"} berhasil
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(
                    lastAttendance.type === "check-in" 
                      ? lastAttendance.check_in_time 
                      : lastAttendance.check_out_time
                  ).toLocaleString('id-ID')}
                </p>
                {lastAttendance.status === "late" && (
                  <p className="text-warning text-sm font-medium">
                    Status: Terlambat
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}