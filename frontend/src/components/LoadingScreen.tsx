import React from 'react';

interface LoadingScreenProps {
  message?: string;
  showBackendWarning?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...",
  showBackendWarning = false 
}) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Animated Logo/Icon */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 bg-black rounded-full opacity-10 animate-ping"></div>
          <div className="relative w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* Loading Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">npx</h2>
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
        
        {/* Backend Warning */}
        {showBackendWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Server is starting up</p>
                <p className="text-amber-700">
                  Our backend is hosted on a free tier and may take 30-60 seconds to start. 
                  Thanks for your patience! ⏳
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-black h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;