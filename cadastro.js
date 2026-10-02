const FIREBASE_VERSION = '12.2.1';
const firebaseConfig = window.HACKTOON_FIREBASE_CONFIG || {};
const form = document.querySelector('#auth-form');
const errorMessage = document.querySelector('#auth-error');
const submitButton = form.querySelector('button[type="submit"]');
const originalButtonText = submitButton.textContent.trim();

const authErrorMessages = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/operation-not-allowed': 'Ative Email/Password nas opções de autenticação do Firebase.',
  'auth/unauthorized-domain': 'Adicione este domínio aos domínios autorizados do Firebase.',
  'auth/network-request-failed': 'Sem conexão com o Firebase. Confira sua rede e tente novamente.'
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  errorMessage.textContent = '';
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    errorMessage.textContent = 'A configuração do Firebase não foi encontrada.';
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Criando conta...';

  try {
    const baseUrl = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
    const [appSdk, authSdk] = await Promise.all([
      import(`${baseUrl}/firebase-app.js`),
      import(`${baseUrl}/firebase-auth.js`)
    ]);
    const firebaseApp = appSdk.initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(firebaseApp);
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const credential = await authSdk.createUserWithEmailAndPassword(auth, email, password);
    await authSdk.updateProfile(credential.user, { displayName: name });
    location.replace('perfil.html');
  } catch (error) {
    errorMessage.textContent = authErrorMessages[error.code] || 'Não foi possível criar a conta. Confira os dados e tente novamente.';
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});
