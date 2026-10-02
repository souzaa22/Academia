export function renderAuthMarkup(mode) {
  return `<section class="auth-shell">
    <aside class="auth-story">
      <a class="brand" href="index.html" aria-label="Body Fit"><span class="brand-logo-frame"><img class="brand-logo" src="img/bodyfit2-removebg-preview.png" alt="Body Fit"></span></a>
      <div class="story-copy"><div class="eyebrow">Treino e nutrição, juntos</div><h1>Consistência que você consegue enxergar.</h1><p>Entenda como sua rotina se conecta. Registre, acompanhe e ajuste com clareza.</p></div>
      <div class="story-foot">Um passo de cada vez. Dados seus, decisões melhores.</div>
    </aside>
    <section class="auth-panel"><div class="auth-form-wrap">
      <h2>${mode === 'login' ? 'Bom ter você de volta.' : 'Comece por aqui.'}</h2>
      <p class="auth-sub">${mode === 'login' ? 'Entre para continuar de onde parou.' : 'Crie sua conta e monte uma rotina que funciona para você.'}</p>
      <div class="auth-tabs"><button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-mode="login">Entrar</button><button class="auth-tab ${mode === 'register' ? 'active' : ''}" data-mode="register">Criar conta</button></div>
      <form id="auth-form" novalidate>
        ${mode === 'register' ? '<div class="field"><label for="auth-name">Seu nome</label><input id="auth-name" name="name" autocomplete="name" placeholder="Como podemos chamar você?" required maxlength="60"></div>' : ''}
        <div class="field"><label for="auth-email">E-mail</label><input id="auth-email" name="email" type="email" autocomplete="email" placeholder="voce@email.com" required></div>
        <div class="field"><label for="auth-password">Senha</label><input id="auth-password" name="password" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" placeholder="${mode === 'login' ? 'Sua senha' : 'Mínimo de 6 caracteres'}" minlength="6" required></div>
        <button class="btn btn-primary" type="submit">${mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'} <span aria-hidden="true">→</span></button>
        <p class="auth-error" id="auth-error"></p>
      </form>
      <button class="demo-button" id="demo-entry">Explorar demonstração</button>
    </div></section>
  </section>`;
}
