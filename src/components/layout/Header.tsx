import { Building2, User, LogOut, QrCode, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import jasakulaLogo from "@/assets/jasakula-logo.png";

interface HeaderProps {
  user?: any;
  isAdmin?: boolean;
}

export function Header({ user, isAdmin }: HeaderProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari sistem.",
        className: "toast-success",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal logout. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="header-corporate p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Company Logo & Name */}
        <div className="flex items-center gap-4">
          <img
            src={jasakulaLogo}
            alt="PT Jasakula Purwa Luhur"
            className="h-12 w-auto object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary-foreground">
              PT Jasakula Purwa Luhur
            </h1>
            <p className="text-sm text-primary-foreground/80">
              Sistem Absensi Digital
            </p>
          </div>
        </div>

        {/* Real-time Status Indicator */}
        <div className="hidden md:flex items-center gap-2">
          <div className="realtime-indicator">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
          </div>
          <span className="text-sm text-primary-foreground/90">
            Real-time Active
          </span>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <User className="w-5 h-5 mr-2" />
                  {isAdmin ? "Admin" : "User"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/employees")}>
                  <Users className="w-4 h-4 mr-2" />
                  Karyawan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/reports")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Laporan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/scan")}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Scanner
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <User className="w-5 h-5 mr-2" />
              Login Admin
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}