import { Building2, Clock, Users } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-primary via-primary-glow to-accent text-primary-foreground py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              <h3 className="text-lg font-semibold">PT Jasakula Purwa Luhur</h3>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Sistem absensi digital modern dengan fitur real-time monitoring 
              untuk efisiensi dan akurasi pencatatan kehadiran karyawan.
            </p>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Jam Kerja</h3>
            </div>
            <div className="text-primary-foreground/80 text-sm space-y-1">
              <p>Senin - Jumat: 08:00 - 17:00</p>
              <p>Sabtu: 08:00 - 12:00</p>
              <p>Minggu: Libur</p>
            </div>
          </div>

          {/* System Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Fitur Sistem</h3>
            </div>
            <div className="text-primary-foreground/80 text-sm space-y-1">
              <p>✓ QR Code Scanning</p>
              <p>✓ Real-time Monitoring</p>
              <p>✓ Laporan Otomatis</p>
              <p>✓ Dashboard Analytics</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center">
          <p className="text-primary-foreground/70 text-sm">
            © {currentYear} PT Jasakula Purwa Luhur. 
            <span className="ml-2">Sistem Absensi Digital - Semua hak dilindungi.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}