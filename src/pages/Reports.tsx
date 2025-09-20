import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AttendanceReport {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_department: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  notes: string | null;
}

export default function Reports() {
  const [attendanceData, setAttendanceData] = useState<AttendanceReport[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchReports();
    fetchDepartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendanceData, startDate, endDate, selectedDepartment]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          attendance_date,
          check_in_time,
          check_out_time,
          status,
          notes,
          employees (
            id,
            employee_id,
            name,
            department
          )
        `)
        .order("attendance_date", { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((item: any) => ({
        id: item.id,
        employee_id: item.employees?.employee_id || "",
        employee_name: item.employees?.name || "",
        employee_department: item.employees?.department || "",
        attendance_date: item.attendance_date,
        check_in_time: item.check_in_time,
        check_out_time: item.check_out_time,
        status: item.status,
        notes: item.notes
      })) || [];

      setAttendanceData(formattedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mengambil data laporan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("department")
        .order("department");

      if (error) throw error;

      const uniqueDepartments = Array.from(
        new Set(data?.map(item => item.department) || [])
      );
      setDepartments(uniqueDepartments);
    } catch (error: any) {
      console.error("Error fetching departments:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(item => item.attendance_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(item => item.attendance_date <= endDate);
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(item => item.employee_department === selectedDepartment);
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedDepartment("");
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Tanggal",
      "ID Karyawan", 
      "Nama",
      "Departemen",
      "Jam Masuk",
      "Jam Keluar",
      "Status",
      "Catatan"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.attendance_date,
        row.employee_id,
        `"${row.employee_name}"`,
        `"${row.employee_department}"`,
        row.check_in_time ? format(new Date(row.check_in_time), "HH:mm:ss") : "",
        row.check_out_time ? format(new Date(row.check_out_time), "HH:mm:ss") : "",
        row.status,
        row.notes ? `"${row.notes}"` : ""
      ].join(","))
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_absensi_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Berhasil",
      description: "Laporan berhasil diekspor ke CSV",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      present: "default",
      late: "secondary",
      absent: "destructive",
      sick: "outline",
      permission: "outline"
    };

    const labels: Record<string, string> = {
      present: "Hadir",
      late: "Terlambat", 
      absent: "Tidak Hadir",
      sick: "Sakit",
      permission: "Izin"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getStatistics = () => {
    const total = filteredData.length;
    const present = filteredData.filter(item => item.status === "present").length;
    const late = filteredData.filter(item => item.status === "late").length;
    const absent = filteredData.filter(item => item.status === "absent").length;

    return { total, present, late, absent };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Laporan Absensi</h1>
            <p className="text-muted-foreground">Laporan kehadiran karyawan PT Jasakula Purwa Luhur</p>
          </div>
          
          <Button variant="corporate" onClick={exportToCSV} disabled={filteredData.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Absensi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Hadir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="department">Departemen</Label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="">Semua Departemen</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Data Absensi
            </CardTitle>
            <CardDescription>
              Menampilkan {filteredData.length} dari {attendanceData.length} data absensi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Memuat data laporan...</div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data absensi yang sesuai dengan filter
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>ID Karyawan</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Jam Masuk</TableHead>
                      <TableHead>Jam Keluar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.attendance_date), "dd/MM/yyyy", { locale: id })}
                        </TableCell>
                        <TableCell className="font-medium">{item.employee_id}</TableCell>
                        <TableCell>{item.employee_name}</TableCell>
                        <TableCell>{item.employee_department}</TableCell>
                        <TableCell>
                          {item.check_in_time 
                            ? format(new Date(item.check_in_time), "HH:mm:ss")
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {item.check_out_time 
                            ? format(new Date(item.check_out_time), "HH:mm:ss")
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell>{item.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}