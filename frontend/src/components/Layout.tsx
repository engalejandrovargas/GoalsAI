import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Target, Home, Sparkles, MessageCircle, BarChart3, Settings, LogOut, User, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);

  // Debug: Log user data to console (comment out for production)
  // React.useEffect(() => {
  //   console.log('Layout - User data:', user);
  //   if (user) {
  //     console.log('Layout - Profile picture URL:', user.profilePicture);
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
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview & goals' },
    { name: 'AI Analyzer', href: '/analyzer', icon: Sparkles, description: 'Goal feasibility' },
    { name: 'AI Chat', href: '/chat', icon: MessageCircle, description: 'Get guidance' },
    { name: 'Progress', href: '/progress', icon: BarChart3, description: 'Track achievements' },
    { name: 'Settings', href: '/settings', icon: Settings, description: 'Preferences' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Beautiful Sidebar */}
      <div className={`w-72 ${colors.sidebarBackground} shadow-xl flex flex-col h-screen fixed left-0 top-0`}>
        {/* Logo */}
        <div className={`flex items-center px-6 py-6 border-b ${colors.sidebarBorder}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${colors.sidebarText}`}>DreamPlan AI</h1>
            <p className={`text-xs ${colors.sidebarTextSecondary}`}>Turn dreams into plans</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.href)}
                    className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? colors.sidebarActive
                        : `${colors.sidebarText} ${colors.sidebarHover}`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-black/10 group-hover:bg-black/20'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? colors.sidebarActiveText : `${colors.sidebarTextSecondary} group-hover:${colors.sidebarText}`}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${isActive ? colors.sidebarActiveText + ' opacity-70' : `${colors.sidebarTextSecondary} group-hover:${colors.sidebarTextSecondary}`}`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className={`border-t ${colors.sidebarBorder} p-4 mt-auto`} style={{ minHeight: '80px', zIndex: 10 }}>
          <div className={`flex items-center p-3 rounded-xl border ${colors.sidebarBorder} ${colors.sidebarProfileBackground} shadow-lg`}>
            {/* Avatar with fallback */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
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
                    <span className="text-white font-bold text-sm">
                      {getInitials(user.name)}
                    </span>
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className={`text-sm font-semibold ${colors.sidebarText} truncate`}>
                {user?.name || 'Loading...'}
              </p>
              <p className={`text-xs ${colors.sidebarTextSecondary} truncate`}>
                {user?.email || 'Please wait...'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className={`ml-3 p-2 ${colors.sidebarTextSecondary} hover:${colors.sidebarText} transition-colors rounded-lg hover:${colors.sidebarProfileBackground}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ml-72 ${colors.background}`}>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;