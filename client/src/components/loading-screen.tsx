import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/lib/i18n";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);

  useEffect(() => {
    // Simulate loading progress over 10 seconds
    const totalDuration = 10000; // 10 seconds
    const intervalTime = 100; // Update every 100ms
    const totalSteps = totalDuration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const baseProgress = (currentStep / totalSteps) * 100;
      // Add some randomness for more natural feel
      const randomOffset = Math.random() * 3 - 1.5; // Random between -1.5 and 1.5
      const newProgress = Math.min(100, Math.max(0, baseProgress + randomOffset));
      
      setProgress(newProgress);

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
        setProgress(100);
        // Complete after showing 100% for a moment
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(onComplete, 500);
        }, 500);
      }
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50 transition-opacity duration-500 ${isComplete ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        {/* Logo Animation Ultra Pro */}
        <div className="mb-8 relative">
          {/* Main logo container with gradient border and shadow */}
          <div className="w-28 h-28 mx-auto relative">
            {/* Rotating gradient border */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-purple-500 via-indigo-500 to-blue-600 rounded-3xl opacity-75 animate-spin" style={{ animationDuration: '4s' }}></div>
            
            {/* Inner glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-2xl opacity-60 animate-pulse" style={{ animationDuration: '2s' }}></div>
            
            {/* Main logo background */}
            <div className="relative w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-2xl flex items-center justify-center">
              {/* White background for logo */}
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-inner">
                <img 
                  src="/attached_assets/image_1755620962348.png" 
                  alt="YGestion Logo" 
                  className="w-16 h-16 object-contain animate-bounce"
                  style={{ animationDuration: '2.5s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </div>
            </div>
          </div>
          
          {/* Multiple animated rings with different speeds and colors */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 border-4 border-blue-400/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-44 h-44 border-2 border-indigo-400/20 rounded-full animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-52 h-52 border border-purple-400/15 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full absolute animate-bounce" style={{ top: '20%', left: '30%', animationDelay: '0.5s', animationDuration: '2s' }}></div>
            <div className="w-1 h-1 bg-indigo-400 rounded-full absolute animate-bounce" style={{ top: '70%', right: '25%', animationDelay: '1s', animationDuration: '2.5s' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute animate-bounce" style={{ bottom: '60%', left: '20%', animationDelay: '1.5s', animationDuration: '3s' }}></div>
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-fade-in">
          YGestion
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