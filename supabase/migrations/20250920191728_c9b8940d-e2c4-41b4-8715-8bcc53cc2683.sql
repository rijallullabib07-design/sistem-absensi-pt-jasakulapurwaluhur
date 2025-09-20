-- First, let's create a user in auth.users for the admin
-- We need to insert into auth.users which requires special handling
-- Let's create a function to handle admin signup

-- Create admin signup function
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_username text,
  admin_password text,
  admin_full_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create auth user with email format based on username
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_username || '@jasakula.com',
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Create admin record
  INSERT INTO admin (user_id, username, full_name, role, is_active)
  VALUES (new_user_id, admin_username, admin_full_name, 'admin', true);

  RETURN new_user_id;
END;
$$;

-- Create the admin user
SELECT create_admin_user('admin', 'admin123', 'Administrator PT Jasakula');