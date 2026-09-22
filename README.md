# FinanceTracker

Aplicación de finanzas personales para uso doméstico (2 usuarios independientes). Monorepo con `backend` (Express + Prisma + PostgreSQL) y `frontend` (Next.js + DaisyUI).

## Estructura

```
FinanceTracker/
├── backend/     # API REST (Express + TypeScript + Prisma)
└── frontend/    # App web (Next.js App Router + Tailwind + DaisyUI)
```

## Requisitos

- Node.js 20+
- PostgreSQL en marcha localmente (o accesible por red)

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `backend/.env`:

- `DATABASE_URL`: cadena de conexión a tu PostgreSQL, p. ej. `postgresql://usuario:password@localhost:5432/FinanceTracker?schema=public`.
- `JWT_SECRET`: cualquier cadena larga y aleatoria.
- `FRONTEND_URL`: origen del frontend (por defecto `http://localhost:3000`).

Aplica las migraciones y siembra categorías de ejemplo:

```bash
npm run prisma:migrate
npm run seed
```

`npm run seed` crea un usuario de desarrollo (`dev@financetracker.local` / `password123`) con categorías de ejemplo. **No hay registro público de usuarios**: para crear una cuenta real usa el script CLI:

```bash
npm run create-user -- --email tu-usuario --password "tu-contraseña"
```

(o ejecútalo sin flags para que te pregunte los datos de forma interactiva).

Arranca el servidor:

```bash
npm run dev
```

La API queda escuchando en `http://localhost:4000`. El job de movimientos recurrentes se ejecuta una vez al arrancar (para ponerse al día) y luego cada día a la 01:00.

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:3000`. Solo hay pantalla de login (no hay registro): usa las credenciales que hayas creado con `create-user`.

El frontend hace proxy de `/api/*` hacia el backend (`BACKEND_URL` en `frontend/.env`, por defecto `http://localhost:4000`), así que en desarrollo ambos deben estar corriendo a la vez.

## API

Rutas principales (todas bajo `/api`, autenticadas por cookie httpOnly salvo login/plantilla CSV):

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET/POST /categories`, `PATCH/DELETE /categories/:id`
- `GET/POST /transactions`, `PATCH/DELETE /transactions/:id`, `GET /transactions/export`
- `GET/POST /budgets`, `PATCH/DELETE /budgets/:id`, `GET /budgets/progress`
- `GET/POST /investments`, `PATCH/DELETE /investments/:id`, `GET /investments/summary`
- `GET /import/template`, `POST /import/preview`, `POST /import/confirm`
- `GET /dashboard/summary`, `GET /dashboard/monthly-breakdown`, `GET /dashboard/category-breakdown`

## Notas

- Los importes se guardan como `Decimal` en PostgreSQL (nunca `float`).
- El despliegue local (proceso, reverse proxy, etc.) corre por cuenta del usuario; no se incluye Docker.
