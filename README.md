# Hacktoon

Aplicacao web responsiva para acompanhar treino, alimentacao, peso e insights calculados a partir dos dados registrados. Feita em HTML, CSS e JavaScript sem etapa de build.

## Organizacao

- `app.js` cuida do estado, autenticacao, navegacao e persistencia compartilhados.
- `home.js`, `treinos.js`, `alimentacao.js`, `evolucao.js` e `perfil.js` montam as telas correspondentes; `auth.js` monta as views compartilhadas de login e cadastro.
- `index.js`, `cadastro.js`, `planos.js` e `ia-coach.js` cuidam das interacoes exclusivas dessas paginas.
- `styles.css` e `cyber-theme.css` contem a base e o tema compartilhados. Arquivos como `home.css`, `treinos.css`, `alimentacao.css`, `evolucao.css`, `perfil.css`, `auth.css`, `index.css`, `cadastro.css`, `planos.css` e `ia-coach.css` guardam estilos especificos; `charts.css` e compartilhado pelas telas com graficos.

## Executar

Sirva esta pasta por HTTP (modulos JavaScript e Firebase nao funcionam de forma confiavel abrindo `index.html` via `file://`):

```powershell
python -m http.server 4173
```

Acesse http://localhost:4173. O modo de demonstracao funciona sem conta Firebase e grava os dados no navegador.

## Firebase

`firebase-config.js` já aponta para o projeto Web `academia-aura`. Para habilitar contas e persistência:

1. No Firebase Console, em **Authentication > Sign-in method**, ative **Email/Password**.
2. Em **Firestore Database**, crie o banco de dados.
3. Publique as regras incluídas neste projeto com Firebase CLI:

```powershell
firebase login
firebase deploy --only firestore:rules
```

Também é possível copiar `firestore.rules` para a aba **Firestore Database > Rules** e publicar. As regras limitam cada usuário a `users/{uid}/appData/main`; não habilite leitura ou escrita pública.

Login e cadastro usam Firebase Authentication. Perfil, treino, refeições e peso são sincronizados no Firestore por UID e mantidos em cache local. A demonstração não envia dados ao Firebase. Se hospedar fora de `localhost`, adicione o domínio em **Authentication > Settings > Authorized domains**.
