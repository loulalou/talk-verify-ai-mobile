import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  confidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
  category?: string;
}

interface KnowledgeCardProps {
  knowledge: KnowledgeItem;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  className?: string;
}

export function KnowledgeCard({ knowledge, onConfirm, onReject, className }: KnowledgeCardProps) {
  const getStatusIcon = () => {
    switch (knowledge.status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-ai-accent" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertCircle className="w-5 h-5 text-ai-primary" />;
    }
  };

  const getConfidenceColor = () => {
    if (knowledge.confidence >= 0.8) return "text-ai-accent";
    if (knowledge.confidence >= 0.6) return "text-ai-primary";
    return "text-yellow-500";
  };

  return (
    <Card className={cn(
      "bg-ai-surface-elevated border-border/50 p-4 space-y-3 animate-slide-up",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <h3 className="font-medium text-sm">{knowledge.title}</h3>
          </div>
          {knowledge.category && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {knowledge.category}
            </span>
          )}
        </div>
        
        {/* Confidence Score */}
        <div className="text-right">
          <span className={cn("text-xs font-mono", getConfidenceColor())}>
            {Math.round(knowledge.confidence * 100)}%
          </span>
          <p className="text-xs text-muted-foreground">confidence</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed">
        {knowledge.content}
      </p>

      {/* Actions */}
      {knowledge.status === 'pending' && (
        <div className="flex space-x-2 pt-2">
          <Button
            variant="confirm"
            size="sm"
            onClick={() => onConfirm(knowledge.id)}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirm
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(knowledge.id)}
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      )}

      {/* Status Badge */}
      {knowledge.status !== 'pending' && (
        <div className={cn(
          "text-xs px-2 py-1 rounded-full w-fit",
          knowledge.status === 'confirmed' 
            ? "bg-ai-accent/20 text-ai-accent" 
            : "bg-destructive/20 text-destructive"
        )}>
          {knowledge.status === 'confirmed' ? 'Confirmed' : 'Rejected'}
        </div>
      )}
    </Card>
  );
}