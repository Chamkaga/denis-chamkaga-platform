// backend/src/scripts/verify-sprint1.ts
// Sprint 1 Final Production Verification Script

import prisma from '../config/database';
import { authService } from '../services/auth.service';
import { NotificationProviderFactory } from '../providers/notification.factory';
import { LocalEventBus } from '../events/LocalEventBus';
import { createAuthEvent } from '../events/auth.events';
import bcrypt from 'bcrypt';

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 STARTING SPRINT 1 FINAL PRODUCTION VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      console.log(` ✅ PASS [${total}]: ${description}`);
      passed++;
    } else {
      console.error(` ❌ FAIL [${total}]: ${description}`);
      throw new Error(`Verification Failed: ${description}`);
    }
  };

  try {
    // ── 1. RBAC Roles Verification ──────────────────────────────────────────
    console.log('1. Verifying RBAC Roles (Admin, Developer, Manager, Finance, Support, Customer)...');
    const roles = await prisma.role.findMany();
    const roleNames = roles.map((r) => r.name);
    const requiredRoles = ['admin', 'developer', 'manager', 'finance', 'support', 'customer'];

    for (const reqRole of requiredRoles) {
      assert(roleNames.includes(reqRole), `Role '${reqRole}' exists in database schema`);
    }

    // ── 2. User & Credentials Setup ──────────────────────────────────────────
    console.log('\n2. Setting up test accounts...');
    const testEmail = `verify-${Date.now()}@example.com`;
    const initialPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(initialPassword, 12);
    const adminRole = roles.find((r) => r.name === 'admin');

    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        username: `verifyuser_${Date.now()}`,
        passwordHash,
        firstName: 'Test',
        lastName: 'Verifier',
        roleId: adminRole!.id,
        isActive: true,
      },
    });
    assert(!!testUser.id, 'Created test active user');

    // ── 3. Authentication & Login Verification ──────────────────────────────
    console.log('\n3. Verifying Authentication & Login Flow...');
    const loginResult = await authService.login(testEmail, initialPassword);
    assert(!!loginResult.accessToken, 'Login issued valid Access Token');
    assert(!!loginResult.refreshToken, 'Login issued valid Refresh Token');
    assert(loginResult.user.email === testEmail, 'Login result matches user email');

    // ── 4. Invalid Credentials & Disabled Account ───────────────────────────
    console.log('\n4. Verifying Invalid Credentials & Disabled Account Protection...');
    let invalidErrorCaught = false;
    try {
      await authService.login(testEmail, 'WrongPassword123!');
    } catch (err: any) {
      invalidErrorCaught = err.code === 'INVALID_CREDENTIALS';
    }
    assert(invalidErrorCaught, 'Invalid credentials returned 401 INVALID_CREDENTIALS error');

    // Test disabled account
    await prisma.user.update({ where: { id: testUser.id }, data: { isActive: false } });
    let disabledErrorCaught = false;
    try {
      await authService.login(testEmail, initialPassword);
    } catch (err: any) {
      disabledErrorCaught = err.code === 'INVALID_CREDENTIALS';
    }
    assert(disabledErrorCaught, 'Disabled account rejected login attempt');
    await prisma.user.update({ where: { id: testUser.id }, data: { isActive: true } });

    // ── 5. Session Management Verification ──────────────────────────────────
    console.log('\n5. Verifying Multi-Session Management...');
    const session1 = await authService.login(testEmail, initialPassword, { device: 'Chrome / Desktop' });
    const session2 = await authService.login(testEmail, initialPassword, { device: 'Safari / Mobile' });

    const activeSessions = await prisma.session.findMany({
      where: { userId: testUser.id, isTerminated: false },
    });
    assert(activeSessions.length >= 2, 'Multiple sessions registered concurrently');

    // Terminate all sessions
    await authService.terminateAllSessions(testUser.id);
    const postTerminateSessions = await prisma.session.findMany({
      where: { userId: testUser.id, isTerminated: false },
    });
    assert(postTerminateSessions.length === 0, 'terminateAllSessions successfully terminated all active sessions');

    // ── 6. Refresh Token Rotation & Security Revocation ───────────────────────
    console.log('\n6. Verifying Refresh Token Rotation & Replay Attack Revocation...');
    const freshLogin = await authService.login(testEmail, initialPassword);
    const refreshed = await authService.refresh(freshLogin.refreshToken);
    assert(!!refreshed.accessToken, 'Refresh token rotation issued new Access Token');
    assert(!!refreshed.refreshToken, 'Refresh token rotation issued new Refresh Token');

    // Attempting to reuse old refresh token should trigger security revocation
    let revokedCaught = false;
    try {
      await authService.refresh(freshLogin.refreshToken);
    } catch (err: any) {
      revokedCaught = err.code === 'INVALID_REFRESH_TOKEN';
    }
    assert(revokedCaught, 'Reused old refresh token rejected with 401 INVALID_REFRESH_TOKEN');

    // ── 7. Password Flow Verification ────────────────────────────────────────
    console.log('\n7. Verifying Password Flow (Forgot Password -> Reset -> Old Password Rejection)...');
    const forgotResult = await authService.forgotPassword(testEmail);
    assert(forgotResult.resetToken !== 'sent', 'Forgot password generated valid crypto reset token');

    const newPassword = 'NewSecretPassword123!';
    await authService.resetPassword(forgotResult.resetToken, newPassword);

    // Old password must be rejected
    let oldPasswordRejected = false;
    try {
      await authService.login(testEmail, initialPassword);
    } catch (err: any) {
      oldPasswordRejected = err.code === 'INVALID_CREDENTIALS';
    }
    assert(oldPasswordRejected, 'Old password correctly rejected after reset');

    // Login with new password must succeed
    const newLogin = await authService.login(testEmail, newPassword);
    assert(!!newLogin.accessToken, 'Login with new password succeeded');

    // ── 8. Notification Provider Architecture Verification ────────────────────
    console.log('\n8. Verifying Notification Provider Architecture (Resend Primary + SendGrid Fallback)...');
    const notificationProvider = NotificationProviderFactory.getProvider();
    assert(!!notificationProvider.getMetadata(), 'Notification Provider Factory initialized composite provider');

    const emailSendResult = await notificationProvider.sendEmail(
      testEmail,
      'Sprint 1 Verification Test',
      '<p>Production verification test email.</p>'
    );
    assert(emailSendResult.success === true, 'Notification Provider executed email dispatch successfully');

    // ── 9. Audit Logs Verification ───────────────────────────────────────────
    console.log('\n9. Verifying Audit Logs Generation...');
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: testUser.id },
    });
    const actions = auditLogs.map((l) => l.action);

    assert(actions.includes('LOGIN_SUCCESS'), 'Audit Log recorded LOGIN_SUCCESS');
    assert(actions.includes('LOGIN_FAILED'), 'Audit Log recorded LOGIN_FAILED');
    assert(actions.includes('PASSWORD_RESET_REQUESTED'), 'Audit Log recorded PASSWORD_RESET_REQUESTED');
    assert(actions.includes('PASSWORD_RESET_COMPLETED'), 'Audit Log recorded PASSWORD_RESET_COMPLETED');

    // ── 10. Event Bus Verification ───────────────────────────────────────────
    console.log('\n10. Verifying Event Bus Publishing & Subscriptions...');
    const eventBus = new LocalEventBus();
    let eventReceived = false;

    eventBus.subscribe('UserLoggedIn', (event) => {
      const data = event.data as any;
      if (data?.userId === testUser.id) {
        eventReceived = true;
      }
    });

    eventBus.publish(
      createAuthEvent('UserLoggedIn', { userId: testUser.id, email: testEmail }, testUser.id)
    );
    assert(eventReceived, 'Event Bus subscriber successfully received UserLoggedIn event');

    // ── Clean up test user & child records ────────────────────────────────────
    await prisma.auditLog.deleteMany({ where: { userId: testUser.id } });
    await prisma.session.deleteMany({ where: { userId: testUser.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: testUser.id } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });

    console.log('\n====================================================');
    console.log(`✅ SPRINT 1 PRODUCTION VERIFICATION PASSED: ${passed}/${total} TESTS`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ SPRINT 1 VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
