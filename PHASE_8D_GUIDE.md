# Phase 8D — Family Customer Page: Full Context Guide

> **Rule:** Read this file before writing a single line of Phase 8D code.
> This is the single source of truth for the Family Customer Page.

---

## 1. What Already Exists (Leverage This!)

### Backend Foundation
| File | What it gives us |
|---|---|
| `app/models/transaction.py` | `Transaction` model with `customer_id` FK column (already added to DB). Fields: `id`, `user_id`, `customer_id`, `type`, `amount`, `description`, `date`, `created_at`, `receipt_image_path` |
| `app/models/customer.py` | `Customer` (family_name, display_name, phone), `CustomerFace` (image_path, embedding), `CustomerVisit` |
| `app/routers/vision.py` | `/vision` GET, `/vision/register` POST, `/vision/embeddings` GET |
| `app/dependencies.py` | `get_db`, `get_current_user` — use these on every new endpoint |
| `app/templates_config.py` | `templates` instance for Jinja2 — import this |
| `app/templates/base.html` | Full layout with nav, toast container, mobile bottom nav. Every new page extends this. |

### Transaction Types in DB
The `type` column on `transactions` table uses these exact string values:
- `'udhaar'` → customer took goods, will pay later (RED, negative for shop)
- `'payment'` → customer paid cash (GREEN, positive for shop)

> **Important:** Do NOT use `'credit_given'` or `'sale'` — use `'udhaar'` and `'payment'` for customer ledger entries.

### Auth
All routes that touch data MUST use:
```python
current_user: User = Depends(get_current_user)
```
The `user_id` from `current_user.id` must be stored on every Transaction created.

---

## 2. The Family Page — Full Product Spec

### URL
```
GET /vision/customer/{customer_id}  →  Full page for that family
```

### Page Layout (Mobile-First, 3 sections stacked vertically)

```
┌─────────────────────────────────────┐
│  ← Back        Meet Family          │  ← Header (sticky, dark bg)
├─────────────────────────────────────┤
│                                     │
│  ┌─── Dashboard Card ─────────────┐ │  ← 20% height, 80% width, centered
│  │  Outstanding  │  Last Payment  │ │    3 stat chips inside
│  │  ₹1,200 ↑    │  ₹500, 2d ago  │ │
│  │              │  Last Udhaar ₹300│ │
│  └─────────────────────────────────┘│
│                                     │
│  ┌─── Calculator ─────────────────┐ │  ← 55% height, 80% width, centered
│  │  [ Display: 0         ] [⌫]   │ │    Big digits in display row
│  │  [ 7 ] [ 8 ] [ 9 ]            │ │    3x3 digit grid
│  │  [ 4 ] [ 5 ] [ 6 ]            │ │
│  │  [ 1 ] [ 2 ] [ 3 ]            │ │
│  │  [ C ]  [ 0 ] [ 00]           │ │
│  │  [   🔴 Udhaar   ] [🟢 Payment]│ │  ← 2 big colored buttons
│  └─────────────────────────────────┘│
│                                     │
│  ┌─── Transaction Table ──────────┐ │  ← Paginated, 10 per page
│  │ Recent First (newest on top)   │ │
│  │ ─────────────────────────────  │ │
│  │ [img] Udhaar  ₹50   25 May     │ │
│  │        [Edit] [Delete]         │ │
│  │ [img] Payment ₹200  24 May     │ │
│  │        [Edit] [Delete]         │ │
│  │ ─────────────────────────────  │ │
│  │ Balance: ₹1,200 (outstanding)  │ │  ← Lifetime balance row at bottom
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 3. Dashboard Card — 3 Stats

| Stat | How to Calculate |
|---|---|
| **Outstanding Balance** | `SUM(amount WHERE type='udhaar') - SUM(amount WHERE type='payment')` for this `customer_id`. Show in RED if > 0, GREEN if 0. |
| **Last Payment** | Most recent transaction WHERE `type='payment'`. Show amount + relative date ("2d ago"). |
| **Last Udhaar** | Most recent transaction WHERE `type='udhaar'`. Show amount. |

---

## 4. Calculator Behavior (Alpine.js, client-side only)

```
State:
  displayValue: "0"   ← shown in display box

Actions:
  pressDigit(d)  → if displayValue == "0": set to d. else: append d. Max 7 digits.
  pressDoubleZero() → same as pressing "0" twice
  pressBackspace() → remove last char. If empty, set to "0"
  pressClear()   → set displayValue to "0"
  pressUdhaar()  → if displayValue == "0": do nothing. else: call submitTransaction('udhaar')
  pressPayment() → if displayValue == "0": do nothing. else: call submitTransaction('payment')
```

---

## 5. Auto-Photo on Transaction

When Red or Green button is pressed:
1. There is a **hidden `<video>` element** on this page that has camera running (started on page load, silently).
2. At the moment of press, JS draws one frame from video onto an offscreen canvas → `toDataURL('image/jpeg', 0.85)`.
3. This base64 image is sent as part of the form POST as `snapshot_image`.
4. Backend saves it to `app/static/uploads/transactions/{uuid}.jpg`.
5. The path is saved to `transaction.receipt_image_path`.

> **Camera start:** On page `init()`, start camera silently (no UI shown). If camera permission denied, proceed without photo — transactions still save, `receipt_image_path` will be null.

---

## 6. Transaction Submit Flow

### POST `/vision/customer/{customer_id}/add`

Form fields:
- `amount: float` (from displayValue)
- `type: str` (`'udhaar'` or `'payment'`)
- `snapshot_image: str` (base64 JPEG, optional)

Backend:
1. Validate amount > 0.
2. If `snapshot_image` provided: decode base64, save to `app/static/uploads/transactions/{uuid}.jpg`.
3. Create `Transaction(user_id=current_user.id, customer_id=customer_id, type=type, amount=amount, date=today, receipt_image_path=path_or_none)`.
4. `db.add(t); db.commit(); db.refresh(t)`.
5. Return **HTMX partial** of just the new table row (so it can be prepended via `hx-swap="afterbegin"`).
6. Also return `HX-Trigger: transactionAdded` header to trigger dashboard stats refresh.

### After Submit (Frontend)
- Reset `displayValue` to `"0"`.
- Show a small toast-style popup: "✓ ₹50 Udhaar saved" for 2 seconds.
- The new row prepends itself to the table via HTMX `hx-swap="afterbegin"`.
- Dashboard stats refresh automatically via `hx-trigger="transactionAdded from:body"`.

---

## 7. Transaction Table Rows

Each row contains:
- **Thumbnail**: `<img>` of `receipt_image_path` (35×35px, rounded). If null, show avatar icon.
- **Type badge**: Red "Udhaar" or Green "Payment".
- **Amount**: `₹{amount}`.
- **Date/Time**: `created_at` formatted as "25 May, 9:32 AM".
- **Description**: `description` field (can be empty).
- **Edit** button: placeholder only for now, no functionality.
- **Delete** button: placeholder only for now, no functionality.

Last row of the table (always visible, sticky at bottom of table):
```
| BALANCE (Lifetime Outstanding) | ₹1,200 |
```
This is computed server-side and updated via `hx-trigger="transactionAdded from:body"`.

### Pagination
- 10 rows per page.
- `?page=1` query param, simple prev/next buttons.
- HTMX `hx-get` on the table container to load pages without full reload.

---

## 8. New Endpoints to Create (in `app/routers/vision.py`)

```python
GET  /vision/customer/{customer_id}            → Full page (customer_page.html)
POST /vision/customer/{customer_id}/add        → Save transaction, return row partial
GET  /vision/customer/{customer_id}/transactions → HTMX: paginated rows partial
GET  /vision/customer/{customer_id}/stats      → HTMX: dashboard card stats partial
```

---

## 9. New Templates to Create

```
app/templates/vision/
  ├── customer_page.html          ← Full page (extends base.html)
  └── partials/
      ├── customer_stats.html     ← Dashboard card (3 stats)
      ├── transaction_row.html    ← Single row partial
      └── transaction_table.html  ← Paginated table of rows
```

---

## 10. Tech Constraints (from main implementation plan)

- **No SPA frameworks.** Alpine.js for interactivity, HTMX for data updates.
- **SSR-first.** Page loads with full data server-side. HTMX only for real-time row inserts and stat refreshes.
- **Mobile-first.** Tested on 360px viewport. Tailwind responsive classes.
- **SQLite.** All queries through SQLAlchemy ORM. No raw SQL.
- **httpOnly JWT cookie.** `get_current_user` dependency handles auth — every route that writes data must include it.
- **File storage.** Snapshot images saved to `app/static/uploads/transactions/`. Directory auto-created if missing.

---

## 11. Implementation Order (Do This Exactly)

1. **Endpoints first** — Add all 4 routes to `vision.py`. Test them return 200.
2. **`customer_page.html`** — Full page with static layout (no JS yet). Verify it renders.
3. **Calculator JS** — Add Alpine.js calculator logic. Test digit input + clear.
4. **Camera init** — Silent camera start, offscreen canvas capture.
5. **Submit + row insert** — Wire Red/Green → POST → HTMX row prepend + toast.
6. **Stats auto-refresh** — Wire `HX-Trigger: transactionAdded` → stats partial reload.
7. **Pagination** — Add page param to table endpoint.
8. **Wire from vision/index.html** — "View Dashboard" button → `href="/vision/customer/{id}"`.

---

## 12. Vision Index Page Integration

In `app/templates/vision/index.html`, the "View Dashboard →" button currently does nothing.
Update it to:
```html
<a href="/vision/customer/{{ face.customer.customer_id }}"
   class="...">View Dashboard →</a>
```
Since this is Alpine.js, use `:href` binding:
```html
<a :href="'/vision/customer/' + face.customer.customer_id" ...>
```
