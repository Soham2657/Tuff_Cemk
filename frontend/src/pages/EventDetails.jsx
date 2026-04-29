import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { AuthContext } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (err) {
        console.error('Failed to load event:', err);
        setActionMessage(err.response?.data?.message || 'Failed to load event details.');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    try {
      await eventService.deleteEvent(id);
      setActionMessage('Event deleted.');
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to delete event.');
    }
  };

  return (
    <div className="flex-1 w-full pb-24 px-4 md:px-6">
      <div className="mb-6">
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors font-semibold"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to events</Link>
      </div>

      {actionMessage && (
        <div className="mb-6 rounded-xl border border-secondary/30 bg-linear-to-r from-secondary/10 to-secondary/5 px-4 py-3 text-sm text-on-surface font-medium">{actionMessage}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : !event ? (
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-6 py-12 text-center text-on-surface-variant">Event not found.</div>
      ) : (
        <div className="bg-linear-to-br from-surface-container-lowest to-surface-container-low rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-outline-variant/40 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            <div className="md:col-span-1">
              <img src={event.image || '/vite.svg'} alt={event.title} className="w-full h-64 object-cover rounded-xl shadow-lg border border-outline-variant/40" />
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-linear-to-r from-primary/10 to-secondary/10 p-4 border border-primary/20">
                  <div className="flex items-center gap-2 text-secondary font-semibold">
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-linear-to-r from-secondary/10 to-primary/10 p-4 border border-secondary/20">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <span className="material-symbols-outlined">location_on</span>
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <h1 className="font-h1 text-[40px] font-bold mb-2 text-on-surface">{event.title}</h1>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/50">
                <span className="material-symbols-outlined text-secondary text-[20px]">event_note</span>
                <p className="text-base text-on-surface-variant">Event Details</p>
              </div>
              <p className="text-[16px] text-on-surface-variant mb-6 leading-relaxed">{event.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-8 p-4 rounded-xl bg-linear-to-r from-primary/5 to-secondary/5 border border-outline-variant/30">
                <div>
                  <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="text-sm font-semibold text-on-surface">{new Date(event.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} {event.time}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-semibold text-on-surface">{event.location}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-h3 text-[20px] font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">people</span>
                  Participants ({event.participants?.length || 0})
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {event.participants && event.participants.length > 0 ? (
                    event.participants.map((p) => (
                      <div key={p._id || p} className="rounded-lg bg-linear-to-r from-primary/5 to-secondary/5 p-3 border border-outline-variant/30 hover:border-secondary/50 transition-colors">
                        <p className="text-sm font-semibold text-on-surface">{p.name || p.email || 'User'}</p>
                        {p.email && <p className="text-xs text-on-surface-variant">{p.email}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-on-surface-variant col-span-2">No participants yet.</p>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-3 pt-4 border-t border-outline-variant/50">
                  <button onClick={handleDelete} className="px-6 py-3 bg-linear-to-r from-error to-error/80 text-on-error font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">delete</span>
                      Delete Event
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
