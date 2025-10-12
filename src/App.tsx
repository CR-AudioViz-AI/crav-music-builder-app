import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { MusicBuilder } from './components/MusicBuilder';
import { TrackLibrary } from './components/TrackLibrary';
import { CreditsView } from './components/CreditsView';
import { AdminPanel } from './components/AdminPanel';
import { getCurrentUser } from './lib/db';

function App() {
  const [currentView, setCurrentView] = useState<'builder' | 'library' | 'credits' | 'admin'>('builder');
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCredits(user.credits);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} credits={credits} />

      <main className="py-8">
        {currentView === 'builder' && <MusicBuilder />}
        {currentView === 'library' && <TrackLibrary />}
        {currentView === 'credits' && <CreditsView />}
        {currentView === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}

export default App;
