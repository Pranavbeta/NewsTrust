import React, { useState, useEffect } from 'react';
import { Settings, Play, CheckCircle, XCircle, RefreshCw, AlertTriangle, Zap, Clock, Globe } from 'lucide-react';
import { hybridTranslationService } from '../lib/hybridTranslation';
import { brandVoiceTranslation } from '../lib/brandVoiceTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const TranslationDebugPanel: React.FC = () => {
  const { profile } = useAuth();
  const { currentLanguage } = useLanguage();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [performanceTest, setPerformanceTest] = useState<any>(null);
  const [runningPerformanceTest, setRunningPerformanceTest] = useState(false);

  if (!profile?.is_admin) return null;

  useEffect(() => {
    // Get initial stats
    const initialStats = {
      ...brandVoiceTranslation.getStats(),
      hybrid: hybridTranslationService.getStats()
    };
    setStats(initialStats);
  }, []);

  const runTranslationTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const testTexts = [
        { text: 'Sign In', type: 'ui' as const },
        { text: 'Breaking News: Global Climate Summit', type: 'news' as const },
        { text: 'Based on my analysis, this appears to be credible.', type: 'chat' as const }
      ];

      const results = await Promise.all(
        testTexts.map(async ({ text, type }) => {
          const startTime = performance.now();
          let result;
          
          switch (type) {
            case 'ui':
              result = await brandVoiceTranslation.translateUI(`test.${type}`, text, 'es', type);
              break;
            case 'news':
              const newsResult = await hybridTranslationService.translate(text, 'en', 'es', 'news');
              result = newsResult.translatedText;
              break;
            case 'chat':
              const chatResult = await hybridTranslationService.translateChatResponse(text, 'en', 'es');
              result = chatResult.translatedText;
              break;
          }
          
          const endTime = performance.now();
          
          return {
            type,
            original: text,
            translated: result,
            service: type === 'ui' ? 'brand-voice' : 'hybrid-service',
            time: Math.round(endTime - startTime)
          };
        })
      );

      setTestResult({
        success: true,
        results,
        totalTime: results.reduce((sum, r) => sum + r.time, 0),
        avgTime: Math.round(results.reduce((sum, r) => sum + r.time, 0) / results.length)
      });
      
      // Get updated stats
      const updatedStats = {
        ...brandVoiceTranslation.getStats(),
        hybrid: hybridTranslationService.getStats()
      };
      setStats(updatedStats);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Translation test failed: ${error.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const runPerformanceTest = async () => {
    setRunningPerformanceTest(true);
    setPerformanceTest(null);
    
    try {
      const testBatch = [
        { text: 'Global Climate Summit Reaches Historic Agreement', type: 'news' as const },
        { text: 'Technology breakthrough announced today', type: 'news' as const },
        { text: 'Sign In', type: 'ui' as const },
        { text: 'Settings', type: 'ui' as const },
        { text: 'This content appears credible based on multiple sources.', type: 'chat' as const }
      ];

      const startTime = performance.now();
      
      // Test batch translation using hybrid service
      const results = await hybridTranslationService.translateBatch(testBatch, 'en', 'es');
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / testBatch.length;

      setPerformanceTest({
        totalTime: Math.round(totalTime),
        avgTime: Math.round(avgTime),
        textsTranslated: testBatch.length,
        results: testBatch.map((item, index) => ({
          original: item.text,
          translated: results[index].translatedText,
          service: results[index].service,
          type: item.type
        })),
        speed: totalTime < 1000 ? 'Excellent' : totalTime < 2000 ? 'Good' : 'Slow'
      });
    } catch (error: any) {
      setPerformanceTest({
        error: error.message
      });
    } finally {
      setRunningPerformanceTest(false);
    }
  };

  const clearCache = () => {
    brandVoiceTranslation.clearCache();
    hybridTranslationService.clearCache();
    setStats({
      ...brandVoiceTranslation.getStats(),
      hybrid: hybridTranslationService.getStats()
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hybrid Translation System</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Lingvanex + DeepL + Brand Voice + Dynamic Content</p>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-400">UI Elements</span>
          </div>
          <div className="text-lg font-bold text-blue-600">Brand Voice</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Pre-built + API fallback</div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Settings className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-400">Dynamic Content</span>
          </div>
          <div className="text-lg font-bold text-green-600">Lingvanex → DeepL</div>
          <div className="text-xs text-green-700 dark:text-green-300">Real-time translation</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">System Status</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stats?.hybrid?.isConfigured ? 'Active' : 'Mock Mode'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Lingo.dev disabled
          </div>
        </div>
      </div>

      {/* Performance Test Results */}
      {performanceTest && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Hybrid Translation Performance Test</h4>
          {performanceTest.error ? (
            <div className="text-red-600 dark:text-red-400">{performanceTest.error}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceTest.totalTime}ms</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Time</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceTest.avgTime}ms</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Items Translated</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{performanceTest.textsTranslated}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Speed Rating</div>
                  <div className={`text-lg font-bold ${
                    performanceTest.speed === 'Excellent' ? 'text-green-600' :
                    performanceTest.speed === 'Good' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {performanceTest.speed}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 dark:text-white">Translation Results:</h5>
                {performanceTest.results.map((result: any, index: number) => (
                  <div key={index} className="bg-white dark:bg-gray-600 p-3 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {result.type}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {result.service}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div><strong>Original:</strong> {result.original}</div>
                      <div><strong>Translated:</strong> {result.translated}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">Translation System Tests</h4>
          <div className="flex space-x-2">
            <button
              onClick={runPerformanceTest}
              disabled={runningPerformanceTest}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md transition-colors"
            >
              {runningPerformanceTest ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>{runningPerformanceTest ? 'Testing...' : 'Performance Test'}</span>
            </button>
            
            <button
              onClick={clearCache}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Clear Cache</span>
            </button>
            
            <button
              onClick={runTranslationTest}
              disabled={testing}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-md transition-colors"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{testing ? 'Testing...' : 'System Test'}</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                testResult.success ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'
              }`}>
                {testResult.success ? 'Translation System Test Passed' : 'Test Failed'}
              </span>
            </div>
            
            {testResult.success ? (
              <div className="space-y-3">
                <div className="text-sm text-green-800 dark:text-green-300">
                  Total time: {testResult.totalTime}ms | Average: {testResult.avgTime}ms per translation
                </div>
                <div className="space-y-2">
                  {testResult.results.map((result: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-green-800/20 p-3 rounded border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase">
                          {result.type} Content
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-green-600 dark:text-green-400">
                            {result.service}
                          </span>
                          <span className="text-xs text-gray-500">
                            {result.time}ms
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-green-900 dark:text-green-100">
                        <div><strong>EN:</strong> {result.original}</div>
                        <div><strong>ES:</strong> {result.translated}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-800 dark:text-red-300">
                {testResult.message}
              </p>
            )}
          </div>
        )}

        {/* System Architecture */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-3">Translation Architecture</h4>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>UI Elements:</strong> Pre-built translations + Brand voice consistency</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>News Content:</strong> Lingvanex → DeepL fallback for accuracy</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>Chat Responses:</strong> Lingvanex → DeepL for technical accuracy</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>Batch Operations:</strong> Hybrid service batch translation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>Fallback System:</strong> Enhanced mock translations if APIs fail</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>Caching:</strong> Memory + database + pre-built translations</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span><strong>Lingo.dev:</strong> Disabled (using Lingvanex + DeepL instead)</span>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-400 mb-3">System Status</h4>
          <div className="space-y-2 text-sm text-green-800 dark:text-green-300">
            <div>
              <strong>Current Language:</strong> {currentLanguage.flag} {currentLanguage.name}
            </div>
            <div>
              <strong>Translation Status:</strong> {stats?.hybrid?.isConfigured ? 'Lingvanex + DeepL Active' : 'Mock Mode'}
            </div>
            <div>
              <strong>Cache Size:</strong> {stats?.cacheSize || 0} UI + {stats?.hybrid?.cacheSize || 0} hybrid translations
            </div>
            <div>
              <strong>Pre-built Translations:</strong> {stats?.prebuiltKeys || 0} UI elements
            </div>
            <div>
              <strong>Performance:</strong> Optimized for accuracy and brand voice consistency
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDebugPanel;