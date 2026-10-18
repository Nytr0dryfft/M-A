# Guia de Publicação no GitHub Pages & Armazenamento em Nuvem (Atelier M&A)

Este documento descreve a arquitetura estática e as instruções passo a passo para hospedar o site no **GitHub Pages** com armazenamento seguro de arquivos e prévias no **Firebase**.

---

## 1. Arquitetura da Solução

* **Hospedagem Frontend**: 100% estática via **GitHub Pages** (sem backend Node.js, Express ou PHP no servidor).
* **Compatibilidade de Caminhos**: O Vite está configurado com `base: './'`, permitindo que o site funcione tanto em **domínio próprio** (`https://atelierma.com.br`) quanto em **subcaminho de projeto** (`https://usuario.github.io/nome-do-repo/`).
* **Segurança de Credenciais**:
  * Nenhuma chave privada ou segredo administrativo reside no código estático.
  * O cliente web utiliza as credenciais públicas do Firebase Web SDK.
  * O controle de acesso é aplicado diretamente pelas regras de segurança em nuvem:
    * `firestore.rules`: Permite apenas inserções de pedidos válidos com status `solicitado`, bloqueando consultas públicas que pudessem expor dados pessoais dos clientes (PII).
    * `storage.rules`: Restringe envios de arquivos a formatos de imagem/vetor até 15MB e bloqueia deleções ou sobrescritas públicas.
* **Fluxo do WhatsApp**:
  * Ao confirmar o orçamento, a prévia visual renderizada em alta definição (PNG) e os vetores/artes do cliente (SVG/PNG) são salvos no Firebase Storage.
  * O WhatsApp é aberto automaticamente com a mensagem estruturada contendo o código do pedido, especificações técnicas e **links diretos para os arquivos na nuvem**.
  * Se o Firebase não estiver configurado, o sistema oferece fallback automático com geração local da ficha técnica (.txt), da prévia (.png) e download das artes para envio manual.

---

## 2. Passo a Passo: Configuração do Firebase (Gratuito - Spark Plan)

### Passo 2.1 — Criar o Projeto no Firebase
1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e faça login com sua conta Google.
2. Clique em **Adicionar projeto** e dê um nome (ex: `atelier-ma-woodcraft`).
3. Desative o Google Analytics (opcional) e clique em **Criar projeto**.

### Passo 2.2 — Adicionar um Aplicativo Web
1. Na página inicial do projeto, clique no ícone **Web** (`</>`).
2. Digite um apelido para o app (ex: `Atelier Web`).
3. Clique em **Registrar app**.
4. Copie o bloco de configuração `firebaseConfig`:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto",
     storageBucket: "seu-projeto.firebasestorage.app",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef"
   };
   ```

### Passo 2.3 — Ativar o Cloud Firestore
1. No menu lateral, acesse **Build > Firestore Database**.
2. Clique em **Criar banco de dados**, escolha o local do servidor (ex: `southamerica-east1` para São Paulo, ou `us-east1`) e selecione o modo de início.
3. Acesse a aba **Regras** no Firestore e cole o conteúdo do arquivo `firestore.rules` do projeto, depois clique em **Publicar**.

### Passo 2.4 — Ativar o Firebase Storage
1. No menu lateral, acesse **Build > Storage**.
2. Clique em **Primeiros passos**, selecione a mesma região e confirme.
3. Acesse a aba **Regras** no Storage e cole o conteúdo do arquivo `storage.rules` do projeto, depois clique em **Publicar**.

### Passo 2.5 — Configurar o CORS no Storage (Essencial para uploads do navegador)
Para permitir que o frontend no GitHub Pages envie arquivos ao Firebase Storage via JavaScript:
1. Instale o Google Cloud SDK (`gcloud`) ou utilize o [Google Cloud Shell](https://shell.cloud.google.com/).
2. Execute o comando apontando para o bucket do seu projeto e o arquivo `cors.json`:
   ```bash
   gcloud storage buckets update gs://SEU-PROJETO.firebasestorage.app --cors-file=cors.json
   ```

---

## 3. Passo a Passo: Publicação no GitHub Pages com GitHub Actions

O repositório já inclui o arquivo `.github/workflows/deploy.yml` pronto para automação contínua.

### Passo 3.1 — Ativar o GitHub Pages no Repositório
1. No GitHub, acesse o seu repositório.
2. Vá em **Settings > Pages**.
3. Em **Build and deployment > Source**, selecione **GitHub Actions**.

### Passo 3.2 — Cadastrar as Variáveis de Ambiente no GitHub
1. No repositório, acesse **Settings > Secrets and variables > Actions**.
2. Na aba **Variables** (ou **Secrets**), adicione as seguintes variáveis obtidas no Passo 2.2:
   * `VITE_FIREBASE_API_KEY`: sua chave de API
   * `VITE_FIREBASE_AUTH_DOMAIN`: seu domínio de autenticação
   * `VITE_FIREBASE_PROJECT_ID`: seu ID de projeto
   * `VITE_FIREBASE_STORAGE_BUCKET`: seu bucket de storage
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`: seu sender ID
   * `VITE_FIREBASE_APP_ID`: seu App ID
3. Faça um `git push` na branch `main` ou dispare o workflow manualmente na aba **Actions**.
4. O GitHub Actions construirá o projeto e publicará o site automaticamente.

---

## 4. Domínio Próprio (Opcional)

Se desejar utilizar um domínio próprio (ex: `www.atelierma.com.br`):
1. No GitHub, em **Settings > Pages > Custom domain**, insira seu domínio.
2. No seu provedor de DNS (Registro.br, Cloudflare, etc.), aponte os registros CNAME ou IPs do GitHub Pages conforme a documentação do GitHub.
3. Como o `vite.config.ts` utiliza `base: './'`, nenhuma alteração no código é necessária ao alternar entre subcaminho e domínio raiz.
