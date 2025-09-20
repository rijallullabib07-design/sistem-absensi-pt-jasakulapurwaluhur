import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QRScanner } from "@/components/qr/QRScanner";

export default function Scanner() {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              QR Code Scanner
            </h1>
            <p className="text-muted-foreground">
              Scan QR Code untuk absensi masuk dan keluar
            </p>
          </div>

          <QRScanner />
        </div>
      </main>

      <Footer />
    </div>
  );
}