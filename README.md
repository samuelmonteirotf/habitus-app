
# Hábitus

**Hábitus** é uma aplicação *full stack* que permite ao usuário se cadastrar ou logar com e-mail/senha ou conta Google. Após logado, ele pode **sincronizar seus hábitos e tarefas com o Google Calendar**, criando uma **rotina inteligente de produtividade**.

---

## Funcionalidades principais

-  Cadastro com e-mail e senha  
-  Login com conta Google (OAuth2)  
-  Integração com Google Calendar  
-  Criação e gerenciamento de rotinas personalizadas  
-  Painel com hábitos diários e metas semanais  

---

##  Tecnologias Utilizadas

### **Frontend** – React + Vite

- TailwindCSS  
- React Router  
- Axios  
- `react-oauth/google`  
- Context API + JWT + `localStorage`  

### **Backend** – FastAPI

- FastAPI  
- SQLAlchemy + PostgreSQL  
- JWT Authentication  
- OAuth2 com Google (authlib)  
- Google Calendar API (v3)  
- Alembic (migrations)  

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seuusuario/habitus.git
cd habitus
```

### 2. Backend – FastAPI

#### Instale as dependências

```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
```

#### Crie um arquivo `.env` com:

```env
DATABASE_URL=postgresql://user:password@localhost/habitus_db
SECRET_KEY=sua_chave_secreta
GOOGLE_CLIENT_ID=sua_client_id_google
GOOGLE_CLIENT_SECRET=sua_client_secret_google
FRONTEND_URL=http://localhost:5173
```

#### Execute o backend

```bash
uvicorn main:app --reload
```

---

### 3. Frontend – React

#### Instale as dependências

```bash
cd frontend
npm install
```

#### Crie um arquivo `.env` com:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=sua_client_id_google
```

#### Execute o frontend

```bash
npm run dev
```

---

## Integração com Google Calendar

1. Vá para: [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative as seguintes APIs:
   - ✅ Google Calendar API
   - ✅ OAuth2 Client ID
4. Configure a tela de consentimento OAuth com:
   - **Scopes**: `https://www.googleapis.com/auth/calendar`
   - **URI de redirecionamento**: `http://localhost:5173`
5. Copie o **Client ID** e **Client Secret** e coloque nos arquivos `.env`

---

## Endpoints úteis

| Método | Rota               | Função                              |
|--------|--------------------|-------------------------------------|
| POST   | `/auth/register`   | Cadastro                            |
| POST   | `/auth/login`      | Login com e-mail/senha              |
| GET    | `/auth/google-login` | Login com Google                  |
| POST   | `/calendar/sync`   | Sincronizar eventos                 |
| GET    | `/calendar/events` | Listar eventos do Google Calendar  |

---

## Exemplos de uso da API

### Login com Google

```bash
curl -X POST http://localhost:8000/auth/google-login   -H "Content-Type: application/json"   -d '{"token": "token_de_oauth2_google"}'
```

### Criar evento no Google Calendar

```json
POST /calendar/create

{
  "summary": "Estudar Python",
  "start": "2025-06-01T14:00:00",
  "end": "2025-06-01T15:00:00"
}
```

---

## Próximos passos

-  Integração com Notion ou Trello  
-  Compartilhamento de rotinas  
-  Versão mobile com React Native  

---

## Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.
