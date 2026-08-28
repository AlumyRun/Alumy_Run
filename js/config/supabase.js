// A URL que estava no seu print
export const SUPABASE_URL = 'https://zbpvonmcvfjljyxsznkj.supabase.co';

// Cole a chave gigante aqui dentro das aspas (A chave ANON / PUBLIC)
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpicHZvbm1jdmZqbGp5eHN6bmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDAyNjEsImV4cCI6MjEwMzQ3NjI2MX0.Mcsf473-mEmxlbBmAI269uTT5iXW45oCF_I9VptH4D4'

// Configuração de segurança para inicializar o Supabase
export const supabase = (window.supabase && SUPABASE_URL.includes('supabase.co'))
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
