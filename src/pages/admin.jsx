import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Heart, 
  UserX, 
  Search, 
  Filter,
  Send,
  Trash2,
  Ban,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Calendar,
  Bell,
  TrendingUp,
  Shield,
  Crown,
  Activity,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Star,
  Clock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserPlus,
  FileCheck,
  FileX,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Award,
  Gift,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notificationData, setNotificationData] = useState({
    title: '',
    description: '',
    sendToAll: false,
    selectedUsers: []
  });

  // Mock data - replace with actual API calls
  const mockData = {
    stats: {
      totalUsers: 1234,
      totalBlogs: 567,
      bannedUsers: 23,
      totalLikes: 8901,
      totalComments: 3456
    },
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', posts: 15, status: 'active', signupDate: '2024-01-15', avatar: 'JD' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', posts: 8, status: 'active', signupDate: '2024-02-20', avatar: 'JS' },
      { id: 3, name: 'Bob Wilson', email: 'bob@example.com', posts: 0, status: 'banned', bannedDate: '2024-03-10', avatar: 'BW' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', posts: 12, status: 'active', signupDate: '2024-01-30', avatar: 'AB' },
    ],
    blogs: [
      { id: 1, title: 'Getting Started with React', author: 'John Doe', category: 'Technology', date: '2024-03-15', status: 'published', views: 1250 },
      { id: 2, title: 'CSS Best Practices', author: 'Jane Smith', category: 'Design', date: '2024-03-14', status: 'published', views: 890 },
      { id: 3, title: 'JavaScript Tips', author: 'Alice Brown', category: 'Programming', date: '2024-03-13', status: 'draft', views: 0 },
    ],
    dailyPosts: [12, 15, 8, 20, 18, 25, 22],
    userSignups: [45, 52, 38, 61, 55, 48, 67, 59, 42, 51, 58, 63, 49, 56, 62, 47, 53, 60, 44, 50, 57, 64, 46, 54, 61, 48, 55, 59, 52, 47]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-purple-600' },
    { id: 'users', label: 'Manage Users', icon: Users, color: 'from-green-500 to-teal-600' },
    { id: 'blogs', label: 'All Blogs', icon: FileText, color: 'from-orange-500 to-red-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-pink-500 to-rose-600' },
    { id: 'account', label: 'Account', icon: Settings, color: 'from-indigo-500 to-purple-600' }
  ];

  const handleBanUser = (userId) => {
    console.log('Banning user:', userId);
  };

  const handleUnbanUser = (userId) => {
    console.log('Unbanning user:', userId);
  };

  const handleDeleteBlog = (blogId) => {
    console.log('Deleting blog:', blogId);
  };

  const handleSendNotification = () => {
    console.log('Sending notification:', notificationData);
  };

  const filteredUsers = mockData.users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlogs = mockData.blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = filteredUsers.filter(user => user.status === 'active');
  const bannedUsers = filteredUsers.filter(user => user.status === 'banned');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Super Admin
                  </h1>
                  <p className="text-sm text-gray-600">BlogHive Platform Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{mockData.stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-blue-100 ml-2">+12% from last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Blogs</p>
                      <p className="text-3xl font-bold">{mockData.stats.totalBlogs.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-green-100 ml-2">+8% from last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Banned Users</p>
                      <p className="text-3xl font-bold">{mockData.stats.bannedUsers}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <UserX className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <AlertTriangle className="h-4 w-4 text-red-300" />
                    <span className="text-sm text-red-100 ml-2">-5% from last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm font-medium">Total Likes</p>
                      <p className="text-3xl font-bold">{mockData.stats.totalLikes.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Heart className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-pink-300" />
                    <span className="text-sm text-pink-100 ml-2">+15% from last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Comments</p>
                      <p className="text-3xl font-bold">{mockData.stats.totalComments.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-purple-300" />
                    <span className="text-sm text-purple-100 ml-2">+22% from last month</span>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Daily New Posts (Last 7 Days)</h3>
                  </div>
                  <div className="flex items-end space-x-2 h-32">
                    {mockData.dailyPosts.map((value, index) => (
                      <div key={index} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg shadow-lg" style={{ height: `${(value / 25) * 100}%` }}>
                        <div className="text-xs text-center text-white mt-1 font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-4 font-medium">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <span key={index}>{day}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">User Signups (Last 30 Days)</h3>
                  </div>
                  <div className="flex items-end space-x-1 h-32">
                    {mockData.userSignups.map((value, index) => (
                      <div key={index} className="flex-1 bg-gradient-to-t from-green-500 to-green-600 rounded-t-lg shadow-lg" style={{ height: `${(value / 70) * 100}%` }}>
                        <div className="text-xs text-center text-white mt-1 font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-4 font-medium">Last 30 days</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <Button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </div>
              </div>

              {/* Active Users */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{activeUsers.length}</span>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-green-500 to-teal-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Posts</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Signup Date</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {user.avatar}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">ID: {user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {user.posts} posts
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.signupDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                onClick={() => handleBanUser(user.id)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                              >
                                <Ban className="h-4 w-4" />
                                <span>Ban User</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Banned Users */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                    <UserMinus className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Banned Users</h3>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">{bannedUsers.length}</span>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-red-500 to-red-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Banned Date</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bannedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {user.avatar}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">ID: {user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.bannedDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                onClick={() => handleUnbanUser(user.id)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                              >
                                <Unlock className="h-4 w-4" />
                                <span>Unban User</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">All Blogs</h2>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <Button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-orange-500 to-red-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Blog</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Author</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Views</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBlogs.map((blog) => (
                        <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                              <div className="text-sm text-gray-500">ID: {blog.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blog.author}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium">
                              {blog.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4 text-gray-400" />
                              <span>{blog.views.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blog.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              blog.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {blog.status === 'published' ? (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Published</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Draft</span>
                                </div>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </Button>
                              <Button
                                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                              >
                                {blog.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span>{blog.status === 'published' ? 'Unpublish' : 'Publish'}</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Send Notifications</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notification Form */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Send className="h-5 w-5 text-pink-600" />
                    <span>Create Notification</span>
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Title
                      </label>
                      <input
                        type="text"
                        value={notificationData.title}
                        onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter notification title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={notificationData.description}
                        onChange={(e) => setNotificationData({...notificationData, description: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter notification description..."
                      />
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                      <input
                        type="checkbox"
                        checked={notificationData.sendToAll}
                        onChange={(e) => setNotificationData({...notificationData, sendToAll: e.target.checked})}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Send to all users</span>
                        <p className="text-xs text-gray-500">This will send the notification to all active users</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleSendNotification}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg py-3 rounded-xl"
                      disabled={!notificationData.title || !notificationData.description}
                    >
                      <Send className="h-5 w-5" />
                      <span>Send Notification</span>
                    </Button>
                  </div>
                </div>

                {/* User Selection */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Select Users</span>
                  </h3>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 max-h-96 overflow-y-auto border border-gray-200">
                    {mockData.users.filter(user => user.status === 'active').map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 py-3 hover:bg-gray-50/50 rounded-lg px-2 transition-colors">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.avatar}
                        </div>
                        <label htmlFor={`user-${user.id}`} className="text-sm text-gray-700 cursor-pointer">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Account</h2>
              </div>
              
              <div className="max-w-2xl">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-white/20">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      SA
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Super Admin</h3>
                      <p className="text-gray-600">admin@bloghive.com</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg py-3 rounded-xl">
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin; 