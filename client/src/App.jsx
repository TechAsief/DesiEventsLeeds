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
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
        console.log('📊 Loaded events:', data);
        console.log('📊 First event imageUrl:', data[0]?.imageUrl);
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
      ) : events.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No approved events yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewEventDetails(event)}>
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">📅 {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-sm text-gray-700">📍 {event.locationText}</p>
                </div>
              </div>
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setEventSubmitLoading(true);
    setEventSubmitMessage('');

    try {
      let uploadedImageUrl = null;

      // Upload image first if one is selected
      if (selectedImage) {
        setEventSubmitMessage('Uploading image...');
        
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
          // Using imgur's free anonymous upload API
          const imgurResponse = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
              Authorization: 'Client-ID 546c25a59c58ad7', // Free anonymous client ID
            },
            body: formData,
          });

          const imgurData = await imgurResponse.json();
          console.log('Imgur response:', imgurData);

          if (imgurResponse.ok && imgurData.success) {
            uploadedImageUrl = imgurData.data.link;
            console.log('✅ Image uploaded successfully:', uploadedImageUrl);
            setEventSubmitMessage('Image uploaded! Creating event...');
          } else {
            console.error('❌ Image upload failed:', imgurData);
            alert('Image upload failed: ' + (imgurData.data?.error || 'Unknown error'));
            setEventSubmitMessage('Image upload failed. Creating event without image...');
            // Wait a bit so user can see the error
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (imgError) {
          console.error('❌ Image upload error:', imgError);
          alert('Image upload error: ' + imgError.message);
          setEventSubmitMessage('Image upload failed. Creating event without image...');
          // Wait a bit so user can see the error
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setEventSubmitMessage('Creating event...');

      // Prepare the data, converting empty strings to null for optional fields
      const eventData = {
        ...eventFormData,
        contactPhone: eventFormData.contactPhone || null,
        bookingLink: eventFormData.bookingLink || null,
        imageUrl: uploadedImageUrl || null,
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
        setSelectedImage(null);
        setImagePreview(null);
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
        setShowEventModal(false); // Close modal after approval
        // Reload the appropriate page data
        if (currentRoute === 'my-events') {
          loadMyEvents();
        } else if (currentRoute === 'admin') {
          loadAdminData();
        }
            } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to approve event');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleViewEventDetails = (event) => {
    setSelectedEventDetail(event);
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedEventDetail(null);
  };

  const renderEventDetailModal = () => {
    if (!showEventModal || !selectedEventDetail) return null;

    const event = selectedEventDetail;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseEventModal}>
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                    <button 
                onClick={handleCloseEventModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>
            <p className={`mt-2 text-sm font-semibold ${
              event.approvalStatus === 'approved' ? 'text-green-600' : 
              event.approvalStatus === 'pending' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              Status: {event.approvalStatus}
            </p>
                </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Image */}
            {event.imageUrl && (
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{event.description}</p>
                </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Date</h3>
                <p className="text-gray-600">{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Time</h3>
                <p className="text-gray-600">{event.time}</p>
                    </div>
                                        </div>

            {/* Location */}
                                            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Location</h3>
              <p className="text-gray-600">{event.locationText}</p>
                                            </div>

            {/* Category */}
                                            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Category</h3>
              <p className="text-gray-600 capitalize">{event.category}</p>
                                            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
                                            <div>
                <h3 className="font-semibold text-gray-700 mb-1">Contact Email</h3>
                                                <p className="text-gray-600">{event.contactEmail}</p>
                                            </div>
              {event.contactPhone && (
                                                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Contact Phone</h3>
                  <p className="text-gray-600">{event.contactPhone}</p>
                                                </div>
              )}
                                                </div>

            {/* Booking Link */}
            {event.bookingLink && (
                                                <div>
                <h3 className="font-semibold text-gray-700 mb-1">Booking Link</h3>
                <a href={event.bookingLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline break-all">
                  {event.bookingLink}
                </a>
                                                </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>Event ID: {event.id}</p>
              <p>Created: {new Date(event.createdAt).toLocaleString()}</p>
                                            </div>
                                            </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
            {userRole === 'admin' && event.approvalStatus === 'pending' && (
                                                <button
                onClick={() => handleApproveEvent(event.id)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                                                >
                ✓ Approve Event
                                                </button>
                                            )}
                                            <button
              onClick={() => {
                handleCloseEventModal();
                handleDeleteEvent(event.id);
              }}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
            >
              🗑️ Delete Event
                                            </button>
                                            <button
              onClick={handleCloseEventModal}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
                                            >
              Close
                                            </button>
                                        </div>
            </div>
        </div>
    );
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
              <label className="block text-sm font-medium mb-2">Event Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600 mb-2">Click to upload event image</span>
                    <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                  </label>
                </div>
              )}
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
                    <div className="mb-6">
        <h1 className="text-3xl font-bold">My Events</h1>
        {userRole === 'admin' && (
          <p className="text-sm text-gray-600 mt-2">
            As an admin, you can approve pending events directly from this page or visit the Admin Dashboard for all events.
          </p>
        )}
                    </div>
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
        <div className="grid gap-6 md:grid-cols-2">
          {myEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                onClick={() => handleViewEventDetails(event)}
                className="cursor-pointer hover:opacity-95 transition-opacity"
              >
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-700">📅 {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-sm text-gray-700">🕐 {event.time}</p>
                    <p className="text-sm text-gray-700">📍 {event.locationText}</p>
                  </div>
                  <p className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                    event.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' : 
                    event.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {event.approvalStatus === 'approved' ? '✓ Approved' : event.approvalStatus === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                  </p>
                  <p className="text-xs text-blue-600 mt-3">Click to view full details →</p>
                </div>
              </div>
              <div className="p-6 pt-0 space-y-2">
                {userRole === 'admin' && event.approvalStatus === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveEvent(event.id);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                  >
                    ✓ Approve Event
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event.id);
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
                >
                  🗑️ Delete Event
                </button>
              </div>
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
              <div key={event.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg overflow-hidden">
                <div
                  onClick={() => handleViewEventDetails(event)}
                  className="cursor-pointer hover:bg-yellow-100 transition-colors"
                >
                  {event.imageUrl && (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>📅 {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • 🕐 {event.time}</p>
                      <p>📍 {event.locationText}</p>
                      <p>🏷️ {event.category}</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-3">Click to view full details →</p>
                  </div>
                </div>
                <div className="flex gap-2 p-4 bg-yellow-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEventDetails(event);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                  >
                    📋 View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveEvent(event.id);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                  >
                    ✓ Quick Approve
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
              <div 
                key={event.id} 
                onClick={() => handleViewEventDetails(event)}
                className={`rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  event.approvalStatus === 'approved' ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100' :
                  event.approvalStatus === 'pending' ? 'bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100' :
                  'bg-red-50 border-2 border-red-200 hover:bg-red-100'
                }`}
              >
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                  <p className="text-xs text-gray-700">📅 {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  <p className={`inline-block text-xs font-semibold mt-2 px-2 py-1 rounded ${
                    event.approvalStatus === 'approved' ? 'bg-green-200 text-green-800' :
                    event.approvalStatus === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {event.approvalStatus}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">Click for details →</p>
                </div>
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
      {renderEventDetailModal()}
        </div>
    );
}

export default App;
