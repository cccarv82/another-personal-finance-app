-- ============================================================
-- SUPABASE REALTIME — enable for key tables
-- ============================================================
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.accounts;
alter publication supabase_realtime add table public.financial_goals;

-- ============================================================
-- SEED categories for existing users (run once for existing accounts)
-- ============================================================
do $$
declare
  u record;
begin
  for u in select id from public.profiles loop
    if not exists (select 1 from public.categories where user_id = u.id and is_system = true limit 1) then
      perform public.seed_default_categories(u.id);
    end if;
  end loop;
end;
$$;
