import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Clock, 
  ChevronRight,
  CheckCircle
} from "lucide-react";
import { StudyCategory } from "./CategorySelection";

export function PeriodSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state?.category as StudyCategory;
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

  if (!category) {
    navigate('/');
    return null;
  }

  const handlePeriodToggle = (period: string) => {
    setSelectedPeriods(prev => 
      prev.includes(period) 
        ? prev.filter(p => p !== period)
        : [...prev, period]
    );
  };

  const handleContinue = () => {
    if (selectedPeriods.length > 0) {
      navigate('/study', { 
        state: { 
          category,
          periods: selectedPeriods 
        }
      });
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <div className="bg-ai-surface border-b border-border/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="hover:bg-ai-surface-elevated"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                {category.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold">{category.name}</h1>
                <p className="text-muted-foreground">Choose specific topics to study</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-ai-primary" />
            <h2 className="text-xl font-semibold">Select Study Periods</h2>
          </div>
          <p className="text-muted-foreground">
            Choose one or more periods/topics you want to verify your knowledge about.
            You can select multiple areas for a comprehensive study session.
          </p>
        </div>

        {/* Period Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {category.periods?.map((period, index) => {
            const isSelected = selectedPeriods.includes(period);
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isSelected
                    ? 'ring-2 ring-ai-primary bg-ai-primary/5 border-ai-primary/30'
                    : 'hover:shadow-lg hover:bg-ai-surface-elevated'
                }`}
                onClick={() => handlePeriodToggle(period)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${isSelected ? 'text-ai-primary' : ''}`}>
                      {period}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test your knowledge in this area
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'border-ai-primary bg-ai-primary text-white' 
                      : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <CheckCircle className="w-4 h-4" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Summary */}
        {selectedPeriods.length > 0 && (
          <Card className="bg-ai-surface-elevated border-ai-primary/20 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Ready to Study</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPeriods.length} topic{selectedPeriods.length > 1 ? 's' : ''} selected
                  </p>
                </div>
                <Button 
                  onClick={handleContinue}
                  className="bg-ai-primary hover:bg-ai-primary/90"
                >
                  Start Session
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected topics:</p>
                <div className="space-y-1">
                  {selectedPeriods.map((period, index) => (
                    <div 
                      key={index}
                      className="text-sm bg-ai-primary/10 text-ai-primary px-3 py-2 rounded-lg border border-ai-primary/20"
                    >
                      {period}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Study Tips */}
        <Card className="bg-ai-surface border-border/50">
          <div className="p-4">
            <h4 className="font-medium mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-ai-accent" />
              Study Session Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium mb-1">Before starting:</p>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Review your notes for the selected periods</li>
                  <li>Prepare in a quiet environment</li>
                  <li>Have your study materials nearby</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">During the session:</p>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Speak clearly about what you know</li>
                  <li>Ask for clarification when needed</li>
                  <li>Correct the AI when information is wrong</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}