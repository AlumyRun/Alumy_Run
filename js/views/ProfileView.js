import { supabase } from '../config/supabase.js';
import { StorageService } from '../services/StorageService.js';

export class ProfileView {
  constructor() {
    this.isLoginMode = true;
  }

  async render(container) {
    this.container = container;
    container.innerHTML = `<div style="padding: 24px;">Carregando perfil...</div>`;

    // Se o Supabase não estiver configurado corretamente, mostra um aviso amigável
    if (!supabase) {
      container.innerHTML = `
        <div class="page-title-bar">
          <div>
            <h1 class="page-title">Perfil do Atleta</h1>
            <p class="card-subtext">Modo Offline</p>
          </div>
        </div>
        <div class="card empty-state">
          <h3>Conexão com a Nuvem Indisponível</h3>
          <p>O sistema está funcionando apenas com os dados locais deste aparelho.</p>
        </div>
      `;
      return;
    }

    // Verifica se já tem alguém logado
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      this.renderLoggedIn(session.user);
    } else {
      this.renderAuthForm();
    }
  }

  renderAuthForm() {
    const title = this.isLoginMode ? 'Fazer Login' : 'Criar Conta';
    const toggleText = this.isLoginMode ? 'Não tem conta? Cadastre-se aqui' : 'Já tem conta? Faça login';
    const btnText = this.isLoginMode ? 'Entrar' : 'Cadastrar';

    this.container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Autenticação</h1>
          <p class="card-subtext">Acesse para salvar e sincronizar seus dados na nuvem.</p>
        </div>
      </div>
      
      <div class="card" style="max-width: 400px; margin: 0 auto; padding: 32px;">
        <h3 style="margin-bottom: 24px; color: var(--text-primary);">${title}</h3>
        
        <form id="auth-form">
          <div class="form-group">
            <label>E-MAIL</label>
            <input type="email" id="auth-email" required placeholder="seu@email.com">
          </div>
          <div class="form-group">
            <label>SENHA</label>
            <input type="password" id="auth-password" required placeholder="******" minlength="6">
          </div>
          
          <div id="auth-error" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 16px; font-weight: 600; display: none;"></div>
          
          <button type="submit" class="btn" style="width: 100%; margin-bottom: 16px; padding: 12px;" id="auth-submit-btn">${btnText}</button>
        </form>
        
        <div style="text-align: center; border-top: 1px solid var(--border); padding-top: 16px;">
          <button class="btn-secondary" id="auth-toggle-mode" style="border: none; background: transparent; color: var(--primary); font-weight: 600; font-size: 0.85rem; cursor: pointer;">${toggleText}</button>
        </div>
      </div>
    `;

    // Botão para alternar entre "Login" e "Cadastro"
    document.getElementById('auth-toggle-mode').onclick = () => {
      this.isLoginMode = !this.isLoginMode;
      this.renderAuthForm();
    };

    // Enviar formulário para o Supabase
    document.getElementById('auth-form').onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const errorEl = document.getElementById('auth-error');
      const submitBtn = document.getElementById('auth-submit-btn');

      errorEl.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerText = 'Aguarde...';

      try {
        let error;
        if (this.isLoginMode) {
          const res = await supabase.auth.signInWithPassword({ email, password });
          error = res.error;
        } else {
          const res = await supabase.auth.signUp({ email, password });
          error = res.error;
          if (!error && res.data.user && !res.data.session) {
            // Alguns projetos no Supabase exigem confirmação de e-mail por padrão.
            alert("Cadastro realizado! (Se o Supabase exigir, confirme no seu e-mail)");
          }
        }

        if (error) throw error;
        
        // Se deu tudo certo, recarrega a tela (que agora vai mostrar Logado)
        this.render(this.container);
      } catch (err) {
        errorEl.innerText = err.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos.' 
          : err.message;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerText = btnText;
      }
    };
  }

  renderLoggedIn(user) {
    this.container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Perfil do Atleta</h1>
          <p class="card-subtext">Gerencie sua conta e o envio de dados para a nuvem.</p>
        </div>
      </div>
      
      <div class="card" style="max-width: 500px;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
          <div class="user-avatar" style="width: 60px; height: 60px; font-size: 1.5rem; background: var(--primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800;">
            ${user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style="margin: 0; color: var(--text-primary); font-size: 1.1rem;">${user.email}</h3>
            <span class="status-badge status-completed" style="margin-top: 8px;">🟢 Conectado à Nuvem</span>
          </div>
        </div>

        <div style="padding: 20px; background: var(--background); border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 24px;">
          <h4 style="margin-bottom: 8px; color: var(--text-primary); font-size: 0.95rem;">Sincronização Inicial</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
            Se você já possui treinos e provas salvos apenas neste aparelho, clique no botão abaixo para copiá-os para o seu banco de dados na nuvem.
          </p>
          <button class="btn" id="btn-sync-data" style="width: 100%;">Sincronizar Dados Locais ➔ Nuvem</button>
          <div id="sync-msg" style="margin-top: 12px; font-size: 0.85rem; font-weight: 700; text-align: center;"></div>
        </div>

        <button class="btn btn-secondary" id="btn-logout">Sair da Conta</button>
      </div>
    `;

    // Botão de Logout
    document.getElementById('btn-logout').onclick = async () => {
      await supabase.auth.signOut();
      this.render(this.container);
    };

    // Botão de Sincronizar (Envia a planilha local para a nuvem)
    const syncBtn = document.getElementById('btn-sync-data');
    syncBtn.onclick = async () => {
      const msgEl = document.getElementById('sync-msg');
      syncBtn.disabled = true;
      syncBtn.innerText = 'Enviando para a nuvem...';
      msgEl.style.color = 'var(--text-secondary)';
      msgEl.innerText = '';

      try {
        await StorageService.migrateLocalDataToSupabase(user.id);
        msgEl.style.color = '#10b981'; // Verde sucesso
        msgEl.innerText = '✅ Seus treinos e provas foram salvos na nuvem!';
      } catch (err) {
        msgEl.style.color = '#ef4444'; // Vermelho erro
        msgEl.innerText = '❌ Erro ao enviar: ' + err.message;
      } finally {
        syncBtn.disabled = false;
        syncBtn.innerText = 'Sincronizar Dados Locais ➔ Nuvem';
      }
    };
  }
}
