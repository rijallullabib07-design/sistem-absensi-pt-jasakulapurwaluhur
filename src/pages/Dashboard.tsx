import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer"; 
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RealtimeAttendance } from "@/components/dashboard/RealtimeAttendance";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode,
  BarChart3,
  UserPlus
} from "lucide-react";

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
}

interface ChartData {
  date: string;
  present: number;
  late: number;
  absent: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get total employees
      const { count: totalEmployees } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get today's attendance stats
      const { data: todayAttendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("attendance_date", today);

      const presentToday = todayAttendance?.filter(a => a.status === "present").length || 0;
      const lateToday = todayAttendance?.filter(a => a.status === "late").length || 0;
      const absentToday = (totalEmployees || 0) - presentToday - lateToday;

      setStats({
        totalEmployees: totalEmployees || 0,
        presentToday,
        lateToday,
        absentToday,
      });

      // Get last 7 days data for chart
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const chartDataPromises = dates.map(async (date) => {
        const { data } = await supabase
          .from("attendance")
          .select("status")
          .eq("attendance_date", date);

        const present = data?.filter(a => a.status === "present").length || 0;
        const late = data?.filter(a => a.status === "late").length || 0;
        const absent = Math.max(0, (totalEmployees || 0) - present - late);

        return {
          date: new Date(date).toLocaleDateString('id-ID', { 
            month: 'short', 
            day: 'numeric' 
          }),
          present,
          late,
          absent,
        };
      });

      const resolvedChartData = await Promise.all(chartDataPromises);
      setChartData(resolvedChartData);

    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Check if user is admin
      const { data: adminData } = await supabase
        .from("admin")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!adminData) {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki akses admin",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setUser(user);
      setAdmin(adminData);
      fetchStats();
    };

    checkAuth();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto p-4">
          <div className="space-y-6">
            <div className="loading-shimmer h-16 rounded-lg"></div>
            <div className="dashboard-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="loading-shimmer h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header user={user} isAdmin={true} />
      
      <main className="container mx-auto p-4 flex-1">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground">
              Selamat datang, {admin?.full_name} - Monitoring real-time sistem absensi
            </p>
          </div>

          {/* Stats Cards */}
          <div className="dashboard-grid">
            <StatsCard
              title="Total Karyawan"
              value={stats.totalEmployees}
              icon={Users}
              className="animate-slide-up"
            />
            <StatsCard
              title="Hadir Hari Ini"
              value={stats.presentToday}
              icon={CheckCircle2}
              trend={{ value: 5, isPositive: true }}
              className="animate-slide-up"
            />
            <StatsCard
              title="Terlambat"
              value={stats.lateToday}
              icon={AlertTriangle}
              trend={{ value: -10, isPositive: true }}
              className="animate-slide-up"
            />
            <StatsCard
              title="Tidak Hadir"
              value={stats.absentToday}
              icon={Clock}
              className="animate-slide-up"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Charts and QR */}
            <div className="lg:col-span-2 space-y-6">
              <AttendanceChart data={chartData} />
              <QRGenerator />
            </div>

            {/* Right Column - Real-time Data */}
            <div className="space-y-6">
              <RealtimeAttendance />
              
              {/* Quick Actions */}
              <div className="card-corporate space-y-4">
                <h3 className="font-semibold text-foreground">Aksi Cepat</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate("/employees")}
                    variant="outline"
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Kelola Karyawan
                  </Button>
                  <Button
                    onClick={() => navigate("/scan")}
                    variant="corporate"
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Scanner
                  </Button>
                  <Button
                    onClick={() => navigate("/reports")}
                    variant="outline"
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Laporan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}