# Admin Dashboard

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Overview

The Admin Dashboard is a protected area accessible only to authenticated users with admin or editor roles. It provides complete control over all platform content, leads, AI conversations, analytics, and system settings.

**Access URL:** `/admin`
**Authentication:** JWT required
**Authorization:** Role-based (admin, editor)

---

## 2. Dashboard Home (`/admin`)

### Stats Cards Row

| Card | Data Source | Description |
|------|------------|-------------|
| Total Leads | leads table | Count of all leads |
| Hot Leads | leads (temperature=hot) | Leads needing immediate attention |
| Total Projects | projects table | Published projects count |
| Messages | messages (is_read=false) | Unread message count |

### Recent Activity

| Section | Content |
|---------|---------|
| Recent Leads | Last 5 leads with name, source, temperature, date |
| Recent Messages | Last 5 messages with sender, subject, date |
| AI Conversations | Last 5 sessions with message count, lead score |
| Quick Actions | Add Project, Add Blog Post, View Leads, Send Message |

---

## 3. Content Management

### 3.1 Projects Manager (`/admin/projects`)

| Feature | Description |
|---------|-------------|
| List View | Table with title, category, status, featured flag, date |
| Create | Form with all project fields + image upload |
| Edit | Pre-filled form with existing data |
| Delete | Soft delete with confirmation modal |
| Reorder | Drag-and-drop display order |
| Bulk Actions | Publish, archive, delete selected |

### 3.2 Gallery Manager (`/admin/gallery`)

| Feature | Description |
|---------|-------------|
| Grid View | Image thumbnails with category labels |
| Upload | Multi-file upload with drag-and-drop |
| Edit | Update title, description, category |
| Delete | Delete with confirmation |
| Reorder | Drag-and-drop display order |

### 3.3 Blog Manager (`/admin/blog`)

| Feature | Description |
|---------|-------------|
| List View | Table with title, status, category, publish date, views |
| Create | Rich text editor, category selector, tag input, cover image |
| Edit | Full editing with preview |
| Delete | Soft delete with confirmation |
| Publish/Draft | Toggle between published and draft |
| Categories | Manage blog categories |
| Tags | Manage blog tags |

### 3.4 Services Manager (`/admin/services`)

| Feature | Description |
|---------|-------------|
| List View | Table with title, status, display order |
| Create | Form with all service fields |
| Edit | Pre-filled form |
| Delete | Delete with confirmation |
| Reorder | Drag-and-drop display order |
| Toggle Active | Enable/disable service visibility |

### 3.5 Certificates Manager (`/admin/certificates`)

| Feature | Description |
|---------|-------------|
| List View | Cards with certificate images |
| Create | Form with image upload |
| Edit | Update details and image |
| Delete | Delete with confirmation |

### 3.6 Timeline Manager (`/admin/timeline`)

| Feature | Description |
|---------|-------------|
| List View | Chronological list of career entries |
| Create | Form for new experience/education entry |
| Edit | Update existing entries |
| Delete | Delete with confirmation |

### 3.7 Testimonials Manager (`/admin/testimonials`)

| Feature | Description |
|---------|-------------|
| List View | Cards with client info and rating |
| Create | Form with client details and testimonial text |
| Edit | Update testimonial |
| Delete | Delete with confirmation |
| Feature Toggle | Mark as featured for homepage display |

---

## 4. Lead & CRM Management

### 4.1 Leads Manager (`/admin/leads`)

| Feature | Description |
|---------|-------------|
| List View | Table with name, email, source, score, temperature, status, date |
| Filter | By status, temperature, source, date range |
| Search | By name, email, company |
| Detail View | Full lead info with conversation history and notes |
| Status Update | Change lead status (new → contacted → qualified → converted) |
| Notes | Add internal notes to leads |
| Export | CSV export of leads |

### 4.2 Messages Manager (`/admin/messages`)

| Feature | Description |
|---------|-------------|
| Inbox View | List with sender, subject, preview, read status |
| Detail View | Full message with reply option |
| Mark Read/Unread | Toggle read status |
| Delete | Delete with confirmation |

### 4.3 Appointments Manager (`/admin/appointments`)

| Feature | Description |
|---------|-------------|
| Calendar View | Monthly/weekly calendar of appointments |
| List View | Table with date, time, client, purpose, status |
| Confirm | Confirm pending appointments |
| Cancel | Cancel with reason |
| Reschedule | Update date/time |

---

## 5. AI Management (`/admin/ai`)

| Feature | Description |
|---------|-------------|
| Session List | All chat sessions with date, message count, score |
| Session Detail | Full conversation transcript |
| Lead Conversion | Sessions that generated leads |
| Analytics | Chat volume, common intents, conversion rates |
| Knowledge Base | Manage AI knowledge entries (future) |

---

## 6. Media Manager (`/admin/media`)

| Feature | Description |
|---------|-------------|
| Grid View | All uploaded files with thumbnails |
| Upload | Drag-and-drop multi-file upload |
| Categories | Organize by folder (profile, projects, gallery, blog) |
| Delete | Delete with confirmation |
| Copy URL | Copy file URL for use in content |
| Image Info | File size, dimensions, upload date |

---

## 7. Analytics (`/admin/analytics`)

### Visitor Analytics

- Page views over time (chart)
- Unique visitors over time
- Popular pages (table)
- Traffic sources
- Geographic distribution
- Device breakdown

### Lead Analytics

- Leads over time (chart)
- Lead funnel (new → contacted → qualified → converted)
- Lead sources breakdown
- Temperature distribution
- Conversion rate

### AI Analytics

- Chat sessions over time
- Average messages per session
- Common intents
- Lead qualification rate
- Handoff frequency

---

## 8. System

### Settings (`/admin/settings`)

| Section | Settings |
|---------|----------|
| General | Site name, tagline, description, logo |
| Contact | Email, phone, address, office hours |
| Social | GitHub, LinkedIn, Twitter, Instagram links |
| SEO | Default meta title, description, keywords |
| Email | SMTP configuration, notification preferences |

### Theme (`/admin/settings/theme`)

- Preview current theme
- Customize accent colors (future)
- Toggle default mode (dark/light)

### Languages (`/admin/settings/languages`)

- Manage active languages
- Translation completeness indicator

### Audit Logs (`/admin/logs`)

- Activity log with user, action, resource, timestamp
- Filter by user, action type, date range
- Export logs

### User Management (`/admin/users`)

- List admin users
- Create new admin/editor user
- Deactivate users
- Role assignment

---

## 9. Admin UI Design

### Layout

```
┌──────────┬─────────────────────────────────────────┐
│          │  Top Bar                                 │
│          │  [Search]        [🔔 3] [Denis ▾]        │
│  Sidebar ├─────────────────────────────────────────┤
│          │                                         │
│  📊 Dashboard │     Page Content Area              │
│  📁 Projects  │                                    │
│  🖼️ Gallery   │                                    │
│  📝 Blog      │                                    │
│  🛠️ Services  │                                    │
│  📜 Certs     │                                    │
│  ⏳ Timeline  │                                    │
│  ⭐ Reviews   │                                    │
│  👥 Leads     │                                    │
│  📅 Booking   │                                    │
│  💬 Messages  │                                    │
│  🤖 AI        │                                    │
│  📊 Analytics │                                    │
│  📎 Media     │                                    │
│  ⚙️ Settings  │                                    │
│  📋 Logs      │                                    │
│  👤 Users     │                                    │
└──────────┴─────────────────────────────────────────┘
```

### Design Rules

- Use the same design system as public pages (Samsung Phantom Black theme)
- Glass morphism sidebar
- Compact data tables with hover effects
- Modal confirmations for destructive actions
- Toast notifications for CRUD operations
- Skeleton loading states
- Responsive sidebar (collapsible on tablet/mobile)
