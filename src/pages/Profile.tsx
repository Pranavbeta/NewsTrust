import React, { useState } from 'react';
import { User, Settings, Bell, Shield, LogOut, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNews } from '../contexts/NewsContext';

function getUserAlt(user: any): string {
  if (typeof user.user_metadata?.full_name === 'string') return user.user_metadata.full_name;
  if (typeof user.email === 'string') return user.email;
  return 'User Avatar';
}

function getUserAvatar(user: any): string {
  return typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url
    ? user.user_metadata.avatar_url
    : '/default-avatar.png';
}

const Profile: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { articles } = useNews();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.user_metadata?.full_name ?? user?.email ?? '',
    email: user?.email ?? '',
    bio: '',
    notifications: {
      email: true,
      push: false,
      news: true,
      comments: true
    }
  });

  if (!user) {
    return (
      <div className="bg-black dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Not Signed In</h2>
        <p className="text-gray-200">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  const userStats = {
    articlesVoted: Math.floor(Math.random() * 50) + 10,
    commentsPosted: Math.floor(Math.random() * 30) + 5,
    articlesSubmitted: Math.floor(Math.random() * 10) + 1,
    helpfulVotes: Math.floor(Math.random() * 100) + 20,
    joinDate: '2024-01-01', // Mock join date
    credibilityScore: Math.floor(Math.random() * 40) + 60
  };

  const handleSaveProfile = () => {
    // In a real app, this would save to the backend
    console.log('Saving profile:', editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user.user_metadata?.full_name ?? user.email ?? '',
      email: user.email ?? '',
      bio: '',
      notifications: {
        email: true,
        push: false,
        news: true,
        comments: true
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-black dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={getUserAvatar(user)}
              alt={getUserAlt(user) || 'User avatar'}
              className="h-20 w-20 rounded-full"
              width="80"
              height="80"
              style={{ aspectRatio: '1/1' }}
            />
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold text-white bg-transparent border-b border-gray-500 focus:border-blue-500 outline-none placeholder-gray-300"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="text-white bg-transparent border-b border-gray-500 focus:border-blue-500 outline-none placeholder-gray-300"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white">{user.user_metadata?.full_name || user.email}</h1>
                  <p className="text-gray-300">{user.email}</p>
                </>
              )}
              
              {(profile?.is_admin || user.email === 'admin@newsverify.com') && (
                <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium mt-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-white mb-2">Bio</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent text-white placeholder-gray-300"
              placeholder="Tell us about yourself..."
            />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black dark:bg-gray-900 p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{userStats.articlesVoted}</div>
            <div className="text-sm text-gray-200">Articles Voted On</div>
          </div>
        </div>
        
        <div className="bg-black dark:bg-gray-900 p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{userStats.commentsPosted}</div>
            <div className="text-sm text-gray-200">Comments Posted</div>
          </div>
        </div>
        
        <div className="bg-black dark:bg-gray-900 p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{userStats.articlesSubmitted}</div>
            <div className="text-sm text-gray-200">Articles Submitted</div>
          </div>
        </div>
        
        <div className="bg-black dark:bg-gray-900 p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{userStats.helpfulVotes}</div>
            <div className="text-sm text-gray-200">Helpful Votes Received</div>
          </div>
        </div>
      </div>

      {/* Credibility Score */}
      <div className="bg-black dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Credibility Score</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-200 mb-2">
              <span>Your Score</span>
              <span>{userStats.credibilityScore}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  userStats.credibilityScore >= 80 ? 'bg-green-400' :
                  userStats.credibilityScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${userStats.credibilityScore}%` }}
              ></div>
            </div>
          </div>
          <div className={`text-2xl font-bold ${
            userStats.credibilityScore >= 80 ? 'text-green-400' :
            userStats.credibilityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {userStats.credibilityScore}
          </div>
        </div>
        <p className="text-sm text-gray-200 mt-3">
          Your credibility score is based on the accuracy of your votes and the helpfulness of your contributions.
        </p>
      </div>

      {/* Notification Settings */}
      <div className="bg-black dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="h-5 w-5 text-gray-200" />
          <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Email Notifications</h3>
              <p className="text-sm text-gray-300">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={editForm.notifications.email}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                notifications: { ...prev.notifications, email: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Push Notifications</h3>
              <p className="text-sm text-gray-300">Receive browser notifications</p>
            </div>
            <input
              type="checkbox"
              checked={editForm.notifications.push}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                notifications: { ...prev.notifications, push: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Breaking News</h3>
              <p className="text-sm text-gray-300">Get notified about breaking news</p>
            </div>
            <input
              type="checkbox"
              checked={editForm.notifications.news}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                notifications: { ...prev.notifications, news: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Comment replies</h3>
              <p className="text-sm text-gray-300">When someone replies to your comments</p>
            </div>
            <input
              type="checkbox"
              checked={editForm.notifications.comments}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                notifications: { ...prev.notifications, comments: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded"
            />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-black dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-200">Member since</span>
            <span className="text-white font-medium">
              {new Date(userStats.joinDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-red-400 hover:text-red-500 font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;