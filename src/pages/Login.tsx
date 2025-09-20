import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from("admin")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (adminData) {
          navigate("/dashboard");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return <LoginForm />;
}