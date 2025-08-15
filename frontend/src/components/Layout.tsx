import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Target, Home, Brain, MessageCircle, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);

  // Debug: Log user data to console (comment out for production)
  // React.useEffect(() => {
  //   if (user) {
  //     console.log('User data:', user);
  //     console.log('Profile picture URL:', user.profilePicture);
  //   }
  // }, [user]);

  // Try to fix Google Photos URL to bypass CORS
  const getWorkingAvatarUrl = () => {
    if (!user?.profilePicture) return null;
    
    const originalUrl = user.profilePicture;
    
    // Extract the photo ID from the URL
    // Google photos URLs look like: https://lh3.googleusercontent.com/a/ACg8ocKy...=s200-c
    // We want to try different formats that might work better
    
    // Try removing the =s200-c parameter entirely (sometimes works better)
    const noSizeParam = originalUrl.split('=')[0];
    
    // Try a smaller size with different parameters
    const smallerSize = originalUrl.replace(/=s\d+-c/, '=s64');
    
    // Try without the -c parameter
    const noCropParam = originalUrl.replace(/=s\d+-c/, '=s96');
    
    // console.log('Trying avatar URLs:', {
    //   original: originalUrl,
    //   noSize: noSizeParam,
    //   smaller: smallerSize,
    //   noCrop: noCropParam
    // });
    
    // Return the smaller size version first
    return smallerSize;
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleImageError = () => {
    // const attemptedUrl = getWorkingAvatarUrl() || user?.profilePicture;
    // console.log('Profile image failed to load:', attemptedUrl);
    // console.log('Original Google URL:', user?.profilePicture);
    setImageError(true);
  };

  const handleImageLoad = () => {
    // const loadedUrl = getWorkingAvatarUrl() || user?.profilePicture;
    // console.log('Profile image loaded successfully:', loadedUrl);
    setImageError(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Analyzer', href: '/analyzer', icon: Brain },
    { name: 'My Goals', href: '/goals', icon: Target },
    { name: 'AI Chat', href: '/chat', icon: MessageCircle },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">DreamPlan AI</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.href)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            {/* Avatar with fallback */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {user?.profilePicture && !imageError ? (
                <img
                  src={getWorkingAvatarUrl() || user.profilePicture}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {user?.name ? (
                    <span className="text-white font-semibold text-sm">
                      {getInitials(user.name)}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;