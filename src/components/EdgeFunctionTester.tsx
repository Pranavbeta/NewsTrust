import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';

interface TestResult {
  success: boolean;
  message?: string;
  environment?: {
    hasNewsApiKey: boolean;
    hasGNewsApiKey: boolean;
    hasSupabaseUrl: boolean;
    hasServiceKey: boolean;
  };
  error?: string;
  timestamp?: string;
}

const EdgeFunctionTester: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testEdgeFunction = async () => {
    setTesting(true);
    setResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/test-fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (hasValue: boolean) => {
    return hasValue ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edge Function Tester</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Test if Edge Functions are working properly</p>
        </div>
        
        <button
          onClick={testEdgeFunction}
          disabled={testing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {testing ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>{testing ? 'Testing...' : 'Test Function'}</span>
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                result.success ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'
              }`}>
                {result.success ? 'Edge Function Working!' : 'Edge Function Failed'}
              </span>
            </div>
            
            {result.message && (
              <p className={`mt-2 text-sm ${
                result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}>
                {result.message}
              </p>
            )}
            
            {result.error && (
              <p className="mt-2 text-sm text-red-800 dark:text-red-300">
                Error: {result.error}
              </p>
            )}
          </div>

          {/* Environment Variables Status */}
          {result.environment && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Environment Variables</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">NEWS_API_KEY</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.environment.hasNewsApiKey)}
                    <span className="text-sm">
                      {result.environment.hasNewsApiKey ? 'Set' : 'Missing'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">GNEWS_API_KEY</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.environment.hasGNewsApiKey)}
                    <span className="text-sm">
                      {result.environment.hasGNewsApiKey ? 'Set' : 'Missing'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">SUPABASE_URL</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.environment.hasSupabaseUrl)}
                    <span className="text-sm">
                      {result.environment.hasSupabaseUrl ? 'Set' : 'Missing'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">SERVICE_ROLE_KEY</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.environment.hasServiceKey)}
                    <span className="text-sm">
                      {result.environment.hasServiceKey ? 'Set' : 'Missing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting Tips */}
          {!result.success && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-400 mb-2">Troubleshooting Steps:</h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                    <li>1. Create the test-fetch function in Supabase Dashboard</li>
                    <li>2. Set API keys in Edge Functions → Settings</li>
                    <li>3. Deploy the function and try again</li>
                    <li>4. Check function logs for detailed errors</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {result.timestamp && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Tested at: {new Date(result.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {!result && !testing && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Click "Test Function" to check Edge Function status</p>
        </div>
      )}
    </div>
  );
};

export default EdgeFunctionTester;