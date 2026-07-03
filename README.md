# Virtual Event Registration Portal

Full-stack event registration app inspired by the dark purple/navy visual language of TKT.GE Movies.

## Stack

- Frontend: React + Vite
- Backend: Express.js REST API
- Database: MongoDB Atlas through Mongoose

The backend reads `MONGODB_KEY` from `backend/.env` and seeds demo users/events into MongoDB when the users collection is empty.

## Features

- Role-based registration and login
- Token-protected REST API routes
- Local password hashing with migration from old demo passwords
- Public event listing
- Event detail page
- One-click registration form
- Digital ticket with unique `TKT-XXXXXX` code
- User ticket vault with cancellation
- Organizer dashboard for creating, editing, deleting events
- Organizer attendee list
- Organizer/Admin ticket check-in
- Admin overview for all events, users, and registrations
- Admin event management
- Admin user role/status management
- Registration deletion from admin panel

## Demo accounts

- User: `user@portal.test` / `user123`
- Organizer: `organizer@portal.test` / `organizer123`
- Admin: `admin@portal.test` / `admin123`

## Run

Install dependencies:

```bash
npm install
npm run install:all
```

Create `backend/.env`:

```bash
MONGODB_KEY=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
MONGODB_DB=virtual_event_registration
```

Start both apps:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Default URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://localhost:4001`

## API

- `GET /api/events`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/events/:id/attendees`
- `POST /api/events/:id/register`
- `GET /api/tickets/:code`
- `GET /api/users/:email/tickets`
- `DELETE /api/registrations/:id`
- `POST /api/check-in`
- `GET /api/admin/overview`
- `PATCH /api/admin/users/:id`
