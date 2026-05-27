# Shopvision — Implementation Plan

> **Rule:** Re-read this document in full before implementing any feature.

---

## 1. Project Overview

Shopvision is a lightweight, server-side-rendered shop management application designed for **2–5 member family businesses**. It must run smoothly on low-end Android phones over a local Wi-Fi or mobile network. Every architectural decision favors simplicity, maintainability, and raw performance over developer convenience or ecosystem popularity.

---

## 2. Why Each Technology Was Chosen

| Technology | Reason |
|---|---|
| **FastAPI** | Async Python, auto-generated OpenAPI docs, tiny footprint, easy to self-host |
| **SQLite** | Zero-config, file-based DB — perfect for 2–5 users, no DB server required |
| **SQLAlchemy** | ORM with migrations support via Alembic; keeps raw SQL away from business logic |
| **Jinja2** | Server-side rendering keeps JS minimal; HTML arrives pre-rendered to slow phones |
| **HTMX** | Partial-page updates without a SPA framework; preserves SSR benefits |
| **Alpine.js** | Micro-interactions (dropdowns, toggles) without React/Vue overhead (~15 KB) |
| **Tailwind CSS** | Utility-first; purge eliminates unused CSS; ideal for mobile-first responsive UI |
| **Chart.js** | Lightweight (~60 KB), canvas-based charts; works on all mobile browsers |
| **JWT + httpOnly cookies** | Stateless auth, safe from XSS (cookies not accessible via JS) |
| **Web Workers** | Offload CSV/PDF export generation so the UI thread never freezes |
| **Tesseract.js (optional)** | Client-side OCR for receipt scanning; no cloud dependency |

---

## 3. Folder Architecture

```
shop-vision-sahaj/
├── app/                          # FastAPI application root
│   ├── main.py                   # App factory, mounts routers & middleware
│   ├── config.py                 # Settings (env vars, paths, secrets)
│   ├── database.py               # SQLAlchemy engine + session factory
│   ├── dependencies.py           # FastAPI Depends() helpers (get_db, get_current_user)
│   │
│   ├── models/                   # SQLAlchemy ORM models (one file per domain)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── transaction.py
│   │   ├── category.py
│   │   ├── receipt.py
│   │   └── widget.py
│   │
│   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── transaction.py
│   │   ├── category.py
│   │   └── receipt.py
│   │
│   ├── routers/                  # One router per feature domain
│   │   ├── __init__.py
│   │   ├── auth.py               # /auth/*
│   │   ├── dashboard.py          # /dashboard/*
│   │   ├── transactions.py       # /transactions/*
│   │   ├── categories.py         # /categories/*
│   │   ├── reports.py            # /reports/*
│   │   ├── receipts.py           # /receipts/*
│   │   └── widgets.py            # /widgets/*  (HTMX partials for dashboard)
│   │
│   ├── services/                 # Business logic (no HTTP concerns here)
│   │   ├── __init__.py
│   │   ├── auth_service.py       # JWT creation/verification, password hashing
│   │   ├── transaction_service.py
│   │   ├── report_service.py     # Aggregate queries for charts/exports
│   │   ├── receipt_service.py    # File save, path management
│   │   └── ocr_service.py        # Server-side OCR fallback (optional)
│   │
│   ├── templates/                # Jinja2 HTML templates
│   │   ├── base.html             # Master layout (nav, meta, CSS/JS imports)
│   │   ├── partials/             # HTMX-targeted fragments (no full <html>)
│   │   │   ├── transaction_row.html
│   │   │   ├── transaction_list.html
│   │   │   ├── chart_data.html
│   │   │   ├── widget_*.html     # One per dashboard widget type
│   │   │   └── toast.html        # Notification fragment
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   ├── dashboard/
│   │   │   └── index.html
│   │   ├── transactions/
│   │   │   ├── index.html        # Transaction list
│   │   │   ├── add.html          # Add/edit form
│   │   │   └── detail.html
│   │   ├── reports/
│   │   │   └── index.html
│   │   └── receipts/
│   │       └── capture.html      # Camera + upload UI
│   │
│   └── static/                   # Served directly by FastAPI (or Nginx)
│       ├── css/
│       │   └── app.css           # Tailwind output (purged)
│       ├── js/
│       │   ├── htmx.min.js
│       │   ├── alpine.min.js
│       │   ├── chart.min.js
│       │   ├── app.js            # Global Alpine data + small helpers
│       │   └── workers/
│       │       ├── export.worker.js   # CSV/PDF export
│       │       └── ocr.worker.js      # Tesseract.js OCR
│       └── uploads/              # Receipt images stored here
│           └── receipts/         # Namespaced by user_id/year/month/
│
├── migrations/                   # Alembic migration scripts
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│
├── tests/                        # Pytest test suite
│   ├── conftest.py               # In-memory SQLite fixture
│   ├── test_auth.py
│   ├── test_transactions.py
│   └── test_reports.py
│
├── alembic.ini
├── requirements.txt
├── .env.example                  # Template for secrets
├── .gitignore
├── Makefile                      # dev / migrate / test shortcuts
├── Dockerfile                    # For optional containerized deployment
└── implementation-plan.md        # ← this file (in repo root for reference)
```

> **WHY this structure?** Each layer (models → schemas → services → routers → templates) has a single responsibility. Services contain *all* business logic so routers stay thin. Partials are separate templates so HTMX can swap them without re-rendering the whole page.

---

## 4. Database Schema

All tables use `INTEGER PRIMARY KEY` (SQLite auto-increment). Timestamps are stored as `DATETIME` with UTC default.

### 4.1 `users`

```sql
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'member',  -- 'owner' | 'member'
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    DATETIME DEFAULT (datetime('now'))
);
```

> **Role rationale:** Only `owner` can delete records, manage users, and export data. `member` can add/edit transactions only.

---

### 4.2 `categories`

```sql
CREATE TABLE categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    type       TEXT    NOT NULL,   -- 'income' | 'expense'
    color      TEXT    DEFAULT '#6366f1',  -- hex for UI badges
    icon       TEXT    DEFAULT 'tag',      -- heroicon name
    created_at DATETIME DEFAULT (datetime('now'))
);
```

---

### 4.3 `transactions`

```sql
CREATE TABLE transactions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type          TEXT    NOT NULL,   -- 'income' | 'expense'
    amount        REAL    NOT NULL,
    description   TEXT,
    note          TEXT,
    date          DATE    NOT NULL,   -- YYYY-MM-DD
    receipt_id    INTEGER REFERENCES receipts(id) ON DELETE SET NULL,
    created_at    DATETIME DEFAULT (datetime('now')),
    updated_at    DATETIME DEFAULT (datetime('now'))
);
```

> **WHY separate `date` from `created_at`?** Allows backdating entries (common in family shops where receipts are entered at end of day).

---

### 4.4 `receipts`

```sql
CREATE TABLE receipts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id),
    filename     TEXT    NOT NULL,          -- stored filename (UUID-based)
    original_name TEXT,                     -- original upload filename
    file_path    TEXT    NOT NULL,          -- relative path under static/uploads/
    ocr_text     TEXT,                      -- raw OCR output (nullable)
    ocr_amount   REAL,                      -- parsed amount from OCR
    ocr_date     DATE,                      -- parsed date from OCR
    uploaded_at  DATETIME DEFAULT (datetime('now'))
);
```

---

### 4.5 `dashboard_widgets`

```sql
CREATE TABLE dashboard_widgets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    widget_type TEXT    NOT NULL,  -- 'summary_card' | 'bar_chart' | 'pie_chart' | 'recent_transactions'
    position    INTEGER NOT NULL DEFAULT 0,  -- display order
    config      TEXT,              -- JSON blob for widget-specific settings
    is_visible  INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT (datetime('now'))
);
```

> **WHY JSON config?** Avoids a separate settings table per widget type. Config stores things like date range, category filter, or chart color — all widget-specific, rarely queried by SQL.

---

### 4.6 Indexes

```sql
-- Fast date-range queries (most common report filter)
CREATE INDEX idx_transactions_date       ON transactions(date);
CREATE INDEX idx_transactions_user_date  ON transactions(user_id, date);
CREATE INDEX idx_transactions_category   ON transactions(category_id);
CREATE INDEX idx_receipts_user           ON receipts(user_id);
```

---

## 5. Routing Structure

All pages return full HTML (Jinja2). HTMX calls return partial HTML fragments. JSON is only returned for workers and the optional API.

```
GET  /                          → redirect to /dashboard or /auth/login
GET  /auth/login                → login page
POST /auth/login                → validate credentials, set JWT cookie, redirect
POST /auth/logout               → clear cookie, redirect to /auth/login
GET  /auth/register             → register page (owner only)
POST /auth/register             → create user

GET  /dashboard                 → dashboard (widgets rendered server-side)
GET  /dashboard/widgets/{id}    → HTMX: re-render single widget fragment
POST /dashboard/widgets/reorder → HTMX: save new widget positions (JSON body)
POST /dashboard/widgets/{id}/toggle → HTMX: show/hide a widget

GET  /transactions              → paginated transaction list
GET  /transactions/add          → add transaction form
POST /transactions/add          → create transaction, return HTMX row insert
GET  /transactions/{id}         → detail view
GET  /transactions/{id}/edit    → edit form fragment (HTMX inline edit)
PUT  /transactions/{id}         → update, return updated row fragment
DELETE /transactions/{id}       → delete (owner only), HTMX removes row

GET  /categories                → category list
POST /categories                → create category (HTMX table row insert)
PUT  /categories/{id}           → update
DELETE /categories/{id}         → delete

GET  /reports                   → reports page (date pickers, summary cards)
GET  /reports/chart-data        → HTMX: returns Chart.js data JSON embedded in <script> fragment
GET  /reports/export/csv        → streams CSV download (handled by Web Worker on client)

GET  /receipts/capture          → camera UI page
POST /receipts/upload           → multipart upload → save file → trigger OCR → return fragment
GET  /receipts/{id}             → view receipt + linked transaction
```

---

## 6. Authentication Flow

```
┌──────────┐    POST /auth/login     ┌──────────────────────┐
│  Browser │ ──────────────────────► │  /routers/auth.py    │
└──────────┘                         │                      │
                                     │  1. Load user by     │
                                     │     username         │
                                     │  2. bcrypt verify    │
                                     │     password         │
                                     │  3. Create JWT       │
                                     │     payload:         │
                                     │     {sub, role, exp} │
                                     │  4. Set-Cookie:      │
                                     │     access_token=... │
                                     │     HttpOnly; Secure │
                                     │     SameSite=Lax     │
                                     └──────────────────────┘
                                              │
                    ◄─────────────────────────┘
                    302 redirect to /dashboard

Every subsequent request:
  Browser sends cookie automatically → FastAPI dependency get_current_user()
  decodes JWT → injects User model into route handler.

Token expiry: 8 hours (configurable via env).
Refresh: silent re-login form shown when token expires (no background refresh needed at this scale).
```

**Key decisions:**
- **httpOnly cookie** prevents JS from reading the token → XSS-safe
- **SameSite=Lax** protects against CSRF on navigation, while allowing HTMX POST requests from same origin
- **No refresh tokens** — family shops close at night; 8h sessions are sufficient
- **bcrypt** for password hashing (passlib[bcrypt])

---

## 7. HTMX Interaction Strategy

The core principle: **every user action that mutates state should return the minimal HTML fragment that updates the UI**, never a full page reload.

### 7.1 Patterns Used

| Pattern | HTMX Attribute | Use Case |
|---|---|---|
| **Row insert** | `hx-swap="afterbegin"` on `<tbody>` | Add new transaction at top of list |
| **Row replace** | `hx-swap="outerHTML"` on `<tr>` | Edit a transaction inline |
| **Row delete** | `hx-swap="outerHTML"` → empty string | Delete a transaction row |
| **Form swap** | `hx-swap="innerHTML"` on form container | Toggle between view/edit mode |
| **Widget refresh** | `hx-get` + `hx-trigger="every 60s"` | Auto-refresh summary cards |
| **Toast** | `hx-swap="innerHTML"` on `#toast-container` | Show success/error notification |
| **Infinite scroll** | `hx-trigger="revealed"` on last row | Load more transactions |
| **Out-of-band swap** | `hx-swap-oob="true"` | Update total/count badge while adding row |

### 7.2 Response Headers

Routes that mutate state set `HX-Trigger` response headers to fire client-side events:

```python
# Example: after creating a transaction
headers = {"HX-Trigger": "transactionAdded"}
```

Alpine.js listens: `x-on:transactionAdded.window="refreshSummary()"` — keeps widget totals in sync without a full reload.

### 7.3 Error Handling

All HTMX endpoints return HTTP 422 with a partial error fragment on validation failure. The fragment targets `#form-errors` within the open form using `hx-target="#form-errors"`.

---

## 8. Dashboard Widget System

### 8.1 Widget Types

| Type | Description | Config Keys |
|---|---|---|
| `summary_card` | Total income / expense / net balance for a period | `period` (today/week/month), `type` |
| `bar_chart` | Monthly income vs. expense bar chart | `months` (1–12) |
| `pie_chart` | Expense breakdown by category | `period`, `limit` (top N) |
| `recent_transactions` | Last N transactions list | `limit` (5–20) |
| `category_summary` | Table: category → total | `period`, `type` |

### 8.2 Rendering Flow

```
GET /dashboard
  → query dashboard_widgets WHERE user_id=? ORDER BY position
  → for each widget: render partials/widget_{type}.html with config
  → assemble into dashboard/index.html grid
```

Each widget `<div>` has:
```html
<div id="widget-{id}"
     hx-get="/dashboard/widgets/{id}"
     hx-trigger="load, every 300s"
     hx-swap="innerHTML">
  <!-- server-rendered initial content (no flash) -->
</div>
```

### 8.3 Drag-and-Drop Reorder

- Alpine.js manages the drag state (lightweight drag-and-drop with `@dragstart`, `@dragover`, `@drop`)
- On drop: `hx-post="/dashboard/widgets/reorder"` sends new position array
- No external DnD library needed

### 8.4 Show/Hide Toggle

Owner-only toggle button per widget. Uses HTMX `hx-post="/dashboard/widgets/{id}/toggle"` → returns updated widget wrapper with `is_visible` toggled.

---

## 9. Web Worker Architecture

### 9.1 Export Worker (`export.worker.js`)

**Problem it solves:** Generating a large CSV/PDF for a year of transactions (~10K rows) on the main thread would freeze the UI for 1–3 seconds on low-end phones.

```
Main Thread                    export.worker.js
    │                               │
    │ postMessage({                  │
    │   type: 'EXPORT_CSV',          │
    │   transactions: [...],         │
    │   filename: 'jan-2025.csv'    │
    │ })                             │
    │ ──────────────────────────► │
    │                               │  build CSV string
    │                               │  create Blob
    │ ◄────────────────────────── │
    │ postMessage({                  │
    │   type: 'EXPORT_DONE',         │
    │   blob: Blob,                  │
    │   filename: '...'              │
    │ })                             │
    │                               │
    │  create Object URL            │
    │  simulate <a> click → download│
```

Main thread fetches transaction data via `/reports/export/csv?format=json` (returns raw JSON), passes to worker. Worker builds and delivers the Blob. **No server-side streaming needed.**

### 9.2 OCR Worker (`ocr.worker.js`)

```
Main Thread                    ocr.worker.js
    │                               │
    │ postMessage({                  │
    │   type: 'OCR_IMAGE',           │
    │   imageData: base64string      │
    │ })                             │
    │ ──────────────────────────► │
    │                               │  Tesseract.js recognize()
    │                               │  parse amount + date
    │ ◄────────────────────────── │
    │ postMessage({                  │
    │   type: 'OCR_RESULT',          │
    │   text, amount, date           │
    │ })                             │
    │                               │
    │  pre-fill form fields         │
```

OCR is **opt-in** — the form works without it. Tesseract.js (~2 MB) is lazy-loaded only when the receipts page opens.

---

## 10. Upload & Storage Strategy

### 10.1 Receipt Storage Path

```
static/uploads/receipts/{user_id}/{year}/{month}/{uuid}.{ext}
```

- Files stored **locally on the server** — no cloud dependency
- UUID filename prevents collisions and path traversal
- Original filename stored in DB for display
- Max file size: **5 MB** (enforced in FastAPI)
- Accepted formats: `image/jpeg`, `image/png`, `image/webp`

### 10.2 Upload Flow

```
1. User opens /receipts/capture
2. Camera captures photo (via <input type="file" capture="environment">)
3. Client resizes image to max 1200px wide (Canvas API, before upload) → reduces bandwidth
4. POST /receipts/upload (multipart/form-data)
5. Server: validate MIME, save file, trigger optional OCR, return fragment
6. Fragment shows receipt thumbnail + pre-filled amount/date fields
7. User confirms → POST /transactions/add with receipt_id
```

### 10.3 Cleanup Policy

- Orphan receipts (no linked transaction after 24h) are deleted by a startup background task
- Never auto-delete receipts with a linked transaction

---

## 11. Deployment Strategy

### 11.1 Self-Hosted (Primary — Recommended)

Best for a family running the app on a home Wi-Fi network:

```
Raspberry Pi / old laptop / Android Termux
  uvicorn app.main:app --host 0.0.0.0 --port 8000
  SQLite file: ./shopvision.db
  Uploads: ./app/static/uploads/

  → Family phones access via local IP (e.g., 192.168.1.100:8000)
  → No internet required — fully offline
```

Backup: copy `shopvision.db` to Google Drive weekly (Makefile target).

### 11.2 Cloud VPS (Optional — Remote Access)

```
DigitalOcean / Hetzner $4/mo droplet
  → Nginx (reverse proxy + static file serving)
  → Gunicorn + Uvicorn workers
  → Let's Encrypt TLS (certbot)
  → SQLite on attached volume (persists restarts)
```

### 11.3 Docker (Optional — Portability)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 11.4 Static Assets

- **Development:** FastAPI serves `/static` directly
- **Production:** Nginx serves `/static` — FastAPI never touches static files (significantly faster)

---

## 12. Phased Roadmap

### Phase 1 — Foundation (Days 1–3)

> Goal: App runs, you can log in, and the DB is set up.

- [ ] Project scaffolding (folders, `requirements.txt`, `.env.example`)
- [ ] FastAPI app factory (`main.py`, `config.py`)
- [ ] SQLAlchemy engine + session (`database.py`)
- [ ] Alembic init + first migration (all tables)
- [ ] Seed script: default categories + owner user
- [ ] Auth router: login, logout, register
- [ ] JWT cookie middleware (`dependencies.py`)
- [ ] Base Jinja2 template (`base.html`) with Tailwind CDN
- [ ] Login page + form

**Exit criterion:** Can log in as owner and see an empty dashboard page.

---

### Phase 2 — Core Transactions (Days 4–7)

> Goal: Family can add and view transactions.

- [ ] Transaction model, schema, service
- [ ] Category model, schema, service
- [ ] Transaction list page (paginated, filterable by date + category)
- [ ] Add transaction form (full-page for Phase 2)
- [ ] HTMX row insert on submission
- [ ] Inline edit with HTMX form swap
- [ ] Delete with HTMX row removal (owner only)
- [ ] Category CRUD (simple table page)
- [ ] Toast notifications fragment

**Exit criterion:** Can add, edit, delete, and list transactions with no page reloads.

---

### Phase 3 — Dashboard & Widgets (Days 8–11)

> Goal: Business owner gets a meaningful at-a-glance view.

- [ ] Dashboard route + layout grid
- [ ] `dashboard_widgets` table + CRUD
- [ ] Summary card widget (today / week / month totals)
- [ ] Recent transactions widget
- [ ] Widget toggle show/hide
- [ ] Widget drag-and-drop reorder (Alpine.js)
- [ ] Auto-refresh widgets every 5 minutes (HTMX `hx-trigger="every 300s"`)

**Exit criterion:** Dashboard shows live data, widgets can be rearranged.

---

### Phase 4 — Reports & Charts (Days 12–15)

> Goal: Owner can analyze income/expense trends.

- [ ] Reports page layout
- [ ] Date range picker (Alpine.js + HTML date inputs)
- [ ] Bar chart: monthly income vs expense (Chart.js)
- [ ] Pie chart: expense by category (Chart.js)
- [ ] Summary table: per-category totals
- [ ] HTMX chart data reload on date range change
- [ ] Bar/pie chart widgets on dashboard

**Exit criterion:** Reports page shows charts filtered by date range.

---

### Phase 5 — Receipts & OCR (Days 16–19)

> Goal: Capture and attach receipts to transactions.

- [ ] Receipt model + service
- [ ] `/receipts/capture` page with camera input
- [ ] Client-side image resize (Canvas API) before upload
- [ ] `/receipts/upload` multipart handler
- [ ] Receipt thumbnail in transaction detail
- [ ] OCR Web Worker (Tesseract.js, lazy-loaded)
- [ ] Pre-fill form from OCR result

**Exit criterion:** Can photograph a receipt, see OCR-extracted amount/date pre-filled, and attach it to a transaction.

---

### Phase 6 — Export & Web Workers (Days 20–22)

> Goal: Owner can export data for accounting.

- [ ] Export worker (`export.worker.js`)
- [ ] CSV export (transactions for date range)
- [ ] PDF export (simple print-friendly layout via worker)
- [ ] Progress indicator during export
- [ ] `/reports/export/csv?format=json` endpoint

**Exit criterion:** Clicking "Export CSV" downloads a file without freezing the UI.

---

### Phase 7 — Polish & Production Hardening (Days 23–27)

> Goal: App is robust, secure, and pleasant to use on mobile.

- [ ] Build Tailwind CSS (purge unused classes)
- [ ] Offline-friendly error pages
- [ ] Input validation (server + client)
- [ ] Rate limiting on auth endpoints (slowapi)
- [ ] Responsive audit (test on 360px viewport)
- [ ] Keyboard navigation + accessibility (ARIA labels)
- [ ] Nginx config for production
- [ ] Backup Makefile target (`make backup`)
- [ ] README with setup instructions
- [ ] Basic Pytest suite (auth, transactions, reports)

**Exit criterion:** App passes mobile responsive audit and handles edge cases gracefully.

---

## 13. Open Questions

> [!IMPORTANT]
> Review these before Phase 1 begins.

1. **Currency:** Should amounts be stored as `REAL` (float) or `INTEGER` paise/cents? Float is simpler but risks rounding; integer is more accurate. Defaulting to `REAL` unless you handle multi-currency.
2. **Multi-shop:** Is there any chance of supporting multiple shop locations (separate ledgers) for the same user? If yes, a `shops` table should be added in Phase 1.
3. **OCR language:** Tesseract.js defaults to English. If receipts are in Hindi/Gujarati/Marathi, we need to load the respective `*.traineddata` file (~5 MB each).
4. **Print receipts:** Should the app generate printable paper receipts for customers (POS-style)? This would be a Phase 8 feature.
5. **Password reset:** With no email server, how should password resets work? Options: owner resets any member's password via the admin panel, or a secret-question flow.

---

## 14. Non-Goals (Out of Scope)

- Inventory/stock management
- Multi-currency support
- Customer CRM
- Online payments
- Mobile app (PWA possible but not planned)
- Cloud sync / real-time multi-user conflict resolution
- React / Vue / Next.js / any SPA framework
