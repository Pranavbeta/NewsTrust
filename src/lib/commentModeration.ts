// Comment moderation using Perspective API
interface ToxicityResult {
  isToxic: boolean;
  score: number;
  reason?: string;
}

export class CommentModerationService {
  private static instance: CommentModerationService;
  
  static getInstance(): CommentModerationService {
    if (!CommentModerationService.instance) {
      CommentModerationService.instance = new CommentModerationService();
    }
    return CommentModerationService.instance;
  }

  async checkToxicity(text: string): Promise<ToxicityResult> {
    try {
      const apiKey = import.meta.env.VITE_PERSPECTIVE_API_KEY;
      
      if (!apiKey) {
        console.warn('Perspective API key not configured, using basic moderation');
        return this.basicModeration(text);
      }

      const response = await fetch(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestedAttributes: {
              TOXICITY: {},
              SEVERE_TOXICITY: {},
              IDENTITY_ATTACK: {},
              INSULT: {},
              PROFANITY: {},
              THREAT: {}
            },
            comment: {
              text: text
            },
            languages: ['en']
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Perspective API error: ${response.status}`);
      }

      const data = await response.json();
      const toxicityScore = data.attributeScores.TOXICITY.summaryScore.value;
      const severeToxicityScore = data.attributeScores.SEVERE_TOXICITY.summaryScore.value;
      
      const isToxic = toxicityScore > 0.8 || severeToxicityScore > 0.7;
      
      return {
        isToxic,
        score: toxicityScore,
        reason: isToxic ? this.getToxicityReason(data.attributeScores) : undefined
      };
    } catch (error) {
      console.error('Toxicity check failed:', error);
      return this.basicModeration(text);
    }
  }

  private basicModeration(text: string): ToxicityResult {
    const toxicWords = [
      'hate', 'stupid', 'idiot', 'moron', 'dumb', 'kill', 'die', 'death',
      'racist', 'nazi', 'terrorist', 'bomb', 'violence', 'attack'
    ];
    
    const lowerText = text.toLowerCase();
    const foundToxicWords = toxicWords.filter(word => lowerText.includes(word));
    
    const isToxic = foundToxicWords.length > 0;
    const score = foundToxicWords.length > 0 ? 0.9 : 0.1;
    
    return {
      isToxic,
      score,
      reason: isToxic ? `Contains potentially harmful language: ${foundToxicWords.join(', ')}` : undefined
    };
  }

  private getToxicityReason(attributeScores: any): string {
    const reasons = [];
    
    if (attributeScores.TOXICITY.summaryScore.value > 0.8) {
      reasons.push('toxic language');
    }
    if (attributeScores.SEVERE_TOXICITY.summaryScore.value > 0.7) {
      reasons.push('severe toxicity');
    }
    if (attributeScores.IDENTITY_ATTACK.summaryScore.value > 0.7) {
      reasons.push('identity attack');
    }
    if (attributeScores.INSULT.summaryScore.value > 0.7) {
      reasons.push('insults');
    }
    if (attributeScores.PROFANITY.summaryScore.value > 0.7) {
      reasons.push('profanity');
    }
    if (attributeScores.THREAT.summaryScore.value > 0.7) {
      reasons.push('threats');
    }
    
    return `Comment flagged for: ${reasons.join(', ')}`;
  }
}

export const commentModerationService = CommentModerationService.getInstance();