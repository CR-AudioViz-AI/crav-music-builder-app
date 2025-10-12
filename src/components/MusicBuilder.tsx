import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Music, Loader2, AlertCircle } from 'lucide-react';
import type { Brief, TrackType, Vocals, Language } from '../lib/types';
import { moderateBrief } from '../lib/moderation';
import { calculateCredits, selectProvider } from '../lib/pricing';

interface MusicBuilderForm extends Brief {
  type: TrackType;
}

const GENRES = [
  'Pop',
  'Rock',
  'Country',
  'Hip Hop',
  'EDM',
  'Jazz',
  'Classical',
  'R&B',
  'Folk',
  'Metal',
  'Indie',
  'Blues',
];

const MOODS = [
  'Upbeat',
  'Melancholic',
  'Energetic',
  'Calm',
  'Romantic',
  'Dark',
  'Inspirational',
  'Mysterious',
  'Playful',
  'Epic',
];

const DURATIONS = [
  { label: '15 seconds', value: 15 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '3 minutes', value: 180 },
];

export function MusicBuilder() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedCredits, setEstimatedCredits] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MusicBuilderForm>({
    defaultValues: {
      type: 'INSTRUMENTAL',
      genre: 'Pop',
      vocals: 'NONE',
      durationSec: 30,
      language: 'en',
    },
  });

  const watchedValues = watch();

  const updateEstimate = () => {
    const type = watchedValues.type || 'INSTRUMENTAL';
    const duration = watchedValues.durationSec || 30;
    const credits = calculateCredits(type, duration);
    setEstimatedCredits(credits);
  };

  useState(() => {
    updateEstimate();
  });

  const onSubmit = async (data: MusicBuilderForm) => {
    setError(null);
    setIsGenerating(true);

    try {
      const moderation = moderateBrief(data);
      if (!moderation.allowed) {
        setError(moderation.reason || 'Content moderation failed');
        setIsGenerating(false);
        return;
      }

      const provider = selectProvider(data.type, data.vocals);

      if (provider === 'eleven') {
        setError('Vocal songs are not yet available. Full vocal generation coming soon via Eleven Music API.');
        setIsGenerating(false);
        return;
      }

      console.log('Generating track:', { data, provider });

      setError('Demo mode: Track generation will be implemented with backend API');
    } catch (err: any) {
      setError(err.message || 'Failed to generate track');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Song Builder</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Track Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['INSTRUMENTAL', 'JINGLE', 'SONG'] as TrackType[]).map((type) => (
                <label
                  key={type}
                  className="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="radio"
                    value={type}
                    {...register('type')}
                    onChange={() => updateEstimate()}
                    className="sr-only"
                  />
                  <span className="font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Track"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                {...register('genre', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood
              </label>
              <select
                {...register('mood')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select mood...</option>
                {MOODS.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <div className="grid grid-cols-4 gap-3">
              {DURATIONS.map((dur) => (
                <label
                  key={dur.value}
                  className="relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="radio"
                    value={dur.value}
                    {...register('durationSec', { valueAsNumber: true })}
                    onChange={() => updateEstimate()}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{dur.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vocals
            </label>
            <div className="grid grid-cols-4 gap-3">
              {(['NONE', 'MALE', 'FEMALE', 'DUET'] as Vocals[]).map((vocal) => (
                <label
                  key={vocal}
                  className="relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="radio"
                    value={vocal}
                    {...register('vocals')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{vocal}</span>
                </label>
              ))}
            </div>
            {watchedValues.vocals !== 'NONE' && (
              <p className="mt-2 text-sm text-amber-600">
                Note: Vocal generation is coming soon via Eleven Music API
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo (BPM, optional)
            </label>
            <input
              type="number"
              {...register('tempo', { valueAsNumber: true, min: 40, max: 220 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="120"
              min="40"
              max="220"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lyrics (optional)
            </label>
            <textarea
              {...register('lyrics', { maxLength: 2000 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter your lyrics here..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {watchedValues.lyrics?.length || 0} / 2000 characters
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Estimated cost:{' '}
              <span className="font-bold text-gray-900">{estimatedCredits} credits</span>
              <span className="text-xs ml-2">(Preview is free)</span>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5" />
                  Generate Preview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
