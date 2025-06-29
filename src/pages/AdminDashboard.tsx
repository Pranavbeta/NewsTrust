import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye,
  Ban,
  Clock,
  BarChart3,
  Database,
  Settings as SettingsIcon,
  Languages,
  Bug,
  Pencil,
  Trash2,
  Plus,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNews } from '../contexts/NewsContext';
import NewsAPIStatus from '../components/NewsAPIStatus';
import EdgeFunctionTester from '../components/EdgeFunctionTester';
import TranslationDebugPanel from '../components/TranslationDebugPanel';
import TranslationDebugger from '../components/TranslationDebugger';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface UserReport {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

const TrendingTopicsManager: React.FC = () => {
  const [topics, setTopics] = useState<{ id: string, topic: string }[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTopics = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('trending_topics').select('*').order('created_at', { ascending: false });
    if (!error) setTopics(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleAdd = async () => {
    if (!newTopic.trim()) return;
    setLoading(true);
    await supabase.from('trending_topics').insert({ topic: newTopic.trim() });
    setNewTopic('');
    fetchTopics();
  };

  const handleEdit = (id: string, topic: string) => {
    setEditingId(id);
    setEditingValue(topic);
  };

  const handleSave = async (id: string) => {
    setLoading(true);
    await supabase.from('trending_topics').update({ topic: editingValue.trim() }).eq('id', id);
    setEditingId(null);
    setEditingValue('');
    fetchTopics();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await supabase.from('trending_topics').delete().eq('id', id);
    fetchTopics();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Trending Topics</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newTopic}
          onChange={e => setNewTopic(e.target.value)}
          placeholder="Add new topic..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center" disabled={loading}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {topics.map(t => (
          <li key={t.id} className="flex items-center justify-between py-2">
            {editingId === t.id ? (
              <>
                <input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded"
                />
                <button onClick={() => handleSave(t.id)} className="text-green-600 ml-2"><Save className="h-4 w-4" /></button>
                <button onClick={() => setEditingId(null)} className="text-gray-500 ml-1"><X className="h-4 w-4" /></button>
              </>
            ) : (
              <>
                <span>{t.topic}</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEdit(t.id, t.topic)} className="text-blue-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { articles } = useNews();
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'users' | 'comments' | 'reports' | 'newsapi' | 'debug' | 'translation' | 'hooks' | 'submissions'>('overview');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const mockUserReports: UserReport[] = [
    {
      id: '1',
      userId: '123',
      userName: 'john_user',
      reason: 'Spreading misinformation',
      reportedAt: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      userId: '456',
      userName: 'jane_commenter',
      reason: 'Toxic behavior in comments',
      reportedAt: '2024-01-15T09:15:00Z',
      status: 'pending'
    }
  ];

  const stats = useMemo(() => {
    const totalVotes = articles.reduce((sum, article) => 
      sum + article.votes.valid + article.votes.fake + article.votes.not_sure, 0
    );
    
    return {
      totalArticles: articles.length,
      pendingReview: articles.filter(a => a.admin_status === 'pending').length,
      verifiedArticles: articles.filter(a => a.admin_status === 'valid').length,
      disputedArticles: articles.filter(a => a.admin_status === 'fake').length,
      totalVotes,
      totalUsers: 1247, // Mock data
      activeUsers: 892, // Mock data
      pendingReports: mockUserReports.filter(r => r.status === 'pending').length,
      translatedArticles: articles.filter(a => a.isTranslated).length,
    };
  }, [articles]);

  // Fetch submissions for admin
  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      console.log('Fetching submissions...');
      console.log('User ID:', user?.id);
      console.log('Is Admin:', profile?.is_admin);
      
      // First, let's check if the table exists and get its structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('submissions')
        .select('*')
        .limit(1);
      
      console.log('Table check result:', { tableInfo, tableError });
      
      if (tableError) {
        console.error('Table access error:', tableError);
        setSubmissions([]);
        return;
      }
      
      // Now fetch all submissions
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Full query result:', { data, error });
      
      if (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } else {
        console.log('Submissions fetched successfully:', data);
        console.log('Submissions count:', data?.length || 0);
        setSubmissions(data || []);
      }
    } catch (err) {
      console.error('Exception fetching submissions:', err);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab]);

  // Also fetch submissions when component mounts if user is admin
  useEffect(() => {
    if (user && profile?.is_admin && activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [user, profile?.is_admin, activeTab]);

  // Approve/reject actions
  const handleSubmissionAction = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('submissions').update({ status }).eq('id', id);
    fetchSubmissions();
  };

  if (!user || !profile?.is_admin) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to access the admin dashboard.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: BarChart3 },
    { id: 'translation' as const, name: 'Translation', icon: Languages },
    { id: 'hooks' as const, name: 'Hook Debug', icon: Bug },
    { id: 'debug' as const, name: 'Debug', icon: SettingsIcon },
    { id: 'newsapi' as const, name: 'News API', icon: Database },
    { id: 'articles' as const, name: 'Articles', icon: FileText },
    { id: 'users' as const, name: 'Users', icon: Users },
    { id: 'comments' as const, name: 'Comments', icon: MessageSquare },
    { id: 'reports' as const, name: 'Reports', icon: AlertTriangle },
    { id: 'submissions' as const, name: 'Submissions', icon: FileText },
  ];

  const handleArticleAction = (articleId: string, action: 'valid' | 'fake' | 'pending') => {
    // This would update the article's admin validation status
    console.log(`Setting article ${articleId} as ${action}`);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalArticles}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Translated</p>
              <p className="text-2xl font-bold text-purple-600">{stats.translatedArticles}</p>
            </div>
            <Languages className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Languages className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Articles translated to multiple languages</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stats.translatedArticles} articles available in other languages</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">New article pending review</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submitted 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Article verified and published</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">User reported for spam</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reported 6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTranslation = () => (
    <div className="space-y-6">
      <TranslationDebugPanel />
    </div>
  );

  const renderHookDebug = () => (
    <div className="space-y-6">
      <TranslationDebugger />
    </div>
  );

  const renderDebug = () => (
    <div className="space-y-6">
      <EdgeFunctionTester />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Environment Check</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Supabase URL</span>
            <span className={`text-sm ${import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
              {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Supabase Anon Key</span>
            <span className={`text-sm ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsAPI = () => (
    <div className="space-y-6">
      <NewsAPIStatus />
    </div>
  );

  const renderArticles = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Article Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Translation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Votes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {articles.slice(0, 10).map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {article.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      article.admin_status === 'valid' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                      article.admin_status === 'fake' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {article.admin_status === 'valid' ? 'Verified' :
                       article.admin_status === 'fake' ? 'Disputed' : 'Under Review'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {article.isTranslated ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                        <Languages className="h-3 w-3 mr-1" />
                        {article.translatedLanguage?.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Original</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {article.votes.valid + article.votes.fake + article.votes.not_sure}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {article.source}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleArticleAction(article.id, 'valid')}
                        className="text-green-600 hover:text-green-800"
                        title="Mark as Valid"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleArticleAction(article.id, 'fake')}
                        className="text-red-600 hover:text-red-800"
                        title="Mark as Fake"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">User management interface would be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComments = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comment Moderation</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Comment moderation interface would be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockUserReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {report.userName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                      report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800" title="Review">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="Ban User">
                        <Ban className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-400 mb-2">Debug Info</h4>
        <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
          <p>Loading: {submissionsLoading ? 'Yes' : 'No'}</p>
          <p>Submissions count: {submissions.length}</p>
          <p>User ID: {user?.id || 'Not logged in'}</p>
          <p>Is Admin: {profile?.is_admin ? 'Yes' : 'No'}</p>
          <p>Active Tab: {activeTab}</p>
        </div>
        <div className="mt-3 space-x-2">
          <button
            onClick={fetchSubmissions}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
          >
            Refresh Submissions
          </button>
          <button
            onClick={async () => {
              console.log('=== MANUAL TEST ===');
              console.log('Testing direct table access...');
              const { data, error } = await supabase
                .from('submissions')
                .select('count')
                .limit(1);
              console.log('Count test:', { data, error });
              
              // Test with different query
              const { data: allData, error: allError } = await supabase
                .from('submissions')
                .select('*');
              console.log('All data test:', { allData, allError });
              
              // Test RLS by checking if we can see any rows
              const { data: rlsTest, error: rlsError } = await supabase
                .from('submissions')
                .select('id, title, user_id')
                .limit(5);
              console.log('RLS test:', { rlsTest, rlsError });
              
              // Test with service role (if available)
              if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
                console.log('Testing with service role...');
                const serviceSupabase = createClient(
                  import.meta.env.VITE_SUPABASE_URL,
                  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
                );
                const { data: serviceData, error: serviceError } = await serviceSupabase
                  .from('submissions')
                  .select('*');
                console.log('Service role test:', { serviceData, serviceError });
              }
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Test Query
          </button>
          <button
            onClick={async () => {
              console.log('=== LIST ALL TABLES ===');
              // Try to query information_schema to see available tables
              try {
                const { data: tables, error: tablesError } = await supabase
                  .from('information_schema.tables')
                  .select('table_name')
                  .eq('table_schema', 'public');
                console.log('Available tables:', { tables, tablesError });
              } catch (e) {
                console.log('Cannot access information_schema:', e);
              }
              
              // Test other known tables
              const knownTables = ['news', 'profiles', 'votes', 'comments', 'submissions'];
              for (const tableName of knownTables) {
                try {
                  const { data, error } = await supabase
                    .from(tableName)
                    .select('count')
                    .limit(1);
                  console.log(`Table ${tableName}:`, { data, error });
                } catch (e) {
                  console.log(`Table ${tableName} error:`, e);
                }
              }
            }}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            List Tables
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">News Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          {submissionsLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No submissions found.</p>
              <p className="text-sm mt-2">This could mean:</p>
              <ul className="text-sm text-gray-400 mt-1">
                <li>• No submissions have been made yet</li>
                <li>• There's an issue with the database query</li>
                <li>• The submissions table is empty</li>
              </ul>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{sub.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{sub.user_id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        sub.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                        sub.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                        'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                      }`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(sub.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSubmissionAction(sub.id, 'approved')}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                          disabled={sub.status === 'approved'}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleSubmissionAction(sub.id, 'rejected')}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                          disabled={sub.status === 'rejected'}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage articles, users, and multilingual content</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {tab.id === 'reports' && stats.pendingReports > 0 && (
                    <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs px-2 py-1 rounded-full">
                      {stats.pendingReports}
                    </span>
                  )}
                  {tab.id === 'translation' && stats.translatedArticles > 0 && (
                    <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                      {stats.translatedArticles}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <TrendingTopicsManager />
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'translation' && renderTranslation()}
          {activeTab === 'hooks' && renderHookDebug()}
          {activeTab === 'debug' && renderDebug()}
          {activeTab === 'newsapi' && renderNewsAPI()}
          {activeTab === 'articles' && renderArticles()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'comments' && renderComments()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'submissions' && renderSubmissions()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;