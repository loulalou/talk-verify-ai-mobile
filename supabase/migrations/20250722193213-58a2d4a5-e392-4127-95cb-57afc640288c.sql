-- Add new fields to profiles table for enhanced account creation
ALTER TABLE public.profiles 
ADD COLUMN account_type TEXT CHECK (account_type IN ('student', 'parent')),
ADD COLUMN school_level TEXT,
ADD COLUMN country TEXT,
ADD COLUMN exam_preparation TEXT CHECK (exam_preparation IN ('bac', 'brevet', 'none'));

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, age, avatar, account_type, school_level, country, exam_preparation)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'age')::INTEGER 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar', 'teacher'),
    NEW.raw_user_meta_data ->> 'account_type',
    NEW.raw_user_meta_data ->> 'school_level',
    NEW.raw_user_meta_data ->> 'country',
    COALESCE(NEW.raw_user_meta_data ->> 'exam_preparation', 'none')
  );
  RETURN NEW;
END;
$$;