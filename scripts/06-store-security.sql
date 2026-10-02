-- Store/economy records are server-side data. Use SUPABASE_SERVICE_ROLE_KEY only
-- on trusted server components; never expose it via NEXT_PUBLIC or browser code.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.username_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_mode_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_metrics ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.users, public.admins, public.transactions, public.username_links,
  public.economy_balance, public.economy_transactions, public.webhook_endpoints,
  public.webhook_events, public.user_analytics, public.system_settings,
  public.price_mode_history, public.daily_metrics, public.package_metrics
  FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.users, public.admins, public.transactions, public.username_links,
  public.economy_balance, public.economy_transactions, public.webhook_endpoints,
  public.webhook_events, public.user_analytics, public.system_settings,
  public.price_mode_history, public.daily_metrics, public.package_metrics TO service_role;
