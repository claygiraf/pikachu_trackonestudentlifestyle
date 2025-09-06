import { Home, Settings } from "lucide-react";

interface MobileNavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function MobileNavigation({ currentPage, setCurrentPage }: MobileNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 safe-area-pb z-50">
      <div className="flex justify-center space-x-8 max-w-md mx-auto">
        <button
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
            currentPage === 'home' 
              ? 'bg-purple-100 text-purple-600 scale-110' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs">Home</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('profile')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
            currentPage === 'profile' 
              ? 'bg-purple-100 text-purple-600 scale-110' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}