# Shiv Seva Kendra

## Current State
- Full frontend app (App.tsx) with Jobs tab (static + RSS fetch) and Services tab (28 services with sub-services)
- Header with logo, contact info
- Tab bar: नोकऱ्या | सेवा
- ContactModal for sub-service WhatsApp/Call redirect
- JobApplyModal for job WhatsApp/Call redirect
- Auto-refresh every 5 minutes for jobs
- Minimal backend (only getShivSevaKendraInfo)

## Requested Changes (Diff)

### Add
1. **Book Appointment button** — next to the Services tab header area ("सेवा" section top), opens a modal form with:
   - Customer Name (mandatory)
   - Mobile Number (mandatory)
   - Time (optional dropdown: 9am–6pm, 1hr slots)
   - Submit saves appointment to backend
2. **Admin Profile card** — right side next to "Book Appointment" button (or in Services section top-right):
   - Shows: Shubham Sunil Koli (Shop Owner), Phone: 7720814323, Email: shubhamkoli918@gmail.com, Address: उत्रण, ता. एरंडोल, जि. जळगाव
   - Visible to all website viewers (no login needed)
   - Only admin can see the two admin panels
3. **Admin Login** — simple PIN-based (4-digit) or principal-based admin gate, visible only to admin (Shubham)
4. **Admin Panel: Add Job** — admin-only, fields:
   - Job Name
   - Date (notification date)
   - Vacancy
   - Salary
   - Last Date
   - Fees
   - On save: job appears in front-end jobs list in same format as existing cards (newest first)
5. **Admin Panel: Add Seva** — admin-only, fields:
   - Main Seva (name in Marathi + English)
   - Sub Seva (name in Marathi + English), with ability to add multiple sub-sevas
   - On save: new seva appears in Services grid automatically
6. **Backend**: store appointments, admin jobs, admin services in stable storage

### Modify
- Services section header: add "Book Appointment" button (left) and "Admin Profile" card (right)
- Jobs section: merge admin-added jobs with static/RSS jobs (admin jobs shown first, newest first)
- Services grid: merge admin-added services with static services data

### Remove
- Nothing removed

## Implementation Plan
1. Generate Motoko backend with:
   - `Appointment` type: id, name, phone, time, createdAt
   - `AdminJob` type: id, title, notifDate, vacancy, salary, lastDate, fees, createdAt
   - `AdminService` type: id, mainName, mainNameMr, subServices (array of {nameEn, nameMr})
   - CRUD: addAppointment, getAppointments, addJob (admin), getAdminJobs, addService (admin), getAdminServices
   - Admin check: hardcoded admin principal (caller === admin)
2. Frontend components to add:
   - `BookAppointmentModal` — form with name (required), phone (required), time (optional select)
   - `AdminProfileCard` — static info card shown in services section
   - `AdminPanel` — admin login (PIN), then two sections: Add Job form + Add Service form
   - Merge admin jobs into JobsSection (above static jobs)
   - Merge admin services into ServicesGrid
3. Tab bar or section header: add "अपॉइंटमेंट बुक करा" button + "माझी माहिती" profile card side by side
