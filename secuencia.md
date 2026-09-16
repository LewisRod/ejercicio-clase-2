# APIs — Secuencia definitiva del proyecto con API KEY + JWT

> Plantilla de referencia para los ejercicios de Programación Aplicada II con **Node.js + Express + Prisma 7 + PostgreSQL/Neon + API Key + JWT**.

---

# ⚡ Regla importante: cambios en `schema.prisma`

Si editas un `model` en `schema.prisma`, debes crear una nueva migración:

```bash
npx prisma migrate dev --name nombre-del-cambio
```

Ejemplos:

```bash
npx prisma migrate dev --name agregar-rol
npx prisma migrate dev --name agregar-relacion-tareas
npx prisma migrate dev --name agregar-campo
```

---

# 📋 Secuencia completa

```text
1.  Node
        ↓
2.  Dependencias
        ↓
3.  Neon + .env + .gitignore
        ↓
4.  API_KEY + JWT_SECRET
        ↓
5.  Prisma init + config
        ↓
6.  schema.prisma
        ↓
7.  prisma generate ← comprobar
        ↓
8.  prisma migrate
        ↓
9.  Crear src/
        ↓
10. db.js
        ↓
11. index.js
        ↓
12. Middlewares
        ↓
13. Controllers
        ↓
14. Routes
        ↓
15. Conectar routes en index.js
        ↓
16. Registro
        ↓
17. Login
        ↓
18. JWT
        ↓
19. API Key
        ↓
20. Protección de rutas
        ↓
21. Roles
        ↓
22. Postman / Thunder Client
        ↓
23. CRUD V1
        ↓
24. CRUD V2
        ↓
25. Probar autenticación
        ↓
26. Probar autorización
        ↓
27. Proyecto completo funcionando
```

--------------------------------------------------------

# PASO 1 — Crear proyecto Node

```bash
mkdir api-jwt
cd api-jwt
npm init -y
```

Configurar `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

---------------------------------------------------------

# PASO 2 — Instalar dependencias

Dependencias principales:

```bash
npm install express @prisma/client@7.10 @prisma/adapter-pg pg dotenv jsonwebtoken bcryptjs
```

Dependencias de desarrollo:

```bash
npm install -D prisma@7.10 nodemon
```

-----------------------------------------------------------

# PASO 3 — Neon + `.env` + `.gitignore`

Crear el proyecto PostgreSQL en Neon.

## `.env`

```env
DATABASE_URL="tu_connection_string"
JWT_SECRET="tu_secreto"
API_KEY="tu_api_key"
```

## `.gitignore`

```text
.env
node_modules/
```

⚠️ Nunca subir `.env` al repositorio.

-----------------------------------------------------------------

# PASO 4 — Generar `JWT_SECRET` y `API_KEY`

Para generar el secreto JWT:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiar el resultado al `.env`:

```env
JWT_SECRET=resultado_generado
```

Para generar la API Key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiar el resultado:

```env
API_KEY=resultado_generado
```

---------------------------------------------------------------------------

# PASO 5 — Inicializar Prisma

```bash
npx prisma init
```

Configurar `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

-----------------------------------------------------------------------

# PASO 6 — Configurar `schema.prisma`

Modelo de usuarios y tareas:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Usuario {
  id       Int     @id @default(autoincrement())
  nombre   String
  email    String  @unique
  password String
  rol      String  @default("usuario")

  tareas Tarea[]
}

model Tarea {
  id         Int      @id @default(autoincrement())
  titulo     String
  completada Boolean  @default(false)
  creadoEn   DateTime @default(now())

  usuarioId Int
  usuario   Usuario @relation(fields: [usuarioId], references: [id])
}
```

----------------------------------------------------------------------------

# PASO 7 — Generar Prisma Client

```bash
npx prisma generate
```

Debe funcionar correctamente.

## 🚨 Regla

Si `prisma generate` falla:

> **NO avanzar al siguiente paso.**

Primero resolver el error.

---------------------------------------------------------------------------

# PASO 8 — Migrar la base de datos

```bash
npx prisma migrate dev --name init
```

Flujo:

```text
schema.prisma
      ↓
prisma migrate
      ↓
PostgreSQL / Neon
```

----------------------------------------------------------------------------

# PASO 9 — Crear estructura `src`

```text
src/
├── controllers/
├── middlewares/
├── routes/
├── db.js
└── index.js
```

----------------------------------------------------------------------------

# PASO 10 — Configurar `db.js`

```js
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({
  adapter
})

export default prisma
```

Los controllers importan:

```js
import prisma from "../db.js"
```

---------------------------------------------------------------------

# PASO 11 — Configurar `index.js`

```js
import "dotenv/config"
import express from "express"

const app = express()

app.use(express.json())

app.listen(3000, () => {
  console.log("Servidor ejecutándose en el puerto 3000")
})
```

Probar:

```bash
npm run dev
```

Debe aparecer:

```text
Servidor ejecutándose en el puerto 3000
```

-----------------------------------------------------------------------

# PASO 12 — Crear Middlewares

Crear:

```text
src/middlewares/
├── logger.middleware.js
├── validaciones.middleware.js
├── apiKey.middleware.js
└── auth.middleware.js
```

## `logger.middleware.js`

```js
export const loggerMiddleware = (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url}`
  )

  next()
}
```

## API Key

Flujo:

```text
request
   ↓
apiKeyMiddleware
   ↓
¿API Key correcta?
   ↓
next()
```

## JWT

Flujo:

```text
request
   ↓
authMiddleware
   ↓
¿JWT válido?
   ↓
req.usuario
   ↓
next()
```

-------------------------------------------------------------------

# PASO 13 — Crear Controllers

Crear:

```text
src/controllers/
├── auth.controller.js
├── v1/
│   └── tareas.controller.js
└── v2/
    └── tareas.controller.js
```

## `auth.controller.js`

Aquí se implementan:

```text
POST /auth/registro
POST /auth/login
```

## V1

CRUD de tareas protegido mediante API Key.

## V2

CRUD de tareas protegido mediante JWT.

---------------------------------------------------------------------------

# PASO 14 — Crear Routes

```text
src/routes/
├── auth.routes.js
├── v1/
│   └── tareas.routes.js
└── v2/
    └── tareas.routes.js
```

---------------------------------------------------------------------------

# PASO 15 — Conectar Routes en `index.js`

```js
app.use("/auth", authRoutes)

app.use("/v1/tareas", apiKeyMiddleware, v1TareasRoutes)

app.use("/v2/tareas", authMiddleware, v2TareasRoutes)
```

Endpoints principales:

```text
/auth
/v1/tareas
/v2/tareas
```

---

# PASO 16 — Registro

Crear:

```text
POST /auth/registro
```

Flujo:

```text
nombre
email
password
      ↓
bcrypt
      ↓
password hasheada
      ↓
Prisma
      ↓
Usuario creado
```

⚠️ El usuario no debería poder convertirse libremente en `admin` enviando el rol desde el cliente.

---

# PASO 17 — Login

Crear:

```text
POST /auth/login
```

Flujo:

```text
email + password
       ↓
buscar usuario
       ↓
bcrypt.compare()
       ↓
¿Password correcta?
       ↓
JWT
```

---

# PASO 18 — JWT

Generar el token:

```js
jwt.sign(...)
```

Utilizando:

```env
JWT_SECRET=...
```

El usuario recibe:

```json
{
  "token": "eyJ..."
}
```

---

# PASO 19 — API Key

El cliente debe enviar:

```text
x-api-key: TU_API_KEY
```

El middleware comprueba:

```text
x-api-key
     ↓
process.env.API_KEY
     ↓
¿Coinciden?
```

---

# PASO 20 — Protección de rutas

## V1

```text
/v1/tareas
      ↓
API KEY
      ↓
Controller
```

## V2

```text
/v2/tareas
      ↓
JWT
      ↓
req.usuario
      ↓
Controller
```

---

# PASO 21 — Roles

Los usuarios pueden tener:

```text
usuario
```

o:

```text
admin
```

Crear middleware:

```text
soloAdmin
```

Flujo:

```text
JWT
 ↓
req.usuario
 ↓
rol
 ↓
¿admin?
 ↓
next()
```

---

# PASO 22 — Probar en Postman / Thunder Client

Primero:

```text
POST /auth/registro
POST /auth/login
```

Obtener el JWT.

Después probar V1 con:

```text
x-api-key
```

Y V2 con:

```text
Authorization: Bearer TOKEN
```

---

# PASO 23 — CRUD V1

Endpoints:

```text
POST   /v1/tareas
GET    /v1/tareas
GET    /v1/tareas/:id
PUT    /v1/tareas/:id
DELETE /v1/tareas/:id
```

Protección:

```text
API KEY
```

---

# PASO 24 — CRUD V2

Endpoints:

```text
POST   /v2/tareas
GET    /v2/tareas
GET    /v2/tareas/:id
PUT    /v2/tareas/:id
DELETE /v2/tareas/:id
```

Protección:

```text
JWT
```

Las tareas estarán relacionadas con el usuario autenticado.

---

# PASO 25 — Probar autenticación

Flujo:

```text
Registro
   ↓
Login
   ↓
JWT
   ↓
Enviar JWT
   ↓
Acceder a /v2/tareas
```

Comprobar:

```text
JWT válido       → acceso
JWT inválido     → 401
JWT inexistente  → 401
```

---

# PASO 26 — Probar autorización

Comprobar:

```text
usuario
   ↓
rutas permitidas
```

Y:

```text
admin
   ↓
rutas de administrador
```

---

# PASO 27 — Proyecto completo funcionando

Flujo final:

```text
                    ┌── /v1/tareas
                    │       ↓
Cliente → Express ──┤    API KEY
                    │       ↓
                    │    Controller
                    │
                    └── /v2/tareas
                            ↓
                           JWT
                            ↓
                       req.usuario
                            ↓
                          Rol
                            ↓
                       Controller
                            ↓
                          Prisma
                            ↓
                       PostgreSQL
```

---

# 📁 Estructura final esperada

```text
api-jwt/
│
├── node_modules/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── v1/
│   │   │   └── tareas.controller.js
│   │   └── v2/
│   │       └── tareas.controller.js
│   │
│   ├── middlewares/
│   │   ├── logger.middleware.js
│   │   ├── validaciones.middleware.js
│   │   ├── apiKey.middleware.js
│   │   └── auth.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── v1/
│   │   │   └── tareas.routes.js
│   │   └── v2/
│   │       └── tareas.routes.js
│   │
│   ├── db.js
│   └── index.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── prisma.config.ts
```

---

# 🔄 Si modifico `schema.prisma`

Cada cambio en el modelo requiere una nueva migración.

## Primera migración

```bash
npx prisma migrate dev --name init
```

## Cambios posteriores

```bash
npx prisma migrate dev --name nombre-del-cambio
```

Ejemplos:

```bash
npx prisma migrate dev --name agregar-rol
npx prisma migrate dev --name agregar-relacion
npx prisma migrate dev --name agregar-campo
```

Flujo:

```text
Modificar model
      ↓
npx prisma migrate dev --name ...
      ↓
Base de datos actualizada
      ↓
Prisma Client actualizado según el flujo de Prisma
```

---

# 🚨 Reglas para evitar errores

## Regla 1 — No avanzar si Prisma falla

```bash
npx prisma generate
```

Debe funcionar antes de continuar.

---

## Regla 2 — Mantener configuración consistente

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Sin:

```prisma
output = ...
```

El cliente se genera en:

```text
node_modules/@prisma/client
```

Y se importa:

```js
import { PrismaClient } from "@prisma/client"
```

---

## Regla 3 — No subir secretos

Nunca subir:

```text
.env
```

al repositorio.

El `.env.example` puede contener solamente los nombres:

```env
DATABASE_URL=""
JWT_SECRET=""
API_KEY=""
```

---

## Regla 4 — Probar cada bloque importante

### Prisma

```bash
npx prisma generate
```

### Base de datos

```bash
npx prisma migrate dev --name init
```

### Express

```bash
npm run dev
```

### API

Probar en Postman / Thunder Client:

```text
GET
POST
PUT
DELETE
```

### Autenticación

```text
Registro
Login
JWT
```

### Protección

```text
API Key
JWT
Roles
```

---

# ✅ Checklist

## Node

- [ ] Proyecto creado
- [ ] `package.json` configurado
- [ ] `"type": "module"`
- [ ] Script `start`
- [ ] Script `dev`

## Dependencias

- [ ] Express instalado
- [ ] Prisma 7.10 instalado
- [ ] `@prisma/client` 7.10 instalado
- [ ] `@prisma/adapter-pg` instalado
- [ ] `pg` instalado
- [ ] `dotenv` instalado
- [ ] `jsonwebtoken` instalado
- [ ] `bcryptjs` instalado
- [ ] `nodemon` instalado

## Base de datos

- [ ] Proyecto Neon creado
- [ ] `.env` configurado
- [ ] `.gitignore` configurado
- [ ] `DATABASE_URL` configurado

## Seguridad

- [ ] `JWT_SECRET` generado
- [ ] `API_KEY` generada
- [ ] Secretos fuera de Git

## Prisma

- [ ] `prisma init` ejecutado
- [ ] `prisma.config.ts` configurado
- [ ] `schema.prisma` creado
- [ ] Modelo `Usuario`
- [ ] Modelo `Tarea`
- [ ] Relación Usuario → Tareas
- [ ] `npx prisma generate` funciona
- [ ] `npx prisma migrate dev --name init` funciona

## Backend

- [ ] `src/` creado
- [ ] `db.js` configurado
- [ ] `index.js` configurado
- [ ] `express.json()` configurado
- [ ] Servidor funcionando

## Middlewares

- [ ] `logger.middleware.js`
- [ ] `validaciones.middleware.js`
- [ ] `apiKey.middleware.js`
- [ ] `auth.middleware.js`
- [ ] `soloAdmin`
- [ ] Middlewares conectados correctamente
- [ ] `next()` utilizado correctamente

## Controllers

- [ ] `auth.controller.js`
- [ ] Registro
- [ ] Login
- [ ] Controller V1
- [ ] Controller V2
- [ ] CRUD implementado

## Routes

- [ ] `auth.routes.js`
- [ ] Routes V1
- [ ] Routes V2
- [ ] Middlewares colocados antes del controller
- [ ] Routes conectadas en `index.js`

## Autenticación

- [ ] Registro funcionando
- [ ] Password hasheada con bcrypt
- [ ] Login funcionando
- [ ] JWT generado
- [ ] JWT verificado
- [ ] `req.usuario` creado

## API Key

- [ ] API Key generada
- [ ] Middleware creado
- [ ] `x-api-key` comprobada
- [ ] V1 protegida

## Roles

- [ ] Rol `usuario`
- [ ] Rol `admin`
- [ ] Middleware `soloAdmin`
- [ ] Rutas de administrador protegidas

## Pruebas

- [ ] Registro probado
- [ ] Login probado
- [ ] JWT probado
- [ ] API Key probada
- [ ] V1 probada
- [ ] V2 probada
- [ ] GET probado
- [ ] POST probado
- [ ] PUT probado
- [ ] DELETE probado
- [ ] `401` probado
- [ ] `404` probado
- [ ] `400` probado
- [ ] CRUD completo funcionando
