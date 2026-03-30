import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import api from '../services/api';

const Pricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [provider, setProvider] = useState<'stripe' | 'razorpay'>('stripe');

  const handleUpgrade = async (priceId: string) => {
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    if (!workspaceId) {
      alert('Please select a workspace first');
      return;
    }

    setLoading(priceId);
    try {
      const endpoint = provider === 'stripe' 
        ? '/subscription/create-checkout-session' 
        : '/subscription/create-razorpay-order';

      const { data } = await api.post(endpoint, { priceId, workspaceId });
      
      if (provider === 'stripe') {
        window.location.href = data.url;
      } else {
        navigate(`/mock-checkout?provider=razorpay&orderId=${data.id}&workspaceId=${workspaceId}`);
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      alert(error.response?.data?.message || 'Failed to initiate checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto text-lg mb-12">
          Choose the plan that's right for your business. All plans include 14-day free trial.
        </p>

        {/* Provider Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16 bg-neutral-900/50 p-1.5 rounded-2xl w-fit mx-auto border border-neutral-800">
          <button
            onClick={() => setProvider('stripe')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${provider === 'stripe' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-500 hover:text-white'}`}
          >
            Stripe
          </button>
          <button
            onClick={() => setProvider('razorpay')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${provider === 'razorpay' ? 'bg-indigo-800 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-500 hover:text-white'}`}
          >
            Razorpay
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 flex flex-col backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-neutral-500 ml-2">/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['Up to 3 documents', 'Basic markdown support', 'Community support'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-neutral-300">
                  <Check className="w-5 h-5 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-3 px-6 rounded-xl bg-neutral-800 text-neutral-500 font-semibold cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-neutral-900 border-2 border-indigo-500/50 rounded-3xl p-8 flex flex-col relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              POPULAR
            </div>
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold">$20</span>
              <span className="text-neutral-500 ml-2">/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {[
                'Unlimited documents',
                'Rich text editor',
                'Priority support',
                'Role-based access control',
                'Export to PDF/Markdown',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-neutral-100">
                  <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('price_pro')}
              disabled={loading === 'price_pro'}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300 transform group-hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading === 'price_pro' ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-12 text-neutral-500 hover:text-white transition-colors"
      >
        Go Back
      </button>
    </div>
  );
};

export default Pricing;
