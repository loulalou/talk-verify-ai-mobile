-- Fix function security by setting search_path properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, age)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'age')::INTEGER 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$;