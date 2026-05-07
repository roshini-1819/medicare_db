# MediCare Doctors Module

Full-stack application for managing doctor accounts — **Spring Boot backend + Next.js frontend + PostgreSQL database**.

---

## Project Structure

```
medicare-doctors/
├── backend/                    
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/medicare/
│       │   ├── MedicareApplication.java
│       │   ├── config/
│       │   │   ├── DataInitializer.java
│       │   │   ├── JwtAuthFilter.java
│       │   │   ├── JwtUtil.java
│       │   │   └── SecurityConfig.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   └── DoctorController.java
│       │   ├── dto/
│       │   │   └── DTOs.java
│       │   ├── entity/
│       │   │   ├── Admin.java
│       │   │   └── Doctor.java
│       │   ├── repository/
│       │   │   ├── AdminRepository.java
│       │   │   └── DoctorRepository.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       └── DoctorService.java
│       └── resources/
│           └── application.properties
│
└── frontend/                   
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   └── dashboard/
    │       ├── layout.tsx
    │       ├── page.tsx
    │       └── doctors/
    │           └── page.tsx
    ├── components/
    │   ├── Sidebar.tsx
    │   └── CreateDoctorModal.tsx
    ├── lib/
    │   ├── api.ts
    │   └── auth.ts
    └── types/
        └── index.ts
```

---

## File-by-File Explanation

### BACKEND

---

#### `pom.xml`
Maven build configuration. Declares all dependencies:
- `spring-boot-starter-web` — REST API support
- `spring-boot-starter-data-jpa` — Database ORM with Hibernate
- `spring-boot-starter-security` — Authentication & authorization
- `spring-boot-starter-validation` — @Valid, @NotBlank, @Email annotations
- `postgresql` — JDBC driver for PostgreSQL
- `jjwt-api/impl/jackson` — JWT token generation & validation
- `lombok` — Eliminates boilerplate (getters, setters, builders)

---

#### `application.properties`
Configuration file. Sets:
- PostgreSQL connection URL, username, password
- JPA: `ddl-auto=update` (auto-creates/updates tables on startup)
- JWT secret key and expiration time (24 hours = 86400000ms)
- Server port (8080)

**Change `your_password_here` to your actual PostgreSQL password.**

---

#### `MedicareApplication.java`
The entry point. `@SpringBootApplication` triggers:
- Component scanning (finds all `@Service`, `@Controller`, `@Repository` classes)
- Auto-configuration of Spring Boot
- Property file loading

---

#### `entity/Admin.java`
JPA entity mapped to the `admins` table.
Fields: `id`, `email`, `password` (BCrypt hashed), `name`, `role`.
The admin is created by `DataInitializer` on first startup.

---

#### `entity/Doctor.java`
JPA entity mapped to the `doctors` table.
Contains all doctor fields: clinical ID, names, auto-generated username,
hashed temporary password, email, specialization, clinic, status,
`requirePasswordChange` flag, last login, device, FPS, and timestamps.
Includes inner enum `DoctorStatus` (ACTIVE, INACTIVE, BLOCKED).

---

#### `repository/AdminRepository.java`
Spring Data JPA repository for Admin. Provides:
- All standard CRUD (save, findById, findAll, delete)
- Custom: `findByEmail(email)` — used during login

---

#### `repository/DoctorRepository.java`
Spring Data JPA repository for Doctor. Provides:
- Standard CRUD
- `findByClinicalId` — uniqueness check
- `findByEmail` — uniqueness check
- `findByStatus` — filter doctors by status
- `countByStatus` — dashboard stat counts
- `searchDoctors` — JPQL full-text search across name/email/ID

---

#### `dto/DTOs.java`
All Data Transfer Objects in one file:
- `LoginRequest` — email + password sent by frontend on login
- `LoginResponse` — JWT token + admin name/email returned after login
- `CreateDoctorRequest` — form fields sent when creating a doctor
- `DoctorResponse` — doctor data returned to frontend (password never exposed)
- `DoctorStatsResponse` — counts for the 4 dashboard stat cards
- `ApiResponse<T>` — generic response wrapper `{ success, message, data }`

---

#### `config/JwtUtil.java`
Utility for JWT operations:
- `generateToken(email)` — Creates signed JWT with 24h expiry
- `extractEmail(token)` — Decodes token to get admin email
- `validateToken(token)` — Returns true if token is valid and not expired

---

#### `config/JwtAuthFilter.java`
Runs on every HTTP request. Reads the `Authorization: Bearer <token>` header,
validates the JWT, and if valid, sets the authentication in Spring Security's
context — marking the request as authenticated.

---

#### `config/SecurityConfig.java`
Main security configuration:
- CORS: Allows `http://localhost:3000` (Next.js dev server)
- CSRF: Disabled (stateless API)
- Session: STATELESS (no server sessions, JWT only)
- `/api/auth/**` — public (no JWT needed)
- All other `/api/**` — require valid JWT
- Registers `JwtAuthFilter` before Spring's default filter
- Defines BCrypt `PasswordEncoder` bean

---

#### `config/DataInitializer.java`
Seeds a default admin on first startup:
- Email: `admin@medicare.com`
- Password: `Admin@123`

Only runs once (checks `adminRepository.count() == 0`).
**Change these credentials in production!**

---

#### `service/AuthService.java`
Login business logic:
1. Calls Spring Security's `AuthenticationManager.authenticate()`
2. On success, generates JWT with `JwtUtil.generateToken()`
3. Returns `LoginResponse` with token + admin info
4. Throws `RuntimeException` on invalid credentials

---

#### `service/DoctorService.java`
Core doctor management logic:
- `createDoctor` — validates uniqueness, auto-generates username (DR00001 format)
  and temp password (Doctor#XXXXXXX), hashes password with BCrypt,
  saves to DB, returns response **including plain-text password once**
- `getAllDoctors` — returns all, newest first
- `searchDoctors` — delegates to `DoctorRepository.searchDoctors()`
- `getDoctorsByStatus` — filter by enum status
- `getStats` — counts for stat cards
- `updateDoctorStatus` — admin changes ACTIVE/INACTIVE/BLOCKED
- `deleteDoctor` — hard delete by ID

---

#### `controller/AuthController.java`
REST endpoint: `POST /api/auth/login`
- Accepts `{ email, password }` JSON body
- Returns `ApiResponse<LoginResponse>` with 200 OK on success
- Returns 401 on invalid credentials

---

#### `controller/DoctorController.java`
REST endpoints (all require JWT):
- `POST   /api/doctors` — create doctor
- `GET    /api/doctors` — list all (optional `?search=` or `?status=`)
- `GET    /api/doctors/stats` — dashboard statistics
- `PATCH  /api/doctors/{id}/status?status=BLOCKED` — change status
- `DELETE /api/doctors/{id}` — delete doctor

---

### FRONTEND

---

#### `package.json`
NPM dependencies:
- `next` 14 — React framework with App Router
- `react`, `react-dom` — Core React
- `axios` — HTTP client for API calls
- `react-hot-toast` — Toast notifications
- `lucide-react` — Icon library
- `tailwindcss` — Utility CSS framework

---

#### `tailwind.config.js`
Extends Tailwind with custom colors:
- `sidebar` (#1a1d2e) — dark navy sidebar background
- `primary` (#7c3aed) — purple primary color (matches reference)

---

#### `types/index.ts`
TypeScript interfaces matching backend DTOs:
`Admin`, `LoginResponse`, `Doctor`, `DoctorStats`, `CreateDoctorForm`, `ApiResponse<T>`.
Ensures type safety across all API calls and components.

---

#### `lib/api.ts`
Centralized Axios API client:
- Base URL: `http://localhost:8080/api`
- **Request interceptor**: Auto-attaches JWT from localStorage to every request
- **Response interceptor**: On 401, clears auth and redirects to `/login`
- `authAPI.login()` — POST /auth/login
- `doctorsAPI.getAll()` — GET /doctors with optional params
- `doctorsAPI.create()` — POST /doctors
- `doctorsAPI.getStats()` — GET /doctors/stats
- `doctorsAPI.updateStatus()` — PATCH /doctors/{id}/status
- `doctorsAPI.delete()` — DELETE /doctors/{id}

---

#### `lib/auth.ts`
LocalStorage auth utilities:
- `saveAuth(data)` — stores token + admin info after login
- `getToken()` — retrieves JWT from localStorage
- `getAdmin()` — retrieves admin object (name, email, role)
- `isAuthenticated()` — returns true if token exists
- `logout()` — clears storage + redirects to `/login`

---

#### `app/layout.tsx`
Root Next.js layout. Wraps all pages with:
- Inter Google Font
- Global CSS (Tailwind)
- React Hot Toast provider (top-right position)
- Page metadata

---

#### `app/globals.css`
Tailwind directives + CSS custom properties + scrollbar styling.

---

#### `app/page.tsx`
Root `/` page. Client component that checks auth state:
- Authenticated → redirect to `/dashboard`
- Not authenticated → redirect to `/login`

---

#### `app/login/page.tsx`
Login page with split layout (dark left panel + white form right):
- Left: MediCare branding, feature bullets, dark navy background
- Right: Email + password form with show/hide toggle
- On submit: calls `authAPI.login()`, saves auth, redirects to dashboard
- Shows default credentials hint for development

---

#### `app/dashboard/layout.tsx`
Shared layout for all dashboard pages:
- Auth guard: redirects to `/login` if not authenticated
- Renders Sidebar + `{children}` (main content)

---

#### `app/dashboard/page.tsx`
Dashboard home (`/dashboard`). Shows quick links to Doctors, Patients, Clinics.
Only Doctors link is functional; others show "Coming soon".

---

#### `app/dashboard/doctors/page.tsx`
**The main page** — matches both reference images:
- Page header with "Pro" badge + Export/Create Doctor buttons
- 4 stat cards (Total, Active, Inactive, Blocked) with trend indicators
- Doctors Directory table with search + status filter
- Empty state with "Create your first doctor →" link
- Table columns: Clinical ID, Doctor (name+email+avatar), Username, Doctor ID,
  Status badge, Password (masked), Last Login, Device, FPS, Actions
- Actions: status dropdown + delete button per row
- Auto-refreshes after create/delete

---

#### `components/Sidebar.tsx`
Left navigation sidebar (dark navy theme):
- MediCare logo at top
- Nav items: Dashboard, Doctors (active), Patients, Clinics, Exercise Library,
  Analytics, Notifications, Settings
- Active state: purple highlight
- Admin info (name, email) at bottom
- Logout button

---

#### `components/CreateDoctorModal.tsx`
Create Doctor modal form — matches reference image exactly:
- All fields: Clinical ID*, First Name*, Last Name*, Birth Year,
  Username (auto/disabled), Temp Password (auto/disabled),
  Mobile Number, Email*, Specialization (dropdown), Clinic/Hospital,
  Status dropdown, Notes textarea
- Security warning banner at bottom
- Form validation with inline error messages
- Calls `doctorsAPI.create()` on submit
- Shows success toast with generated username + password

---

## Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+
- PostgreSQL 14+

### Database Setup
```sql
CREATE DATABASE medicare_db;
```

### Backend Setup
```bash
cd backend

# Edit application.properties — set your DB password
# spring.datasource.password=YOUR_PASSWORD

mvn spring-boot:run
# Starts on http://localhost:8080
# Default admin is auto-created: admin@medicare.com / Admin@123
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:3000
```

### Login
Open `http://localhost:3000`
- Email: `admin@medicare.com`
- Password: `Admin@123`

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login  | Admin login, returns JWT |
| GET | /api/doctors  | List all doctors |
| POST | /api/doctors | Create new doctor |
| GET | /api/doctors/stats  | Dashboard statistics |
| PATCH | /api/doctors/{id}/status  | Update doctor status |
| DELETE | /api/doctors/{id} | Delete doctor |

---

## Security Notes

1. **Passwords** are hashed with BCrypt before storage — plain text is never saved.
2. **JWT tokens** expire after 24 hours. Refresh logic can be added.
3. **`requirePasswordChange = true`** is set for all new doctors — implement enforcement in doctor login flow.
4. **Change** `jwt.secret` and default admin credentials in production.
5. **CORS** is configured for `localhost:3000` only — update for your production domain.
