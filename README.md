# Yaclam Admin

Next.js 15 admin panel connected to **Yaclam Express API** (`http://localhost:9000/api`).

## Setup

1. Start backend: `D:\mypro\yaclam\yaclam backend` (port 9000)
2. Copy env: `cp .env.local.example .env.local`
3. `npm install && npm run dev`
4. Login: [http://localhost:3000/login](http://localhost:3000/login)

First admin (once): `POST /api/users/admin/bootstrap`

## Integrated endpoints

### Auth & users
| UI | Endpoints |
|----|-----------|
| Login | `POST /users/admin/login` |
| Students | `GET /users/getall/students`, `POST /users/register`, `PATCH /users/admin/update/:id`, `PATCH /users/status/:id`, `DELETE /users/soft-delete/:id` |
| Admins | `GET /users/getall/adminUsers`, `POST /users/admin/create`, same update/status/delete |
| Profile (header) | `GET /users/profile` |

### Roles & newsletter
| UI | Endpoints |
|----|-----------|
| Roles | `GET/POST /role/*`, `PATCH /role/update/:id`, `DELETE /role/delete/:id` |
| Newsletter | `GET /newsletter/getAll` |

### CMS pages (JSON editor)
Home, Courses Page, Roadmaps Page, Scholarships Page, Blog Page, About, Contact, Login/Register **page content**, Footer — each uses `GET/POST/PATCH/DELETE` on `/{module}/*`.

### Content entities (form fields)
| UI | Endpoints |
|----|-----------|
| Courses | `/course/*` + `PATCH /course/status/:id` |
| Roadmaps | `/roadmap/*` + status |
| Scholarships | `/scholarship/*` + status |
| Blog posts | `/blog_post/*` + status |

### Not in admin UI (by design)
- `POST /users/login` — student app only
- `POST /users/admin/bootstrap` — one-time setup (Postman/curl)
- `/cart/*` — per-user cart (no admin list API)

## Architecture

```
src/
├── config/api-modules.ts   # All CMS modules + sidebar
├── services/cms.service.ts # Generic CRUD factory
├── services/role.service.ts
├── services/newsletter.service.ts
├── components/cms/CmsManagePage.tsx
└── app/(admin)/manage/[slug]  # Dynamic CMS routes
```
