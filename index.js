document.addEventListener('DOMContentLoaded', () => {
    // Inicialização dos ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Elementos da Interface
    const authModal = document.getElementById('authModal');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const openRegisterBtn = document.getElementById('openRegisterBtn');
    const heroStartBtn = document.getElementById('heroStartBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Formulários
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const goToRegister = document.getElementById('goToRegister');
    const goToLogin = document.getElementById('goToLogin');

    // Mensagens de Erro e Toast
    const loginError = document.getElementById('loginError');
    const regError = document.getElementById('regError');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // Garante que a modal inicia fechada para não bloquear cliques na tela
    if (authModal) {
        authModal.classList.remove('is-open', 'active');
        authModal.style.display = 'none';
    }

    // Função para ABRIR a modal
    function openModal(mode = 'login') {
        if (!authModal) return;
        
        authModal.style.display = 'grid'; // Torna visível para o grid do CSS
        setTimeout(() => {
            authModal.classList.add('is-open', 'active');
            document.body.classList.add('modal-open');
        }, 10);

        if (mode === 'login') {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
        } else {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
        }
    }

    // Função para FECHAR a modal
    function closeModal() {
        if (!authModal) return;

        authModal.classList.remove('is-open', 'active');
        document.body.classList.remove('modal-open');

        // Aguarda a animação terminar para esconder totalmente a camada do overlay
        setTimeout(() => {
            authModal.style.display = 'none';
        }, 200);

        if (loginError) loginError.style.display = 'none';
        if (regError) regError.style.display = 'none';
    }

    function showToast(message) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Eventos dos Botões de Abertura
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('login');
        });
    }

    if (openRegisterBtn) {
        openRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('register');
        });
    }

    if (heroStartBtn) {
        heroStartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('register');
        });
    }

    // Evento de Fecho
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    // Fechar ao clicar fora da caixa do modal
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                closeModal();
            }
        });
    }

    // Alternar entre Login e Cadastro
    if (goToRegister) {
        goToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginError) loginError.style.display = 'none';
            openModal('register');
        });
    }

    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (regError) regError.style.display = 'none';
            openModal('login');
        });
    }

    // Alternar visibilidade da senha
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
            }
        });
    });

    // SUBMIT DO LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;

            if (loginError) loginError.style.display = 'none';

            if (!email || !password) {
                if (loginError) {
                    loginError.textContent = 'Por favor, preencha todos os campos.';
                    loginError.style.display = 'block';
                }
                return;
            }

            try {
                if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                } else {
                    localStorage.setItem('currentUser', JSON.stringify({ email }));
                }
                
                showToast('Login efetuado com sucesso!');
                setTimeout(() => { window.location.href = 'home.html'; }, 1000);

            } catch (error) {
                if (loginError) {
                    loginError.textContent = 'E-mail ou senha inválidos.';
                    loginError.style.display = 'block';
                }
            }
        });
    }

    // SUBMIT DO CADASTRO
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('regName')?.value.trim();
            const email = document.getElementById('regEmail')?.value.trim();
            const password = document.getElementById('regPassword')?.value;

            if (regError) regError.style.display = 'none';

            if (!name || !email || !password) {
                if (regError) {
                    regError.textContent = 'Por favor, preencha todos os campos.';
                    regError.style.display = 'block';
                }
                return;
            }

            try {
                if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
                    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    if (userCredential.user) {
                        await userCredential.user.updateProfile({ displayName: name });
                    }
                } else {
                    localStorage.setItem('currentUser', JSON.stringify({ name, email }));
                }

                showToast('Conta criada com sucesso!');
                setTimeout(() => { window.location.href = 'home.html'; }, 1000);

            } catch (error) {
                if (regError) {
                    regError.textContent = error.message || 'Erro ao criar conta. Tente novamente.';
                    regError.style.display = 'block';
                }
            }
        });
    }
});