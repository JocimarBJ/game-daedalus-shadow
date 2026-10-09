# 🕯️ Daedalus' Shadow

> A 2D maze game shrouded in darkness, where every move matters in the search for the exit.

**Daedalus' Shadow** is an interactive web application developed by a team of Software Engineering students at UTFPR — Cornélio Procópio Campus, Brazil.

The project is a 2D game in which players control a character through different mazes, using either the keyboard or the controls available in the interface. The system also features authentication, profile management, and player progress tracking.

---

## 🌐 Links

<p align="center">
  <a href="README.md"><img src="https://flagcdn.com/br.svg" width="15" alt="Bandeira do Brasil"> Português</a> |
  <a href="README.en.md"><img src="https://flagcdn.com/us.svg" width="17" alt="English Flag"> English</a> |
  <a href="README.es.md"><img src="https://flagcdn.com/es.svg" width="15" alt="Español Bandera"> Español</a>
</p>

<div align="center">

[![Documentation](https://img.shields.io/badge/Documentation-4285F4?style=for-the-badge\&logo=readthedocs\&logoColor=white)](https://docs.google.com/document/d/1wHTKKy-OlpOd1Lxw_D1iCJACUWW3lvY1SN9SBoPetN8/edit?usp=sharing)
[![Kanban](https://img.shields.io/badge/Kanban-0052CC?style=for-the-badge\&logo=trello\&logoColor=white)](https://trello.com/b/AyHurhur)
  
</div>

---

## 👥 Team

| Team Member                         | Profile                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Jocimar Borges Júnior**           | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat\&logo=linkedin\&logoColor=white)](https://www.linkedin.com/in/jocimarbj/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat\&logo=github\&logoColor=white)](https://github.com/JocimarBJ)                                            |
| **Leonardo Silva e Cruz**           | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat\&logo=linkedin\&logoColor=white)](https://www.linkedin.com/in/leonardosilvaeecruz/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat\&logo=github\&logoColor=white)](https://github.com/HiperD)                                     |
| **Lucas Francisco Alves Costa**     | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat\&logo=linkedin\&logoColor=white)](https://www.linkedin.com/in/lucas-francisco-alves-costa-12b2ab327/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat\&logo=github\&logoColor=white)](https://github.com/LucasFranciscoAlvesCosta) |
| **Pedro Paulo Valente Bittencourt** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat\&logo=linkedin\&logoColor=white)](https://www.linkedin.com/in/pedro-bittencourt-883867275/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat\&logo=github\&logoColor=white)](https://github.com/PedroPVB26)                         |
| **Pedro Lucas da Silva Mota**       | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat\&logo=linkedin\&logoColor=white)](https://www.linkedin.com/in/pedro-lucas-silva-mota-769a70267/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat\&logo=github\&logoColor=white)](https://github.com/LucasPedropl)                  |

---

## 🎮 About the Game

Players must navigate 2D environments, overcome obstacles, and find their way through the mazes.

Movement is controlled using:

* ⌨️ **Keyboard:** Arrow keys or WASD.

The game features multiple stages and difficulty levels, as well as a system for tracking user progress.

### Main Features

* 🔐 User registration and authentication
* 🔑 Traditional login and Google sign-in
* 🔄 Password recovery
* 👤 Account editing and deletion
* 🎮 Character movement
* 🧱 Collision detection with obstacles
* 🗺️ Map boundaries
* 🔄 Level restarting
* 🎞️ Movement animations
* 🏆 Progress tracking
* 📊 Tracking of completed levels and difficulty settings
* 🎨 Avatar customization

---

## 🛠️ Technologies

### Front-end

| Technology     | Purpose                                   |
| -------------- | ----------------------------------------- |
| **React**      | User interface development                |
| **TypeScript** | Type safety and application development   |
| **Rollup**     | Build tooling and development environment |
| **HTML5**      | Application structure                     |
| **CSS3**       | Styling                                   |
| **Phaser**     | 2D game engine                            |

**Phaser** handles the core game logic, including scenes, the player, maps, sprites, animations, the camera, collisions, lighting, keyboard input, and visual effects. The main implementation is located in `game.ts`.

### Back-end

| Technology      | Purpose                      |
| --------------- | ---------------------------- |
| **Java**        | Primary programming language |
| **Spring Boot** | REST API and business logic  |

### Database

| Technology     | Purpose                                       |
| -------------- | --------------------------------------------- |
| **PostgreSQL** | Data persistence                              |
| **Supabase**   | Database platform and authentication services |

---

## 🏗️ Architecture

The system is organized into three main layers:

```text
┌───────────────────────────┐
│         Front-end         │
│     React + TypeScript    │
│       Rollup + Phaser     │
└─────────────┬─────────────┘
              │
              │ HTTP / REST
              ▼
┌───────────────────────────┐
│         Back-end          │
│      Java + Spring Boot   │
│       Business Logic      │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│         Database          │
│         PostgreSQL        │
│          Supabase         │
└───────────────────────────┘
```

---

## 📁 Project Structure

The project structure can be organized as follows:

```text
Daedalus-Shadow/
│
├── frontend/
│   ├── dist/
│   │   ├── assets/
│   │   │   ├── map/
│   │   │   └── player/
│   │   ├── style/
│   │   │   └── game.css
│   │   └── index.html
│   ├── src/
│   │   ├── scenes/
│   │   ├── services/
│   │   ├── controls.ts
│   │   ├── game.ts
│   │   ├── map-generator.ts
│   │   ├── map-render.ts
│   │   └── player.ts
│   ├── LICENCE
│   ├── package-lock.json
│   ├── package.json
│   ├── .env.example
│   ├── rollup.config.dev.mjs
│   ├── rollup.config.dist.mjs
│   └── tsconfig.json
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

> The structure above represents a proposed organization for the project. Directories should be adjusted as the project evolves and may differ from the final implementation.

---

## 🚀 How to Run

### Prerequisites

Before running the project, make sure you have the following installed:

* **Node.js**
* **npm**
* **Java**
* **Maven**
* **Git**
* A configured **PostgreSQL/Supabase** instance

### 1. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd Daedalus-Shadow
```

### 2. Run the Front-end

Navigate to the front-end directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at the address displayed by Rollup, typically:

```text
http://localhost:9090
```

### 3. Run the Back-end

Open another terminal and navigate to the back-end directory:

```bash
cd backend
```

Run the Spring Boot application using the appropriate Maven command for the project:

```bash
...
```

On Windows, if necessary:

```bash
...
```

---

## ⚙️ Environment Variables

Sensitive credentials and configuration values must not be committed to Git.

Create the required `.env` files according to the project configuration.

Example:

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=
```

> Never include private keys, passwords, or tokens directly in the source code.

---

## 🎮 Controls

| Input   | Action     |
| ------- | ---------- |
| ⬆️ or W | Move up    |
| ⬇️ or S | Move down  |
| ⬅️ or A | Move left  |
| ➡️ or D | Move right |

The system must prevent the character from crossing the scenario boundaries or moving into cells occupied by obstacles.

---

## 🧪 Testing

The project uses unit tests for both the back-end and the front-end.

### Back-end

* **JUnit 5**
* **Mockito**
* **JaCoCo**

The established goal is a **minimum test coverage of 80%** for classes containing business rules and services.

### Front-end

* **Vitest**
* **React Testing Library**
* **Vitest Coverage**

The established goal is a **minimum test coverage of 70%** for interactive components, custom hooks, and utility functions.

For a feature to be considered complete, its main scenarios and exception paths must be covered by tests, and the test suite must achieve a **100% pass rate**.

---

## 📋 Main Requirements

### Functional Requirements

* User registration and login
* Google sign-in
* Logout
* Password recovery
* User profile management
* 2D environment rendering
* Keyboard movement
* Button-based movement
* Environment boundaries
* Collision detection
* Environment restarting
* Movement animations
* Progress tracking

### Non-functional Requirements

* Intuitive interface
* Execution directly in the browser
* Fast response to user input
* Clear gameplay
* Organized and maintainable code
* Consistent behavior
* Responsive interface

---

## 🔄 Methodology

Development follows the **Scrum** methodology and is organized into two main sprints.

### Sprint 1 — Planning and Architecture

* Scope definition
* Requirements gathering
* Technology selection
* System modeling
* UML diagrams
* Database modeling
* Interface prototypes
* Project structure setup

### Sprint 2 — Development and Implementation

* Authentication
* Maze mechanics
* 2D movement
* Collision detection
* User profile
* Progress tracking
* Front-end and back-end integration
* Testing
* MVP deployment

---

## 📚 Documentation

The project documentation covers:

* Functional and non-functional requirements
* Use case diagrams
* Class diagrams
* Activity diagrams
* Package diagrams
* Entity-relationship model
* Interface prototypes
* System architecture
* Testing strategy

---

## 📄 License

This project was developed for academic purposes as part of the **Integration Workshop II (Oficina de Integração 2)** course.

---

<p align="center">
  <strong>Daedalus' Shadow</strong><br>
  <i>Find the way. Conquer the maze.</i>
</p>
