import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { clubService } from '../services/clubService';
import { canteenService } from '../services/canteenService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';
  const [dashboardData, setDashboardData] = useState({
    activeOrder: null,
    queueInfo: null,
    upcomingEvents: [],
    joinedClubs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [events, clubs, orders] = await Promise.all([
          eventService.getEvents(),
          clubService.getClubs(),
          canteenService.getMyOrders().catch(() => []),
        ]);

        const activeOrder = orders.find((order) => order.status !== 'Ready') || orders[0] || null;
        const queueInfo = activeOrder
          ? await canteenService.getQueueInfo(activeOrder._id).catch(() => null)
          : null;

        const currentUserId = user?._id?.toString();
        const joinedClubs = clubs.filter((club) =>
          Array.isArray(club.members)
            ? club.members.some((member) => (member?._id || member)?.toString?.() === currentUserId)
            : false,
        );

        setDashboardData({
          activeOrder,
          queueInfo,
          upcomingEvents: Array.isArray(events) ? events.slice(0, 2) : [],
          joinedClubs: joinedClubs.slice(0, 3),
        });
      } catch {
        setDashboardData({
          activeOrder: null,
          queueInfo: null,
          upcomingEvents: [],
          joinedClubs: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?._id]);

  const formatEventDate = (event) => {
    if (!event?.date) return 'Date pending';
    const date = new Date(event.date);
    if (Number.isNaN(date.getTime())) return 'Date pending';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatEventTime = (event) => event?.time || 'Time pending';

  const activeOrderQuantity = Array.isArray(dashboardData.activeOrder?.items)
    ? dashboardData.activeOrder.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    : 0;
  const queueItemCount = Number(dashboardData.queueInfo?.totalQuantity || 0) || activeOrderQuantity;
  const minimumEstimatedMinutes = Math.max(1, queueItemCount * 3);
  const parsedQueueMinutes = Number.parseInt(String(dashboardData.queueInfo?.estimatedTime || ''), 10);
  const estimatedMinutes = dashboardData.queueInfo
    ? Math.max(Number.isFinite(parsedQueueMinutes) && parsedQueueMinutes > 0 ? parsedQueueMinutes : 0, minimumEstimatedMinutes)
    : null;

  return (
    <>
      {/* Hero Section */}
      <div className="mb-8">
        <h2 className="font-h1 text-[40px] font-extrabold text-on-surface mb-2">
          Good morning, {user?.name?.split(' ')[0] || 'Alex'}.
        </h2>
        <p className="font-body-lg text-[18px] text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
          It's a great day to be on campus.
        </p>
      </div>

      {isAdmin && (
        <div className="mb-8 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-h3 text-[22px] font-bold text-on-surface">Admin controls</h3>
            <p className="text-sm text-on-surface-variant">Use the Events, Clubs, Canteen, and Announcements pages to manage campus content.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/events" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary">Manage Events</a>
            <a href="/clubs" className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary">Manage Clubs</a>
            <a href="/canteen" className="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container">Manage Canteen</a>
          </div>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (Span 8) */}
        <div className="md:col-span-8 flex flex-col gap-4 sm:gap-6">
          
          {/* Active Orders (Featured Card) */}
          <div className="bg-linear-to-br from-primary-container/20 to-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 relative overflow-hidden backdrop-blur-sm">
            {/* Decorative Glass Element */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-fixed-dim/20 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="font-h3 text-[24px] font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                  Active Orders
                </h3>
                <p className="font-body-md text-[16px] text-on-surface-variant mt-1">Canteen pickup</p>
              </div>
              <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full font-label-sm text-[12px] font-medium text-primary border border-primary/20 flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Preparing
              </span>
            </div>
            
            <div className="bg-white/60 rounded-lg p-4 border border-white/40 flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined icon-fill text-[24px]">local_cafe</span>
                </div>
                <div>
                  <p className="font-label-bold text-[14px] font-semibold text-on-surface">
                    {dashboardData.activeOrder ? `Order #${dashboardData.activeOrder.tokenNumber}` : 'No active order'}
                  </p>
                  <p className="font-body-md text-[16px] text-on-surface-variant">
                    {dashboardData.activeOrder ? dashboardData.activeOrder.status : 'Place an order in the canteen to see pickup status.'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-h2 text-[32px] font-bold text-on-surface">
                  {estimatedMinutes ?? '--'}
                  <span className="font-body-md text-[16px] text-on-surface-variant">m</span>
                </p>
                <p className="font-label-sm text-[12px] font-medium text-on-surface-variant">Est. Pickup</p>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-4">
              <h3 className="font-h3 text-[24px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">calendar_month</span>
                Upcoming Events
              </h3>
              <button className="font-label-bold text-[14px] font-semibold text-primary hover:text-primary-container transition-colors">
                View All
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {loading ? (
                <p className="text-on-surface-variant text-[14px]">Loading upcoming events...</p>
              ) : dashboardData.upcomingEvents.length > 0 ? (
                dashboardData.upcomingEvents.map((event, index) => (
                  <div key={event._id} className="group flex items-start gap-4 p-3 -mx-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center border ${index === 0 ? 'bg-error-container/50 text-on-error-container border-error-container' : 'bg-secondary-container/30 text-on-secondary-container border-secondary-container/50'}`}>
                      <span className="font-label-bold text-[10px] font-semibold uppercase">{formatEventDate(event).split(' ')[0]}</span>
                      <span className="font-h3 text-[24px] font-bold leading-none mt-1">{formatEventDate(event).split(' ')[1] || '--'}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-label-bold text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <p className="font-body-md text-[16px] text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatEventTime(event)} • {event.location}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-[14px]">No upcoming events found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Span 4) */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-6">
          {/* Joined Clubs */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-[24px] font-bold text-on-surface">Joined Clubs</h3>
              <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-label-bold text-[14px] font-semibold">
                3
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {loading ? (
                <p className="text-on-surface-variant text-[14px]">Loading clubs...</p>
              ) : dashboardData.joinedClubs.length > 0 ? (
                dashboardData.joinedClubs.map((club) => (
                  <Link
                    key={club._id}
                    to={`/clubs/${club._id}`}
                    className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant/30 hover:border-secondary/50 hover:bg-surface-container-low/50 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]">
                      <span className="material-symbols-outlined icon-fill">groups</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-label-bold text-[14px] font-semibold text-on-surface">{club.name}</h4>
                      <p className="font-label-sm text-[12px] font-medium text-on-surface-variant">{club.members?.length || 0} members</p>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                  </Link>
                ))
              ) : (
                <p className="text-on-surface-variant text-[14px]">You are not joined to any clubs yet.</p>
              )}
            </div>
            
            <button onClick={() => navigate('/clubs')} className="w-full mt-4 py-2 border border-outline-variant/50 rounded-lg font-label-bold text-[14px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
              Explore More Clubs
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
