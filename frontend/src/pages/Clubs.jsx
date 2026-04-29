import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clubService } from '../services/clubService';

const Clubs = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [pendingClubId, setPendingClubId] = useState(null);
  const [savingClub, setSavingClub] = useState(false);
  const [clubForm, setClubForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
    const searchInputRef = useRef(null);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const data = await clubService.getClubs();
        setClubs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch clubs', error);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };

    loadClubs();
  }, []);

  const handleApply = async (clubId) => {
    setPendingClubId(clubId);
    setMessage('');

    try {
      await clubService.applyToClub(clubId, {});
      setMessage('Application submitted successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to submit application.');
    } finally {
      setPendingClubId(null);
    }
  };

  const handleCreateClub = async (submitEvent) => {
    submitEvent.preventDefault();
    setSavingClub(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', clubForm.name);
      formData.append('description', clubForm.description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await clubService.createClub(formData);
      setMessage('Club created successfully.');
      setClubForm({ name: '', description: '' });
      setImageFile(null);

      const data = await clubService.getClubs();
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create club.');
    } finally {
      setSavingClub(false);
    }
  };

  const handleDeleteClub = async (clubId) => {
    try {
      await clubService.deleteClub(clubId);
      setClubs((current) => current.filter((club) => club._id !== clubId));
      setMessage('Club deleted successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete club.');
    }
  };

  const handleSearch = async (query) => {
    setSearchTerm(query);
    setSearching(true);
    setMessage('');

    try {
      if (query.trim()) {
        const data = await clubService.searchClubs(query);
        setClubs(Array.isArray(data) ? data : []);
      } else {
        const data = await clubService.getClubs();
        setClubs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Search failed', error);
      setMessage('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const isMember = (club) => {
    const currentUserId = user?._id?.toString();
    return Array.isArray(club.members)
      ? club.members.some((member) => (member?._id || member)?.toString?.() === currentUserId)
      : false;
  };

  return (
    <div className="flex-1 w-full pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-h1 text-[40px] font-bold text-on-surface tracking-tight mb-1">Campus Clubs</h2>
          <p className="font-body-lg text-[18px] text-on-surface-variant">Discover communities, join discussions, and participate in events.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
            <input 
              ref={searchInputRef}
              className="w-full pl-10 pr-4 py-2.5 bg-linear-to-r from-surface-container-lowest to-surface-container-low border border-secondary/30 rounded-xl font-body-md text-[16px] focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all shadow-sm hover:border-secondary/50" 
              placeholder="Search clubs..." 
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={searching}
              autoFocus={searchTerm.length > 0}
            />
          </div>
          <button className="px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </header>

      {message && (
        <div className="mb-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
          {message}
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handleCreateClub} className="mb-8 rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <h3 className="font-h3 text-[24px] font-bold text-on-surface">Create Club</h3>
          </div>
          <input value={clubForm.name} onChange={(event) => setClubForm({ ...clubForm, name: event.target.value })} className="rounded-xl border border-outline-variant/30 px-4 py-3" placeholder="Club name" />
          <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
          <textarea value={clubForm.description} onChange={(event) => setClubForm({ ...clubForm, description: event.target.value })} className="md:col-span-2 rounded-xl border border-outline-variant/30 px-4 py-3 min-h-28" placeholder="Club description" />
          <div className="md:col-span-2 flex justify-end">
            <button disabled={savingClub} className="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-70">
              {savingClub ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-on-surface-variant">Loading clubs...</div>
        ) : clubs.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-on-surface-variant">No clubs found.</div>
        ) : clubs.map((club) => {
          const member = isMember(club);
          const pending = pendingClubId === club._id;

          return (
            <article key={club._id} className="bg-linear-to-br from-surface-container-lowest to-surface-container-low rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/40 overflow-hidden flex flex-col hover:shadow-[0_16px_50px_rgba(0,0,0,0.12)] hover:border-secondary/30 transition-all duration-300 group">
              <div className="h-32 w-full bg-surface-container relative">
                <img 
                  alt={club.name} 
                  className="w-full h-full object-cover" 
                  src={club.image || '/vite.svg'}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-4 text-white">
                  <span className="px-3 py-1.5 bg-linear-to-r from-primary to-primary/80 backdrop-blur-md rounded-lg font-label-sm text-[12px] font-medium border border-primary/50 shadow-lg">Club</span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-h3 text-[24px] font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">{club.name}</h3>
                <p className="font-body-md text-[16px] text-on-surface-variant mb-4 line-clamp-2">{club.description}</p>
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-outline-variant/50">
                  <div className="flex items-center gap-1.5 text-secondary font-label-sm text-[12px] font-medium">
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                    {club.members?.length || 0} Members
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center gap-2">
                      <Link to={`/clubs/${club._id}`} className="px-4 py-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-colors">
                        View
                      </Link>
                      {isAdmin ? (
                        <button onClick={() => handleDeleteClub(club._id)} className="px-5 py-2 bg-error text-on-error font-label-bold text-[14px] font-semibold rounded-xl shadow-sm">
                          Delete
                        </button>
                      ) : member ? (
                        <div className="px-4 py-1.5 bg-secondary/10 text-secondary font-label-bold text-[12px] font-semibold rounded-xl flex items-center gap-1.5 border border-secondary/20">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Member
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(club._id)}
                          disabled={pending}
                          className="px-5 py-2 bg-primary text-on-primary font-label-bold text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
                        >
                          {pending ? 'Submitting...' : 'Apply'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

      </div>
    </div>
  );
};

export default Clubs;
