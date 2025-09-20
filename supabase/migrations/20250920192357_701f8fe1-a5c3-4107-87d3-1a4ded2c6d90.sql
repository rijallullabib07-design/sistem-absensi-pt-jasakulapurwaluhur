-- Enable realtime for attendance table
ALTER TABLE public.attendance REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- Enable realtime for employees table
ALTER TABLE public.employees REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;