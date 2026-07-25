// src/services/notification.service.ts
// Reusable notification manager and business activities ledger.

import prisma from '../config/database';

export const notificationService = {
  // Dispatches in-app notification to Denis or a specific User
  async sendNotification(userId: string, data: { type: string; title: string; message: string; actionUrl?: string }) {
    try {
      const notif = await prisma.notification.create({
        data: {
          userId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
        },
      });
      return notif;
    } catch (error) {
      console.error('Failed to create in-app notification:', error);
      return null;
    }
  },

  // Log chronological activity in the CRM Organization/Business Timeline
  async logActivity(data: { action: string; description: string; performedBy?: string }) {
    try {
      const activity = await prisma.businessActivity.create({
        data: {
          action: data.action,
          description: data.description,
          performedBy: data.performedBy || 'system',
        },
      });
      return activity;
    } catch (error) {
      console.error('Failed to log business timeline activity:', error);
      return null;
    }
  },

  // Notify admins (all users with admin or super_admin roles)
  async notifyAdmins(data: { type: string; title: string; message: string; actionUrl?: string }) {
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: {
            name: { in: ['admin', 'super_admin'] },
          },
        },
      });

      for (const admin of admins) {
        await this.sendNotification(admin.id, data);
      }
    } catch (error) {
      console.error('Failed to notify administrators:', error);
    }
  },
};
