import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { eventService } from '../services/eventService';

const Events = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', location: '' });
  const [imageFile, setImageFile] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [loadingMyEvents, setLoadingMyEvents] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch events", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;
      setLoadingMyEvents(true);
      try {
        const data = await eventService.getMyEvents();
        setMyEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch my events', error);
        setMyEvents([]);
      } finally {
        setLoadingMyEvents(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId);
    setActionMessage('');

    try {
      await eventService.registerForEvent(eventId);
      setActionMessage('Registered for event successfully.');
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to register for this event.');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCreateEvent = async (submitEvent) => {
    submitEvent.preventDefault();
    setSavingEvent(true);
    setActionMessage('');

    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('date', eventForm.date);
      formData.append('time', eventForm.time);
      formData.append('location', eventForm.location);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await eventService.createEvent(formData);
      setActionMessage('Event created successfully.');
      setEventForm({ title: '', description: '', date: '', time: '', location: '' });
      setImageFile(null);

      const data = await eventService.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to create event.');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventService.deleteEvent(eventId);
      setEvents((current) => current.filter((event) => event._id !== eventId));
      setActionMessage('Event deleted successfully.');
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to delete event.');
    }
  };

  const handleSearch = async (query) => {
    setSearchTerm(query);
    setSearching(true);
    setActionMessage('');

    try {
      if (query.trim()) {
        const data = await eventService.searchEvents(query);
        setEvents(Array.isArray(data) ? data : []);
      } else {
        const data = await eventService.getEvents();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Search failed', error);
      setActionMessage('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 sm:gap-8">
      <div className="flex-1 flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="font-h2 text-[28px] sm:text-[32px] font-bold text-on-surface mb-2">Campus Events</h2>
            <p className="font-body-md text-[15px] sm:text-[16px] text-on-surface-variant">Discover what's happening around campus this week.</p>
          </div>
          <div className="relative w-full sm:flex-none sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
            <input 
              ref={searchInputRef}
              className="w-full pl-10 pr-4 py-2.5 bg-linear-to-r from-surface-container-lowest to-surface-container-low border border-secondary/30 rounded-xl font-body-md text-[16px] focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all shadow-sm hover:border-secondary/50" 
              placeholder="Search events..." 
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={searching}
              autoFocus={searchTerm.length > 0}
            />
          </div>
        </div>

        {isAdmin && (
          <form onSubmit={handleCreateEvent} className="rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-4 sm:p-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h3 className="font-h3 text-[24px] font-bold text-on-surface">Create Event</h3>
            </div>
            <input value={eventForm.title} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} className="rounded-xl border border-outline-variant/30 px-4 py-3" placeholder="Event title" />
            <input value={eventForm.location} onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })} className="rounded-xl border border-outline-variant/30 px-4 py-3" placeholder="Location" />
            <input value={eventForm.date} onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })} type="date" className="rounded-xl border border-outline-variant/30 px-4 py-3" />
            <input value={eventForm.time} onChange={(event) => setEventForm({ ...eventForm, time: event.target.value })} type="time" className="rounded-xl border border-outline-variant/30 px-4 py-3" />
            <textarea value={eventForm.description} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} className="md:col-span-2 rounded-xl border border-outline-variant/30 px-4 py-3 min-h-28" placeholder="Event description" />
            <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end">
              <button disabled={savingEvent} className="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-70">
                {savingEvent ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        )}

        {actionMessage && (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
            {actionMessage}
          </div>
        )}
        
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
            {events.length === 0 ? (
              <div className="rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-6 text-on-surface-variant">
                No events are available right now.
              </div>
            ) : events.map((evt) => (
              <article key={evt._id} className="bg-linear-to-br from-surface-container-lowest to-surface-container-low rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/40 overflow-hidden flex flex-col group hover:shadow-[0_16px_50px_rgba(149,73,33,0.12)] hover:border-secondary/30 transition-all duration-300">
                <div className="h-40 sm:h-48 w-full relative overflow-hidden">
                  <img 
                    alt={evt.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={evt.image || '/vite.svg'} 
                  />
                  <div className="absolute top-4 right-4 bg-linear-to-r from-primary to-primary/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-primary/50">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-[12px] text-on-primary font-semibold">{evt.category || 'General'}</span>
                  </div>
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-1 gap-4">
                  <div className="flex items-center gap-2 text-secondary font-label-bold text-[14px] font-semibold">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    <span>{formatDate(evt.date)}</span>
                  </div>
                  <h3 className="font-h3 text-[24px] font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{evt.title}</h3>
                  <p className="font-body-md text-[16px] text-on-surface-variant line-clamp-2 -mt-2">{evt.description}</p>
                  <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span className="font-label-sm text-[12px] font-medium">{evt.location}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Link to={`/events/${evt._id}`} className="w-full sm:w-auto text-center px-4 py-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-colors">View</Link>
                      {isAdmin ? (
                        <button onClick={() => handleDeleteEvent(evt._id)} className="w-full sm:w-auto bg-error text-on-error px-5 py-2 rounded-lg font-label-bold text-[14px] font-semibold shadow-sm">
                          Delete
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRegister(evt._id)}
                          disabled={registeringId === evt._id}
                          className="w-full sm:w-auto bg-primary text-on-primary px-5 py-2 rounded-lg font-label-bold text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70"
                        >
                          {registeringId === evt._id ? 'Registering...' : 'Register'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      
      {!isAdmin && (
        <aside className="w-full xl:w-90 shrink-0 flex flex-col gap-6">
          <div className="bg-surface-container-low rounded-3xl p-4 sm:p-6 border border-outline-variant/20 shadow-[0_8px_30px_rgba(0,0,0,0.02)] xl:sticky xl:top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-h3 text-[20px] sm:text-[24px] font-bold text-on-surface">My Registered Events</h3>
              <button className="text-primary hover:text-primary-fixed-dim transition-colors">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {loadingMyEvents ? (
                <div className="text-sm text-on-surface-variant">Loading your events...</div>
              ) : myEvents.length === 0 ? (
                <div className="text-sm text-on-surface-variant">You have no registered events.</div>
              ) : (
                myEvents.map((me) => (
                  <div key={me._id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <Link to={`/events/${me._id}`} className="font-label-sm font-semibold text-on-surface hover:text-primary">{me.title}</Link>
                      <div className="text-xs text-on-surface-variant">{formatDate(me.date)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-label-bold text-[14px] font-semibold hover:bg-surface-container-lowest hover:text-on-surface transition-all">
              View Full Calendar
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Events;
