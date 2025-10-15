import React, { useState, useEffect } from 'react';
import { getApiUrl, API_BASE_URL } from './lib/config';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentRoute, setCurrentRoute] = useState('feed');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [adminEvents, setAdminEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Event form state
  const [eventFormData, setEventFormData] = useState({
    title: '',
    date: '',
    time: '',
    locationText: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    bookingLink: '',
    category: '',
    imageUrl: ''
  });
  const [eventSubmitLoading, setEventSubmitLoading] = useState(false);
  const [eventSubmitMessage, setEventSubmitMessage] = useState('');

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check regular user authentication using session cookie
        const response = await fetch(getApiUrl('/api/auth/status'), {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.authenticated) {
          setIsAuthenticated(true);
          setUserRole(data.user?.role);
          setUserEmail(data.user?.email);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          setUserEmail(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserEmail(null);
        setIsAdmin(false);
      }
    };
    checkAuthStatus();
  }, []);

  // Load events for the feed
  useEffect(() => {
    if (currentRoute === 'feed') {
      loadEvents();
    } else if (currentRoute === 'my-events' && isAuthenticated) {
      loadMyEvents();
    } else if (currentRoute === 'admin' && userRole === 'admin') {
      loadAdminData();
    }
  }, [currentRoute, isAuthenticated, userRole]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/events'), {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to load events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/events/my'), {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMyEvents(data);
      } else {
        console.error('Failed to load my events');
      }
    } catch (error) {
      console.error('Error loading my events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Load all events
      const eventsResponse = await fetch(getApiUrl('/api/admin/events'), {
        credentials: 'include'
      });
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setAdminEvents(eventsData.events || []);
      }

      // Load pending events
      const pendingResponse = await fetch(getApiUrl('/api/admin/pending'), {
        credentials: 'include'
      });
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingEvents(pendingData.events || []);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth';
      const body = isLogin 
        ? { email, password }
        : { firstName, lastName, email, password };

      console.log('Auth request:', { endpoint, body: isLogin ? { email, password: '***' } : { firstName, lastName, email, password: '***' } });

      const response = await fetch(getApiUrl(endpoint), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
                credentials: 'include'
            });

            if (response.ok) {
        const data = await response.json();
        if (isLogin) {
          setMessage('Login successful! Redirecting...');
          setIsAuthenticated(true);
          setUserRole(data.user?.role);
          setUserEmail(data.user?.email);
          
          setTimeout(() => {
            handleNavigate('feed');
          }, 1000);
        } else {
          setMessage('Registration successful! Please log in.');
          setIsLogin(true);
        }
            } else {
                const errorData = await response.json();
        setMessage(errorData.message || 'Authentication failed.');
            }
        } catch (error) {
      console.error('Auth error:', error);
      setMessage('Network error. Please try again.');
        } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(getApiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail(null);
    setIsAdmin(false);
    handleNavigate('feed');
  };

  const handleNavigate = (route) => {
    setCurrentRoute(route);
    setSelectedEvent(null);
    setMessage('');
  };

  const renderNavigation = () => (
    <nav className="bg-orange-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <button 
            onClick={() => handleNavigate('feed')}
            className={`px-3 py-2 rounded ${currentRoute === 'feed' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
          >
            Events Feed
          </button>
          {isAuthenticated && (
            <>
              <button 
                onClick={() => handleNavigate('my-events')}
                className={`px-3 py-2 rounded ${currentRoute === 'my-events' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
              >
                My Events
              </button>
              <button 
                onClick={() => handleNavigate('create-event')}
                className={`px-3 py-2 rounded ${currentRoute === 'create-event' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
              >
                Create Event
              </button>
            </>
          )}
          {isAdmin && (
            <button 
              onClick={() => handleNavigate('admin')}
              className={`px-3 py-2 rounded ${currentRoute === 'admin' ? 'bg-orange-700' : 'hover:bg-orange-700'}`}
            >
              Admin
            </button>
          )}
                </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span>Welcome, {userEmail}</span>
              <button 
                onClick={handleLogout}
                className="px-3 py-2 bg-orange-700 rounded hover:bg-orange-800"
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleNavigate('login')}
              className="px-3 py-2 bg-orange-700 rounded hover:bg-orange-800"
            >
              Login / Register
            </button>
          )}
                </div>
      </div>
    </nav>
  );

  const renderEventsFeed = () => (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Desi Events Leeds</h1>
      {isLoading ? (
        <div className="text-center">Loading events...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <p className="text-sm text-gray-500">Date: {new Date(event.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Location: {event.location}</p>
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title} className="mt-4 w-full h-48 object-cover rounded" />
              )}
                    </div>
          ))}
                    </div>
      )}
                </div>
  );

  const renderLoginForm = () => (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
                <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                        type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                    />
                </div>
                <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
              />
                </div>
          </>
        )}
                    <div>
          <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>
                    <div>
          <label className="block text-sm font-medium mb-1">Password</label>
                        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
                        />
                    </div>
                    <button
                        type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    >
          {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
      </form>
      <div className="mt-4 text-center">
                    <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-orange-600 hover:underline"
                    >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
            </div>
      )}
        </div>
    );

  // Update contact email when user logs in
  useEffect(() => {
    if (userEmail && !eventFormData.contactEmail) {
      setEventFormData(prev => ({ ...prev, contactEmail: userEmail }));
    }
  }, [userEmail]);

  const handleEventFormChange = (field, value) => {
    setEventFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEventSubmit = async (e) => {
        e.preventDefault();
    setEventSubmitLoading(true);
    setEventSubmitMessage('');

    try {
      // Prepare the data, converting empty strings to null for optional fields
      const eventData = {
        ...eventFormData,
        contactPhone: eventFormData.contactPhone || null,
        bookingLink: eventFormData.bookingLink || null,
        imageUrl: eventFormData.imageUrl || null,
      };

      console.log('Submitting event data:', eventData);

      const response = await fetch(getApiUrl('/api/events'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData)
            });

            if (response.ok) {
        setEventSubmitMessage('Event created successfully! Waiting for admin approval.');
        // Reset form
        setEventFormData({
          title: '',
          date: '',
          time: '',
          locationText: '',
          description: '',
          contactEmail: userEmail || '',
          contactPhone: '',
          bookingLink: '',
          category: '',
          imageUrl: ''
        });
        setTimeout(() => {
          handleNavigate('my-events');
        }, 2000);
            } else {
                const errorData = await response.json();
        console.error('Event creation failed:', errorData);
        setEventSubmitMessage(errorData.message || 'Failed to create event');
            }
    } catch (error) {
      console.error('Event creation error:', error);
      setEventSubmitMessage('Network error. Please try again.');
        } finally {
      setEventSubmitLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
      const endpoint = userRole === 'admin' 
        ? `/api/admin/events/${eventId}` 
        : `/api/events/${eventId}`;

      const response = await fetch(getApiUrl(endpoint), {
                method: 'DELETE',
                credentials: 'include'
            });

      if (response.ok) {
        alert('Event deleted successfully!');
        // Reload the current page data
        if (currentRoute === 'my-events') {
          loadMyEvents();
        } else if (currentRoute === 'admin') {
          loadAdminData();
        }
            } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete event');
            }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error. Please try again.');
        }
    };

  const handleApproveEvent = async (eventId) => {
        try {
            const response = await fetch(getApiUrl(`/api/admin/approve/${eventId}`), {
                method: 'POST',
                credentials: 'include'
            });

      if (response.ok) {
        alert('Event approved successfully!');
        loadAdminData();
            } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to approve event');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Network error. Please try again.');
    }
  };

  const renderEventForm = () => {

        return (
            <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Create New Event</h2>
        <form onSubmit={handleEventSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Event Title *</label>
              <input
                type="text"
                value={eventFormData.title}
                onChange={(e) => handleEventFormChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

                        <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
                            <input
                type="date"
                value={eventFormData.date}
                onChange={(e) => handleEventFormChange('date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
              <label className="block text-sm font-medium mb-2">Time *</label>
                            <input
                type="time"
                value={eventFormData.time}
                onChange={(e) => handleEventFormChange('time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Location *</label>
              <input
                type="text"
                value={eventFormData.locationText}
                onChange={(e) => handleEventFormChange('locationText', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Leeds City Centre, Millennium Square"
                required
              />
                </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={eventFormData.description}
                onChange={(e) => handleEventFormChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={eventFormData.category}
                onChange={(e) => handleEventFormChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select a category</option>
                <option value="cultural">Cultural</option>
                <option value="religious">Religious</option>
                <option value="social">Social</option>
                <option value="educational">Educational</option>
                <option value="sports">Sports</option>
                <option value="food">Food & Dining</option>
                <option value="music">Music & Dance</option>
                <option value="other">Other</option>
              </select>
                </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Email *</label>
              <input
                type="email"
                value={eventFormData.contactEmail}
                onChange={(e) => handleEventFormChange('contactEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
                </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Phone</label>
              <input
                type="tel"
                value={eventFormData.contactPhone}
                onChange={(e) => handleEventFormChange('contactPhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
                    </div>

            <div>
              <label className="block text-sm font-medium mb-2">Booking Link</label>
              <input
                type="url"
                value={eventFormData.bookingLink}
                onChange={(e) => handleEventFormChange('bookingLink', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://..."
              />
                    </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={eventFormData.imageUrl}
                onChange={(e) => handleEventFormChange('imageUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://..."
              />
                    </div>
                    </div>

          <div className="flex gap-4">
                        <button
              type="submit"
              disabled={eventSubmitLoading}
              className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {eventSubmitLoading ? 'Creating...' : 'Create Event'}
                        </button>
                        <button
              type="button"
              onClick={() => handleNavigate('feed')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
                        </button>
                </div>

          {eventSubmitMessage && (
            <div className={`mt-4 p-3 rounded ${eventSubmitMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {eventSubmitMessage}
                        </div>
          )}
        </form>
                    </div>
    );
  };

  const renderMyEvents = () => (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Events</h1>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : myEvents.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>You haven't created any events yet.</p>
                                        <button
            onClick={() => handleNavigate('create-event')}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Create Your First Event
                                        </button>
                                    </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <p className="text-sm text-gray-500">Date: {new Date(event.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Time: {event.time}</p>
              <p className="text-sm text-gray-500">Location: {event.locationText}</p>
              <p className={`text-sm font-semibold mt-2 ${
                event.approvalStatus === 'approved' ? 'text-green-600' : 
                event.approvalStatus === 'pending' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                Status: {event.approvalStatus}
              </p>
                                                <button
                onClick={() => handleDeleteEvent(event.id)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full"
              >
                Delete Event
                                            </button>
                                </div>
                            ))}
                        </div>
      )}
        </div>
    );

  const renderAdminDashboard = () => (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Pending Events Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Pending Events ({pendingEvents.length})</h2>
        {pendingEvents.length === 0 ? (
          <p className="text-gray-600">No pending events</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingEvents.map((event) => (
              <div key={event.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-2">{event.description}</p>
                <p className="text-sm text-gray-500">Date: {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Time: {event.time}</p>
                <p className="text-sm text-gray-500">Location: {event.locationText}</p>
                <p className="text-sm text-gray-500">Category: {event.category}</p>
                <div className="flex gap-2 mt-4">
                <button
                    onClick={() => handleApproveEvent(event.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Approve
                </button>
                    <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                    Reject/Delete
                    </button>
                </div>
        </div>
            ))}
                        </div>
                    )}
                        </div>

      {/* All Events Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">All Events ({adminEvents.length})</h2>
        {adminEvents.length === 0 ? (
          <p className="text-gray-600">No events found</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminEvents.map((event) => (
              <div key={event.id} className={`rounded-lg p-6 ${
                event.approvalStatus === 'approved' ? 'bg-green-50 border-2 border-green-200' :
                event.approvalStatus === 'pending' ? 'bg-yellow-50 border-2 border-yellow-200' :
                'bg-red-50 border-2 border-red-200'
              }`}>
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                <p className="text-xs text-gray-500">Date: {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">Status: {event.approvalStatus}</p>
                        <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 w-full"
                        >
                  Delete
                        </button>
                    </div>
            ))}
                </div>
        )}
            </div>
        </div>
    );

    const renderContent = () => {
    switch (currentRoute) {
            case 'login':
        return renderLoginForm();
      case 'create-event':
        return renderEventForm();
      case 'my-events':
        return renderMyEvents();
            case 'admin':
        return renderAdminDashboard();
      case 'feed':
            default:
        return renderEventsFeed();
        }
    };

    return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <main className="py-8">
            {renderContent()}
      </main>
        </div>
    );
}

export default App;
