-- Add avatar field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar TEXT DEFAULT 'teacher';

-- Update the handle_new_user function to include avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, age, avatar)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'age')::INTEGER 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar', 'teacher')
  );
  RETURN NEW;
END;
$$;