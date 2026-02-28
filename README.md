# JMS Public School Chaudiha - MERN Website

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT (Admin-only protected routes)
- Upload: Multer + Cloudinary

## Project Structure
- `config/`
- `controllers/`
- `middleware/`
- `models/`
- `routes/`
- `utils/`
- `seed/`
- `client/` (React frontend)

## Setup
1. Copy `.env.example` to `.env` and configure values.
2. Copy `client/.env.example` to `client/.env`.
3. Install backend dependencies:
   - `npm install`
4. Install frontend dependencies:
   - `npm install --prefix client`
5. Seed admin user:
   - `npm run seed:admin`
6. Run both backend and frontend:
   - `npm run all`

## Admin Login
Use values from `.env`:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## API Endpoints
- `POST /api/auth/login`
- `GET /api/auth/me` (admin)
- `GET /api/gallery`
- `POST /api/gallery` (admin, multiple image upload)
- `DELETE /api/gallery/:id` (admin)
- `GET /api/notices`
- `POST /api/notices` (admin)
- `PUT /api/notices/:id` (admin)
- `DELETE /api/notices/:id` (admin)
- `GET /api/events`
- `POST /api/events` (admin)
- `PUT /api/events/:id` (admin)
- `DELETE /api/events/:id` (admin)
- `GET /api/content`
- `PUT /api/content` (admin)
- `POST /api/contact`
- `GET /api/contact/messages` (admin)

## Notes
- Cloudinary credentials are required for gallery upload.
- Role-based middleware is enforced for admin mutation routes.
- Toasts, loading states, confirmation dialogs, and responsive layout are included.
