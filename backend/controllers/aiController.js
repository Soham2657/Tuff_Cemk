export const chatWithAssistant = async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim().toLowerCase();

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let reply = 'I can help with events, clubs, canteen orders, announcements, and notifications.';

    if (message.includes('event')) {
      reply = 'Open the Events page to view events, register, or create an event if you are an admin.';
    } else if (message.includes('club')) {
      reply = 'Open the Clubs page to apply or, if you are an admin, create and manage clubs.';
    } else if (message.includes('canteen') || message.includes('menu') || message.includes('order')) {
      reply = 'Use the Canteen page to place orders. Admins can add menu items and update order status.';
    } else if (message.includes('announcement')) {
      reply = 'Announcements are managed from the Announcements page. Admins can create new announcements there.';
    } else if (message.includes('notification')) {
      reply = 'Your notifications are available in the Notifications page.';
    }

    res.json({
      reply,
      suggestions: [
        'Ask about events',
        'Ask about canteen orders',
        'Ask about clubs',
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};