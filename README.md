# 💼 JobPortal — Full Stack Job Portal Web Application

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Django](https://img.shields.io/badge/Backend-Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A modern, full-stack **Job Portal Web Application** built with **React**, **Django REST Framework**, and **MySQL**. It connects job seekers with employers through an intelligent AI-powered skill matching system, real-time notifications, and a complete hiring pipeline — from job posting to final hiring decision.

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Unique Features](#unique-features)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## 📖 About the Project

JobPortal is a complete hiring ecosystem where:

- **Job Seekers** can register, build profiles, upload resumes, search jobs, apply with AI match scores, and track application status in real time.
- **Employers** can post jobs, receive and sort applications by skill match percentage, shortlist candidates, schedule interviews, and manage the full hiring pipeline.
- **Admins** can moderate job listings, manage users, maintain the skills master list, and monitor platform analytics.

The standout feature is the **AI Skill Matching Engine** — every application is automatically scored (0–100%) based on cosine similarity between the seeker's skill profile and the job's requirements, helping employers find the best fit instantly.

---

## ✨ Features

### 👤 Job Seeker
- Register and log in with JWT authentication
- Build a detailed profile (experience, location, bio, resume upload)
- Add skills with proficiency ratings (1–5 scale)
- Browse and search jobs with filters (title, location, salary, job type)
- See AI match score for every job before applying
- One-click apply or apply with a cover letter
- Track application status: `Applied → Shortlisted → Interview → Hired/Rejected`
- Save jobs to a wishlist
- Receive skill gap recommendations for jobs
- Set up job alerts via email
- Join video interviews scheduled by employers

### 🏢 Employer
- Register and set up a company profile (logo, industry, website)
- Post detailed job listings with required and optional skills
- View all applicants sorted by AI match score
- Shortlist, reject, or advance candidates through the pipeline
- Schedule interviews (video / phone / on-site) with one click
- Add private interview notes per candidate
- View hiring analytics dashboard (views, applications, conversion rate)

### 🛠️ Admin
- Approve or reject job postings before they go live
- Manage all user accounts (activate, deactivate, ban)
- Maintain the master skills list
- View platform-wide analytics

### 🤖 AI Skill Matching (Unique)
- Skill vectors built for each seeker and job
- Required skills weighted higher than optional skills
- Cosine similarity used to compute match percentage
- Score saved on every application for employer reference
- Missing skills shown to seeker as a learning recommendation

### 🔔 Real-Time Notifications
- Instant in-app notifications via Django Channels + WebSockets
- Email notifications for status changes and job alerts

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Redux, React Router, Axios |
| Backend | Django, Django REST Framework |
| Database | MySQL |
| Authentication | JWT (SimpleJWT) |
| Real-time | Django Channels, WebSockets |
| Task Queue | Celery + Redis |
| AI Matching | scikit-learn, NumPy |
| Resume Parsing | spaCy, PyPDF2 |
| File Storage | AWS S3 / Local Storage |
| Styling | Tailwind CSS |

---

## 📁 Project Structure

```
jobportal/
│
├── backend/                        # Django project
│   ├── jobportal/                  # Project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── asgi.py                 # For Django Channels
│   ├── users/                      # User auth & profiles
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── jobs/                       # Job listings & applications
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── matching/                   # AI skill matching engine
│   │   └── matching.py
│   ├── notifications/              # Real-time notifications
│   │   ├── consumers.py
│   │   └── routing.py
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/                       # React project
│   ├── public/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route-level pages
│   │   │   ├── auth/               # Login, Register
│   │   │   ├── seeker/             # Seeker dashboard, job search, applications
│   │   │   ├── employer/           # Employer dashboard, post job, applicants
│   │   │   └── admin/              # Admin panel pages
│   │   ├── store/                  # Redux state management
│   │   ├── services/               # Axios API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Redis (for Celery and Django Channels)
- Git

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/jobportal.git
cd jobportal/backend

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download spaCy model
python -m spacy download en_core_web_sm

# 5. Apply migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create a superuser (admin)
python manage.py createsuperuser

# 7. Run the development server
python manage.py runserver
```

---

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The React app will run on `http://localhost:5173` and the Django API on `http://localhost:8000`.

---

### Database Setup

Create a MySQL database and update your `.env` file:

```sql
CREATE DATABASE jobportal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jobportal_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON jobportal_db.* TO 'jobportal_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory. Use `.env.example` as a reference:

```env
# Django
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=jobportal_db
DB_USER=jobportal_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# JWT
JWT_SECRET_KEY=your_jwt_secret

# Redis
REDIS_URL=redis://localhost:6379

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# AWS S3 (optional — for file storage)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_STORAGE_BUCKET_NAME=your_bucket
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login and get JWT tokens |
| POST | `/api/auth/refresh/` | Refresh access token |

### Job Seeker
| Method | Endpoint | Description |
|---|---|---|
| GET/PUT | `/api/seeker/profile/` | Get or update seeker profile |
| GET/POST | `/api/seeker/skills/` | View or add skills |
| GET | `/api/jobs/` | Search and list all jobs |
| POST | `/api/jobs/{id}/apply/` | Apply to a job |
| GET | `/api/seeker/applications/` | View all applications |
| GET | `/api/jobs/{id}/match-score/` | Get AI match score for a job |

### Employer
| Method | Endpoint | Description |
|---|---|---|
| GET/PUT | `/api/employer/company/` | Get or update company profile |
| GET/POST | `/api/employer/jobs/` | List or post jobs |
| GET | `/api/employer/jobs/{id}/applicants/` | View applicants for a job |
| PUT | `/api/employer/applications/{id}/status/` | Update application status |
| POST | `/api/employer/interviews/` | Schedule an interview |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users/` | List all users |
| PUT | `/api/admin/jobs/{id}/approve/` | Approve a job posting |
| GET/POST | `/api/admin/skills/` | Manage master skills list |

---

## 📸 Screenshots

> _Add screenshots of your application here after building the UI._

| Page | Screenshot |
|---|---|
| Home / Landing page | `screenshots/home.png` |
| Job Seeker Dashboard | `screenshots/seeker-dashboard.png` |
| Job Search with Match Score | `screenshots/job-search.png` |
| Employer Dashboard | `screenshots/employer-dashboard.png` |
| Application Pipeline | `screenshots/pipeline.png` |
| Admin Panel | `screenshots/admin.png` |

---

## 🌟 Unique Features

### 🤖 AI Skill Match Score
Every application is automatically scored using cosine similarity between the seeker's weighted skill vector and the job's required skill vector. Required skills carry double weight. The score is displayed to both parties and used to sort employer applicant lists.

### 🎯 Skill Gap Recommendations
If a seeker's match score is below 80%, the portal shows exactly which required skills they are missing and links to free learning resources on YouTube, Coursera, and freeCodeCamp.

### 🙈 Blind Hiring Mode
Employers can toggle blind mode to hide applicant names, photos, and university names during initial screening — reducing unconscious bias and promoting merit-based hiring.

### 🎥 Video Introduction
Seekers can record a short 2-minute video intro directly inside the portal. Employers watch it asynchronously before deciding to schedule a formal interview.

### 📊 Hiring Analytics
Employers see a visual analytics dashboard — applicant source, daily application trends, most common skills among applicants, and hiring funnel conversion rates.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing style and all tests pass before submitting a PR.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [Aayushstha1](https://github.com/Aayushstha1)
- LinkedIn: [www.linkedin.com/in/aayush-stha-0a97742b2]
- Email: aayush33@gmail.com

---

> ⭐ If you found this project helpful, please give it a star on GitHub — it means a lot!
