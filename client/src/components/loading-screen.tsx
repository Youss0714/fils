import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/lib/i18n";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Wait a bit before starting fade out
          setTimeout(() => {
            setIsVisible(false);
            // Complete the loading after fade out animation
            setTimeout(onComplete, 500);
          }, 300);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random increment between 5-20
      });
    }, 150);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50 transition-opacity duration-500 ${!isVisible ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <BarChart3 className="text-white text-4xl animate-bounce" />
          </div>
          
          {/* Animated rings around logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-primary/20 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-2 border-primary/10 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-fade-in">
          GestionPro
        </h1>
        <p className="text-lg text-gray-600 mb-8 animate-fade-in-delay">
          {settings?.language === 'en' ? 'Simplified business management' : 'Gestion d\'entreprise simplifiée'}
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {settings?.language === 'en' ? 'Loading...' : 'Chargement...'} {Math.floor(Math.min(progress, 100))}%
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center mt-6 space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>


    </div>
  );
}