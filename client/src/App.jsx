import React, { useState, useEffect } from 'react';
import ForgotPasswordJS from './components/ForgotPasswordJS';
import ResetPasswordJS from './pages/ResetPasswordJS';
import { authHelper } from './lib/auth';
import { getApiUrl } from './lib/config';

// Utility function to format dates for display
const formatDate = (dateString, timeString) => {
  if (!dateString) return 'TBD';
  
  // Combine date and time, creating a Date object
  const date = new Date(dateString);
  const time = timeString ? timeString.split(':').slice(0, 2).join(':') : '00:00';
  
  // Format the date part (e.g., Oct 25)
  const datePart = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  
  // Return combined string
  return `${datePart} @ ${time}`;
};

// --- COMPONENTS ---

// 1. Header Component
const Header = ({ onNavigate, isAuthenticated, onLogout, userRole, userEmail, isAdmin }) => (
  <header className="bg-orange-600 shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
      <h1 
        className="text-2xl font-extrabold text-white cursor-pointer tracking-wider"
        onClick={() => onNavigate('feed')}
      >
        Desi Events Leeds
      </h1>
      <nav className="flex space-x-4 items-center">
        {(isAuthenticated || isAdmin) ? (
          <>
            <button
              onClick={() => onNavigate('post')}
              className="px-3 py-1 bg-white text-orange-600 rounded-full text-sm font-semibold hover:bg-gray-100 transition duration-150"
            >
              + Post Event
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="text-white hover:text-gray-200 text-sm hidden sm:inline"
              >
                Admin
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-white hover:text-gray-200 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-1.5 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold hover:bg-yellow-300 transition duration-150 shadow-md"
          >
            Login / Register
          </button>
        )}
      </nav>
    </div>
  </header>
);

// 2. Event Card Component
const EventCard = ({ event, onNavigate }) => {
  const handleClick = () => {
    console.log('Event card clicked:', event);
    onNavigate('detail', event);
  };

  return (
  <div 
    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer flex flex-col"
      onClick={handleClick}
  >
    <img 
      src={event.imageUrl || `https://placehold.co/600x400/FDBA74/881337?text=${encodeURIComponent(event.title)}`}
      alt={event.title}
      className="w-full h-40 object-cover"
      onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/FDBA74/881337?text=${encodeURIComponent(event.title || 'Event')}`; }}
    />
    <div className="p-4 flex-grow">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <span>{event.locationText || 'Leeds'}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">{event.title}</h2>
      <p className="text-sm text-orange-600 font-medium">
        {formatDate(event.date, event.time)}
      </p>
    </div>
    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm">
        <span className="font-semibold text-gray-700">{event.category}</span>
        <span className="text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {event.viewsCount || 0} Views
        </span>
    </div>
  </div>
);
};

// 3. Main Event Feed View
const EventFeedView = ({ events, loading, error, onNavigate }) => (
  <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Upcoming Community Events</h2>
    
    {loading && <p className="text-center text-xl text-orange-600">Loading events...</p>}
    {error && <p className="text-center text-xl text-red-600">Error loading events: {error.message}</p>}

    {!loading && events.length === 0 && (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
            <p className="text-2xl text-gray-600 font-semibold mb-2">No Approved Events Found</p>
            <p className="text-gray-500">Check back later or try posting a new event!</p>
        </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onNavigate={onNavigate} />
      ))}
    </div>
  </main>
);

// Event Submission Success Screen
const EventSuccessView = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
                {/* Success Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>

                {/* Success Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🎉 Event Submitted Successfully!
                </h1>

                {/* Success Message */}
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Thank you for submitting your event! Your event has been sent for approval and will be reviewed by our team.
                    <br />
                    <span className="font-semibold text-gray-800">You can expect a decision within 24 hours.</span>
                </p>

                {/* Additional Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                        What happens next?
                    </h3>
                    <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Our team will review your event details</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>You'll receive a notification once your event is approved</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Approved events will appear on the main events page</span>
                        </li>
                    </ul>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onNavigate('feed')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                    Browse All Events
                </button>
            </div>
        </div>
    );
};

// 4. Event Creation Form Component
const EventFormView = ({ onEventCreated, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        locationText: '',
        category: 'Cultural',
        contactEmail: '',
        contactPhone: '',
        bookingLink: '',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(getApiUrl('/api/events'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                console.log('✅ Event created successfully');
                setLoading(false);
                // Navigate to success screen instead of showing message
                onSuccess();
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to create event.');
            }
        } catch (error) {
            setMessage('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
                Create New Event
            </h2>
            
            {message && (
                <p className={`text-center py-2 px-4 rounded mb-4 ${
                    message.includes('successfully') || message.includes('Thank you') || message.includes('approval')
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </p>
            )}
            {console.log('🔍 EventFormView - message state:', message)}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                        placeholder="e.g., Diwali Celebration 2024"
                    />
                </div>

                {/* Event Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                        placeholder="Describe your event..."
                    />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time *
                        </label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                    </label>
                    <input
                        type="text"
                        name="locationText"
                        value={formData.locationText}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                        placeholder="e.g., Leeds Town Hall, City Square"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    >
                        <option value="Cultural">Cultural</option>
                        <option value="Religious">Religious</option>
                        <option value="Community">Community</option>
                        <option value="Sports">Sports</option>
                        <option value="Music">Music</option>
                        <option value="Food">Food</option>
                        <option value="Business">Business</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Email *
                        </label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            required
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            placeholder="+44 123 456 7890"
                        />
                    </div>
                </div>

                {/* Booking Link */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking Link (Optional)
                    </label>
                    <input
                        type="url"
                        name="bookingLink"
                        value={formData.bookingLink}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder="https://..."
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Image URL (Optional)
                    </label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder="https://..."
                    />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition duration-150 disabled:bg-gray-400 shadow-md"
                        disabled={loading}
                    >
                        {loading ? 'Creating Event...' : 'Create Event'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onEventCreated()}
                        className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition duration-150 shadow-md"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Your event will be reviewed by our team before it goes live. 
                    This usually takes 24-48 hours. You'll be notified via email once approved.
                </p>
            </div>
        </div>
    );
};

// 5. Admin Dashboard Component
const AdminDashboardView = ({ onNavigate, onAdminLogin }) => {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
    
    // Admin login form state
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Admin login function
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        console.log('🔐 Admin login form submitted!', { adminEmail, adminPassword });
        setLoginLoading(true);
        setLoginError('');

        try {
            const response = await fetch(getApiUrl('/api/admin/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminEmail, adminPassword })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token) {
                    // Store admin token
                    authHelper.setToken(data.token);
                }
                setIsLoggedIn(true);
                setMessage('Admin logged in successfully!');
                setLoginError(''); // Clear any previous errors
                setError(''); // Clear any previous dashboard errors
                // Update the parent component's admin state
                if (onAdminLogin) {
                    onAdminLogin();
                }
                console.log('✅ Admin login successful!');
            } else {
                const errorData = await response.json();
                setLoginError(errorData.message || 'Login failed');
            }
        } catch (err) {
            setLoginError('Network error. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    const fetchPendingEvents = async () => {
        try {
            const response = await fetch(getApiUrl('/api/admin/pending'), {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setPendingEvents(data.events);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch pending events');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(getApiUrl('/api/admin/analytics/summary'), {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    };

    const fetchAllEvents = async () => {
        console.log('🚀 fetchAllEvents function called!');
        try {
            console.log('🔄 Fetching all events...');
            console.log('🍪 Document cookies:', document.cookie);
            const response = await fetch(getApiUrl('/api/admin/events'), {
                credentials: 'include'
            });
            console.log('📡 Response status:', response.status);
            const data = await response.json();
            console.log('📊 All events response:', data);
            if (data.success) {
                setAllEvents(data.events);
                console.log('✅ All events set:', data.events.length, 'events');
            } else {
                console.error('❌ Failed to fetch all events:', data.message);
                setError(data.message);
            }
        } catch (err) {
            console.error('❌ Error fetching all events:', err);
            setError('Failed to fetch all events');
        }
    };

    const deleteEvent = async (eventId, eventTitle) => {
        if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(getApiUrl(`/api/admin/events/${eventId}`), {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setMessage(`Event "${eventTitle}" deleted successfully`);
                // Refresh the events lists
                await fetchPendingEvents();
                await fetchAllEvents();
                await fetchAnalytics();
            } else {
                setError(data.message || 'Failed to delete event');
            }
        } catch (err) {
            setError('Failed to delete event');
        }
    };

    const approveEvent = async (eventId) => {
        try {
            const response = await fetch(getApiUrl(`/api/admin/approve/${eventId}`), {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setMessage('Event approved successfully!');
                fetchPendingEvents(); // Refresh the list
                fetchAnalytics(); // Refresh analytics
            } else {
                setMessage(`Failed to approve event: ${data.message}`);
            }
        } catch (err) {
            setMessage('Failed to approve event');
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchPendingEvents(), fetchAllEvents(), fetchAnalytics()])
            .finally(() => setLoading(false));
    }, []);

    // Show login form if not logged in
    if (!isLoggedIn) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
                    <form onSubmit={handleAdminLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Enter admin password"
                                required
                            />
                        </div>
                        {loginError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {loginError}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                {message}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {loginLoading ? 'Logging in...' : 'Login as Admin'}
                        </button>
                        {isLoggedIn && (
                            <button
                                type="button"
                                onClick={async () => {
                                    console.log('🔄 Loading dashboard data...');
                                    console.log('📋 fetchAllEvents function:', typeof fetchAllEvents);
                                    await fetchPendingEvents();
                                    await fetchAllEvents();
                                    await fetchAnalytics();
                                }}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold mt-2"
                            >
                                Load Dashboard Data
                            </button>
                        )}
                    </form>
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => onNavigate('feed')}
                            className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                            ← Back to Events
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Manage events and view platform analytics</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.includes('successfully') 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {message}
                    <button 
                        onClick={() => setMessage('')}
                        className="float-right font-bold"
                    >
                        ×
                    </button>
                </div>
            )}

            {error && !message && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">
                    <p className="font-semibold">Error: {error}</p>
                    <p className="text-sm mt-1">Make sure you're logged in as an admin user.</p>
                </div>
            )}

            {/* Analytics Summary */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600">{analytics.totalUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Events</h3>
                        <p className="text-3xl font-bold text-green-600">{analytics.totalEvents}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Approved Events</h3>
                        <p className="text-3xl font-bold text-green-600">{analytics.approvedEvents}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Events</h3>
                        <p className="text-3xl font-bold text-orange-600">{analytics.pendingEvents}</p>
                    </div>
                </div>
            )}

            {/* Events Management */}
            <div className="bg-white rounded-lg shadow-md border">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Events Management</h2>
                    
                    {/* Tabs */}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                activeTab === 'pending'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Pending Events ({pendingEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                activeTab === 'all'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Events ({allEvents.length})
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'pending' ? (
                    pendingEvents.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Events</h3>
                        <p className="text-gray-500">All events have been reviewed. Check back later for new submissions.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {pendingEvents.map((event) => (
                            <div key={event.id} className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                                {event.category}
                                            </span>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                                    Pending
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{event.description}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Date & Time:</span>
                                                <p className="text-gray-600">{formatDate(event.date, event.time)}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Location:</span>
                                                <p className="text-gray-600">{event.locationText}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Contact:</span>
                                                <p className="text-gray-600">{event.contactEmail}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-500">
                                            Submitted: {new Date(event.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="ml-6 flex space-x-3">
                                        <button
                                            onClick={() => approveEvent(event.id)}
                                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-150"
                                        >
                                            Approve
                                        </button>
                                            <button
                                                onClick={() => deleteEvent(event.id, event.title)}
                                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-150"
                                            >
                                                Delete
                                        </button>
                                        <button
                                            onClick={() => onNavigate('detail', event)}
                                            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition duration-150"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    )
                ) : (
                    // All Events Tab
                    allEvents.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                            <p className="text-gray-500">No events have been created yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {allEvents.map((event) => (
                                <div key={event.id} className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                    {event.category}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    event.approvalStatus === 'approved' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : event.approvalStatus === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {event.approvalStatus}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-3">{event.description}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Date & Time:</span>
                                                    <p className="text-gray-600">{formatDate(event.date, event.time)}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Location:</span>
                                                    <p className="text-gray-600">{event.locationText}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Contact:</span>
                                                    <p className="text-gray-600">{event.contactEmail}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-sm text-gray-500">
                                                Created: {new Date(event.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="ml-6 flex space-x-3">
                                            {event.approvalStatus === 'pending' && (
                                                <button
                                                    onClick={() => approveEvent(event.id)}
                                                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-150"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteEvent(event.id, event.title)}
                                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-150"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => onNavigate('detail', event)}
                                                className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition duration-150"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex justify-center space-x-4">
                <button
                    onClick={() => onNavigate('feed')}
                    className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition duration-150"
                >
                    View Public Events
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition duration-150"
                >
                    Refresh Dashboard
                </button>
            </div>
        </div>
    );
};

// 6. Login/Register View (Placeholder)
const AuthView = ({ onLoginSuccess, onLoginError }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const body = { email, password };
        if (!isLogin) {
            body.firstName = name.split(' ')[0];
            body.lastName = name.split(' ').slice(1).join(' ') || name.split(' ')[0];
        }

        try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

            if (response.ok) {
                const data = await response.json();
                
                if (isLogin && data.token) {
                    // Store token for login
                    authHelper.setToken(data.token);
                    setMessage('Login successful! Redirecting...');
                    onLoginSuccess();
                } else if (!isLogin) {
                    setMessage('Registration successful! Please log in.');
                    setIsLogin(true); // Switch to login after successful register
                }
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Authentication failed.');
            }
        } catch (error) {
            setMessage('An unexpected error occurred during communication.');
        } finally {
            setLoading(false);
        }
    };

    if (showForgotPassword) {
        return (
            <ForgotPasswordJS onBack={() => setShowForgotPassword(false)} />
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
                {isLogin ? 'Login to Post' : 'Create Account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error/Success Message */}
                {message && (
                    <p className={`text-center py-2 px-4 rounded ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </p>
                )}

                {/* Name Field (for Register) */}
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    />
                )}

                {/* Email Field */}
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    required
                />

                {/* Password Field */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    required
                />

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition duration-150 disabled:bg-gray-400 shadow-md"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Register')}
                </button>
            </form>

            {/* Forgot Password Link (only show on login) */}
            {isLogin && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setShowForgotPassword(true)}
                        className="text-orange-600 hover:underline text-sm"
                    >
                        Forgot your password?
                    </button>
                </div>
            )}

            {/* Switch between Login and Register */}
            <p className="mt-6 text-center text-gray-600">
                {isLogin ? "Need an account? " : "Already have an account? "}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-orange-600 font-semibold hover:text-orange-700 transition duration-150"
                >
                    {isLogin ? "Register Here" : "Log In"}
                </button>
            </p>
        </div>
    );
};

// 6. Event Detail View Component
const EventDetailView = ({ event, onNavigate }) => {
    console.log('EventDetailView rendered with event:', event);
    
    // Simple fallback if no event data
    if (!event) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
                    <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or the data is missing.</p>
                    <button
                        onClick={() => onNavigate('feed')}
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-150 font-semibold"
                    >
                        ← Back to Events
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBD';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return 'TBD';
        const time = timeStr.split(':').slice(0, 2).join(':');
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Event Image */}
                <div className="relative h-64 md:h-80 bg-gray-200">
                    <img 
                        src={event.imageUrl || `https://placehold.co/800x400/FDBA74/881337?text=${encodeURIComponent(event.title || 'Event')}`}
                        alt={event.title || 'Event'}
                        className="w-full h-full object-cover"
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = `https://placehold.co/800x400/FDBA74/881337?text=${encodeURIComponent(event.title || 'Event')}`; 
                        }}
                    />
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                            {event.category || 'Event'}
                        </span>
                    </div>
                </div>

                {/* Event Content */}
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {event.title || 'Untitled Event'}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">{formatTime(event.time)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-medium">{event.locationText}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">About This Event</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {event.description || 'No description available.'}
                        </p>
                    </div>

                    {/* Contact Information */}
                    {event.contactEmail && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h3>
                            <p className="text-gray-700">
                                <strong>Email:</strong> 
                                <a 
                                    href={`mailto:${event.contactEmail}`}
                                    className="text-orange-600 hover:text-orange-700 ml-2"
                                >
                                    {event.contactEmail}
                                </a>
                            </p>
                        </div>
                    )}

                    {/* Booking Link */}
                    {event.bookingLink && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Book Your Spot</h3>
                            <a 
                                href={event.bookingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition duration-150"
                            >
                                Book Now
                            </a>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                        <button
                            onClick={() => onNavigate('feed')}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-150"
                        >
                            Back to Events
                        </button>
                        {event.bookingLink && (
                            <a 
                                href={event.bookingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-150 text-center"
                            >
                                Book Event
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 7. App Component (The Router)
const App = () => {
    // State for routing and data management
    const [route, setRoute] = useState('feed');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Should be checked by API
    const [userRole, setUserRole] = useState(null); // Track user role for admin access
    const [userEmail, setUserEmail] = useState(null); // Track user email for admin access
    const [isAdmin, setIsAdmin] = useState(false); // Track admin session status

    // Simple router logic with URL updates
    const handleNavigate = (newRoute, event = null) => {
        console.log('Navigating to:', newRoute, 'with event:', event);
        setRoute(newRoute);
        setSelectedEvent(event);
        
        // Update URL to match route
        let newPath = '/';
        switch (newRoute) {
            case 'admin':
                newPath = '/admin';
                break;
            case 'login':
                newPath = '/login';
                break;
            case 'post':
                newPath = '/events/new';
                break;
            case 'event-success':
                newPath = '/events/success';
                break;
            case 'detail':
                newPath = `/events/${event?.id || 'detail'}`;
                break;
            case 'reset-password':
                newPath = '/reset-password';
                break;
            default:
                newPath = '/';
        }
        
        // Update browser URL without page reload
        if (window.location.pathname !== newPath) {
            window.history.pushState({}, '', newPath);
        }
    };

    // Check authentication status on app load
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Check if we have a token
                if (!authHelper.isAuthenticated()) {
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                    return;
                }

                // Check regular user authentication
                const response = await authHelper.fetchWithAuth('/api/auth/status');
                const data = await response.json();
                
                if (data.success && data.isAuthenticated) {
                    setIsAuthenticated(true);
                    setUserRole(data.user?.role); // Store user role
                    setUserEmail(data.user?.email); // Store user email
                } else {
                    setIsAuthenticated(false);
                    setUserRole(null); // Clear user role
                    setUserEmail(null); // Clear user email
                    authHelper.clearToken();
                }

                // Check admin authentication status
                const adminResponse = await authHelper.fetchWithAuth('/api/admin/status');
                const adminData = await adminResponse.json();
                console.log('🔍 Admin status check on page load:', adminData);
                setIsAdmin(adminData.isAdmin || false);
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                setUserRole(null); // Clear user role
                setUserEmail(null); // Clear user email
                setIsAdmin(false); // Clear admin status
                authHelper.clearToken();
            }
        };

        checkAuthStatus();

        // Handle URL-based routing
        const handleUrlRouting = () => {
            const path = window.location.pathname;
            console.log('URL routing - current path:', path);
            
            if (path === '/admin') {
                setRoute('admin');
            } else if (path.includes('reset-password') || new URLSearchParams(window.location.search).get('token')) {
                setRoute('reset-password');
            } else if (path === '/login') {
                setRoute('login');
            } else if (path === '/post' || path === '/events/new') {
                setRoute('post');
            } else if (path === '/events/success') {
                setRoute('event-success');
            } else if (path.startsWith('/events/') && path !== '/events/new' && path !== '/events/success') {
                // Handle event detail routes
                const eventId = path.split('/events/')[1];
                if (eventId) {
                    // For now, just go to feed - we can enhance this later
                    setRoute('feed');
                }
            } else {
                setRoute('feed');
            }
        };

        // Set initial route based on URL
        handleUrlRouting();

        // Listen for browser back/forward buttons
        window.addEventListener('popstate', handleUrlRouting);

        // Cleanup
        return () => {
            window.removeEventListener('popstate', handleUrlRouting);
        };
    }, []);

    // Check admin status on every route change
    useEffect(() => {
        const checkAdminStatusOnRouteChange = async () => {
            try {
                console.log('🔄 Checking admin status for route:', route);
                // Check admin authentication status using token
                const adminResponse = await authHelper.fetchWithAuth('/api/admin/status');
                const adminData = await adminResponse.json();
                console.log('🔍 Admin status check on route change:', adminData);
                setIsAdmin(adminData.isAdmin || false);
                
                // If we're going to admin route and not logged in, show login form
                if (route === 'admin' && !adminData.isAdmin) {
                    console.log('❌ Not admin, will show login form');
                } else if (route === 'admin' && adminData.isAdmin) {
                    console.log('✅ Admin token found, will show dashboard');
                }
            } catch (error) {
                console.error('Admin status check failed:', error);
                setIsAdmin(false);
            }
        };

        checkAdminStatusOnRouteChange();
    }, [route]); // This runs every time the route changes

    const handleLoginSuccess = async () => {
        // Verify the token was stored successfully
        try {
            const response = await authHelper.fetchWithAuth('/api/auth/status');
            const data = await response.json();
            
            if (data.success && data.isAuthenticated) {
                setIsAuthenticated(true);
                setUserRole(data.user?.role); // Store user role
                setUserEmail(data.user?.email); // Store user email
                
                // Check admin status after login
                const adminResponse = await authHelper.fetchWithAuth('/api/admin/status');
                const adminData = await adminResponse.json();
                setIsAdmin(adminData.isAdmin || false);
                
                handleNavigate('feed');
            } else {
                console.error('Token verification failed');
                alert('Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            alert('Login failed. Please try again.');
        }
    };

    const handleLogout = async () => {
        // Clear token
        authHelper.clearToken();
        setIsAuthenticated(false);
        setUserRole(null); // Clear user role
        setUserEmail(null); // Clear user email
        setIsAdmin(false); // Clear admin status
        handleNavigate('feed');
    };

    const handleAdminLogin = async () => {
        console.log('🔄 Admin login callback triggered');
        console.log('🔑 Current token:', authHelper.getToken());
        // Re-check admin status after login
        try {
            const adminResponse = await authHelper.fetchWithAuth('/api/admin/status');
            console.log('📡 Admin status response:', adminResponse.status);
            const adminData = await adminResponse.json();
            console.log('📊 Admin status data:', adminData);
            setIsAdmin(adminData.isAdmin || false);
            console.log('✅ Admin status updated in state:', adminData.isAdmin);
            
            // Also update authenticated state
            if (adminData.isAdmin) {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('❌ Failed to check admin status:', error);
            setIsAdmin(false);
        }
    };

    // Data fetching logic (from GET /api/auth/public-events)
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                // Try API first, fallback to sample data
                try {
                    const response = await fetch(getApiUrl('/api/events/public-events'), {
                    credentials: 'include'
                }); 
                    if (response.ok) {
                const data = await response.json();
                        setEvents(data.events || data || []);
                        return;
                    }
                } catch (apiError) {
                    console.log('API not available, using sample data');
                }
                
                // Fallback to sample data
                const sampleEvents = [
                    {
                        id: '1',
                        title: 'Sample Event 1',
                        description: 'This is a sample event for testing your Desi Events Leeds app!',
                        date: '2024-12-15',
                        time: '19:00',
                        locationText: 'Leeds Town Hall',
                        category: 'Cultural',
                        contactEmail: 'test@example.com',
                        contactPhone: '123-456-7890',
                        bookingLink: 'https://example.com',
                        imageUrl: '',
                        approvalStatus: 'approved',
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        userId: 'sample-user-id'
                    },
                    {
                        id: '2',
                        title: 'Sample Event 2',
                        description: 'Another sample event to showcase your community platform.',
                        date: '2024-12-20',
                        time: '18:30',
                        locationText: 'Community Center',
                        category: 'Social',
                        contactEmail: 'test2@example.com',
                        contactPhone: '098-765-4321',
                        bookingLink: 'https://example2.com',
                        imageUrl: '',
                        approvalStatus: 'approved',
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        userId: 'sample-user-id-2'
                    },
                    {
                        id: '3',
                        title: 'Cultural Festival',
                        description: 'Join us for an amazing cultural festival celebrating diversity in Leeds.',
                        date: '2024-12-25',
                        time: '17:00',
                        locationText: 'City Center',
                        category: 'Cultural',
                        contactEmail: 'festival@example.com',
                        contactPhone: '555-123-4567',
                        bookingLink: 'https://festival.com',
                        imageUrl: '',
                        approvalStatus: 'approved',
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        userId: 'sample-user-id-3'
                    }
                ];
                
                console.log('✅ Using sample events:', sampleEvents);
                setEvents(sampleEvents);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (route === 'feed') {
            fetchEvents();
        }
    }, [route]);

    // Render the correct view based on the current route
    const renderContent = () => {
        console.log('Current route:', route, 'Selected event:', selectedEvent);
        console.log('Window location:', window.location.pathname);
        switch (route) {
            case 'feed':
                return <EventFeedView events={events} loading={loading} error={error} onNavigate={handleNavigate} />;
            case 'login':
                return <AuthView onLoginSuccess={handleLoginSuccess} />;
            case 'detail':
                return <EventDetailView event={selectedEvent} onNavigate={handleNavigate} />;
            case 'post':
                return <EventFormView onSuccess={() => handleNavigate('event-success')} />;
            case 'event-success':
                return <EventSuccessView onNavigate={handleNavigate} />;
            case 'admin':
                return <AdminDashboardView onNavigate={handleNavigate} onAdminLogin={handleAdminLogin} />;
            case 'reset-password':
                return <ResetPasswordJS />;
            default:
                return <EventFeedView events={events} loading={loading} error={error} onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <Header onNavigate={handleNavigate} isAuthenticated={isAuthenticated} onLogout={handleLogout} userRole={userRole} userEmail={userEmail} isAdmin={isAdmin} />
            {renderContent()}
        </div>
    );
};

export default App;
