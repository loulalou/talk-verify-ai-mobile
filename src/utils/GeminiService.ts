import { supabase } from "@/integrations/supabase/client";

class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async sendMessage(
    message: string, 
    category: string, 
    context?: string
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          message,
          category,
          context
        }
      });

      if (error) {
        console.error('Erreur lors de l\'appel à la fonction Gemini:', error);
        return {
          success: false,
          error: 'Erreur de communication avec le service Gemini'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Erreur inconnue du service Gemini'
        };
      }

      return {
        success: true,
        response: data.response
      };

    } catch (error) {
      console.error('Erreur GeminiService:', error);
      return {
        success: false,
        error: 'Erreur de connexion au service Gemini'
      };
    }
  }

  async getTopicExplanation(
    topic: string, 
    category: string
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    const prompt = `Peux-tu m'expliquer en détail le sujet "${topic}" dans le domaine ${category} ? 
    Inclus les points clés, des exemples concrets, et des questions pour tester ma compréhension.`;

    const result = await this.sendMessage(prompt, category, `Explication du sujet: ${topic}`);
    
    return {
      success: result.success,
      content: result.response,
      error: result.error
    };
  }

  async validateKnowledge(
    userStatement: string,
    topic: string,
    category: string
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    const prompt = `L'étudiant affirme ceci sur le sujet "${topic}": "${userStatement}"
    
    Peux-tu évaluer cette affirmation et :
    1. Confirmer si c'est correct ou identifier les erreurs
    2. Ajouter des informations complémentaires utiles
    3. Poser une question de suivi pour approfondir sa compréhension`;

    return this.sendMessage(prompt, category, `Validation des connaissances: ${topic}`);
  }
}

export default GeminiService.getInstance();