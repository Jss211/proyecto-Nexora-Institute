# Nexora Institute — Sistema de Gestión Académica

Plataforma modular para la gestión académica de un instituto con tres perfiles: **Administrador**, **Docente** y **Estudiante**.

## Stack Tecnológico
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Base de Datos:** PostgreSQL (Docker en local / compatible con Supabase en producción)

---

## Estructura del Proyecto

```text
proyecto-NexoraInstitute/
├── docker-compose.yml      # Servidor PostgreSQL local en Docker
├── backend/                # API REST modular (Express + TS + Prisma)
│   ├── prisma/             # Esquema, migraciones y seed de base de datos
│   └── src/modules/        # Módulos: auth, users, academic, enrollments, grades, attendance
└── frontend/               # SPA modular (React + TS + Tailwind CSS)
    └── src/modules/        # Módulos: auth, admin, teacher, student
```

---

## Cómo levantar el proyecto en local

### 1. Base de datos (Docker)
Abre **Docker Desktop** y ejecuta desde la raíz:
```powershell
docker compose up -d
docker compose ps
```

### 2. Backend + Prisma
```powershell
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

*(Para ver tus tablas visualmente en el navegador: `npx prisma studio`)*

### 3. Frontend
En otra terminal:
```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### Cuentas de prueba (cargadas por `seed.ts`)
| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| Administrador | `admin@nexorainstitute.edu` | `Admin123!` |
| Docente | `docente@nexorainstitute.edu` | `Docente123!` |
| Estudiante | `estudiante@nexorainstitute.edu` | `Alumno123!` |

---

## Flujo de trabajo con Git (equipo de 2)
1. Mantener `main` limpio con la base estable.
2. Cada integrante crea su rama desde `main`:
   ```powershell
   git checkout main
   git pull origin main
   git checkout -b feat/nombre-del-modulo
   ```
3. Avisar al equipo antes de modificar `backend/prisma/schema.prisma` para evitar conflictos en migraciones.
