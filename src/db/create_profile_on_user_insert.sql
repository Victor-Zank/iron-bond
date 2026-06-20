-- Creates a trigger that inserts a row into public.profiles when a new auth user is created.
-- Run this SQL in your Supabase SQL editor (Database -> New Query).

-- 1) Create function
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  -- Insert a profile row for the new user. Adjust columns as needed.
  insert into public.profiles (user_id, full_name, email, created_at)
  values (new.id, coalesce(new.raw_user_meta->> 'full_name', ''), new.email, now())
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 2) Create trigger on auth.users (fires after a new user is created)
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Note: Supabase stores auth users in the "auth" schema. Run this migration in the SQL editor.
-- If your app uses a different profiles schema/table name, adjust accordingly.
