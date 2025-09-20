-- Create function to handle new user signup and create admin record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only create admin record for @jasakula.com emails
  IF NEW.email LIKE '%@jasakula.com' THEN
    -- Extract username from email
    INSERT INTO public.admin (user_id, username, full_name, role, is_active)
    VALUES (
      NEW.id,
      SPLIT_PART(NEW.email, '@', 1),
      'Administrator PT Jasakula',
      'admin',
      true
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create admin record on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();