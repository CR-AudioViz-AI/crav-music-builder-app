import { CreditCard, Plus, Clock } from 'lucide-react';
import { CREDIT_BUNDLES } from '../lib/pricing';

export function CreditsView() {
  const handlePurchase = (bundleName: string, credits: number, price: number) => {
    alert(`Purchase of ${bundleName} bundle (${credits} credits for $${(price / 100).toFixed(2)}) will be implemented with Stripe integration`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credits & Pricing</h1>
        <p className="text-gray-600">
          Purchase credits to generate full-length tracks with professional quality
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {CREDIT_BUNDLES.map((bundle) => (
          <div
            key={bundle.name}
            className={`relative bg-white rounded-xl shadow-lg p-8 ${
              bundle.popular ? 'ring-2 ring-blue-600' : ''
            }`}
          >
            {bundle.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  ${(bundle.price / 100).toFixed(0)}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{bundle.credits} credits</p>
            </div>

            <button
              onClick={() => handlePurchase(bundle.name, bundle.credits, bundle.price)}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                bundle.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Purchase
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How Credits Work</h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Free Previews</h3>
              <p className="text-gray-600">
                Generate 20-30 second watermarked previews for free to test your ideas
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Jingles (15-60s)</h3>
              <p className="text-gray-600">
                Short format tracks cost 2-4 credits depending on duration
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Instrumentals (3 min)</h3>
              <p className="text-gray-600">
                Full-length instrumental tracks cost 4 credits (MP3) or 6 credits (WAV)
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Songs with Vocals (3 min)</h3>
              <p className="text-gray-600">
                Full songs with vocals cost 8 credits (MP3) or 12 credits (WAV). Coming soon via Eleven Music API.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Stems Package</h3>
              <p className="text-gray-600">
                Add individual track stems for +4-6 credits per generation
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Commercial Licensing Included</h3>
        <p className="text-blue-800 text-sm">
          All purchased tracks come with full commercial licensing rights. Use your music in
          videos, podcasts, ads, games, and more without additional fees or royalties.
        </p>
      </div>
    </div>
  );
}
