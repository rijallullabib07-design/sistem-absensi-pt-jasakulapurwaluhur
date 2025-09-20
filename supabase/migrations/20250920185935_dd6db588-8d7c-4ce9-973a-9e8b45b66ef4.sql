-- Create company_settings table
CREATE TABLE public.company_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'PT Jasakula Purwa Luhur',
    logo_url TEXT,
    work_hours_start TIME DEFAULT '08:00:00',
    work_hours_end TIME DEFAULT '17:00:00',
    late_tolerance_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin table
CREATE TABLE public.admin (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create qr_codes table
CREATE TABLE public.qr_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 day'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id),
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent', 'excused')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for admin table
CREATE POLICY "Admin can manage their own data" 
ON public.admin 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for company_settings (only admins can manage)
CREATE POLICY "Admin can view company settings" 
ON public.company_settings 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.admin WHERE user_id = auth.uid()));

CREATE POLICY "Admin can update company settings" 
ON public.company_settings 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.admin WHERE user_id = auth.uid()));

-- Create policies for employees (admin can manage all)
CREATE POLICY "Admin can manage all employees" 
ON public.employees 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin WHERE user_id = auth.uid()));

-- Create policies for qr_codes (admin can manage, employees can read active codes)
CREATE POLICY "Admin can manage QR codes" 
ON public.qr_codes 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin WHERE user_id = auth.uid()));

CREATE POLICY "Public can read active QR codes" 
ON public.qr_codes 
FOR SELECT 
USING (is_active = TRUE AND expires_at > now());

-- Create policies for attendance (admin can manage all, public can insert with valid QR)
CREATE POLICY "Admin can manage all attendance" 
ON public.attendance 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin WHERE user_id = auth.uid()));

CREATE POLICY "Public can insert attendance with valid QR" 
ON public.attendance 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.qr_codes 
        WHERE id = qr_code_id 
        AND is_active = TRUE 
        AND expires_at > now()
    )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_updated_at
    BEFORE UPDATE ON public.admin
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default company settings
INSERT INTO public.company_settings (company_name) VALUES ('PT Jasakula Purwa Luhur');

-- Create indexes for better performance
CREATE INDEX idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX idx_qr_codes_date ON public.qr_codes(date);
CREATE INDEX idx_qr_codes_active ON public.qr_codes(is_active) WHERE is_active = TRUE;