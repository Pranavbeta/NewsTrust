import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Zap,
  Layers,
  Cpu
} from 'lucide-react';
import useTranslationDebug from '../hooks/useTranslationDebug';
import { useLanguage } from '../contexts/LanguageContext';

interface RenderMetrics {
  timestamp: number;
  renderCount: number;
  translationsCount: number;
  pendingCount: number;
  renderTime: number;
}

const RENDER_WARNING_THRESHOLD = 5;

const TranslationDebugger: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const { t, translateBatch, loading, _debug } = useTranslationDebug();
  const [metrics, setMetrics] = useState<RenderMetrics[]>([]);
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Record metrics on each render
  useEffect(() => {
    if (_debug) {
      setMetrics(prev => [
        ...prev,
        {
          timestamp: Date.now(),
          renderCount: _debug.renderCount,
          translationsCount: _debug.translationsCount,
          pendingCount: _debug.pendingCount,
          renderTime: performance.now() % 10000 // Just for visualization
        }
      ].slice(-20)); // Keep only the last 20 metrics
    }
  }, [_debug]);

  const runStressTest = async () => {
    setTestRunning(true);
    setTestResults(null);
    
    try {
      const startTime = performance.now();
      
      // Generate 50 random translation keys
      const testItems = Array.from({ length: 50 }, (_, i) => ({
        key: `test.stress.${i}`,
        text: `Test string ${i} for stress testing`,
        context: i % 2 === 0 ? 'ui' : 'content'
      }));
      
      // Translate in batches of 10
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < testItems.length; i += batchSize) {
        const batch = testItems.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      // Process batches sequentially
      for (const batch of batches) {
        await translateBatch(batch);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      setTestResults({
        totalTime,
        itemsTranslated: testItems.length,
        averageTimePerItem: totalTime / testItems.length,
        batchCount: batches.length,
        renderCount: _debug?.renderCount || 0,
        success: true
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setTestRunning(false);
    }
  };

  const getStatusColor = (renderCount: number) => {
    if (renderCount > 15) return 'text-red-600';
    if (renderCount > 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Bug className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Translation Hook Debugger</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor render cycles and performance</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Layers className="h-4 w-4" />
            <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
          </button>
          
          <button
            onClick={runStressTest}
            disabled={testRunning}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-md transition-colors"
          >
            {testRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span>{testRunning ? 'Running...' : 'Stress Test'}</span>
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Render Count</span>
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(_debug?.renderCount || 0)}`}>
            {_debug?.renderCount || 0}
          </div>
          {_debug?.renderCount && _debug.renderCount > RENDER_WARNING_THRESHOLD && (
            <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              High render count detected!
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Cpu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Translation Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {loading ? 'Translating...' : 'Idle'}
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {_debug?.pendingCount || 0} pending translations
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Translations</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {_debug?.translationsCount || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Language: {currentLanguage.code}
          </div>
        </div>
      </div>

      {/* Render Metrics Visualization */}
      {showDetails && metrics.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Render History</h4>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-end h-40 space-x-1">
              {metrics.map((metric, index) => (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center"
                >
                  <div 
                    className={`w-full ${
                      metric.renderCount > 15 ? 'bg-red-500' : 
                      metric.renderCount > 5 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    } rounded-t`}
                    style={{ 
                      height: `${Math.min(100, metric.renderCount * 5)}%`,
                      minHeight: '4px'
                    }}
                    title={`Render #${metric.renderCount}: ${metric.translationsCount} translations, ${metric.pendingCount} pending`}
                  ></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Oldest</span>
              <span>Render Sequence</span>
              <span>Latest</span>
            </div>
          </div>
        </div>
      )}

      {/* Stress Test Results */}
      {testResults && (
        <div className={`p-4 rounded-lg border mb-6 ${
          testResults.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            {testResults.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${
              testResults.success ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'
            }`}>
              {testResults.success ? 'Stress Test Completed' : 'Test Failed'}
            </span>
          </div>
          
          {testResults.success ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{testResults.totalTime.toFixed(2)}ms</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Items Translated</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{testResults.itemsTranslated}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Time Per Item</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{testResults.averageTimePerItem.toFixed(2)}ms</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Renders</div>
                <div className={`text-lg font-bold ${getStatusColor(testResults.renderCount)}`}>
                  {testResults.renderCount}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-800 dark:text-red-300">
              Error: {testResults.error}
            </div>
          )}
        </div>
      )}

      {/* Debugging Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">Debugging Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• High render counts (more than 5) may indicate an infinite loop</li>
          <li>• Check for object/function dependencies that create new references</li>
          <li>• Verify useEffect dependency arrays are properly configured</li>
          <li>• Use React.memo or useMemo for expensive components</li>
          <li>• Memoize callback functions with useCallback</li>
          <li>• Use the React DevTools Profiler to identify problematic components</li>
        </ul>
      </div>

      {/* Current Translation Example */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Translation Example</h4>
          <div className="flex items-center space-x-1 text-xs">
            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Original:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Welcome to the Translation Debugger</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Translated:</span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {t('debug.welcome', 'Welcome to the Translation Debugger')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDebugger;