import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  QrCode, 
  Shield, 
  Clock, 
  BarChart3, 
  Users, 
  Smartphone,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import jasakulaLogo from "@/assets/jasakula-logo.png";

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkAuth();
  }, []);

  const features = [
    {
      icon: QrCode,
      title: "QR Code Scanning",
      description: "Teknologi QR Code modern untuk absensi yang cepat dan akurat"
    },
    {
      icon: Clock,
      title: "Real-time Monitoring",
      description: "Monitoring kehadiran secara real-time dengan notifikasi instant"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Dashboard analytics lengkap dengan laporan dan insights"
    },
    {
      icon: Shield,
      title: "Keamanan Tinggi",
      description: "Sistem keamanan berlapis dengan validasi QR Code terenkripsi"
    },
    {
      icon: Users,
      title: "Manajemen Karyawan",
      description: "Kelola data karyawan dengan mudah dan sistem yang terorganisir"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Responsive design yang sempurna di semua perangkat"
    }
  ];

  const benefits = [
    "Otomatisasi pencatatan kehadiran 100%",
    "Eliminasi manipulasi data absensi",
    "Laporan real-time dan akurat",
    "Integrasi dengan sistem payroll",
    "Notifikasi keterlambatan otomatis",
    "Backup data cloud yang aman"
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header user={user} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-foreground leading-tight">
                  Sistem Absensi
                  <span className="bg-gradient-primary bg-clip-text text-transparent block">
                    Digital Modern
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Revolusi sistem kehadiran karyawan dengan teknologi QR Code, 
                  monitoring real-time, dan analytics yang comprehensive untuk 
                  PT Jasakula Purwa Luhur.
                </p>
              </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate("/scan")}
                variant="corporate"
                className="text-lg px-8 py-4 h-auto"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Mulai Scan QR Code
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => navigate("/login")}
                variant="corporate-outline"
                className="text-lg px-8 py-4 h-auto"
              >
                <Shield className="w-5 h-5 mr-2" />
                Login Admin
              </Button>
            </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Akurasi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">24/7</div>
                  <div className="text-sm text-muted-foreground">Real-time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0.5s</div>
                  <div className="text-sm text-muted-foreground">Scan Time</div>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="card-corporate p-8 text-center space-y-6">
                <img
                  src={jasakulaLogo}
                  alt="PT Jasakula Purwa Luhur"
                  className="h-24 w-auto object-contain mx-auto"
                />
                
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    PT Jasakula Purwa Luhur
                  </h3>
                  <p className="text-muted-foreground">
                    Sistem Absensi Digital Terintegrasi
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Karyawan</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                    <div className="text-2xl font-bold text-accent">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary/30 py-20">
          <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Fitur Unggulan Sistem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Teknologi terdepan untuk sistem absensi yang efisien dan modern
            </p>
          </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="card-corporate group hover:scale-105 transition-all duration-300"
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-bold text-foreground mb-6">
                    Keunggulan Sistem Kami
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Manfaat nyata yang akan Anda rasakan dengan menggunakan 
                    sistem absensi digital PT Jasakula Purwa Luhur.
                  </p>
                </div>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
                      <span className="text-foreground font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => navigate("/dashboard")}
                  variant="corporate"
                  className="text-lg px-8 py-4 h-auto"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Lihat Dashboard
                </Button>
              </div>

              <div className="relative">
                <div className="card-corporate p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-center text-foreground">
                    Quick Start
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-semibold">Scan QR Code</div>
                        <div className="text-sm text-muted-foreground">
                          Karyawan scan QR code harian
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-semibold">Input Employee ID</div>
                        <div className="text-sm text-muted-foreground">
                          Masukkan ID karyawan
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-semibold">Absensi Tercatat</div>
                        <div className="text-sm text-muted-foreground">
                          Data masuk sistem secara real-time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-primary py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl font-bold text-primary-foreground">
                Siap Memulai Sistem Absensi Digital?
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Bergabunglah dengan revolusi digital PT Jasakula Purwa Luhur. 
                Sistem absensi yang lebih efisien, akurat, dan modern.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/scan")}
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 h-auto font-semibold"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Mulai Sekarang
                </Button>
                
                <Button
                  onClick={() => navigate("/login")}
                  className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto font-semibold"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Login Admin
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}