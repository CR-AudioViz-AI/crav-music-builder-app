import { useState, useEffect } from 'react';
import { Shield, RefreshCw, X, DollarSign, BarChart3 } from 'lucide-react';
import {
  adminListTracks,
  adminRetryTrack,
  adminFailTrack,
  adminDisableTrack,
  adminAdjustCredits,
  getAdminStats,
  type AdminStats,
} from '../lib/admin';
import type { Track } from '../lib/types';

export function AdminPanel() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, providerFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tracksData, statsData] = await Promise.all([
        adminListTracks({ status: statusFilter || undefined, provider: providerFilter || undefined }),
        getAdminStats(),
      ]);
      setTracks(tracksData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (trackId: string) => {
    try {
      await adminRetryTrack(trackId);
      await loadData();
    } catch (err: any) {
      alert(`Failed to retry: ${err.message}`);
    }
  };

  const handleDisable = async (trackId: string) => {
    if (!confirm('Are you sure you want to disable this track?')) return;

    try {
      await adminDisableTrack(trackId);
      await loadData();
    } catch (err: any) {
      alert(`Failed to disable: ${err.message}`);
    }
  };

  const handleAdjustCredits = async () => {
    const userId = prompt('Enter user ID:');
    if (!userId) return;

    const deltaStr = prompt('Enter credit delta (positive to add, negative to subtract):');
    if (!deltaStr) return;

    const delta = parseInt(deltaStr, 10);
    if (isNaN(delta)) {
      alert('Invalid number');
      return;
    }

    const reason = prompt('Enter reason:');
    if (!reason) return;

    try {
      await adminAdjustCredits(userId, delta, reason);
      alert('Credits adjusted successfully');
    } catch (err: any) {
      alert(`Failed to adjust credits: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Total Tracks</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalTracks}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Credits Issued</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCreditsIssued}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Recent Errors</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.recentErrors.length}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Track Management</h2>
            <button
              onClick={handleAdjustCredits}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Adjust Credits
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="rendering">Rendering</option>
              <option value="ready">Ready</option>
              <option value="error">Error</option>
            </select>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Providers</option>
              <option value="musicgen">MusicGen</option>
              <option value="loudly">Loudly</option>
              <option value="beatoven">Beatoven</option>
              <option value="eleven">Eleven Music</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tracks.map((track) => (
                <tr key={track.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{track.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{track.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{track.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{track.provider}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        track.status === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : track.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : track.status === 'rendering'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {track.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(track.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {track.status === 'error' && (
                        <button
                          onClick={() => handleRetry(track.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Retry"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDisable(track.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Disable"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tracks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tracks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
