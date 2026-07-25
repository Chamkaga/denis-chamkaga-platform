import React from 'react';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Video,
  Lightbulb,
  Compass,
  Handshake,
  Bot,
  BarChart,
  Settings,
  FolderOpen,
  Layout,
  MessageSquare
} from 'lucide-react';
import type { IconKey } from '../../config/navigation';

export const IconRegistry: Record<IconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboard,
  business: Users,
  crm: Handshake,
  content: Layout,
  ai: Bot,
  reports: BarChart,
  system: Settings,
  settings: Settings,
  media: FolderOpen,
  support: MessageSquare,
  marketing: Megaphone,
  creator: Video,
  innovation: Lightbulb,
  futureVision: Compass,
  partnerships: Handshake
};
