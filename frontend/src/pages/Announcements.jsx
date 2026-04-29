import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { adminService } from '../services/adminService';

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await adminService.getAnnouncements();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch announcements', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await adminService.createAnnouncement(form);
      setForm({ title: '', message: '' });
      setMessage('Announcement created successfully.');
      const data = await adminService.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await adminService.deleteAnnouncement(announcementId);
      setAnnouncements((current) => current.filter((announcement) => announcement._id !== announcementId));
      setMessage('Announcement deleted successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete announcement.');
    }
  };

  return (
    <div className="flex-1 w-full pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-h1 text-[40px] font-bold text-on-surface tracking-tight mb-1">Announcements</h2>
          <p className="font-body-lg text-[18px] text-on-surface-variant">Stay updated with the latest campus news and important alerts.</p>
        </div>
      </header>

      {message && <div className="mb-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">{message}</div>}

      {isAdmin && (
        <form onSubmit={handleCreateAnnouncement} className="mb-8 rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <h3 className="font-h3 text-[24px] font-bold text-on-surface">Create Announcement</h3>
          </div>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-xl border border-outline-variant/30 px-4 py-3" placeholder="Title" />
          <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="md:col-span-2 rounded-xl border border-outline-variant/30 px-4 py-3 min-h-28" placeholder="Announcement message" />
          <div className="md:col-span-2 flex justify-end">
            <button disabled={saving} className="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-70">
              {saving ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.length === 0 ? (
            <div className="rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-6 text-on-surface-variant">No announcements available.</div>
          ) : announcements.map((announcement) => (
            <article key={announcement._id} className="bg-surface-container-lowest rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden flex flex-col hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="p-6 flex flex-col h-full gap-4 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-primary-container text-on-primary-container">Campus Update</span>
                  <span className="text-[12px] font-medium text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString('en-US') : 'Recently'}
                  </span>
                </div>
                <h3 className="font-h3 text-[24px] font-bold text-on-surface">{announcement.title}</h3>
                <p className="font-body-md text-[16px] text-on-surface-variant flex-1">{announcement.message}</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-label-sm text-[12px] text-on-surface-variant">
                    Posted by {announcement.createdBy?.name || 'Admin'}
                  </p>
                  {isAdmin && (
                    <button onClick={() => handleDeleteAnnouncement(announcement._id)} className="rounded-lg bg-error px-3 py-2 text-sm font-semibold text-on-error">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
