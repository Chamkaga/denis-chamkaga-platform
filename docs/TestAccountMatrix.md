# Official V1 Test Account Matrix & Governance Policy

This document defines the official production and development accounts for **Denis Chamkaga Enterprise Business Operating System (Enterprise BOS)**.

---

## Official V1 Account Matrix

| Account Role | Full Name | Email Address | Development Password | Default Landing Page | Core Governance & Capabilities | Key Restrictions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Owner** | Denis Chamkaga | `denis@denischamkaga.com` | `Denis@Platform2025` | `/admin/dashboard` | **Unrestricted Supreme Governance**: Access to every business module, revenue data, AI copilot, system settings, governance, data export, backup restores, and user ownership. | **None** (Supreme Business Authority) |
| **Administrator** | System Administrator | `admin@denischamkaga.com` | `Admin@Platform2025` | `/admin/operations` | **Technical Operator**: System health monitoring, NOC infrastructure, server logs, user support, feature flags, backups execution, and troubleshooting. | **Strictly Restricted**: CANNOT modify/delete Owner account, transfer ownership, alter root security policies, or purge audit history. |

---

## Governance & Security Policies

1. **Owner Protection Guarantee**:
   - The system strictly prevents non-Owner accounts from altering the Owner account record, deleting the Owner account, or altering supreme security policies.

2. **First Login Password Policy**:
   - All accounts seeded into the database are initialized with `mustChangePassword: true`. Upon initial login, users are required to set a permanent, high-entropy password.

3. **Production Seeding & Cleansing**:
   - Development default passwords (`Denis@Platform2025`, `Admin@Platform2025`) are strictly intended for development/staging verification and must be rotated upon first production sign-in.

4. **Extensible Role Architecture**:
   - Extraneous operational roles (`sales_manager`, `finance_manager`, `marketing_manager`, etc.) are hidden from the V1 UI but remain defined inside the backend RBAC database schema for future organizational expansion.
