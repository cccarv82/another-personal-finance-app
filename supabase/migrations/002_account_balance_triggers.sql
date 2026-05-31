-- ============================================================
-- ACCOUNT BALANCE TRIGGER
-- Auto-updates account.balance on transaction insert/update/delete
-- ============================================================
create or replace function public.update_account_balance()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.type = 'income' then
      update public.accounts set balance = balance + new.amount where id = new.account_id;
    elsif new.type = 'expense' then
      update public.accounts set balance = balance - new.amount where id = new.account_id;
    end if;

  elsif tg_op = 'DELETE' then
    if old.type = 'income' then
      update public.accounts set balance = balance - old.amount where id = old.account_id;
    elsif old.type = 'expense' then
      update public.accounts set balance = balance + old.amount where id = old.account_id;
    end if;

  elsif tg_op = 'UPDATE' then
    -- reverse old
    if old.type = 'income' then
      update public.accounts set balance = balance - old.amount where id = old.account_id;
    elsif old.type = 'expense' then
      update public.accounts set balance = balance + old.amount where id = old.account_id;
    end if;
    -- apply new
    if new.type = 'income' then
      update public.accounts set balance = balance + new.amount where id = new.account_id;
    elsif new.type = 'expense' then
      update public.accounts set balance = balance - new.amount where id = new.account_id;
    end if;
  end if;

  return null;
end;
$$;

create trigger trg_update_account_balance
  after insert or update or delete on public.transactions
  for each row execute procedure public.update_account_balance();

-- ============================================================
-- DEFAULT CATEGORIES — seeded on user signup
-- ============================================================
create or replace function public.seed_default_categories(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.categories (user_id, name, type, icon, color, is_system) values
  -- Expenses
  (p_user_id, 'Moradia', 'expense', '🏠', '#6C8EFF', true),
  (p_user_id, 'Alimentação', 'expense', '🍽️', '#F59E0B', true),
  (p_user_id, 'Transporte', 'expense', '🚗', '#00D4AA', true),
  (p_user_id, 'Saúde', 'expense', '💊', '#FF4D6A', true),
  (p_user_id, 'Educação', 'expense', '📚', '#A78BFA', true),
  (p_user_id, 'Lazer', 'expense', '🎮', '#34D399', true),
  (p_user_id, 'Roupas', 'expense', '👕', '#60A5FA', true),
  (p_user_id, 'Assinaturas', 'expense', '📱', '#F472B6', true),
  (p_user_id, 'Supermercado', 'expense', '🛒', '#FBBF24', true),
  (p_user_id, 'Delivery', 'expense', '🛵', '#FB923C', true),
  (p_user_id, 'Pets', 'expense', '🐾', '#4ADE80', true),
  (p_user_id, 'Outros gastos', 'expense', '💸', '#8A8A9A', true),
  -- Income
  (p_user_id, 'Salário', 'income', '💼', '#00D4AA', true),
  (p_user_id, 'Freelance', 'income', '💻', '#6C8EFF', true),
  (p_user_id, 'Investimentos', 'income', '📈', '#A78BFA', true),
  (p_user_id, 'Outros rendimentos', 'income', '💰', '#8A8A9A', true);
end;
$$;

-- Update handle_new_user to also seed categories
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  perform public.seed_default_categories(new.id);
  return new;
end;
$$;
