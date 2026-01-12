import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/SidebarLayout';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Calendar,
  Heart,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Users,
  MessageCircle,
  FileText,
  PlayCircle,
  Download,
  Share2
} from 'lucide-react';

type TabType = 'dashboard' | 'services' | 'education' | 'wellness' | 'community';

export default function UserDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      active: activeTab === 'dashboard',
      onClick: () => setActiveTab('dashboard')
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: 'Services',
      active: activeTab === 'services',
      onClick: () => setActiveTab('services')
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Education',
      active: activeTab === 'education',
      onClick: () => setActiveTab('education')
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Wellness',
      active: activeTab === 'wellness',
      onClick: () => setActiveTab('wellness')
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Community',
      active: activeTab === 'community',
      onClick: () => setActiveTab('community')
    }
  ];

  const services = [
    {
      id: 1,
      title: 'General Dentistry',
      description: 'Routine checkups, cleanings, and preventive care',
      icon: <CheckCircle className="w-8 h-8 text-[#0b8fac]" />,
      duration: '30-60 mins',
      price: '$50 - $100'
    },
    {
      id: 2,
      title: 'Cosmetic Dentistry',
      description: 'Teeth whitening, veneers, and smile makeovers',
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      duration: '1-2 hours',
      price: '$200 - $500'
    },
    {
      id: 3,
      title: 'Orthodontics',
      description: 'Braces, aligners, and teeth straightening',
      icon: <Award className="w-8 h-8 text-purple-500" />,
      duration: '6-24 months',
      price: '$2000 - $6000'
    },
    {
      id: 4,
      title: 'Emergency Care',
      description: '24/7 urgent dental care services',
      icon: <Clock className="w-8 h-8 text-red-500" />,
      duration: 'Immediate',
      price: 'Varies'
    }
  ];

  const educationalContent = [
    {
      id: 1,
      type: 'Article',
      title: 'Top 10 Dental Care Tips for Healthy Teeth',
      author: 'Dr. Sarah Johnson',
      date: 'Dec 15, 2025',
      readTime: '5 min read',
      image: '📄',
      category: 'Preventive Care'
    },
    {
      id: 2,
      type: 'Video',
      title: 'How to Properly Brush Your Teeth',
      author: 'Dr. Michael Chen',
      date: 'Dec 12, 2025',
      readTime: '8 min watch',
      image: '🎥',
      category: 'Tutorial'
    },
    {
      id: 3,
      type: 'Guide',
      title: 'Understanding Root Canal Treatment',
      author: 'Dr. Emily Davis',
      date: 'Dec 10, 2025',
      readTime: '10 min read',
      image: '📚',
      category: 'Treatment'
    },
    {
      id: 4,
      type: 'Article',
      title: 'Dental Health During Pregnancy',
      author: 'Dr. Lisa Anderson',
      date: 'Dec 8, 2025',
      readTime: '6 min read',
      image: '📄',
      category: 'Special Care'
    }
  ];

  const wellnessTips = [
    {
      id: 1,
      category: 'Daily Routine',
      tips: [
        'Brush teeth twice daily for 2 minutes',
        'Floss at least once per day',
        'Use fluoride toothpaste',
        'Replace toothbrush every 3 months'
      ]
    },
    {
      id: 2,
      category: 'Diet & Nutrition',
      tips: [
        'Limit sugary foods and drinks',
        'Eat calcium-rich foods',
        'Drink plenty of water',
        'Avoid tobacco products'
      ]
    },
    {
      id: 3,
      category: 'Preventive Care',
      tips: [
        'Visit dentist every 6 months',
        'Get professional cleanings',
        'Consider dental sealants',
        'Use mouthwash regularly'
      ]
    }
  ];

  const communityPosts = [
    {
      id: 1,
      author: 'John Smith',
      avatar: 'JS',
      content: 'Just got my teeth whitening done! Amazing results in just one session. Highly recommend Dr. Johnson!',
      likes: 24,
      comments: 5,
      time: '2 hours ago'
    },
    {
      id: 2,
      author: 'Emma Wilson',
      avatar: 'EW',
      content: 'Can anyone recommend a good dentist for kids? My 5-year-old needs her first checkup.',
      likes: 18,
      comments: 12,
      time: '5 hours ago'
    },
    {
      id: 3,
      author: 'David Brown',
      avatar: 'DB',
      content: 'Thanks to the emergency dental care team for seeing me on short notice. Professional service!',
      likes: 31,
      comments: 3,
      time: '1 day ago'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Welcome to Dental Care Portal</h1>
              <p className="text-gray-600 mt-1">Your comprehensive dental health resource</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#0b8fac] to-[#096f85] p-6 rounded-xl shadow-sm text-white">
                <Heart className="w-10 h-10 mb-3 opacity-90" />
                <p className="text-2xl font-bold mb-1">150+</p>
                <p className="text-sm opacity-90">Dental Services</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-sm text-white">
                <BookOpen className="w-10 h-10 mb-3 opacity-90" />
                <p className="text-2xl font-bold mb-1">500+</p>
                <p className="text-sm opacity-90">Educational Articles</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-sm text-white">
                <Users className="w-10 h-10 mb-3 opacity-90" />
                <p className="text-2xl font-bold mb-1">50+</p>
                <p className="text-sm opacity-90">Expert Dentists</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-sm text-white">
                <Award className="w-10 h-10 mb-3 opacity-90" />
                <p className="text-2xl font-bold mb-1">1000+</p>
                <p className="text-sm opacity-90">Happy Patients</p>
              </div>
            </div>

            {/* Featured Services */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.slice(0, 4).map((service) => (
                  <div key={service.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <div className="p-3 bg-white rounded-lg">{service.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">⏱ {service.duration}</span>
                        <span className="text-xs text-[#0b8fac] font-semibold">{service.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Articles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Educational Content</h2>
              <div className="space-y-3">
                {educationalContent.slice(0, 3).map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{content.image}</div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs bg-[#0b8fac] text-white px-2 py-1 rounded">{content.type}</span>
                          <span className="text-xs text-gray-500">{content.category}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{content.title}</h3>
                        <p className="text-sm text-gray-600">{content.author} • {content.date}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{content.readTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Our Dental Services</h1>
              <p className="text-gray-600 mt-1">Comprehensive dental care for all your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-4 bg-gray-50 rounded-xl">{service.icon}</div>
                    <button className="text-[#0b8fac] hover:text-[#096f85] font-semibold text-sm">
                      Book Now →
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{service.duration}</span>
                    </div>
                    <span className="text-lg font-bold text-[#0b8fac]">{service.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Services */}
            <div className="mt-8 bg-gradient-to-r from-[#0b8fac] to-[#096f85] rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Need Custom Treatment?</h2>
              <p className="mb-4 opacity-90">Contact our specialists for personalized dental care plans</p>
              <button className="bg-white text-[#0b8fac] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Contact Specialists
              </button>
            </div>
          </div>
        );

      case 'education':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Educational Resources</h1>
              <p className="text-gray-600 mt-1">Learn about dental health and care</p>
            </div>

            {/* Content Categories */}
            <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
              <button className="px-4 py-2 bg-[#0b8fac] text-white rounded-lg font-medium whitespace-nowrap">
                All Content
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-[#0b8fac] whitespace-nowrap">
                Articles
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-[#0b8fac] whitespace-nowrap">
                Videos
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-[#0b8fac] whitespace-nowrap">
                Guides
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {educationalContent.map((content) => (
                <div key={content.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                  <div className="h-48 bg-gradient-to-br from-[#0b8fac] to-[#096f85] flex items-center justify-center text-6xl">
                    {content.image}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs bg-[#0b8fac] text-white px-2 py-1 rounded">{content.type}</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{content.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{content.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{content.author}</span>
                      <span>{content.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{content.readTime}</span>
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'wellness':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Wellness Tips</h1>
              <p className="text-gray-600 mt-1">Daily habits for optimal dental health</p>
            </div>

            {/* Wellness Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {wellnessTips.map((category) => (
                <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{category.category}</h3>
                  <ul className="space-y-3">
                    {category.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-[#0b8fac] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Health Tracker */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Dental Health Tracker</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Last Dental Visit</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-1">3 months ago</p>
                  <p className="text-sm text-gray-600">Next checkup due in 3 months</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Oral Health Score</h3>
                  <p className="text-3xl font-bold text-green-600 mb-1">85/100</p>
                  <p className="text-sm text-gray-600">Good - Keep up the routine!</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'community':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
              <p className="text-gray-600 mt-1">Connect with others and share experiences</p>
            </div>

            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <textarea
                placeholder="Share your dental care experience or ask a question..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button className="bg-[#0b8fac] text-white px-6 py-2 rounded-lg hover:bg-[#096f85] transition font-semibold">
                  Post
                </button>
              </div>
            </div>

            {/* Community Posts */}
            <div className="space-y-4">
              {communityPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#0b8fac] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{post.author}</h3>
                        <span className="text-sm text-gray-500">{post.time}</span>
                      </div>
                      <p className="text-gray-700 mb-4">{post.content}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <button className="flex items-center space-x-2 hover:text-[#0b8fac] transition">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes} likes</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-[#0b8fac] transition">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments} comments</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-[#0b8fac] transition">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarLayout
      menuItems={menuItems}
      userName={user?.full_name || ''}
      userRole="User"
      onLogout={signOut}
    >
      <div className="p-8">
        {renderContent()}
      </div>
    </SidebarLayout>
  );
}
