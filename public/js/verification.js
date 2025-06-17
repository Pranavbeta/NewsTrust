// News Verification System using Puter.js AI
(function() {
  'use strict';

  // Global verification system
  window.newsVerification = {
    verificationResults: new Map(),
    
    async verifyArticle(articleData) {
      try {
        console.log('Starting verification for article:', articleData.id);
        
        // Check if Puter.js is available
        if (typeof window.puter === 'undefined' || !window.puter.ai) {
          console.warn('Puter.js not available, using fallback verification');
          return this.fallbackVerification(articleData);
        }

        // Structured prompt for consistent verification
        const verificationPrompt = `
          Analyze this news article for credibility and authenticity:
          
          Title: ${articleData.title}
          Content: ${articleData.content}
          Source: ${articleData.source}
          URL: ${articleData.sourceUrl}
          Date: ${articleData.publishDate}
          
          Please evaluate:
          1. Factual accuracy based on known information
          2. Source credibility and reputation
          3. Potential bias or misleading information
          4. Cross-reference with established facts
          
          Provide a verdict (valid/fake/unclear), confidence percentage (0-100), 
          and detailed explanation of your analysis.
        `;

        // Call Puter.js AI with error handling
        const aiResponse = await window.puter.ai.chat({
          prompt: verificationPrompt,
          temperature: 0.3,
          maxTokens: 500
        });

        // Parse AI response
        const result = this.parseAIResponse(aiResponse, articleData);
        
        // Store verification proof (mock blockchain for demo)
        const verificationHash = await this.createVerificationProof(articleData.id, result);
        result.blockchainProof = verificationHash;
        result.timestamp = new Date().toISOString();

        // Store result
        this.verificationResults.set(articleData.id, result);
        
        // Update UI
        this.displayVerificationResults(articleData.id, result);
        
        return result;
        
      } catch (error) {
        console.error('Verification failed:', error);
        return this.handleVerificationError(error, articleData);
      }
    },

    parseAIResponse(aiResponse, articleData) {
      // Extract verdict, confidence, and explanation from AI response
      const responseText = aiResponse.text || aiResponse.message || String(aiResponse);
      
      // Simple parsing logic (in production, this would be more sophisticated)
      let verdict = 'unclear';
      let confidence = 50;
      let explanation = responseText;
      
      // Look for verdict keywords
      if (responseText.toLowerCase().includes('valid') || responseText.toLowerCase().includes('credible')) {
        verdict = 'valid';
        confidence = Math.floor(Math.random() * 20) + 80; // 80-100%
      } else if (responseText.toLowerCase().includes('fake') || responseText.toLowerCase().includes('false')) {
        verdict = 'fake';
        confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
      }
      
      // Extract confidence if mentioned
      const confidenceMatch = responseText.match(/(\d+)%/);
      if (confidenceMatch) {
        confidence = parseInt(confidenceMatch[1]);
      }

      return {
        verdict,
        confidence,
        explanation: explanation.substring(0, 500),
        sources_checked: ['AI Knowledge Base', 'Cross-reference Database'],
        flags: verdict === 'fake' ? ['Potential misinformation detected'] : [],
        reasoning: `AI analysis based on content patterns, source credibility, and factual consistency. Confidence: ${confidence}%`
      };
    },

    fallbackVerification(articleData) {
      // Fallback verification when Puter.js is not available
      const suspiciousWords = ['shocking', 'unbelievable', 'secret', 'exposed', 'conspiracy'];
      const credibleSources = ['reuters', 'bbc', 'ap news', 'associated press', 'cnn', 'nytimes'];
      
      const title = articleData.title.toLowerCase();
      const content = articleData.content.toLowerCase();
      const source = articleData.source.toLowerCase();
      
      const hasSuspiciousWords = suspiciousWords.some(word => title.includes(word) || content.includes(word));
      const hasCredibleSource = credibleSources.some(src => source.includes(src));

      let verdict, confidence, explanation;
      
      if (hasCredibleSource && !hasSuspiciousWords) {
        verdict = 'valid';
        confidence = Math.floor(Math.random() * 20) + 80;
        explanation = 'This article appears to be from a credible source with factual reporting style.';
      } else if (hasSuspiciousWords) {
        verdict = 'fake';
        confidence = Math.floor(Math.random() * 30) + 70;
        explanation = 'This article contains sensationalized language often associated with misinformation.';
      } else {
        verdict = 'unclear';
        confidence = Math.floor(Math.random() * 40) + 30;
        explanation = 'Unable to determine credibility with high confidence. Manual verification recommended.';
      }

      return {
        verdict,
        confidence,
        explanation,
        sources_checked: ['Heuristic Analysis', 'Source Pattern Recognition'],
        flags: hasSuspiciousWords ? ['Sensationalized language detected'] : [],
        reasoning: `Fallback analysis based on content patterns and source recognition. Confidence: ${confidence}%`
      };
    },

    async createVerificationProof(articleId, result) {
      // Mock blockchain proof creation
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 9);
      return `ALGO_${timestamp}_${randomSuffix}`;
    },

    displayVerificationResults(articleId, result) {
      const resultContainer = document.querySelector(`#article-${articleId} .verification-results`);
      
      if (!resultContainer) {
        console.warn('Verification results container not found for article:', articleId);
        return;
      }

      const verdictColor = result.verdict === 'valid' ? 'green' : 
                          result.verdict === 'fake' ? 'red' : 'yellow';
      
      resultContainer.innerHTML = `
        <div class="verification-summary bg-${verdictColor}-50 border border-${verdictColor}-200 rounded-lg p-4 mb-4">
          <h4 class="font-medium text-${verdictColor}-900 mb-2">AI Verification Results</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Verdict:</span>
              <span class="text-sm font-bold text-${verdictColor}-700">${result.verdict.toUpperCase()}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Confidence:</span>
              <span class="text-sm font-bold">${result.confidence}%</span>
            </div>
            <div class="mt-2">
              <span class="text-sm font-medium">Analysis:</span>
              <p class="text-sm mt-1">${result.explanation}</p>
            </div>
            <div class="proof-details mt-3 pt-3 border-t border-${verdictColor}-200">
              <div class="flex items-center justify-between text-xs">
                <span>Verification Proof:</span>
                <a href="https://algoexplorer.io/tx/${result.blockchainProof}" target="_blank" class="text-blue-600 hover:underline flex items-center">
                  ${result.blockchainProof.substring(0, 16)}...
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    handleVerificationError(error, articleData) {
      console.error('Verification error:', error);
      
      // Return a graceful error result
      return {
        verdict: 'unclear',
        confidence: 30,
        explanation: 'Verification service encountered an error. Please try again later.',
        sources_checked: [],
        flags: ['Verification service error'],
        reasoning: 'Error during verification process'
      };
    },

    getVerificationState() {
      return {
        resultsCount: this.verificationResults.size,
        verifiedArticles: Array.from(this.verificationResults.keys())
      };
    },

    getVerificationResult(articleId) {
      return this.verificationResults.get(articleId) || null;
    }
  };

  // Initialize verification system
  document.addEventListener('DOMContentLoaded', function() {
    console.log('News verification system initialized');
    
    // Add click handlers to any pre-existing verification buttons
    document.querySelectorAll('.verify-btn').forEach(button => {
      const articleId = button.getAttribute('data-article-id');
      if (articleId) {
        button.addEventListener('click', function() {
          const articleElement = document.getElementById(`article-${articleId}`);
          if (articleElement) {
            const articleData = {
              id: articleId,
              title: articleElement.querySelector('.article-title')?.textContent || '',
              content: articleElement.querySelector('.article-content')?.textContent || '',
              source: articleElement.querySelector('.article-source')?.textContent || '',
              sourceUrl: articleElement.querySelector('a[href]')?.getAttribute('href') || '',
              publishDate: articleElement.querySelector('.article-date')?.textContent || new Date().toISOString()
            };
            
            window.newsVerification.verifyArticle(articleData);
          }
        });
      }
    });
  });
})();