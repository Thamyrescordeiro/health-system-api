# 🏥 Health System API 

**Stack:** TypeScript • Node.js • NestJS (arquitetura modular) • @nestjs/sequelize (ORM) • JWT • Google Gemini API
 
Este projeto foi desenvolvido para **agendamento de consultas médicas** e **gerenciamento de todo o ecossistema de saúde** (empresas, médicos, pacientes, administradores).  
Ele foi escrito em **TypeScript** rodando sobre **Node.js**, utilizando o **NestJS** para organizar o código em **módulos** bem definidos, com **injeção de dependências**, **decorators** e **guards**.

### Principais características
- 📅 **Agendamento e gerenciamento de consultas**: pacientes podem marcar, reagendar ou cancelar consultas; médicos e admins podem gerenciar a agenda e disponibilidade.
- 🔐 **Autenticação JWT** e **autorização por papéis** (`patient`, `doctor`, `admin`, `super_admin`) via `JwtAuthGuard` e `RolesGuard`.
- 🏢 **Escopo multiempresa**: quase todas as operações usam `company_id` do usuário autenticado para isolar dados.
- 📧 **E-mail**: envio de código para recuperação de senha e comunicações transacionais (configurado via variáveis `MAIL_*`). 
- 🔗 **Convites**: admins geram links (`/admins/invite`) para cadastro de pacientes no front `FRONT_URL`.
- 🤖 **Integração com Gemini AI**: utilizada para **analisar informações do paciente** e **identificar urgência de atendimento**, auxiliando admins/médicos a priorizarem casos críticos.
- 🧩 **Módulos**: `Auth`, `Admins`, `Companies`, `Users`, `Doctor`, `Patient`, `Appoiments`, `Gemini`.
- 🧱 **DTOs** de entrada/saída para validação forte e padronização de payloads.
- 🛡️ **Boas práticas NestJS**: controllers enxutos, services com regras de negócio, exceptions HTTP adequadas e rate limiting em endpoints sensíveis.

### Arquitetura em alto nível
1. **Controllers** recebem a requisição HTTP e aplicam `guards`/`roles`.
2. **Services** encapsulam a lógica de negócio (ex.: agendamento de consultas, envio de e-mail, análise Gemini de urgência, estatísticas).
3. **ORM (@nestjs/sequelize)** acessa o banco relacional conforme os models/entidades.
4. **Providers**/módulos integram serviços adicionais (e-mail, Gemini API, etc.).

> Abaixo estão instruções de ambiente, execução, autenticação e o catálogo completo de rotas.


**Stack:** TypeScript • Node.js • NestJS (arquitetura modular) • @nestjs/sequelize (ORM) • JWT • Google Gemini API
 
Esta API foi desenvolvida em **TypeScript** rodando sobre **Node.js**, usando o **NestJS** para organizar o código em **módulos** bem definidos, com **injeção de dependências**, **decorators** e **guards**. Ela atende ao domínio de saúde, permitindo o gerenciamento de **empresas**, **usuários**, **pacientes**, **médicos** e **consultas** (appointments).

### Principais características
- 🔐 **Autenticação JWT** e **autorização por papéis** (`patient`, `doctor`, `admin`, `super_admin`) via `JwtAuthGuard` e `RolesGuard`.
- 🏢 **Escopo multiempresa**: quase todas as operações usam `company_id` do usuário autenticado para isolar dados.
- 📅 **Consultas médicas**: criação, listagem, reagendamento, cancelamento e checagem de disponibilidade por médico/data.
- 📧 **E-mail**: envio de código para recuperação de senha e comunicações transacionais (configurado via variáveis `MAIL_*`). 
- 🔗 **Convites**: admins geram links (`/admins/invite`) para cadastro de pacientes no front `FRONT_URL`.
- 🤖 **Integração com Gemini AI**: utilizada para **analisar informações do paciente** e **identificar urgência de atendimento**, auxiliando admins/médicos a priorizarem casos críticos.
- 🧩 **Módulos**: `Auth`, `Admins`, `Companies`, `Users`, `Doctor`, `Patient`, `Appoiments`, `Gemini`.
- 🧱 **DTOs** de entrada/saída para validação forte e padronização de payloads.
- 🛡️ **Boas práticas NestJS**: controllers enxutos, services com regras de negócio, exceptions HTTP adequadas e rate limiting em endpoints sensíveis.

### Arquitetura em alto nível
1. **Controllers** recebem a requisição HTTP e aplicam `guards`/`roles`.
2. **Services** encapsulam a lógica de negócio (ex.: criação de consulta, envio de e-mail, análise Gemini de urgência, estatísticas).
3. **ORM (@nestjs/sequelize)** acessa o banco relacional conforme os models/entidades.
4. **Providers**/módulos integram serviços adicionais (e-mail, Gemini API, etc.).

> Abaixo estão instruções de ambiente, execução, autenticação e o catálogo completo de rotas.


**Stack:** TypeScript • Node.js • NestJS (arquitetura modular) • @nestjs/sequelize (ORM) • JWT
 
Esta API foi desenvolvida em **TypeScript** rodando sobre **Node.js**, usando o **NestJS** para organizar o código em **módulos** bem definidos, com **injeção de dependências**, **decorators** e **guards**. Ela atende ao domínio de saúde, permitindo o gerenciamento de **empresas**, **usuários**, **pacientes**, **médicos** e **consultas** (appointments).

### Principais características
- 🔐 **Autenticação JWT** e **autorização por papéis** (`patient`, `doctor`, `admin`, `super_admin`) via `JwtAuthGuard` e `RolesGuard`.
- 🏢 **Escopo multiempresa**: quase todas as operações usam `company_id` do usuário autenticado para isolar dados.
- 📅 **Consultas médicas**: criação, listagem, reagendamento, cancelamento e checagem de disponibilidade por médico/data.
- 📧 **E-mail**: envio de código para recuperação de senha e comunicações transacionais (configurado via variáveis `MAIL_*`). 
- 🔗 **Convites**: admins geram links (`/admins/invite`) para cadastro de pacientes no front `FRONT_URL`.
- 🧩 **Módulos**: `Auth`, `Admins`, `Companies`, `Users`, `Doctor`, `Patient`, `Appoiments`.
- 🧱 **DTOs** de entrada/saída para validação forte e padronização de payloads.
- 🛡️ **Boas práticas NestJS**: controllers enxutos, services com regras de negócio, exceptions HTTP adequadas e rate limiting em endpoints sensíveis.

### Arquitetura em alto nível
1. **Controllers** recebem a requisição HTTP e aplicam `guards`/`roles`.
2. **Services** encapsulam a lógica de negócio (ex.: criação de consulta, envio de e-mail, estatísticas).
3. **ORM (@nestjs/sequelize)** acessa o banco relacional conforme os models/entidades.
4. **Providers**/módulos integram serviços adicionais (e-mail, Gemini API, etc.).

> Abaixo estão instruções de ambiente, execução, autenticação e o catálogo completo de rotas.


# 🏥 Health System API — README

API REST construída com **NestJS** para gestão de sistema de saúde.  
Este README documenta **variáveis de ambiente**, **papéis e guards**, e **todas as rotas** encontradas nos controllers fornecidos.

> **Status**: Documentação baseada nos trechos enviados de `AuthController`, `AdminController`, `CompanyController`, `UserController`, `DoctorsController`, `PatientController` e `AppoimentsController`.

---

## ⚙️ Variáveis de Ambiente (.env)

Copie `.env.example` e preencha conforme seu ambiente:

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_NAME=
DB_PASSWORD=
JWT_SECRET=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
GEMINI_API_KEY=
FRONT_URL=
```

- **JWT_SECRET**: usado para assinar tokens de autenticação.
- **FRONT_URL**: utilizado na geração de links de convite para cadastro de pacientes.
- **MAIL_***: configuração do serviço de e-mail (recuperação de senha etc.).

---

## 🚀 Como rodar

```bash
npm install
npm run start:dev   # ou npm run start:prod
```

> Garanta que o banco de dados esteja acessível e que o `.env` esteja configurado.

---

## 🔐 Autenticação, Roles e Guards

- **JwtAuthGuard**: exige um token **Bearer JWT** válido no header `Authorization`.
- **RolesGuard**: exige que o usuário tenha um dos papéis indicados pelo decorator `@Roles(...)`.
- **RateLimitGuard**: aplicado em **/auth/forgot-password** para mitigar abuso.
- **Papéis** suportados: `patient`, `doctor`, `admin`, `super_admin`.

### Como enviar o token JWT
```
Authorization: Bearer <seu_token_jwt>
```

---

## 🧭 Rotas

Abaixo, as rotas por controller, com **método**, **caminho**, **auth/roles**, **parâmetros** e **body** quando aplicável.

### 1) Auth (`/auth`)

| Método | Caminho | Auth | Roles | Query | Body | Descrição |
|---|---|---|---|---|---|---|
| POST | `/auth/login` | — | — | — | `{ email, password }` | Autentica e retorna JWT. |
| POST | `/auth/register/patient` | — | — | `companyId`, `token` | `RegisterPatientDto` | Cadastro de paciente via convite. |
| POST | `/auth/register/doctor` | ✅ | `admin` | — | `RegisterDoctorDto` | Admin cadastra médico na sua empresa. |
| POST | `/auth/register/admins` | ✅ | `super_admin` | — | `RegisterAdminDto` | Cria admin (empresa em `dto.company_id`). |
| POST | `/auth/forgot-password` | — + ⏱ | — | — | `{ email }` | Envia código de recuperação. |
| POST | `/auth/validate-code` | — | — | — | `{ email, code }` | Valida código de recuperação. |
| POST | `/auth/reset-password` | — | — | — | `{ email, code, newPassword }` | Redefine senha com código. |

**Exemplo (login):**
```bash
curl -X POST {BASE_URL}/auth/login   -H "Content-Type: application/json"   -d '{"email":"user@acme.com","password":"secret"}'
```

---

### 2) Admins (`/admins`) — exige JWT na maioria das rotas

> Controller com operações de **administração**, incluindo gerenciamento de admins, empresas, médicos, pacientes e consultas (appoiments).

#### Admins
| Método | Caminho | Roles | Query | Body | Descrição |
|---|---|---|---|---|---|
| PATCH | `/admins/:id` | `super_admin` | — | `Partial<RegisterAdminDto>` | Atualiza dados de um admin. |
| POST | `/admins/:id/deactivate` | `super_admin` | — | — | Desativa admin. |
| POST | `/admins/:id/reset-password` | `super_admin` | — | — | Redefine senha do admin. |
| GET | `/admins` | `super_admin` | — | — | Lista todos os admins. |
| GET | `/admins/:id` | `super_admin` | — | — | Busca admin por ID. |
| GET | `/admins/company/:companyId` | `super_admin` | — | — | Lista admins de uma empresa. |

#### Pacientes (escopo admin)
| Método | Caminho | Roles | Query | Body | Descrição |
|---|---|---|---|---|---|
| GET | `/admins/patients` | `admin` | `status` = `all\|active\|inactive` | — | Lista pacientes da empresa do admin. |
| GET | `/admins/patients/:id` | `admin` | — | — | Busca paciente por ID (empresa do admin). |
| GET | `/admins/patients/cpf/:cpf` | `admin` | — | — | Busca por CPF. |
| GET | `/admins/patients/name/:name` | `admin` | — | — | Busca por nome. |
| PATCH | `/admins/patients/:id` | `admin` | — | `Partial<UpdatePatientDto>` | Atualiza paciente. |
| PATCH | `/admins/patients/desactive/:id` | `admin` | — | — | Desativa paciente. |

#### Médicos (escopo admin)
| Método | Caminho | Roles | Query | Body | Descrição |
|---|---|---|---|---|---|
| GET | `/admins/doctors` | `admin` | `status` = `all\|active\|inactive` | — | Lista médicos da empresa. |
| GET | `/admins/doctors/:id` | `admin` | — | — | Busca médico por ID. |
| GET | `/admins/doctor/crm/:crm` | `admin` | — | — | Busca por CRM. |
| GET | `/admins/doctor/specialty/:specialty` | `admin` | — | — | Busca por especialidade. |
| GET | `/admins/doctor/name/:name` | `admin` | — | — | Busca por nome. |
| PATCH | `/admins/doctor/:id` | `admin` | — | `Partial<UpdateDoctorDto>` | Atualiza médico. |

#### Convites e Empresas (escopo admin/super_admin)
| Método | Caminho | Roles | Query | Body | Descrição |
|---|---|---|---|---|---|
| GET | `/admins/invite` | `admin` | — | — | Retorna link de convite de paciente baseado em `FRONT_URL` e `invite_token` da empresa. |
| GET | `/admins/companies` | `super_admin` | — | — | Lista empresas. |
| POST | `/admins/create/companies` | `super_admin` | — | `CreateCompanyDto` | Cria empresa. |
| PATCH | `/admins/companies/:id` | `super_admin` | — | `CreateCompanyDto` | Atualiza empresa. |
| POST | `/admins/companies/:id/deactivate` | `super_admin` | — | — | Desativa empresa. |

#### Consultas (Appointments) via `/admins/...`
| Método | Caminho | Roles | Query | Body | Descrição |
|---|---|---|---|---|---|
| POST | `/admins/appoiments/create` | `admin` | — | `CreateAppoimentsDto` | Cria consulta. |
| GET | `/admins/appoiments/stats` | `admin` | — | — | Estatísticas de consultas. |
| GET | `/admins/appoiments` | `admin` | — | — | Lista todas as consultas da empresa. |
| GET | `/admins/appoiments/by-date` | `admin` | `date` (YYYY-MM-DD) | — | Lista por data. |
| GET | `/admins/appoiments/:id` | `admin` | — | — | Detalha consulta por ID (checa papel/empresa). |
| PATCH | `/admins/appoiments/reschedule/:id` | `admin` | — | `{ dateTime }` | Reagenda consulta. |
| PATCH | `/admins/appoiments/:id` | `admin` | — | `UpdateAppoimentsDto` | Atualiza consulta. |
| PATCH | `/admins/appoiments/cancel/:id` | `admin` | — | — | Cancela consulta. |
| GET | `/admins/appoiments/doctors/:doctorId/availability` | `admin` | `date` (YYYY-MM-DD) | — | Agenda disponível por médico/data. |

---

### 3) Companies (`/companies`)

| Método | Caminho | Auth | Roles | Body/Query | Descrição |
|---|---|---|---|---|---|
| POST | `/companies` | ✅ | `super_admin` | `CreateCompanyDto` | Cria empresa. |
| GET | `/companies/search` | ✅ | `super_admin` | `q` (query) | Busca empresas por nome. |
| PATCH | `/companies/:companyId/deactivate` | ✅ | `super_admin` | — | Desativa empresa. |
| PATCH | `/companies/:companyId/activate` | ✅ | `super_admin` | — | Reativa empresa. |

---

### 4) Users (`/users`)

> Controller protegido por padrão com JWT + RolesGuard.

| Método | Caminho | Roles | Body | Descrição |
|---|---|---|---|---|
| POST | `/users/create` | `admin` | `CreateUserDto` | Cria usuário. |
| GET | `/users` | `admin` | — | Lista usuários. |
| PATCH | `/users/:userId/deactivate` | `admin` ou `super_admin` | — | Desativa usuário. |
| PATCH | `/users/:userId/activate` | `admin` ou `super_admin` | — | Reativa usuário. |

---

### 5) Doctors (`/doctor`)

> Controller protegido. Alguns endpoints permitem `patient` para leitura.

| Método | Caminho | Roles | Query | Body | Descrição |
|---|---|---|---|---|---|
| GET | `/doctor` | `doctor`, `admin` | — | — | Lista médicos da empresa. |
| GET | `/doctor/by-crm/:crm` | `doctor`, `admin` | — | — | Busca por CRM. |
| GET | `/doctor/by-id/:id` | `doctor`, `admin` | — | — | Busca por ID. |
| GET | `/doctor/by-specialty/:specialty` | `doctor`, `patient`, `admin` | — | — | Busca por especialidade. |
| GET | `/doctor/specialties` | `doctor`, `patient`, `admin` | — | — | Lista especialidades disponíveis. |
| PATCH | `/doctor/update/:id` | `doctor`, `admin` | — | `UpdateDoctorDto` | Atualiza médico. |
| PATCH | `/doctor/deactivate/:id` | `doctor`, `admin` | — | — | Desativa médico. |

---

### 6) Patient (`/patient`)

> Controller protegido. Regras de acesso garantem que um `patient` só veja o próprio registro.

| Método | Caminho | Roles | Body | Descrição |
|---|---|---|---|---|
| GET | `/patient/me` | `patient` | — | Retorna registro do próprio paciente. |
| GET | `/patient` | `admin` | — | Lista pacientes da empresa. |
| GET | `/patient/:id` | `admin`, `patient` | — | Busca paciente por ID (com checagem de ownership para `patient`). |
| PATCH | `/patient/update/:id` | `patient`, `admin` | `UpdatePatientDto` | Atualiza paciente. |
| PATCH | `/patient/desactive/:id` | `patient`, `admin` | — | Desativa paciente. |

---

### 7) Appoiments (`/appoiments`)

> Controller de consultas. Protegido por JWT + RolesGuard.

| Método | Caminho | Roles | Query | Body | Descrição |
|---|---|---|---|---|---|
| POST | `/appoiments/create` | `patient` | — | `CreateAppoimentsDto` | Paciente cria consulta. |
| GET | `/appoiments/doctors` | `patient`, `admin`, `doctor` | `specialty`, `q` | — | Lista médicos com filtros. |
| GET | `/appoiments/by-date/:date` | `doctor`, `patient`, `admin` | — | — | Lista consultas por data (YYYY-MM-DD). |
| GET | `/appoiments/by-cpf/:cpf` | `doctor`, `admin` | — | — | Busca consultas por CPF do paciente. |
| GET | `/appoiments/my-appoiments` | `patient`, `admin` | — | — | Lista consultas do paciente autenticado. |
| GET | `/appoiments/my-doctor-appoiments` | `doctor`, `admin` | — | — | Lista consultas do médico autenticado. |
| GET | `/appoiments/doctors/:id/availability` | `doctor`, `patient`, `admin` | `date` | — | Agenda disponível do médico. |
| GET | `/appoiments/:id` | `doctor`, `patient`, `admin` | — | — | Detalhes da consulta por ID (checagem de papel/empresa). |
| PATCH | `/appoiments/reschedule/:id` | `patient` | — | `{ dateTime }` | Reagenda (paciente). |
| PATCH | `/appoiments/cancel/:id` | `patient` | — | — | Cancela (paciente). |

---

## 🧱 DTOs (visão geral)

- **RegisterPatientDto / RegisterDoctorDto / RegisterAdminDto**
- **CreateCompanyDto**
- **CreateUserDto**
- **UpdateDoctorDto / UpdatePatientDto**
- **CreateAppoimentsDto / UpdateAppoimentsDto**

> Consulte os arquivos `dtos/*.ts` para formatos exatos de payload.

---

## ❗ Convenções de Erro

- `HttpException` com `HttpStatus` apropriado (ex.: `400 Bad Request`, `404 Not Found`, `403 Forbidden`).
- Mensagens comuns:
  - `"Invalid invite"` quando `companyId` ou `token` ausentes no registro de paciente.
  - `"Invite not found"` quando não há `invite_token` configurado para a empresa.
  - `"Patient record not found"` / `"Patient not found"` conforme buscas.

---

## 🧪 Exemplo de fluxo (Cadastro paciente com convite)

1. **Admin** obtém link de convite: `GET /admins/invite` (precisa JWT + role `admin`).  
2. **Paciente** acessa o front-end via link gerado `FRONT_URL/register/patient?companyId=...&token=...` e envia `POST /auth/register/patient` com o corpo requerido.  
3. **Paciente** faz login em `POST /auth/login` e usa o token para acessar as rotas protegidas.

---

## 🛡️ Segurança & Escopo

- Quase todas as rotas (exceto algumas de `/auth`) exigem **JWT**.
- A maioria das operações é **scoped por empresa** (`company_id` do usuário autenticado).

---
