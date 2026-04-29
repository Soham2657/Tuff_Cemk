import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { eventService } from '../services/eventService';
import { clubService } from '../services/clubService';

const Admin = () => {
  const [stats, setStats] = useState({ announcements: 0, events: 0, clubs: 0, applications: 0 });
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [applications, setApplications] = useState([]);
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);

  const loadAdminData = useCallback(async () => {
    try {
      const [events, clubs, announcements, apps] = await Promise.all([
        eventService.getEvents().catch(() => []),
        clubService.getClubs().catch(() => []),
        adminService.getAnnouncements().catch(() => []),
        adminService.getApplications().catch(() => []),
      ]);

      const safeApps = Array.isArray(apps) ? apps : [];

      setStats({
        announcements: Array.isArray(announcements) ? announcements.length : 0,
        events: Array.isArray(events) ? events.length : 0,
        clubs: Array.isArray(clubs) ? clubs.length : 0,
        applications: safeApps.length,
      });

      setApplications(safeApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      const latestActivity = [
        ...(Array.isArray(announcements) ? announcements.slice(0, 3).map((item) => ({
          type: 'Announcement',
          title: item.title,
          detail: item.message,
          time: item.createdAt,
        })) : []),
        ...safeApps.slice(0, 3).map((item) => ({
          type: 'Application',
          title: `${item.user?.name || 'User'} -> ${item.club?.name || 'Club'}`,
          detail: item.status,
          time: item.updatedAt || item.createdAt,
        })),
      ];

      setRecentActivity(latestActivity.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6));
    } catch (error) {
      console.error('Failed to load admin data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      setUpdatingApplicationId(applicationId);
      setActionMessage('');
      await adminService.updateApplication(applicationId, { status });
      setActionMessage(`Application marked as ${status}.`);
      await loadAdminData();
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to update application status.');
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  return (
    <div className="flex-1 w-full pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-[32px] gap-4">
        <div>
          <h2 className="font-h1 text-[40px] font-bold text-on-surface tracking-tight mb-1">Admin Dashboard</h2>
          <p className="font-body-lg text-[18px] text-on-surface-variant">Manage users, events, and campus configurations.</p>
        </div>
        <Link to="/announcements" className="px-5 py-2.5 bg-primary text-on-primary font-label-bold text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Announcement
        </Link>
      </header>

      {actionMessage && (
        <div className="mb-[24px] rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
          {actionMessage}
        </div>
      )}

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] mb-[32px]">
        <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] icon-fill">group</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[14px] font-medium">Announcements</p>
            <h3 className="text-on-surface text-[32px] font-bold tracking-tight">{stats.announcements}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] icon-fill">calendar_month</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[14px] font-medium">Active Events</p>
            <h3 className="text-on-surface text-[32px] font-bold tracking-tight">{stats.events}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] icon-fill">event</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[14px] font-medium">Applications</p>
            <h3 className="text-on-surface text-[32px] font-bold tracking-tight">{stats.applications}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] mb-[24px]">
        <div className="bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="text-[20px] font-bold text-on-surface">Recent System Activities</h3>
            <Link to="/notifications" className="text-primary hover:underline text-[14px] font-semibold">View All</Link>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {loading ? (
              <p className="text-on-surface-variant text-[14px]">Loading activity...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-on-surface-variant text-[14px]">No recent activity found.</p>
            ) : recentActivity.map((activity, index) => (
              <div key={`${activity.type}-${index}`} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary mt-0.5">check_circle</span>
                <div>
                  <p className="text-on-surface font-medium text-[14px]">{activity.title}</p>
                  <p className="text-on-surface-variant text-[12px]">
                    {activity.detail} • {activity.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="text-[20px] font-bold text-on-surface">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link to="/announcements" className="flex flex-col items-center justify-center p-4 bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl gap-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[28px] text-primary">campaign</span>
              <span className="text-[14px] font-semibold text-on-surface">Broadcast</span>
            </Link>
            <Link to="/canteen" className="flex flex-col items-center justify-center p-4 bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl gap-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[28px] text-secondary">restaurant_menu</span>
              <span className="text-[14px] font-semibold text-on-surface">Update Menu</span>
            </Link>
            <Link to="/events" className="flex flex-col items-center justify-center p-4 bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl gap-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[28px] text-on-surface-variant">event</span>
              <span className="text-[14px] font-semibold text-on-surface">Add Event</span>
            </Link>
            <Link to="/clubs" className="flex flex-col items-center justify-center p-4 bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl gap-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[28px] text-on-surface-variant">manage_accounts</span>
              <span className="text-[14px] font-semibold text-on-surface">Manage Clubs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h3 className="text-[20px] font-bold text-on-surface">Club Applications</h3>
          <span className="text-sm text-on-surface-variant">Approve or reject student requests</span>
        </div>
        <div className="p-6 flex flex-col gap-3">
          {loading ? (
            <p className="text-on-surface-variant text-[14px]">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-on-surface-variant text-[14px]">No applications found.</p>
          ) : applications.map((application) => {
            const status = application.status || 'Pending';
            const isPending = status === 'Pending';
            const disabled = updatingApplicationId === application._id;

            return (
              <div key={application._id} className="rounded-xl border border-outline-variant/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-on-surface font-semibold">{application.user?.name || 'Unknown User'} to {application.club?.name || 'Unknown Club'}</p>
                  <p className="text-sm text-on-surface-variant">Status: {status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApplicationStatus(application._id, 'Approved')}
                    disabled={!isPending || disabled}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApplicationStatus(application._id, 'Rejected')}
                    disabled={!isPending || disabled}
                    className="rounded-lg bg-error px-3 py-2 text-xs font-semibold text-on-error disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Admin;
