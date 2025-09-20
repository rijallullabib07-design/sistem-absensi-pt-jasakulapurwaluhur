import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  username: z.string().min(1, "Username tidak boleh kosong"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      // Convert username to email format for authentication
      const email = `${data.username}@jasakula.com`;
      
      if (isSignUp) {
        // Sign up new admin
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (authError) throw authError;

        toast({
          title: "Pendaftaran Berhasil",
          description: "Admin berhasil didaftarkan dan dapat login sekarang",
          className: "toast-success",
        });

        setIsSignUp(false);
      } else {
        // Login existing admin
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: data.password,
        });

        if (authError) throw authError;

        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from("admin")
          .select("*")
          .eq("user_id", authData.user.id)
          .single();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          throw new Error("Akses ditolak. Hanya admin yang dapat login.");
        }

        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${adminData.full_name}!`,
          className: "toast-success",
        });

        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Pendaftaran Gagal" : "Login Gagal",
        description: error.message || `Terjadi kesalahan saat ${isSignUp ? 'pendaftaran' : 'login'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md card-corporate">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isSignUp ? "Daftar Admin" : "Login Admin"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              PT Jasakula Purwa Luhur - Sistem Absensi Digital
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username Admin
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  className="pl-10"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="corporate"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? "Mendaftar..." : "Memproses..."}
                </>
              ) : (
                isSignUp ? "Daftar Admin" : "Login ke Dashboard"
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sudah punya akun? Login" : "Belum punya akun? Daftar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Sistem ini khusus untuk admin PT Jasakula Purwa Luhur
            </p>
            
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs font-medium text-foreground mb-2">Kredensial Testing:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-medium">Username:</span> admin</p>
                <p><span className="font-medium">Password:</span> admin123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}