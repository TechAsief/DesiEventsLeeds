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
  const [name, setName] = useState('');
  const [currentRoute, setCurrentRoute] = useState('feed');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
    }
  }, [currentRoute]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth';
      const body = isLogin 
        ? { email, password }
        : { name, email, password };

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
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
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

  const renderContent = () => {
    switch (currentRoute) {
      case 'login':
        return renderLoginForm();
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
