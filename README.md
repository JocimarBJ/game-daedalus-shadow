# 🕯️ Daedalus' Shadow

> Um jogo 2D de labirinto darkness onde cada movimento importa para encontrar a saída.

**Daedalus' Shadow** é uma aplicação web interativa desenvolvida por um time do curso de Engenharia de Software da UTFPR — Campus Cornélio Procópio.

O projeto consiste em um jogo 2D no qual o jogador controla um personagem através de diferentes labirintos, utilizando tanto o teclado quanto controles disponíveis na interface. O sistema também possui autenticação, gerenciamento de perfil e acompanhamento do progresso do jogador.

---

## 🌐 Acessos

[![Documentação](https://img.shields.io/badge/Documentação-4285F4?style=for-the-badge&logo=readthedocs&logoColor=white)](https://docs.google.com/document/d/1wHTKKy-OlpOd1Lxw_D1iCJACUWW3lvY1SN9SBoPetN8/edit?usp=sharing)
[![Kanban](https://img.shields.io/badge/Kanban-0052CC?style=for-the-badge&logo=trello&logoColor=white)](https://trello.com/b/AyHurhur)

---

## 👥 Equipe

| Integrante                          | Perfil                     |
| ----------------------------------- | -------------------------- |
| **Jocimar Borges Júnior**           | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jocimarbj/)[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/JocimarBJ)|
| **Leonardo Silva e Cruz**           | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/leonardosilvaecruz/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/HiperD)|
| **Lucas Francisco Alves Costa**     | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-francisco-alves-costa-12b2ab327/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/LucasFranciscoAlvesCosta)|
| **Pedro Paulo Valente Bittencourt** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pedro-bittencourt-883867275/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/PedroPVB26)|
| **Pedro Lucas da Silva Mota**       | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pedro-lucas-silva-mota-769a70267/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/LucasPedropl)|

---

## 🎮 Sobre o jogo

O jogador deve navegar por cenários bidimensionais, superar obstáculos e encontrar o caminho através dos labirintos.

A movimentação pode ser realizada por:

* ⌨️ **Teclado:** utilização das teclas direcionais ou WASD;

O jogo conta com diferentes fases e níveis de dificuldade, além de um sistema de acompanhamento do progresso do usuário.

### Principais funcionalidades

* 🔐 Cadastro e autenticação de usuários
* 🔑 Login tradicional e login com Google
* 🔄 Recuperação de senha
* 👤 Edição e exclusão de conta
* 🎮 Movimentação do personagem
* 🧱 Colisão com obstáculos
* 🗺️ Limites dos mapas
* 🔄 Reinicialização das fases
* 🎞️ Animação dos movimentos
* 🏆 Progress Tracking
* 📊 Registro de fases concluídas e níveis de dificuldade
* 🎨 Personalização do avatar

---

## 🛠️ Tecnologias

### Front-end

| Tecnologia     | Utilização                          |
| -------------- | ----------------------------------- |
| **React**      | Construção da interface             |
| **TypeScript** | Tipagem e desenvolvimento           |
| **Vite**       | Build e ambiente de desenvolvimento |
| **HTML5**      | Estrutura da aplicação              |
| **CSS3**       | Estilização                         |
| **Phaser**     | Motor do jogo 2D                    |

O **Phaser** é responsável pela lógica principal do jogo, incluindo cenas, jogador, mapas, sprites, animações, câmera, colisões, iluminação, teclado e efeitos visuais. A implementação principal encontra-se em `game.ts`.

### Back-end

| Tecnologia      | Utilização                   |
| --------------- | ---------------------------- |
| **Java**        | Linguagem principal          |
| **Spring Boot** | API REST e regras de negócio |

### Banco de dados

| Tecnologia     | Utilização                                              |
| -------------- | ------------------------------------------------------- |
| **PostgreSQL** | Persistência dos dados                                  |
| **Supabase**   | Plataforma de banco de dados e serviços de autenticação |

---

## 🏗️ Arquitetura

O sistema é organizado em três camadas principais:

```text
┌───────────────────────────┐
│        Front-end          │
│    React + TypeScript     │
│      Vite + Phaser        │
└─────────────┬─────────────┘
              │
              │ HTTP / REST
              ▼
┌───────────────────────────┐
│         Back-end           │
│      Java + Spring Boot    │
│     Regras de negócio      │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│        Banco de Dados      │
│       PostgreSQL           │
│         Supabase           │
└───────────────────────────┘
```

---

## 📁 Estrutura do projeto

A estrutura pode ser organizada da seguinte maneira:

```text
Daedalus-Shadow/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── game/
│   │   │   └── game.ts
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── pom.xml
│
├── docs/
│   └── ...
│
└── README.md
```

> A estrutura acima representa uma organização previamente pensada recomendada para o projeto. Os diretórios devem ser ajustados conforme ocorrem alterações na estrutura real do projeto, podendo ser diferente ao final.

---

## 🚀 Como executar

### Pré-requisitos

Antes de executar o projeto, certifique-se de possuir:

* **Node.js**
* **npm**
* **Java**
* **Maven**
* **Git**
* Uma instância/configuração do **PostgreSQL/Supabase**

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd Daedalus-Shadow
```

### 2. Execute o Front-end

Entre no diretório do front-end:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível no endereço apresentado pelo Vite, normalmente:

```text
http://localhost:9090
```

### 2.1 Execute o pseudo-backend local

Para testar o progresso persistido, abra outro terminal na raiz do projeto e execute:

```bash
npm run api
```

O servidor SQLite ficará disponível em `http://localhost:3001`. A base local será criada em `server/progress.sqlite` e não deve ser versionada. Com a API em execução, o botão de continuar recupera o nível e a seed do usuário da sessão; ao concluir uma fase, o servidor cria e salva a seed da próxima fase.

### 3. Execute o Back-end

Em outro terminal:

```bash
cd backend
```

Execute a aplicação Spring Boot:

```bash
...
```

No Windows, caso necessário:

```bash
...
```

---

## ⚙️ Variáveis de ambiente

As credenciais e configurações sensíveis não devem ser versionadas no Git.

Crie os arquivos `.env` necessários de acordo com a configuração do projeto.

Exemplo:

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=
```

> Nunca coloque chaves privadas, senhas ou tokens diretamente no código-fonte.

---

## 🎮 Controles

| Entrada            | Ação                    |
| ------------------ | ----------------------- |
| ⬆️ ou W            | Mover para frente       |
| ⬇️ ou S            | Mover para trás         |
| ⬅️ ou A            | Mover para esquerda     |
| ➡️ ou D            | Mover para direita      |

O sistema deve impedir que o personagem atravesse os limites do cenário ou células ocupadas por obstáculos.

---

## 🧪 Testes

O projeto utiliza testes unitários tanto no back-end quanto no front-end.

### Back-end

* **JUnit 5**
* **Mockito**
* **JaCoCo**

A meta estabelecida é de **80% de cobertura mínima** para classes que contenham regras de negócio e serviços.

### Front-end

* **Vitest**
* **React Testing Library**
* **Vitest Coverage**

A meta estabelecida é de **70% de cobertura mínima** dos componentes interativos, hooks customizados e funções utilitárias.

Para uma funcionalidade ser considerada concluída, os testes principais e caminhos de exceção devem estar cobertos e a suíte deve apresentar **100% de aprovação**.

---

## 📋 Requisitos principais

### Funcionais

* Cadastro e login de usuários
* Login com Google
* Logout
* Recuperação de senha
* Gerenciamento de perfil
* Renderização do cenário 2D
* Movimentação por teclado
* Movimentação por botões
* Limitação do cenário
* Detecção de colisões
* Reinicialização do cenário
* Animação dos movimentos
* Rastreamento do progresso

### Não funcionais

* Interface intuitiva
* Execução diretamente no navegador
* Resposta rápida aos comandos
* Jogabilidade clara
* Código organizado e manutenível
* Comportamento consistente
* Interface responsiva

---

## 🔄 Metodologia

O desenvolvimento segue a metodologia **Scrum**, organizado em duas Sprints principais:

### Sprint 1 — Planejamento e Arquitetura

* Definição do escopo
* Levantamento de requisitos
* Escolha das tecnologias
* Modelagem do sistema
* Diagramas UML
* Modelagem do banco
* Protótipos de interface
* Estruturação do projeto

### Sprint 2 — Desenvolvimento e Implementação

* Autenticação
* Mecânica do labirinto
* Movimentação 2D
* Colisões
* Perfil do usuário
* Progress Tracking
* Integração Front-end + Back-end
* Testes
* Deploy do MVP

---

## 📚 Documentação

A documentação do projeto contempla:

* Requisitos funcionais e não funcionais
* Diagramas de casos de uso
* Diagrama de classes
* Diagrama de atividades
* Diagrama de pacotes
* Modelo entidade-relacionamento
* Protótipos de interface
* Arquitetura do sistema
* Estratégia de testes

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos no contexto da disciplina **Oficina de Integração 2**.

---

<p align="center">
  <strong>Daedalus' Shadow</strong><br>
  <i>Encontre o caminho. Supere o labirinto.</i>
</p>
