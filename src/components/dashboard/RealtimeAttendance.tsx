import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  employee_name: string;
  check_in_time: string;
  check_out_time?: string;
  status: string;
  created_at: string;
}

export function RealtimeAttendance() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTodayAttendances = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          check_in_time,
          check_out_time,
          status,
          created_at,
          employees (
            name
          )
        `)
        .eq("attendance_date", today)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        employee_name: item.employees?.name || "Unknown",
        check_in_time: item.check_in_time,
        check_out_time: item.check_out_time,
        status: item.status,
        created_at: item.created_at,
      })) || [];

      setAttendances(formattedData);
    } catch (error: any) {
      console.error("Error fetching attendances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendances();

    // Set up real-time subscription
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          console.log('Attendance change detected:', payload);
          
          // Show toast notification for new attendance
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Absensi Baru",
              description: "Ada karyawan yang baru saja melakukan absensi",
              className: "toast-success",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Update Absensi",
              description: "Ada karyawan yang melakukan check-out",
              className: "toast-success",
            });
          }
          
          // Refresh data
          fetchTodayAttendances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="status-online">
            <CheckCircle2 className="w-3 h-3" />
            Hadir
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-warning text-warning-foreground">
            <AlertCircle className="w-3 h-3" />
            Terlambat
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="card-corporate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Absensi Real-time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-corporate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Absensi Real-time
        </CardTitle>
        <div className="realtime-indicator">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span className="ml-2 text-sm text-muted-foreground">Live</span>
        </div>
      </CardHeader>
      
      <CardContent>
        {attendances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada absensi hari ini</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {attendances.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg animate-slide-up border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">
                      {attendance.employee_name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {new Date(attendance.check_in_time).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {attendance.check_out_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(attendance.check_out_time).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(attendance.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}