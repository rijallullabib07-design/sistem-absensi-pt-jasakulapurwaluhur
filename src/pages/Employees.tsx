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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users } from "lucide-react";

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    department: "",
    position: "",
    email: "",
    phone: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchEmployees();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mengambil data karyawan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        const { error } = await supabase
          .from("employees")
          .update(formData)
          .eq("id", editingEmployee.id);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Data karyawan berhasil diperbarui",
        });
      } else {
        const { error } = await supabase
          .from("employees")
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Karyawan baru berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      setEditingEmployee(null);
      setFormData({
        employee_id: "",
        name: "",
        department: "",
        position: "",
        email: "",
        phone: ""
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name,
      department: employee.department,
      position: employee.position,
      email: employee.email || "",
      phone: employee.phone || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus karyawan ini?")) return;

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Karyawan berhasil dihapus",
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus karyawan",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `Status karyawan ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mengubah status karyawan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manajemen Karyawan</h1>
            <p className="text-muted-foreground">Kelola data karyawan PT Jasakula Purwa Luhur</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="corporate" 
                onClick={() => {
                  setEditingEmployee(null);
                  setFormData({
                    employee_id: "",
                    name: "",
                    department: "",
                    position: "",
                    email: "",
                    phone: ""
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Karyawan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Edit Karyawan" : "Tambah Karyawan Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingEmployee ? "Perbarui data karyawan" : "Masukkan data karyawan baru"}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee_id">ID Karyawan</Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                      placeholder="EMP001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Departemen</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      placeholder="IT"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Jabatan</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="Software Developer"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@jasakula.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="081234567890"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" variant="corporate" className="flex-1">
                    {editingEmployee ? "Perbarui" : "Tambah"} Karyawan
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar Karyawan
            </CardTitle>
            <CardDescription>
              Total {employees.length} karyawan terdaftar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Memuat data karyawan...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data karyawan
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.email && <div>{employee.email}</div>}
                          {employee.phone && <div>{employee.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(employee.id, employee.is_active)}
                        >
                          {employee.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}