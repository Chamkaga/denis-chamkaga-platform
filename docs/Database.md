# Database Design

> Denis Chamkaga Portfolio & AI Business Platform
> PostgreSQL + Prisma ORM

---

## 1. Database Overview

| Property | Value |
|----------|-------|
| DBMS | PostgreSQL 16.x |
| ORM | Prisma 6.x |
| Migrations | Prisma Migrate |
| Seeding | Custom seed scripts |
| Naming Convention | snake_case for tables and columns |
| Primary Keys | UUID (cuid) |
| Timestamps | created_at, updated_at on all tables |
| Soft Deletes | deleted_at where applicable |

---

## 2. Entity Relationship Diagram

```
users ─────────────── roles
  │                     │
  ├── blog_posts        ├── permissions
  ├── projects          │
  ├── audit_logs        │
  └── notifications     │
                        │
blog_posts ──── categories
    │
    └──── tags (many-to-many via blog_post_tags)

leads ──── appointments
  │            │
  └── messages │
               │
chat_sessions ─┘
  │
  └── ai_conversations

services
projects
gallery
certificates
experiences
education
testimonials
investor_requests
site_settings
languages
visitors
analytics
```

---

## 3. Table Definitions

### 3.1 users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| email | String | Unique, Not Null | Login email |
| password_hash | String | Not Null | bcrypt hash |
| first_name | String | Not Null | First name |
| last_name | String | Not Null | Last name |
| role_id | String | FK → roles.id | User role |
| avatar_url | String? | Nullable | Profile image |
| is_active | Boolean | Default: true | Account status |
| last_login_at | DateTime? | Nullable | Last login timestamp |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.2 roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | Unique, Not Null | Role name (admin, editor) |
| description | String? | Nullable | Role description |
| created_at | DateTime | Default: now() | Created timestamp |

---

### 3.3 permissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| role_id | String | FK → roles.id | Associated role |
| resource | String | Not Null | Resource name (projects, leads) |
| action | String | Not Null | Action (create, read, update, delete) |
| created_at | DateTime | Default: now() | Created timestamp |

---

### 3.4 projects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| title | String | Not Null | Project title |
| slug | String | Unique, Not Null | URL slug |
| description | String | Not Null | Short description |
| content | Text | Not Null | Full project writeup |
| thumbnail_url | String? | Nullable | Card thumbnail image |
| images | Json? | Nullable | Array of image URLs |
| tech_stack | Json | Not Null | Array of technologies |
| category | String | Not Null | Project category |
| status | Enum | Not Null | completed, in_progress, planned |
| live_url | String? | Nullable | Live demo URL |
| github_url | String? | Nullable | Source code URL |
| start_date | DateTime? | Nullable | Project start date |
| end_date | DateTime? | Nullable | Project end date |
| is_featured | Boolean | Default: false | Show on homepage |
| display_order | Int | Default: 0 | Sort order |
| created_by | String | FK → users.id | Creator |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |
| deleted_at | DateTime? | Nullable | Soft delete |

---

### 3.5 gallery

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| title | String | Not Null | Image title |
| description | String? | Nullable | Image description |
| image_url | String | Not Null | Image file path |
| thumbnail_url | String? | Nullable | Thumbnail version |
| category | String | Not Null | Gallery category |
| tags | Json? | Nullable | Array of tags |
| display_order | Int | Default: 0 | Sort order |
| is_visible | Boolean | Default: true | Visibility toggle |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.6 services

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| title | String | Not Null | Service name |
| slug | String | Unique, Not Null | URL slug |
| description | String | Not Null | Short description |
| content | Text | Not Null | Full service details |
| icon | String? | Nullable | Icon identifier |
| image_url | String? | Nullable | Service image |
| features | Json? | Nullable | Array of feature strings |
| technologies | Json? | Nullable | Array of related tech |
| pricing_info | String? | Nullable | Pricing description |
| is_active | Boolean | Default: true | Active toggle |
| display_order | Int | Default: 0 | Sort order |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.7 experiences

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| company | String | Not Null | Company name |
| role | String | Not Null | Job title |
| description | Text | Not Null | Role description |
| achievements | Json? | Nullable | Array of achievements |
| company_logo_url | String? | Nullable | Company logo |
| location | String? | Nullable | Work location |
| start_date | DateTime | Not Null | Start date |
| end_date | DateTime? | Nullable | End date (null = current) |
| is_current | Boolean | Default: false | Currently employed |
| display_order | Int | Default: 0 | Sort order |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.8 education

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| institution | String | Not Null | School/university name |
| degree | String | Not Null | Degree or certification |
| field_of_study | String | Not Null | Area of study |
| description | Text? | Nullable | Additional details |
| institution_logo_url | String? | Nullable | Institution logo |
| start_date | DateTime | Not Null | Start date |
| end_date | DateTime? | Nullable | End date |
| grade | String? | Nullable | Grade or GPA |
| display_order | Int | Default: 0 | Sort order |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.9 certificates

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| title | String | Not Null | Certificate title |
| issuer | String | Not Null | Issuing organization |
| description | Text? | Nullable | Certificate details |
| image_url | String? | Nullable | Certificate image |
| credential_url | String? | Nullable | Verification link |
| credential_id | String? | Nullable | External credential ID |
| issue_date | DateTime | Not Null | Date issued |
| expiry_date | DateTime? | Nullable | Expiration date |
| display_order | Int | Default: 0 | Sort order |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.10 testimonials

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| client_name | String | Not Null | Client full name |
| client_title | String? | Nullable | Client job title |
| client_company | String? | Nullable | Client company |
| client_photo_url | String? | Nullable | Client photo |
| content | Text | Not Null | Testimonial text |
| rating | Int | Not Null (1-5) | Star rating |
| is_featured | Boolean | Default: false | Show on homepage |
| is_visible | Boolean | Default: true | Visibility toggle |
| display_order | Int | Default: 0 | Sort order |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.11 blog_posts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| title | String | Not Null | Post title |
| slug | String | Unique, Not Null | URL slug |
| excerpt | String | Not Null | Short preview |
| content | Text | Not Null | Full post content (Markdown) |
| cover_image_url | String? | Nullable | Featured image |
| category_id | String | FK → categories.id | Post category |
| author_id | String | FK → users.id | Post author |
| status | Enum | Not Null | draft, published, archived |
| published_at | DateTime? | Nullable | Publish date |
| reading_time | Int? | Nullable | Estimated minutes |
| view_count | Int | Default: 0 | Read counter |
| is_featured | Boolean | Default: false | Featured post |
| meta_title | String? | Nullable | SEO title override |
| meta_description | String? | Nullable | SEO description |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |
| deleted_at | DateTime? | Nullable | Soft delete |

---

### 3.12 categories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | Unique, Not Null | Category name |
| slug | String | Unique, Not Null | URL slug |
| description | String? | Nullable | Category description |
| created_at | DateTime | Default: now() | Created timestamp |

---

### 3.13 tags

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | Unique, Not Null | Tag name |
| slug | String | Unique, Not Null | URL slug |
| created_at | DateTime | Default: now() | Created timestamp |

---

### 3.14 blog_post_tags (Join Table)

| Column | Type | Constraints |
|--------|------|-------------|
| blog_post_id | String | FK → blog_posts.id |
| tag_id | String | FK → tags.id |
| @@id | Composite | [blog_post_id, tag_id] |

---

### 3.15 leads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | Not Null | Lead name |
| email | String? | Nullable | Email address |
| phone | String? | Nullable | Phone number |
| company | String? | Nullable | Company name |
| source | Enum | Not Null | ai_chat, contact_form, booking, business_checker |
| status | Enum | Not Null | new, contacted, qualified, converted, lost |
| score | Int | Default: 0 | Lead score (0-100) |
| temperature | Enum | Not Null | cold, warm, hot |
| requirements | Text? | Nullable | What they need |
| budget_mentioned | Boolean | Default: false | Mentioned budget |
| timeline_mentioned | Boolean | Default: false | Mentioned timeline |
| notes | Text? | Nullable | Internal notes |
| assigned_to | String? | FK → users.id | Assigned admin |
| converted_at | DateTime? | Nullable | Conversion date |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.16 messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| lead_id | String? | FK → leads.id | Associated lead |
| name | String | Not Null | Sender name |
| email | String | Not Null | Sender email |
| phone | String? | Nullable | Sender phone |
| subject | String? | Nullable | Message subject |
| content | Text | Not Null | Message body |
| is_read | Boolean | Default: false | Read status |
| replied_at | DateTime? | Nullable | Reply timestamp |
| created_at | DateTime | Default: now() | Created timestamp |

---

### 3.17 appointments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| lead_id | String? | FK → leads.id | Associated lead |
| name | String | Not Null | Client name |
| email | String | Not Null | Client email |
| phone | String? | Nullable | Client phone |
| purpose | String | Not Null | Meeting purpose |
| preferred_date | DateTime | Not Null | Requested date |
| preferred_time | String | Not Null | Requested time |
| status | Enum | Not Null | pending, confirmed, completed, cancelled |
| notes | Text? | Nullable | Additional notes |
| confirmed_at | DateTime? | Nullable | Confirmation timestamp |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.18 chat_sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| visitor_id | String? | Nullable | Anonymous visitor ID |
| lead_id | String? | FK → leads.id | Converted lead |
| status | Enum | Not Null | active, closed, handed_off |
| started_at | DateTime | Default: now() | Session start |
| ended_at | DateTime? | Nullable | Session end |
| message_count | Int | Default: 0 | Total messages |
| lead_score | Int | Default: 0 | Calculated score |
| metadata | Json? | Nullable | Session metadata |

---

### 3.19 ai_conversations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| session_id | String | FK → chat_sessions.id | Parent session |
| role | Enum | Not Null | user, assistant, system |
| content | Text | Not Null | Message content |
| intent | String? | Nullable | Detected intent |
| confidence | Float? | Nullable | Intent confidence (0-1) |
| metadata | Json? | Nullable | Response metadata |
| created_at | DateTime | Default: now() | Created timestamp |

---

### 3.20 investor_requests

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | Not Null | Investor name |
| email | String | Not Null | Email address |
| phone | String? | Nullable | Phone number |
| company | String? | Nullable | Company/fund name |
| interest_type | Enum | Not Null | investor, partner, sponsor, supporter |
| message | Text | Not Null | Interest details |
| status | Enum | Not Null | new, reviewed, contacted, active, declined |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.21 site_settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| key | String | Unique, Not Null | Setting key |
| value | Text | Not Null | Setting value |
| type | String | Not Null | string, number, boolean, json |
| category | String | Not Null | general, contact, social, seo |
| description | String? | Nullable | Human-readable description |
| updated_at | DateTime | @updatedAt | Updated timestamp |

---

### 3.22 visitors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| session_id | String | Not Null | Browser session ID |
| ip_address | String? | Nullable | Visitor IP |
| user_agent | String? | Nullable | Browser user agent |
| referrer | String? | Nullable | Referral source |
| country | String? | Nullable | Geo country |
| city | String? | Nullable | Geo city |
| first_visit | DateTime | Default: now() | First visit |
| last_visit | DateTime | Default: now() | Last visit |
| visit_count | Int | Default: 1 | Total visits |
| pages_viewed | Json? | Nullable | Array of page paths |

---

### 3.23 analytics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| event_type | String | Not Null | page_view, chat_start, lead_created, etc. |
| event_data | Json? | Nullable | Event payload |
| page_path | String? | Nullable | Page where event occurred |
| visitor_id | String? | FK → visitors.id | Visitor |
| session_id | String? | Nullable | Browser session |
| created_at | DateTime | Default: now() | Event timestamp |

---

### 3.24 notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| user_id | String | FK → users.id | Recipient |
| type | String | Not Null | new_lead, new_message, appointment, system |
| title | String | Not Null | Notification title |
| message | String | Not Null | Notification body |
| is_read | Boolean | Default: false | Read status |
| action_url | String? | Nullable | Click-through URL |
| created_at | DateTime | Default: now() | Created timestamp |

---

### 3.25 audit_logs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| user_id | String | FK → users.id | Acting user |
| action | String | Not Null | create, update, delete, login, logout |
| resource | String | Not Null | Table/entity affected |
| resource_id | String? | Nullable | Affected record ID |
| old_values | Json? | Nullable | Previous values |
| new_values | Json? | Nullable | New values |
| ip_address | String? | Nullable | Request IP |
| user_agent | String? | Nullable | Browser info |
| created_at | DateTime | Default: now() | Action timestamp |

---

### 3.26 languages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| code | String | Unique, Not Null | Language code (en, sw) |
| name | String | Not Null | Language name |
| native_name | String | Not Null | Native language name |
| is_default | Boolean | Default: false | Default language |
| is_active | Boolean | Default: true | Active toggle |
| created_at | DateTime | Default: now() | Created timestamp |

---

### 3.27 faqs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| question | String | Not Null | FAQ question text |
| answer | String | Not Null | FAQ answer text |
| display_order | Int | Default: 0 | Sorting display order |
| created_at | DateTime | Default: now() | Created timestamp |
| updated_at | DateTime | UpdatedAt | Updated timestamp |

---

## 4. Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| users | email | Unique | Login lookup |
| projects | slug | Unique | URL routing |
| services | slug | Unique | URL routing |
| blog_posts | slug | Unique | URL routing |
| blog_posts | status, published_at | Composite | Published post queries |
| leads | status, temperature | Composite | Lead filtering |
| leads | created_at | Index | Date sorting |
| messages | is_read | Index | Unread filtering |
| analytics | event_type, created_at | Composite | Event queries |
| audit_logs | user_id, created_at | Composite | User activity |
| chat_sessions | status | Index | Active session queries |
| site_settings | key | Unique | Setting lookup |
| categories | slug | Unique | URL routing |
| tags | slug | Unique | URL routing |

---

## 5. Enums

```prisma
enum ProjectStatus {
  completed
  in_progress
  planned
}

enum BlogPostStatus {
  draft
  published
  archived
}

enum LeadSource {
  ai_chat
  contact_form
  booking
  business_checker
  referral
  other
}

enum LeadStatus {
  new
  contacted
  qualified
  converted
  lost
}

enum LeadTemperature {
  cold
  warm
  hot
}

enum AppointmentStatus {
  pending
  confirmed
  completed
  cancelled
}

enum ChatSessionStatus {
  active
  closed
  handed_off
}

enum MessageRole {
  user
  assistant
  system
}

enum InvestorInterestType {
  investor
  partner
  sponsor
  supporter
}

enum InvestorRequestStatus {
  new
  reviewed
  contacted
  active
  declined
}
```

---

## 6. Seed Data

The following seed data is required for initial deployment:

1. **Default admin user** (Denis Chamkaga)
2. **Default roles** (admin, editor)
3. **Default permissions** per role
4. **Default languages** (English, Swahili)
5. **Default site settings** (site name, contact info, social links)
6. **Default categories** (Technology, Business, Tutorial, Career)
7. **Sample services** (based on Denis's actual offerings)
