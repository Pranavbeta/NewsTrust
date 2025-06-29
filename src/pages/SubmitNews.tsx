import React, { useState } from 'react';
import { Plus, ExternalLink, AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNews } from '../contexts/NewsContext';
import { supabase } from '../lib/supabase';
import { commentModerationService } from '../lib/commentModeration';

const SubmitNews: React.FC = () => {
  const { user } = useAuth();
  const { submitNews } = useNews();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sourceUrl: '',
    category: 'all' as const,
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'General' },
    { id: 'politics', name: 'Politics' },
    { id: 'business', name: 'Business' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'conflicts', name: 'Conflicts' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      // Rate limit: max 3 submissions per user per 24 hours
      const { data: recentSubs, error: rateError } = await supabase
        .from('submissions')
        .select('id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      if ((recentSubs?.length || 0) >= 3) {
        setErrorMsg('Rate limit exceeded. You can only submit 3 news articles per 24 hours.');
        setSubmitting(false);
        return;
      }
      // Spam/toxicity check
      const titleCheck = await commentModerationService.checkToxicity(formData.title);
      const contentCheck = await commentModerationService.checkToxicity(formData.content);
      if (titleCheck.isToxic || contentCheck.isToxic) {
        setErrorMsg('Submission blocked due to inappropriate or spammy content.');
        setSubmitting(false);
        return;
      }
      // Submit via Edge Function
      // Use access token from user if available, otherwise use anon key
      const accessToken = (user as any)?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch('https://jgaiopkkcplaewibqwaf.supabase.co/functions/v1/submit-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          source_url: formData.sourceUrl,
          category: formData.category,
          location: formData.location
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
      // TODO: Send email to user (placeholder)
      setFormData({
        title: '',
        content: '',
        sourceUrl: '',
        category: 'all',
        location: ''
      });
    } catch (error: any) {
      setErrorMsg(error.message || 'Submission failed. Please try again.');
      console.error('Submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">
            Please sign in to submit news articles for community verification.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Submission Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your news submission has been received and is now under review by our moderation team. 
            It will appear in the feed once approved.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Another Article
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Plus className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submit News</h1>
            <p className="text-gray-600">Share news for community verification</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Submission Guidelines</h3>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Only submit factual news from credible sources</li>
                <li>• Include original source URL for verification</li>
                <li>• Provide accurate titles and summaries</li>
                <li>• Avoid duplicate submissions</li>
                <li>• All submissions undergo moderation before publication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              News Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the news headline..."
              required
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/200 characters
            </div>
          </div>

          {/* Source URL */}
          <div>
            <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Source URL *
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="url"
                id="sourceUrl"
                name="sourceUrl"
                value={formData.sourceUrl}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/news-article"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Article Summary *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide a detailed summary of the news article..."
              required
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.content.length}/1000 characters
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || !formData.title || !formData.content || !formData.sourceUrl}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>What makes a good submission?</strong><br />
            Submit news from recognized, credible sources with clear headlines and accurate summaries.
          </p>
          <p>
            <strong>How long does review take?</strong><br />
            Most submissions are reviewed within 24 hours by our moderation team.
          </p>
          <p>
            <strong>What happens after approval?</strong><br />
            Approved articles appear in the main feed where the community can vote and discuss their authenticity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmitNews;