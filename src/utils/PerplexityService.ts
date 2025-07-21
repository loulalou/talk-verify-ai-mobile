interface PerplexityResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface DocumentationResult {
  success: boolean;
  content?: string;
  error?: string;
}

export class PerplexityService {
  private static API_KEY_STORAGE_KEY = 'perplexity_api_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async getTopicDocumentation(topic: string, category: string): Promise<DocumentationResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      const prompt = `Provide comprehensive educational documentation about "${topic}" in the context of ${category}. Include:
- Key concepts and definitions
- Important facts and dates (if applicable)
- Main points students should know
- Examples or case studies
- Study tips for this topic

Format the response in a clear, educational manner suitable for students.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an educational assistant providing comprehensive study documentation. Be precise, educational, and well-structured.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 2000,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: PerplexityResponse = await response.json();
      
      return {
        success: true,
        content: data.choices[0]?.message?.content || 'No content received'
      };
    } catch (error) {
      console.error('Error fetching documentation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documentation'
      };
    }
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: 'Test message'
            }
          ],
          max_tokens: 10
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }
}