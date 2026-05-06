# Team Task Manager (Full-Stack)

A full-stack Team Task Management web application where users can create projects, collaborate with team members, assign tasks, and track progress.

---

## Live Demo

* Frontend: https://ethara-ai-frontend-production-ef81.up.railway.app
* Backend API: https://ethara-ai-backend-production-612a.up.railway.app

---

## Features

### Authentication

* User signup & login
* JWT-based authentication
* Protected routes (frontend + backend)

### Project Management

* Create projects
* Remove members
* View only assigned projects

### Task Management

* Create tasks (Admin only)
* Assign tasks to members
* Update task status:
  * To Do → In Progress → Done

* Role-based permissions:
  * Admin → full control
  * Member → update assigned tasks only

### Dashboard

* Total tasks
* Tasks by status
* Tasks by priority
* Overdue tasks

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* bcrypt

### Frontend

* Angular (Standalone APIs)
* Tailwind CSS
* Angular HttpClient

---

## Role-Based Access Control (RBAC)

Roles are **project-based**, not global:

| Role   | Permissions                                           |
| ------ | ----------------------------------------------------- |
| Admin  | Manage members, create/delete tasks, update all tasks |
| Member | View project, update only assigned tasks              |

---

## Architecture

### Backend (MVC)

```
backend/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── config/
```

### Frontend (Feature-Based)

```
frontend/src/app/
├── core/
├── features/
├── shared/
```

---

## Application Flow

1. User logs in → receives JWT
2. Token stored in frontend
3. Interceptor attaches token to API calls
4. Backend verifies user
5. Project-based RBAC applied
6. Data returned → UI updated

---

##️ Setup Instructions

### Clone Repository

```bash
git clone [https://github.com/Codewithme-Vikas/EtharaAI/tree/masteryour-repo-url](https://github.com/Codewithme-Vikas/EtharaAI/tree/master)
cd team-task-manager
```

---

###  Backend Setup

```bash
cd backend
npm install
npm run start
```

---

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Update API URL in:

```
src/environments/environment.ts
```

---

## Deployment

* Backend deployed on Railway
* Frontend deployed on Railway

---

## Folder Structure

```
ETHARA_AI/
├── ethara_ai_backend/
├── ethara_ai_frontend/
├── README.md
├── .gitignore
```

---

## Key Highlights

* Clean MVC backend architecture
* Feature-based Angular frontend
* Project-level RBAC (real-world design)
* Modular and scalable code

---

## Author

**Vikash**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/vikas-gurjar-622477270/)
---

## License

This project is for educational and assignment purposes.
