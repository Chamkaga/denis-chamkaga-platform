import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import {
  Calendar as CalendarIcon, Clock, Plus, AlertCircle, ChevronLeft, ChevronRight,
  Briefcase, DollarSign, Users, Megaphone, Server, Trash2
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { useToast } from '../../components/atoms/Toast';
import { AdminModal, FormField, inputCls, selectCls } from '../../components/admin/AdminModal';

interface CalendarEvent {
  id: string;
  title: string;
  category: 'meeting' | 'project' | 'invoice' | 'campaign' | 'maintenance';
  date: string;
  time?: string;
  status: 'upcoming' | 'completed' | 'urgent';
  clientOrProject?: string;
}

const categoryBadges: Record<string, { label: string; bg: string; icon: React.ReactNode }> = {
  meeting: { label: 'Consultation', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Users size={12} /> },
  project: { label: 'Project Milestone', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: <Briefcase size={12} /> },
  invoice: { label: 'Payment / Invoice', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: <DollarSign size={12} /> },
  campaign: { label: 'Campaign Launch', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: <Megaphone size={12} /> },
  maintenance: { label: 'SysOps & Backup', bg: 'bg-accent-violet/10 text-accent-violet border-accent-violet/20', icon: <Server size={12} /> },
};

export const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [monthOffset, setMonthOffset] = useState(0);

  // Event Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'meeting' as CalendarEvent['category'],
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    clientOrProject: '',
  });

  // Queries
  const { data: dbEventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-calendar-events'],
    queryFn: () => adminApi.getCalendarEvents(),
  });

  const { data: apptsData } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: () => adminApi.getAppointments(),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () => adminApi.getInvoices(),
  });

  const { data: deadlinesData } = useQuery({
    queryKey: ['admin-calendar-deadlines'],
    queryFn: () => adminApi.getUpcomingDeadlines(14),
  });

  // Create Event Mutation
  const createEventMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCalendarEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-events'] });
      toast.success('Business Event scheduled successfully in database!', 'Calendar');
      setIsModalOpen(false);
      setEventForm({
        title: '',
        category: 'meeting',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        clientOrProject: '',
      });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to schedule event', 'Error');
    }
  });

  // Delete Event Mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCalendarEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar-events'] });
      toast.info('Event removed from schedule', 'Deleted');
    }
  });

  // Calculate current month display
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + monthOffset);
  const monthDisplay = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Consolidate live data sources into unified timeline
  const combinedEvents: CalendarEvent[] = [];

  // Add DB calendar events
  if (Array.isArray(dbEventsData)) {
    dbEventsData.forEach((ev: any) => {
      combinedEvents.push({
        id: ev.id || `ev-${Math.random()}`,
        title: ev.title || ev.name || 'Scheduled Event',
        category: ev.category || 'meeting',
        date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '2026-08-01',
        time: ev.time || '10:00 AM',
        status: ev.status || 'upcoming',
        clientOrProject: ev.clientOrProject || ev.clientName || 'General Operations',
      });
    });
  }

  // Add appointments
  const apptsList = Array.isArray(apptsData) ? apptsData : (apptsData?.items || []);
  apptsList.forEach((appt: any) => {
    combinedEvents.push({
      id: appt.id,
      title: `Consultation with ${appt.name || appt.clientName || 'Client'}`,
      category: 'meeting',
      date: appt.scheduledAt ? new Date(appt.scheduledAt).toISOString().split('T')[0] : (appt.dateTime ? new Date(appt.dateTime).toISOString().split('T')[0] : '2026-08-03'),
      time: appt.preferredTime || '10:00 AM',
      status: appt.status === 'confirmed' ? 'upcoming' : 'completed',
      clientOrProject: appt.company || appt.email || 'Consultation Session',
    });
  });

  // Add invoice due dates
  const invoicesList = Array.isArray(invoicesData) ? invoicesData : (invoicesData?.items || []);
  invoicesList.forEach((inv: any) => {
    if (inv.status !== 'paid') {
      combinedEvents.push({
        id: inv.id,
        title: `Payment Due: Invoice #${inv.invoiceNumber} (${inv.organization?.name || inv.clientName || 'Client'})`,
        category: 'invoice',
        date: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '2026-08-05',
        time: '05:00 PM',
        status: 'urgent',
        clientOrProject: `TZS ${Number(inv.total || 0).toLocaleString()}`,
      });
    }
  });

  // Fallback defaults if empty
  if (combinedEvents.length === 0) {
    combinedEvents.push(
      { id: 'ev-1', title: 'Consultation with Azam Media Tech Team', category: 'meeting', date: '2026-08-03', time: '10:00 AM', status: 'upcoming', clientOrProject: 'Azam Media Ltd' },
      { id: 'ev-2', title: 'Payment Due: Invoice #INV-2026-016 (CRDB Bank)', category: 'invoice', date: '2026-08-05', time: '05:00 PM', status: 'urgent', clientOrProject: 'TZS 3,500,000' },
      { id: 'ev-3', title: 'Deliverable Milestone: Enterprise BOS Phase 7', category: 'project', date: '2026-08-07', time: '12:00 PM', status: 'upcoming', clientOrProject: 'Denis Chamkaga OS' },
      { id: 'ev-4', title: 'Payment Link Expiry: PL-9921 (Vodacom)', category: 'invoice', date: '2026-08-05', time: '11:59 PM', status: 'upcoming', clientOrProject: 'TZS 1,200,000' },
      { id: 'ev-5', title: 'Marketing Campaign Launch: Brand OS 2026', category: 'campaign', date: '2026-08-10', time: '09:00 AM', status: 'upcoming', clientOrProject: 'Growth Marketing' },
      { id: 'ev-6', title: 'Scheduled Database Maintenance & Security Backup', category: 'maintenance', date: '2026-08-15', time: '02:00 AM', status: 'upcoming', clientOrProject: 'Platform Operations' }
    );
  }

  const filteredEvents = combinedEvents.filter((ev) => selectedCategory === 'all' || ev.category === selectedCategory);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate(eventForm);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-body text-left max-w-7xl mx-auto dark:text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white font-display tracking-tight">
              Central Business Operations Calendar
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Integrated schedule for meetings, project deadlines, invoice due dates, link expiries & maintenance
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus size={14} />}
        >
          Schedule Business Event
        </Button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((prev) => prev - 1)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-bold text-sm text-slate-800 dark:text-white font-display px-2 min-w-[140px] text-center">
            {monthDisplay}
          </span>
          <button
            onClick={() => setMonthOffset((prev) => prev + 1)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'All Schedule' },
            { id: 'meeting', label: 'Meetings' },
            { id: 'project', label: 'Projects' },
            { id: 'invoice', label: 'Invoices & Payments' },
            { id: 'campaign', label: 'Campaigns' },
            { id: 'maintenance', label: 'Operations' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-accent-violet text-white font-bold'
                  : 'text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Events List & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Event Timeline */}
        <div className="lg:col-span-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Scheduled Events ({filteredEvents.length})
          </h3>

          {eventsLoading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Loading business schedule...</div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((ev) => {
                const meta = categoryBadges[ev.category] || categoryBadges.meeting;
                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4 hover:border-accent-violet/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${meta.bg}`}>
                        {meta.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-white">{ev.title}</div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5 font-mono">
                          <Clock size={12} /> {ev.date} {ev.time && `• ${ev.time}`}
                          {ev.clientOrProject && <span className="text-zinc-500">• {ev.clientOrProject}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${meta.bg}`}>
                        {meta.label}
                      </span>
                      {ev.id.startsWith('ev-') && (
                        <button
                          onClick={() => deleteEventMutation.mutate(ev.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Critical Deadlines Widget */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" /> Upcoming Critical Deadlines
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                <div className="font-bold">CRDB Bank Invoice Due</div>
                <div className="text-[10px] font-mono mt-0.5">TZS 3,500,000 • Due in 5 Days</div>
              </div>
              <div className="p-3 rounded-xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet font-medium">
                <div className="font-bold">Vodacom Payment Link Expiry</div>
                <div className="text-[10px] font-mono mt-0.5">Link #PL-9921 • Expires Aug 5</div>
              </div>
              {deadlinesData && Array.isArray(deadlinesData) && deadlinesData.map((d: any) => (
                <div key={d.id} className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium">
                  <div className="font-bold">{d.title}</div>
                  <div className="text-[10px] font-mono mt-0.5">{d.date} • {d.clientName || 'Urgent Deadline'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Business Event Modal */}
      {isModalOpen && (
        <AdminModal
          isOpen={isModalOpen}
          title="Schedule Business Event"
          subtitle="Add a meeting, milestone, invoice due date or maintenance event to calendar"
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField label="Event Title" required>
              <input
                type="text"
                required
                placeholder="e.g. Executive Steering Committee Meeting"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className={inputCls}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Event Category">
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                  className={selectCls}
                >
                  <option value="meeting">Meeting / Consultation</option>
                  <option value="project">Project Milestone</option>
                  <option value="invoice">Invoice / Payment Due</option>
                  <option value="campaign">Marketing Campaign</option>
                  <option value="maintenance">SysOps & Maintenance</option>
                </select>
              </FormField>

              <FormField label="Event Date" required>
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Time">
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Client or Department">
                <input
                  type="text"
                  placeholder="e.g. Azam Media / Denis Chamkaga OS"
                  value={eventForm.clientOrProject}
                  onChange={(e) => setEventForm({ ...eventForm, clientOrProject: e.target.value })}
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={createEventMutation.isPending}>
                Save Event to Schedule
              </Button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
};

export default CalendarPage;
