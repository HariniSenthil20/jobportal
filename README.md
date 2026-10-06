# 💼 Full-Stack Job Portal Application

A full-stack recruitment platform with candidate & recruiter role workflows, real-time messaging, deadline notifications, ATS screening, and dark slate glassmorphism design.

---

## 🛠 Tech Stack

- **Frontend**: React.js (Vite), Lucide Icons, Axios, React Router v7, Custom CSS Design System
- **Backend**: Python, Django 5, Django REST Framework, Django Channels (WebSockets), SimpleJWT
- **Database**: PostgreSQL (`job_portal`)

---

## 🗄 PostgreSQL Configuration

- **Database Name**: `job_portal`
- **Username**: `your username`
- **Password**: `your password`
- **Host**: `localhost`
- **Port**: `5432`

Stored securely in `backend/.env`.

---

## 🚀 Quick Start Guide

### 1. Backend Server Setup

```powershell
cd backend
..\venv\Scripts\python.exe manage.py migrate
..\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```
- REST API Root: `http://localhost:8000/api/`
- WebSocket Chat: `ws://localhost:8000/ws/chat/<conversation_id>/`

### 2. Frontend App Setup

```powershell
cd frontend
npm install
npm run dev
```
- Application Web Interface: `http://localhost:5173/`

### 3. Run Backend Automated Unit Tests

```powershell
cd backend
..\venv\Scripts\python.exe manage.py test
```

### 4. Trigger Automated Deadline Reminders & Auto-Expiration Command

```powershell
cd backend
..\venv\Scripts\python.exe manage.py run_reminders
```

---

## 📋 Features Overview

### 👤 Candidate Features
- **Profile & Resume Manager**: Update personal details, skills, social links, resume upload (`.pdf`, `.doc`, `.docx` <= 5MB), and live completion score progress bar.
- **Job Search & Catalog**: Multi-filtering by title, location, salary range, employment type, experience level, work mode (Remote/Hybrid/On-site), and date posted.
- **Applications & Status Timeline**: Application submission with cover letter, status tracking timeline (`Applied` → `Under Review` → `Shortlisted` → `Interview` → `Selected`), and application withdrawal.
- **Bookmarks**: Save/un-save jobs and review bookmarked listings.

### 🏢 Recruiter Features
- **Company Profile Manager**: Manage company logo, description, industry, location, size, and website.
- **Job Management**: Create, edit, publish, close, or delete job postings with salary & deadline validations.
- **ATS Candidate Review Board**: Screen applicants, view cover letters, download resumes, and update application statuses (triggers automatic candidate notification).
- **Recruiter Dashboard**: Analytics cards for active jobs, total applications, shortlisted, interviews, hired candidates, and jobs closing soon.

### 💬 Real-Time Messaging & Notifications
- **Chat Engine**: WebSockets + REST API fallback for instant candidate-recruiter messaging per job application.
- **Notifications & Preferences**: Unread counter drawer, status update alerts, deadline alerts, and custom preference toggles.
