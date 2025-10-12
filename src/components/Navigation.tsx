import { Music, Library, CreditCard, User } from 'lucide-react';

interface NavigationProps {
  currentView: 'builder' | 'library' | 'credits';
  onViewChange: (view: 'builder' | 'library' | 'credits') => void;
  credits?: number;
}

export function Navigation({ currentView, onViewChange, credits = 0 }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Music className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Song Builder</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewChange('builder')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'builder'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Music className="w-4 h-4" />
                Builder
              </button>

              <button
                onClick={() => onViewChange('library')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'library'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Library className="w-4 h-4" />
                Library
              </button>

              <button
                onClick={() => onViewChange('credits')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'credits'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Credits
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900">{credits}</span>
              <span className="text-sm text-gray-600">credits</span>
            </div>

            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <User className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
