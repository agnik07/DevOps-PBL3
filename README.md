# Academic Management System

Full-stack MERN portal with two roles only: `teacher` and `student`.

## Final Folder Structure

```txt
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    tests/
    app.js
    server.js
    seed.js
  .env.example
  package.json

frontend/
  src/
    api/
    components/
    context/
    layouts/
    pages/
    utils/
    App.jsx
    main.jsx
    index.css
  .env.example
  package.json
```

## Environment Variables

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/academic_management
JWT_SECRET=change_this_to_a_long_random_secret
```

### `frontend/.env`
```env
VITE_API_URL=http://54.89.92.120:30001
```

## Seed Demo Users

Run:

```bash
npm run seed --prefix backend
```

Seeded credentials:

- Teacher: `teacher@test.com` / `123456`
- Student: `student1@test.com` / `123456`
- Student: `student2@test.com` / `123456`

## Run Commands

```bash
npm install --prefix backend
npm install --prefix frontend

npm run dev --prefix backend
npm run dev --prefix frontend
```

## API Base

All APIs are under `/api`.

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Tasks: `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`
- Submissions: `POST /api/submissions/:taskId`, `GET /api/submissions/task/:taskId`, `PUT /api/submissions/:id/review`
- Attendance: `POST /api/attendance/request`, `POST /api/attendance/mark`, `GET /api/attendance/student/:id`, `GET /api/attendance/all`
- Marks: `POST /api/marks`, `GET /api/marks/student/:id`
- Reports: `GET /api/reports/student/:id/pdf`, `GET /api/reports/all/pdf`, `GET /api/reports/all/csv`

## Deployment Guide

1. Create production MongoDB database and set `MONGO_URI`.
2. Set strong `JWT_SECRET`.
3. Build frontend:
   - `npm run build --prefix frontend`
4. Run backend in production:
   - `npm run start --prefix backend`
5. Serve `frontend/dist` from CDN, Nginx, or object storage.
6. Set frontend env `VITE_API_URL` to deployed backend URL.
7. Enable reverse proxy limits for uploads and HTTPS termination.
