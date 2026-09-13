// backend/src/scripts/seed-production-accounts.ts
// Creates real database user accounts for the official V1 system accounts:
// 1. Owner (Denis Chamkaga) - Supreme Business Account
// 2. Administrator - Technical Platform Operator Account
// Automatically generates docs/TestAccountMatrix.md upon execution.

import prisma from '../config/database';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const BCRYPT_ROUNDS = 12;

const ACCOUNTS = [
  {
    email: 'denis@denischamkaga.com',
    username: 'denis',
    firstName: 'Denis',
    lastName: 'Chamkaga',
    roleName: 'owner',
    passwordRaw: 'Denis@Platform2025',
    title: 'Platform Owner & Founder',
    landingPage: '/admin/dashboard',
    permissions: 'Unrestricted Supreme Governance Access',
    restrictions: 'None (Unrestricted Supreme Authority)'
  },
  {
    email: 'admin@denischamkaga.com',
    username: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    roleName: 'admin',
    passwordRaw: 'Admin@Platform2025',
    title: 'Technical Platform Operator',
    landingPage: '/admin/operations',
    permissions: 'Infrastructure Maintenance, System Monitoring, User Management, Backups & Incident Response',
    restrictions: 'CANNOT delete/modify Owner, transfer ownership, alter core security policies, or purge audit history'
  }
];

async function seedProductionAccounts() {
  console.log('================================================================');
  console.log('🌱 SEEDING OFFICIAL V1 SYSTEM ACCOUNTS INTO POSTGRESQL DATABASE');
  console.log('================================================================\n');

  // Ensure owner and admin roles exist in database
  const requiredRoles = ['owner', 'admin', 'super_admin', 'manager', 'finance', 'support', 'customer'];
  for (const roleName of requiredRoles) {
    const existing = await prisma.role.findUnique({ where: { name: roleName } });
    if (!existing) {
      await prisma.role.create({
        data: { name: roleName, description: `${roleName} system role` }
      });
    }
  }

  for (const acc of ACCOUNTS) {
    let role = await prisma.role.findUnique({ where: { name: acc.roleName } });
    if (!role) {
      role = await prisma.role.create({
        data: { name: acc.roleName, description: `${acc.roleName} role` }
      });
    }

    const passwordHash = await bcrypt.hash(acc.passwordRaw, BCRYPT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        username: acc.username,
        firstName: acc.firstName,
        lastName: acc.lastName,
        roleId: role.id,
        passwordHash,
        mustChangePassword: true,
        isActive: true
      },
      create: {
        email: acc.email,
        username: acc.username,
        firstName: acc.firstName,
        lastName: acc.lastName,
        roleId: role.id,
        passwordHash,
        mustChangePassword: true,
        isActive: true
      }
    });

    console.log(`  ✅ Account Created/Updated: ${acc.firstName} ${acc.lastName} <${acc.email}> [Role: ${acc.roleName}]`);

    if (acc.roleName === 'admin') {
      await prisma.permission.deleteMany({ where: { roleId: role.id } });
      const permissions: Record<string, string[]> = {
        analytics: ['read'], audit_logs: ['read'], messages: ['read', 'update'],
        appointments: ['read'], notifications: ['read', 'update'], calls: ['read', 'update', 'manage'],
        settings: ['read', 'update'], ai: ['read'], calendar: ['read'], leads: ['read']
      };
      for (const [resource, actions] of Object.entries(permissions)) {
        for (const action of actions) {
          await prisma.permission.create({ data: { roleId: role.id, resource, action } });
        }
      }
    }
  }

  console.log('\n================================================================');
  console.log('📄 GENERATING OFFICIAL TEST ACCOUNT MATRIX DOCUMENTATION...');
  console.log('================================================================\n');

  const matrixDocPath = path.resolve(__dirname, '../../../docs/TestAccountMatrix.md');
  const markdownContent = `# Official V1 Test Account Matrix & Governance Policy

This document defines the official production and development accounts for **Denis Chamkaga Enterprise Business Operating System (Enterprise BOS)**.

---

## Official V1 Account Matrix

| Account Role | Full Name | Email Address | Development Password | Default Landing Page | Core Governance & Capabilities | Key Restrictions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Owner** | Denis Chamkaga | \`denis@denischamkaga.com\` | \`Denis@Platform2025\` | \`/admin/dashboard\` | **Unrestricted Supreme Governance**: Access to every business module, revenue data, AI copilot, system settings, governance, data export, backup restores, and user ownership. | **None** (Supreme Business Authority) |
| **Administrator** | System Administrator | \`admin@denischamkaga.com\` | \`Admin@Platform2025\` | \`/admin/operations\` | **Technical Operator**: System health monitoring, NOC infrastructure, server logs, user support, feature flags, backups execution, and troubleshooting. | **Strictly Restricted**: CANNOT modify/delete Owner account, transfer ownership, alter root security policies, or purge audit history. |

---

## Governance & Security Policies

1. **Owner Protection Guarantee**:
   - The system strictly prevents non-Owner accounts from altering the Owner account record, deleting the Owner account, or altering supreme security policies.

2. **First Login Password Policy**:
   - All accounts seeded into the database are initialized with \`mustChangePassword: true\`. Upon initial login, users are required to set a permanent, high-entropy password.

3. **Production Seeding & Cleansing**:
   - Development default passwords (\`Denis@Platform2025\`, \`Admin@Platform2025\`) are strictly intended for development/staging verification and must be rotated upon first production sign-in.

4. **Extensible Role Architecture**:
   - Extraneous operational roles (\`sales_manager\`, \`finance_manager\`, \`marketing_manager\`, etc.) are hidden from the V1 UI but remain defined inside the backend RBAC database schema for future organizational expansion.
`;

  fs.writeFileSync(matrixDocPath, markdownContent, 'utf-8');
  console.log(`  ✅ Documentation generated successfully at: ${matrixDocPath}`);

  console.log('\n================================================================');
  console.log('🎉 ALL V1 SYSTEM ACCOUNTS SEEDED & MATRIX DOC CREATED SUCCESSFULLY!');
  console.log('================================================================\n');
}

seedProductionAccounts()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal Error seeding user accounts:', err);
    process.exit(1);
  });
