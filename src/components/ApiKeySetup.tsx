import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PerplexityService } from "@/utils/PerplexityService";

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState(PerplexityService.getApiKey() || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Perplexity API key",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const isValid = await PerplexityService.testApiKey(apiKey.trim());
      
      if (isValid) {
        PerplexityService.saveApiKey(apiKey.trim());
        toast({
          title: "Success",
          description: "API key validated and saved successfully",
        });
        onApiKeySet();
      } else {
        toast({
          title: "Error",
          description: "Invalid API key. Please check your key and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-ai-primary" />
          <h3 className="text-lg font-semibold">Setup Perplexity API</h3>
        </div>
        
        <Alert>
          <AlertDescription>
            To fetch documentation about your study topics, you need a Perplexity API key. 
            Get one from{" "}
            <a 
              href="https://www.perplexity.ai/settings/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ai-primary hover:underline inline-flex items-center"
            >
              Perplexity Settings <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            API Key
          </label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="pplx-..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleSaveApiKey}
          disabled={isValidating || !apiKey.trim()}
          className="w-full"
        >
          {isValidating ? "Validating..." : "Save API Key"}
        </Button>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Recommendation:</strong> For better security, connect your project to Supabase 
            and store the API key in Edge Function Secrets instead of local storage.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}