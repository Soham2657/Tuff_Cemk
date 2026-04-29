import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { AuthContext } from '../context/AuthContext';

const ClubDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await clubService.getClubById(id);
        setClub(data);
      } catch (err) {
        console.error('Failed to load club:', err);
        setMessage(err.response?.data?.message || 'Failed to load club details.');
        setClub(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isMember = () => {
    const currentUserId = user?._id?.toString();
    return Array.isArray(club?.members)
      ? club.members.some((m) => (m?._id || m)?.toString?.() === currentUserId)
      : false;
  };

  const handleApply = async () => {
    try {
      await clubService.applyToClub(id, {});
      setMessage('Application submitted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to apply.');
    }
  };

  const handleDelete = async () => {
    try {
      await clubService.deleteClub(id);
      setMessage('Club deleted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to delete club.');
    }
  };

  return (
    <div className="flex-1 w-full pb-24 px-4 md:px-6">
      <div className="mb-6">
        <Link to="/clubs" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors font-semibold"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to clubs</Link>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-secondary/30 bg-linear-to-r from-secondary/10 to-secondary/5 px-4 py-3 text-sm text-on-surface font-medium">{message}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : !club ? (
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-6 py-12 text-center text-on-surface-variant">Club not found.</div>
      ) : (
        <div className="bg-linear-to-br from-surface-container-lowest to-surface-container-low rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-outline-variant/40 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            <div className="md:col-span-1">
              <img src={club.image || '/vite.svg'} alt={club.name} className="w-full h-64 object-cover rounded-xl shadow-lg border border-outline-variant/40" />
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-linear-to-r from-primary/10 to-secondary/10 p-4 border border-primary/20">
                  <div className="flex items-center gap-2 text-secondary font-semibold">
                    <span className="material-symbols-outlined">groups</span>
                    <span>{club.members?.length || 0} Members</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <h1 className="font-h1 text-[40px] font-bold mb-2 text-on-surface">{club.name}</h1>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/50">
                <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
                <p className="text-base text-on-surface-variant">Club Information</p>
              </div>
              <p className="text-[16px] text-on-surface-variant mb-6 leading-relaxed">{club.description}</p>

              <div className="mb-8">
                <h3 className="font-h3 text-[20px] font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">person</span>
                  Members List
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {club.members && club.members.length > 0 ? (
                    club.members.map((m) => (
                      <div key={m._id || m} className="rounded-lg bg-linear-to-r from-primary/5 to-secondary/5 p-3 border border-outline-variant/30 hover:border-secondary/50 transition-colors">
                        <p className="text-sm font-semibold text-on-surface">{m.name || m.email || 'User'}</p>
                        {m.email && <p className="text-xs text-on-surface-variant">{m.email}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-on-surface-variant col-span-2">No members yet.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/50">
                {!isAdmin && !isMember() && (
                  <button onClick={handleApply} className="px-6 py-3 bg-linear-to-r from-primary to-primary/80 text-on-primary font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">add</span>
                      Apply to Join
                    </span>
                  </button>
                )}
                {isAdmin && (
                  <button onClick={handleDelete} className="px-6 py-3 bg-linear-to-r from-error to-error/80 text-on-error font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">delete</span>
                      Delete Club
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetails;
