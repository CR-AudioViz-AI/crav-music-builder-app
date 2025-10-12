import { useState, useEffect } from 'react';
import { Music, Download, Clock, Calendar } from 'lucide-react';
import type { Track } from '../lib/types';
import { getUserTracks } from '../lib/db';

export function TrackLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const data = await getUserTracks();
      setTracks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      queued: 'bg-gray-100 text-gray-800',
      rendering: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.queued;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Music className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your tracks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Error loading tracks: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Music Library</h1>
        <p className="text-gray-600">
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} generated
        </p>
      </div>

      {tracks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tracks yet</h3>
          <p className="text-gray-600 mb-6">
            Start by creating your first AI-generated track
          </p>
          <a
            href="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Music className="w-5 h-5" />
            Create Track
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{track.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(track.status)}`}
                    >
                      {track.status}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {track.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      {track.brief.genre}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(track.duration_sec)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(track.created_at)}
                    </span>
                  </div>

                  {track.brief.mood && (
                    <p className="text-sm text-gray-600">Mood: {track.brief.mood}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {track.preview_url && (
                    <a
                      href={track.preview_url}
                      className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center"
                    >
                      Preview
                    </a>
                  )}
                  {track.full_url && (
                    <a
                      href={track.full_url}
                      download
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
