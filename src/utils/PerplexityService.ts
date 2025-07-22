import { supabase } from '@/integrations/supabase/client';

interface DocumentationResult {
  success: boolean;
  content?: string;
  error?: string;
}

export class PerplexityService {
  static async getTopicDocumentation(topic: string, category: string): Promise<DocumentationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('perplexity-documentation', {
        body: { topic, category }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error calling documentation function:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documentation'
      };
    }
  }

  // Legacy methods for backward compatibility - can be removed after migration
  static saveApiKey(apiKey: string): void {
    console.warn('API keys are now managed through Supabase Edge Function Secrets');
  }

  static getApiKey(): string | null {
    console.warn('API keys are now managed through Supabase Edge Function Secrets');
    return null;
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    console.warn('API key testing is now handled automatically through the edge function');
    return true;
  }
}