# TechNova Backend (Spring Boot + MyBatis + MySQL)

REST API backend for the TechNova intelligent e-commerce platform, matching
the technical requirements doc (Parts 2–4, plus Docker bonus Part 5).

## Tech stack
- Java 17, Spring Boot 3.2 (`spring-boot-starter-web`, `spring-boot-starter-validation`)
- MyBatis (`mybatis-spring-boot-starter`) as the ORM / DAO layer
- MySQL 8.0
- Lombok
- JWT (`jjwt`) for stateless auth, BCrypt (`spring-security-crypto`) for password hashing — no full Spring Security filter chain, just a lightweight `HandlerInterceptor`
- JUnit 5 + Mockito for unit tests

## Layered structure
```
src/main/java/com/technova/shop/
├── controller/     # HTTP endpoints, validates input, delegates to service — no business logic
├── service/        # interfaces + impl/ — business logic
├── mapper/         # MyBatis DAO interfaces (annotation-based SQL)
├── entity/         # tables mapped 1:1 to Java classes
├── dto/            # request/response shapes (not DB entities)
├── util/           # JwtUtil
├── interceptor/    # AuthInterceptor (JWT check)
├── config/         # CORS, interceptor registration, password encoder bean
└── exception/      # BusinessException + GlobalExceptionHandler
```

## 1. Run locally (no Docker)

Requirements: JDK 17+, Maven 3.8+, MySQL 8.0 running locally.

```bash
# 1. create the schema + seed data
mysql -u root -p < init.sql

# 2. run the app (uses localhost:3306 by default — see application.yml)
mvn spring-boot:run
```
The API comes up on **http://localhost:8080**.

Environment variables (all optional, defaults shown in `application.yml`):
`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.

## 2. Run with Docker (recommended)

```bash
docker-compose up --build
```
This starts MySQL (auto-runs `init.sql`) and the backend together. API on `http://localhost:8080`.

## 3. IntelliJ IDEA
1. `File → Open...` → select this folder.
2. Let Maven import finish (bottom-right notification).
3. Start a local MySQL 8.0, run `init.sql` against it.
4. Run `ShopApplication.main()`.

## Seed login
Every seeded user's password is **`123456`**:
`alice`, `bob`, `carol`, `dave`, `admin`.

## API summary

All responses are wrapped as `{ code, message, data }`. Endpoints under
`/api/cart`, `/api/orders`, `/api/wishlist`, `/api/users` require
`Authorization: Bearer <token>` (returned from login/register).

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | – | create account, returns JWT |
| POST | /api/auth/login | – | returns JWT |
| GET | /api/products | – | search/filter/sort/paginate |
| GET | /api/products/{id} | – | product detail |
| GET | /api/products/{id}/related | – | same-category picks |
| GET | /api/categories | – | nested category tree |
| GET | /api/cart | ✓ | current user's cart |
| POST | /api/cart | ✓ | add item `{productId, quantity}` |
| PUT | /api/cart/{id} | ✓ | change quantity `{quantity}` |
| DELETE | /api/cart/{id} | ✓ | remove item |
| POST | /api/orders | ✓ | checkout `{receiverName, receiverPhone, address}` |
| GET | /api/orders | ✓ | order history |
| GET | /api/orders/{id} | ✓ | order detail |
| GET | /api/orders/{id}/items | ✓ | line items |
| PUT | /api/orders/{id}/status | ✓ | advance status `{status}` |
| GET | /api/wishlist | ✓ | saved products |
| POST /DELETE | /api/wishlist/{productId} | ✓ | add / remove |
| GET | /api/users/me | ✓ | profile |
| PUT | /api/users/me | ✓ | update profile |

## Wiring up the existing React frontend

Your `technova-frontend` currently reads everything from `src/lib/data.js`
(mock data). To connect it to this backend:

1. **Dev proxy** — in `vite.config.js`, add a proxy so `/api/*` calls from
   the Vite dev server hit this backend without CORS headaches:
   ```js
   export default defineConfig({
     plugins: [react()],
     server: {
       proxy: { '/api': 'http://localhost:8080' }
     }
   })
   ```
2. **Auth token** — after login/register, store the returned `token` (e.g.
   in a React context or `localStorage`), and attach it as
   `Authorization: Bearer <token>` on every subsequent fetch to `/api/cart`,
   `/api/orders`, `/api/wishlist`, `/api/users`.
3. **Replace mock reads** — swap the places in `HomePage.jsx`, `ProductPage.jsx`,
   `CartPage.jsx`, etc. that currently import from `lib/data.js` with `fetch('/api/...')`
   calls, keeping the same shape your components already expect where possible.
4. Keep `lib/data.js` around during the transition — it's still useful for
   local development/demoing if the backend isn't running.

## Unit tests
```bash
mvn test
```
Covers `JwtUtil` token generation/parsing and `AuthServiceImpl` /
`ProductServiceImpl` business logic (duplicate username rejection, wrong
password rejection, successful login, pagination math, missing product).

## Notes on the requirements doc mapping
- Part 2.1 dependencies — all present in `pom.xml` (added `spring-security-crypto` and `jjwt` for auth, not in the original list, since JWT + password hashing need *something*; swap for `spring-boot-starter-security` if your team prefers the full framework).
- Part 2.2 layering — Controller/Service/DAO(Mapper)/Entity/Util/Config all present.
- Part 4 — `init.sql` has all 6 required tables plus a `wishlist` table (7 total), FK constraints, 5+ seed rows each.
- Part 5 (Docker bonus) — `Dockerfile` + `docker-compose.yml` included (Lv.2). Add an `nginx.conf` + a frontend container for Lv.3 if you want the extra points.
- Part 6 (AI bonus) — not implemented here; it's independent of this core backend and can be added as an extra controller/service (e.g. `AiChatController` calling an LLM API) without touching anything above.
