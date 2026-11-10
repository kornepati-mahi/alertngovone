# ALERT NGO - PHP Backend & XAMPP MySQL Setup Guide

This backend provides a RESTful PHP API communicating with MySQL running on XAMPP.

## 1. Prerequisites
- [XAMPP](https://www.apachefriends.org/) installed (Windows default path: `C:\xampp`)
- Apache and MySQL services started in XAMPP Control Panel

---

## 2. Setup Database in XAMPP MySQL
1. Open your browser and navigate to: `http://localhost/phpmyadmin`
2. Click on the **Databases** tab or **Import** tab.
3. Import the file `schema.sql`:
   - Click **Import** > **Browse** and select `schema.sql` (found in this `backend` folder).
   - Click **Go** / **Import**.
4. This will create:
   - Database: `alertngo_db`
   - Tables:
     - `donations` (Name, Email, Phone, PAN, Amount, Payment status, Txn ID)
     - `contacts` (Inquiries from the Contact page)
     - `newsletters` (Email subscribers)
     - `programs` (Tribal advocacy & livelihood programs)
     - `impact_stats` (Key achievements: 25,000+ families, etc.)

---

## 3. Deploy API Files to XAMPP htdocs
Copy this `backend` directory to `C:\xampp\htdocs\alertngo-api`:

In PowerShell:
```powershell
Copy-Item -Recurse -Force "d:\vone\alertngo.in\alertngo-rebuild\backend" "C:\xampp\htdocs\alertngo-api"
```

Verify in browser:
- `http://localhost/alertngo-api/get_stats.php` -> should return JSON with impact metrics
- `http://localhost/alertngo-api/get_programs.php` -> should return JSON with initiatives list

---

## 4. API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/donate.php` | Records donation submissions (Name, Email, Phone, PAN, Amount) |
| `POST` | `/contact.php` | Records contact inquiries (Name, Email, Phone, Subject, Message) |
| `POST` | `/newsletter.php` | Subscribes an email to updates |
| `GET`  | `/get_programs.php` | Fetches active NGO programs |
| `GET`  | `/get_stats.php` | Fetches impact statistics |

CORS is pre-configured to allow requests from `http://localhost:5173` (Vite dev server) and any origin.
