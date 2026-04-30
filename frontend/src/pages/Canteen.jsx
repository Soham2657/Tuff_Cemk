import React, { useEffect, useRef, useState } from 'react';
import { canteenService } from '../services/canteenService';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const Canteen = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);
  const [savingMenuItem, setSavingMenuItem] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', prepWeight: '', category: 'snacks' });
  const [menuImage, setMenuImage] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await canteenService.getMenu();
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch menu", error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    const loadAdminOrders = async () => {
      if (!isAdmin) return;

      try {
        const data = await canteenService.getAllOrders();
        setAdminOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch orders', error);
        setAdminOrders([]);
      }
    };

    loadAdminOrders();
  }, [isAdmin]);

  useEffect(() => {
    const loadActiveOrderQueue = async () => {
      if (isAdmin) {
        setActiveOrder(null);
        setQueueInfo(null);
        return;
      }

      try {
        const orders = await canteenService.getMyOrders();
        const active = Array.isArray(orders)
          ? orders.find((order) => String(order.status || '').toLowerCase() !== 'ready') || orders[0] || null
          : null;

        setActiveOrder(active);

        if (active?._id) {
          const info = await canteenService.getQueueInfo(active._id).catch(() => null);
          setQueueInfo(info);
        } else {
          setQueueInfo(null);
        }
      } catch {
        setActiveOrder(null);
        setQueueInfo(null);
      }
    };

    loadActiveOrderQueue();
  }, [isAdmin]);

  const featuredItem = menuItems[0] || null;

  const addToCart = (item) => {
    setMessage('');
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem._id === item._id);

      if (existingItem) {
        return currentItems.map((cartItem) => (
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const changeQuantity = (itemId, amount) => {
    setCartItems((currentItems) =>
      currentItems
        .map((cartItem) =>
          cartItem._id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + amount }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setMessage('Add at least one item before checkout.');
      return;
    }

    setPlacingOrder(true);
    setMessage('');

    try {
      const order = await canteenService.placeOrder({
        items: cartItems.map((item) => ({ menuItem: item._id, quantity: item.quantity })),
      });

      setCartItems([]);
      setActiveOrder(order);
      const info = await canteenService.getQueueInfo(order._id).catch(() => null);
      setQueueInfo(info);
      setMessage(`Order placed successfully. Token #${order.tokenNumber}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCreateMenuItem = async (submitEvent) => {
    submitEvent.preventDefault();
    setSavingMenuItem(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', menuForm.name);
      formData.append('price', menuForm.price);
      formData.append('prepWeight', menuForm.prepWeight);
      formData.append('category', menuForm.category);
      if (menuImage) {
        formData.append('image', menuImage);
      }

      await canteenService.addMenuItem(formData);
      setMenuForm({ name: '', price: '', prepWeight: '', category: 'snacks' });
      setMenuImage(null);
      setMessage('Menu item created successfully.');
      const data = await canteenService.getMenu();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create menu item.');
    } finally {
      setSavingMenuItem(false);
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await canteenService.updateOrderStatus(orderId, status);
      setMessage(`Order ${status.toLowerCase()} successfully.`);
      const data = await canteenService.getAllOrders();
      setAdminOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update order status.');
    }
  };

  const handleSearch = async (query) => {
    setSearchTerm(query);
    setSearching(true);
    setMessage('');

    try {
      if (query.trim()) {
        const data = await canteenService.searchMenu(query);
        setMenuItems(Array.isArray(data) ? data : []);
      } else {
        const data = await canteenService.getMenu();
        setMenuItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Search failed', error);
      setMessage('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const formatCategory = (category) => {
    if (!category) return 'Menu item';
    return category
      .split(/[_-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const queueLevel = queueInfo?.ordersAhead == null
    ? 'No data'
    : queueInfo.ordersAhead > 8
      ? 'Busy'
      : queueInfo.ordersAhead > 3
        ? 'Moderate'
        : 'Low';

  const activeOrderQuantity = Array.isArray(activeOrder?.items)
    ? activeOrder.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    : 0;
  const queueItemCount = Number(queueInfo?.totalQuantity || 0) || activeOrderQuantity;
  const minimumEstimatedMinutes = Math.max(1, queueItemCount * 3);
  const parsedQueueMinutes = Number.parseInt(String(queueInfo?.estimatedTime || ''), 10);
  const estimatedMinutes = queueInfo
    ? Math.max(Number.isFinite(parsedQueueMinutes) && parsedQueueMinutes > 0 ? parsedQueueMinutes : 0, minimumEstimatedMinutes)
    : 0;
  const nowServingOrder = adminOrders.find((order) => String(order.status || '').toLowerCase() === 'preparing');
  const nowServingToken = nowServingOrder?.tokenNumber || (String(activeOrder?.status || '').toLowerCase() === 'preparing' ? activeOrder?.tokenNumber : null);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
      {/* Left Column: Menu Browsing */}
      <div className="flex-1 flex flex-col gap-6 sm:gap-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4">
          <div>
            <h1 className="font-h1 text-[32px] sm:text-[40px] font-extrabold text-on-surface">Canteen</h1>
            <p className="font-body-lg text-[16px] sm:text-[18px] text-on-surface-variant mt-2">Order ahead and skip the line.</p>
          </div>
          
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
              <input 
                ref={searchInputRef}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary/30 bg-linear-to-r from-surface-container-lowest to-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-body-md shadow-sm hover:border-secondary/50" 
                placeholder="Search menu..." 
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={searching}
                autoFocus={searchTerm.length > 0}
              />
            </div>
            <button className="p-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>
        </header>

        {isAdmin && (
          <form onSubmit={handleCreateMenuItem} className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h3 className="font-h3 text-[24px] font-bold text-on-surface">Add Menu Item</h3>
            </div>
            <input value={menuForm.name} onChange={(event) => setMenuForm({ ...menuForm, name: event.target.value })} className="rounded-xl border border-outline-variant/30 px-4 py-3" placeholder="Item name" />
            <input value={menuForm.price} onChange={(event) => setMenuForm({ ...menuForm, price: event.target.value })} className="rounded-xl border border-outline-variant/30 px-4 py-3" type="number" step="0.01" placeholder="Price" />
            <input value={menuForm.prepWeight} onChange={(event) => setMenuForm({ ...menuForm, prepWeight: event.target.value })} className="rounded-xl border border-outline-variant/30 px-4 py-3" type="number" placeholder="Prep weight" />
            <select value={menuForm.category} onChange={(event) => setMenuForm({ ...menuForm, category: event.target.value })} className="rounded-xl border border-outline-variant/30 px-4 py-3">
              <option value="snacks">Snacks</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="beverages">Beverages</option>
              <option value="desserts">Desserts</option>
            </select>
            <input type="file" accept="image/*" onChange={(event) => setMenuImage(event.target.files?.[0] || null)} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end">
              <button disabled={savingMenuItem} className="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-70">
                {savingMenuItem ? 'Adding...' : 'Add Menu Item'}
              </button>
            </div>
          </form>
        )}

        {message && (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
            {message}
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button className="whitespace-nowrap px-6 py-2 rounded-full bg-primary text-on-primary font-label-bold font-semibold transition-colors">All Items</button>
          <button className="whitespace-nowrap px-6 py-2 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface font-label-bold font-semibold hover:bg-surface-container-low transition-colors">Menu</button>
        </div>

        {/* Bento Grid Menu Items */}
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {featuredItem ? (
              <div className="col-span-1 sm:col-span-2 bg-linear-to-br from-surface-container-lowest to-surface-container-low rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col sm:flex-row group border border-outline-variant/40 hover:border-secondary/30 hover:shadow-[0_16px_50px_rgba(0,0,0,0.12)] transition-all duration-300">
                <div className="sm:w-1/2 h-44 sm:h-auto relative overflow-hidden">
                  <img 
                    alt={featuredItem.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={featuredItem.image || '/vite.svg'} 
                  />
                  <div className="absolute top-4 left-4 bg-linear-to-r from-secondary to-secondary/80 backdrop-blur-md px-3 py-1.5 rounded-full text-on-secondary font-label-bold text-xs flex items-center gap-1 border border-secondary/50 shadow-lg">
                    <span className="material-symbols-outlined text-[14px]">local_fire_department</span> Featured
                  </div>
                </div>
                <div className="sm:w-1/2 p-4 sm:p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-h3 text-[24px] font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">{featuredItem.name}</h3>
                      <span className="font-h3 text-[24px] font-bold text-secondary">₹{Number(featuredItem.price).toFixed(2)}</span>
                    </div>
                    <p className="font-body-sm text-[16px] text-on-surface-variant mb-4 line-clamp-2">
                      {formatCategory(featuredItem.category)} • Prep weight: {featuredItem.prepWeight || 5}
                    </p>
                    <div className="flex gap-2 mb-6">
                      <span className="px-2 py-1 bg-tertiary-container/20 text-on-tertiary-container text-xs rounded-md font-label-sm font-medium">
                        {featuredItem.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(featuredItem)}
                    className="w-full bg-linear-to-r from-primary to-primary/80 text-on-primary py-3 rounded-xl font-label-bold font-semibold hover:shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined">add_circle</span> Add to Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="col-span-1 sm:col-span-2 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-on-surface-variant">
                No menu items available.
              </div>
            )}

            {/* Map remaining items */}
            {menuItems.slice(1).map((item) => (
              <div key={item._id} className="bg-linear-to-br from-surface-container-lowest to-surface-container-low rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col group border border-outline-variant/40 hover:border-secondary/30 hover:shadow-[0_16px_50px_rgba(0,0,0,0.12)] transition-all duration-300">
                <div className="h-36 sm:h-40 relative overflow-hidden">
                  <img 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={item.image || '/vite.svg'} 
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-label-bold text-[16px] font-semibold text-on-surface group-hover:text-primary transition-colors">{item.name}</h3>
                    <span className="font-label-bold text-[16px] font-semibold text-secondary">₹{item.price.toFixed(2)}</span>
                  </div>
                  <p className="font-body-sm text-[14px] text-on-surface-variant mb-4 line-clamp-2 flex-1">
                    {formatCategory(item.category)} • Prep weight: {item.prepWeight || 5}
                  </p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full bg-linear-to-r from-primary to-primary/80 text-on-primary py-2 rounded-lg font-label-bold font-semibold hover:shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            ))}
            
          </div>
        )}
      </div>

      {/* Right Column: Queue Status & Cart Sidebar */}
      <aside className="w-full xl:w-95 flex flex-col gap-6 sm:gap-8 shrink-0">
        
        {/* Queue Status Glassmorphism Card */}
        <div className="bg-linear-to-br from-secondary/10 to-secondary-fixed/30 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-h3 text-[20px] font-bold text-on-secondary-container flex items-center gap-2">
                <span className="material-symbols-outlined">timer</span> Live Queue
              </h2>
              <span className="px-3 py-1 bg-white/60 text-secondary text-xs rounded-full font-label-bold font-semibold border border-white/80">{queueLevel}</span>
            </div>
            
            <div className="flex items-end gap-4 mb-6">
              <div className="bg-white/80 px-4 py-3 rounded-xl border border-white flex-1 text-center shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Est. Wait</p>
                <p className="font-h2 text-[32px] font-bold text-secondary leading-none">
                  {queueInfo ? estimatedMinutes : '--'} <span className="text-[18px] text-on-surface-variant">min</span>
                </p>
              </div>
              <div className="bg-white/80 px-4 py-3 rounded-xl border border-white flex-1 text-center shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Now Serving</p>
                <p className="font-h2 text-[32px] font-bold text-primary leading-none">{nowServingToken ? `#${nowServingToken}` : '--'}</p>
              </div>
            </div>
            
            <div className="bg-white/50 rounded-xl p-3 border border-white/60 flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                {queueInfo?.ordersAhead ?? '--'}
              </div>
              <div>
                <p className="font-label-bold text-[14px] font-semibold text-on-surface">Queue Status</p>
                <p className="text-[12px] text-on-surface-variant">
                  {queueInfo ? `${estimatedMinutes} minutes (${queueInfo.ordersAhead} orders ahead)` : 'Place an order to see queue timing.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Sidebar Panel */}
        {!isAdmin && (
          <div className="bg-surface-container-lowest rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col h-auto xl:h-auto xl:min-h-125 flex-1 xl:sticky xl:top-10">
          <div className="p-4 sm:p-6 border-b border-outline-variant/20 flex justify-between items-center">
            <h2 className="font-h3 text-[24px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">shopping_cart</span> Order Summary
            </h2>
            <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-label-bold font-semibold">{cartCount}</span>
          </div>
          
          {/* Cart Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            {cartItems.length === 0 ? (
              <div className="text-sm text-on-surface-variant">Your cart is empty.</div>
            ) : cartItems.map((item) => (
              <div key={item._id} className="flex gap-4 items-start">
                <img alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-outline-variant/20" src={item.image || '/vite.svg'} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-label-bold text-[14px] font-semibold text-on-surface">{item.name}</h4>
                    <span className="font-label-bold text-[14px] font-semibold text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <p className="text-[12px] text-on-surface-variant mb-2">Qty: {item.quantity}</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => changeQuantity(item._id, -1)} className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="font-label-bold text-[14px] font-semibold">{item.quantity}</span>
                    <button onClick={() => changeQuantity(item._id, 1)} className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
          </div>

          {/* Checkout Section */}
          <div className="p-4 sm:p-6 bg-surface-container-low border-t border-outline-variant/20 rounded-b-3xl">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="font-medium text-on-surface">₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-on-surface-variant">Tax (8%)</span>
              <span className="font-medium text-on-surface">₹{(totalPrice * 0.08).toFixed(2)}</span>
            </div>
            <div className="border-t border-outline-variant/30 pt-4 mb-6 flex justify-between items-center">
              <span className="font-label-bold text-[16px] font-semibold text-on-surface">Total</span>
              <span className="font-h3 text-[20px] font-bold text-primary">₹{(totalPrice * 1.08).toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={placingOrder}
              className="w-full bg-linear-to-r from-primary to-primary-container text-on-primary py-4 rounded-xl font-label-bold text-[16px] font-semibold shadow-[0_8px_30px_rgba(149,73,33,0.2)] hover:shadow-[0_8px_30px_rgba(149,73,33,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {placingOrder ? 'Placing Order...' : 'Checkout & Pay'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="text-center text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span> Live order flow connected to backend
            </p>
          </div>
          </div>
        )}

        {isAdmin && (
          <div className="bg-surface-container-lowest rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 p-6 flex flex-col gap-4">
            <h3 className="font-h3 text-[22px] font-bold text-on-surface">Order Management</h3>
            <div className="flex flex-col gap-3 max-h-105 overflow-y-auto">
              {adminOrders.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No orders found.</p>
              ) : adminOrders.map((order) => (
                <div key={order._id} className="rounded-2xl border border-outline-variant/30 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-on-surface">Order #{order.tokenNumber}</p>
                      <p className="text-sm text-on-surface-variant">{order.user?.name || 'Student'} • {order.status}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">₹{Number(order.totalPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleOrderStatus(order._id, 'Preparing')} className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-on-secondary">Preparing</button>
                    <button onClick={() => handleOrderStatus(order._id, 'Ready')} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary">Ready</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </aside>
    </div>
  );
};

export default Canteen;
