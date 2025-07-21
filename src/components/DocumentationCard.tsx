import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface DocumentationCardProps {
  topic: string;
  category: string;
  content?: string;
  isLoading?: boolean;
  onFetchDocumentation: (topic: string) => void;
}

export function DocumentationCard({ 
  topic, 
  category, 
  content, 
  isLoading = false,
  onFetchDocumentation 
}: DocumentationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-ai-surface-elevated border-border/50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium">{topic}</h3>
              <p className="text-xs text-muted-foreground">{category}</p>
            </div>
          </div>
          
          {!content && !isLoading && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFetchDocumentation(topic)}
            >
              Fetch Documentation
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-ai-primary" />
              <span className="text-sm text-muted-foreground">Fetching documentation...</span>
            </div>
          </div>
        )}

        {content && (
          <div className="space-y-3">
            <Separator />
            
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2 p-0 h-auto text-sm"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{isExpanded ? 'Collapse' : 'Expand'} Documentation</span>
              </Button>

              {isExpanded && (
                <ScrollArea className="h-64 w-full rounded border bg-background/50 p-4">
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: content.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                </ScrollArea>
              )}

              {!isExpanded && content && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {content.substring(0, 120)}...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}