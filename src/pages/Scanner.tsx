import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QRScanner } from "@/components/qr/QRScanner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User } from '@supabase/supabase-js'

export default function Scanner() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header user={user} isAdmin={false} />
      
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