import React, { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { canteenService } from '../services/canteenService';

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const [registeredEvents, orders] = await Promise.all([
          eventService.getMyEvents().catch(() => []),
          canteenService.getMyOrders().catch(() => []),
        ]);

        const eventItems = Array.isArray(registeredEvents)
          ? registeredEvents.slice(0, 3).map((event) => ({
              time: event.time || 'Time pending',
              title: event.title,
              location: event.location,
              type: 'Event',
              duration: event.date ? new Date(event.date).toLocaleDateString('en-US') : 'Date pending',
            }))
          : [];

        const orderItems = Array.isArray(orders)
          ? orders.slice(0, 2).map((order) => ({
              time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Now',
              title: `Canteen order #${order.tokenNumber}`,
              location: order.status,
              type: 'Order',
              duration: order.totalPrice ? `₹${order.totalPrice.toFixed(2)}` : 'Order placed',
            }))
          : [];

        setScheduleData([...eventItems, ...orderItems]);
      } catch (error) {
        console.error('Failed to load schedule', error);
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  return (
    <div className="flex-1 w-full pb-20 sm:pb-24 flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="font-h1 text-[40px] font-bold text-on-surface tracking-tight mb-1">My Schedule</h2>
          <p className="font-body-lg text-[18px] text-on-surface-variant">View your upcoming classes and events for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 border border-outline-variant/50 rounded-xl hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
          </button>
          <span className="font-label-bold text-[16px] text-on-surface font-semibold">Today, Oct 24</span>
          <button className="p-2 border border-outline-variant/50 rounded-xl hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex flex-col">
          {loading ? (
            <div className="p-6 text-on-surface-variant">Loading schedule...</div>
          ) : scheduleData.length === 0 ? (
            <div className="p-6 text-on-surface-variant">No schedule data available yet.</div>
          ) : (
            scheduleData.map((item, index) => (
              <div key={`${item.type}-${index}`} className={`flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 ${index !== scheduleData.length - 1 ? 'border-b border-outline-variant/20' : ''} hover:bg-surface-container/30 transition-colors`}>
                <div className="w-full sm:w-32 shrink-0 flex items-start gap-2">
                  <span className="font-label-bold text-[16px] text-on-surface font-semibold">{item.time}</span>
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="font-h3 text-[18px] sm:text-[20px] font-bold text-on-surface wrap-break-word">{item.title}</h3>
                    <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-secondary/10 text-secondary">
                      {item.type}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-on-surface-variant text-[14px]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {item.duration}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
