# API de Gerenciamento de Consultas

Uma API RESTful robusta e segura, construída com **NestJS** e **TypeScript**, para gerenciar agendamentos de pacientes e doutores. O sistema implementa um controle de acesso por papéis (`patient` e `doctor`) e autenticação com JWT, ideal para ser integrada com uma aplicação frontend.

## Colaboradores

* **João Victtor Paulo**
* **Thamyres Cordeiro**

---

## Tecnologias e Ferramentas

| Categoria | Tecnologia | Uso e Justificativa |
| :--- | :--- | :--- |
| **Framework** | NestJS | Framework para backend em Node.js, com arquitetura modular e injetável. |
| **Linguagem** | TypeScript | Garante segurança de tipos, escalabilidade e qualidade do código. |
| **ORM** | Sequelize | Mapeamento Objeto-Relacional para interagir com o banco de dados de forma intuitiva. |
| **Banco de Dados** | PostgreSQL | Um dos bancos de dados relacionais mais robustos e confiáveis do mercado. |
| **Autenticação** | JWT & Passport | Padrão seguro para autenticação de usuários e proteção de rotas. |
| **Criptografia** | Bcrypt | Algoritmo de hash para armazenamento seguro de senhas. |
| **Validação** | Class-validator | Validação de dados de entrada com decoradores declarativos. |
| **Controle de Versão** | Git & GitHub | Plataformas essenciais para controle de versão e colaboração. |

---

## Arquitetura e Qualidade do Código

A API foi projetada com base nos princípios de arquitetura de software para garantir escalabilidade e manutenibilidade:

* **Separação de Responsabilidades:** O projeto é dividido em módulos (`Auth`, `Patient`, `Doctors`, `Appoiments`), onde cada entidade tem seu próprio **Controller**, **Service** e **Entity/DTO**.
* **Segurança Robusta:**
    * As senhas dos usuários são sempre hashadas com `bcrypt` antes de serem salvas.
    * Todas as rotas críticas são protegidas por `Guards` que verificam o token JWT.
    * O acesso às rotas é granular, baseado no `papel` do usuário (`doctor` ou `patient`).
* **Programação Orientada a Objetos (POO):** O código utiliza herança e encapsulamento, com entidades e DTOs bem definidos.

---

## Endpoints da API

A API é acessada através da URL base `http://localhost:3000` (ou a porta que o NestJS usa). O header de autorização `Authorization: Bearer <token_jwt>` é necessário para as rotas protegidas.

### **Autenticação**

| Método | Rota | Descrição | Permissões |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Autentica um usuário com email e senha e retorna um token JWT. | Público |

### **Usuários**

| Método | Rota | Descrição | Permissões |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/create` | Cria um novo usuário com papel (`patient` ou `doctor`). | Público |
| `GET` | `/users` | Lista todos os usuários. | Doutor |

### **Pacientes**

| Método | Rota | Descrição | Permissões |
| :--- | :--- | :--- | :--- |
| `POST` | `/patients/create` | Cria um novo paciente. | Doutor, Paciente |
| `GET` | `/patients` | Lista todos os pacientes. | Doutor |
| `GET` | `/patients/:id` | Busca um paciente por ID. | Doutor, Paciente |
| `GET` | `/patients/by-cpf/:cpf` | Busca um paciente por CPF. | Doutor |
| `PATCH` | `/patients/update/:id` | Atualiza os dados de um paciente. | Doutor, Paciente |
| `DELETE` | `/patients/delete/:id` | Deleta um paciente. | Doutor, Paciente |

### **Doutores**

| Método | Rota | Descrição | Permissões |
| :--- | :--- | :--- | :--- |
| `POST` | `/doctors/create` | Cria um novo doutor. | Doutor |
| `GET` | `/doctors` | Lista todos os doutores. | Doutor, Paciente |
| `GET` | `/doctors/by-id/:id` | Busca um doutor por ID. | Doutor, Paciente |
| `GET` | `/doctors/by-crm/:crm` | Busca um doutor por CRM. | Doutor |
| `GET` | `/doctors/by-specialty/:specialty` | Busca doutores por especialidade. | Doutor, Paciente |
| `PATCH` | `/doctors/update/:id` | Atualiza os dados de um doutor. | Doutor |
| `DELETE` | `/doctors/delete/:id` | Deleta um doutor. | Doutor |

### **Agendamentos**

| Método | Rota | Descrição | Permissões |
| :--- | :--- | :--- | :--- |
| `POST` | `/appoiments/create` | Cria um agendamento. | Paciente |
| `GET` | `/appoiments/my-appoiments` | Lista os agendamentos do paciente logado. | Paciente |
| `GET` | `/appoiments/my-doctor-appoiments` | Lista os agendamentos do doutor logado. | Doutor |
| `GET` | `/appoiments/by-date/:date` | Busca agendamentos por data. | Doutor, Paciente |
| `PATCH` | `/appoiments/reschedule/:id` | Reagenda uma consulta. | Paciente |
| `DELETE` | `/appoiments/cancel/:id` | Cancela uma consulta. | Doutor, Paciente |

---


## Como Rodar a API Localmente

Siga estes passos para configurar e executar a API:

### **Pré-requisitos**

* [Node.js](https://nodejs.org/en/download/) (com npm)
* [PostgreSQL](https://www.postgresql.org/download/)
* [Git](https://git-scm.com/)

### **Instalação**

1.  **Clone o Repositório:**
    ```bash
    git clone [https://github.com/Thamyrescordeiro/health-system-api](https://github.com/Thamyrescordeiro/health-system-api)
    ```
2.  **Navegue até a Pasta do Projeto:**
    ```bash
    cd health-system-api
    ```
    
3.  **Crie o Arquivo `.env`:**
    * Crie um arquivo chamado `.env` na raiz do projeto.
    * Adicione suas credenciais do banco de dados e a chave secreta do JWT:
        ```
        DB_HOST=localhost
        DB_PORT=5432
        DB_USER=postgres
        DB_PASSWORD=sua_senha_do_banco
        DB_NAME=seu_banco_de_dados
        JWT_SECRET=sua_chave_secreta
        ```
4.  **Instale as Dependências:**
    ```bash
    npm install
    ```
5.  **Crie o Banco de Dados:**
    * Abra o `psql` ou o PgAdmin e crie o banco de dados com o nome que você definiu em `DB_NAME`.

### **Executando o Servidor de Desenvolvimento**

1.  **Inicie o Servidor:**
    * ```bash
        npm run start:dev
        ```
    * Se a conexão for bem-sucedida, o Sequelize criará todas as tabelas automaticamente.